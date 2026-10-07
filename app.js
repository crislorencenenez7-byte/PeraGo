import{initializeApp}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import{getAuth,onAuthStateChanged,signInAnonymously,signOut}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import{getFirestore,doc,getDoc,setDoc,query,collection,where,limit,getDocs,serverTimestamp}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import{firebaseConfig}from"./firebase-config.js";

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),root=document.querySelector("#app");
const peso=n=>Number(n||0).toLocaleString("en-PH",{style:"currency",currency:"PHP"});
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const toast=m=>{const x=document.querySelector("#toast");x.textContent=m;x.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove("show"),2200)};
const validPhone=p=>/^09\d{9}$/.test(p);
const validPin=p=>/^\d{4}$/.test(p);
const makeOtp=()=>String(Math.floor(100000+Math.random()*900000));

async function findUser(phone){
 const q=query(collection(db,"users"),where("phone","==",phone),limit(1));
 const s=await getDocs(q); return s.empty?null:{id:s.docs[0].id,data:s.docs[0].data()};
}
async function ensureSessionUser(){if(!auth.currentUser)await signInAnonymously(auth);return auth.currentUser}

function authScreen(mode="login"){
 root.innerHTML=`<main class="auth"><section class="authbox">
 <img class="logo" src="assets/perago-logo.svg"><h1 class="title">PeraGo</h1>
 <p class="muted" style="text-align:center">Your wallet, made simple.</p>
 <div id="authbox"></div></section></main>`;
 mode==="register"?registerPhoneStep():loginStep();
}

function loginStep(){
 const box=document.querySelector("#authbox");
 box.innerHTML=`<div class="card"><h2>Login</h2><p class="muted">Enter your PeraGo mobile number.</p>
 <div class="field"><label>MOBILE NUMBER</label><input id="loginPhone" inputmode="numeric" maxlength="11" placeholder="09XXXXXXXXX"></div>
 <button class="primary" id="continue">Continue</button>
 <button class="ghost" id="register" style="margin-top:10px">Create new account</button></div>`;
 document.querySelector("#continue").onclick=async()=>{
  const phone=document.querySelector("#loginPhone").value.trim();
  if(!validPhone(phone))return toast("Enter a valid 11-digit PH number.");
  const u=await findUser(phone);if(!u)return toast("Number is not registered.");
  pinLogin(u);
 };
 document.querySelector("#register").onclick=()=>registerPhoneStep();
}

function registerPhoneStep(){
 const box=document.querySelector("#authbox");
 box.innerHTML=`<div class="steps"><i class="step on"></i><i class="step"></i><i class="step"></i></div>
 <div class="card"><h2>Create account</h2><p class="muted">Start with your mobile number.</p>
 <div class="field"><label>MOBILE NUMBER</label><input id="regPhone" inputmode="numeric" maxlength="11" placeholder="09XXXXXXXXX"></div>
 <button class="primary" id="otpBtn">Generate OTP</button>
 <button class="ghost" id="back" style="margin-top:10px">Back to login</button></div>`;
 document.querySelector("#otpBtn").onclick=async()=>{
  const phone=document.querySelector("#regPhone").value.trim();
  if(!validPhone(phone))return toast("Enter a valid 11-digit PH number.");
  if(await findUser(phone))return toast("Number is already registered.");
  const otp=makeOtp();sessionStorage.setItem("perago_demo_otp",otp);sessionStorage.setItem("perago_reg_phone",phone);
  otpStep(phone,otp);
 };
 document.querySelector("#back").onclick=()=>authScreen("login");
}

function otpStep(phone,otp){
 const box=document.querySelector("#authbox");
 box.innerHTML=`<div class="steps"><i class="step on"></i><i class="step on"></i><i class="step"></i></div>
 <div class="card"><h2>Verify number</h2><p class="muted">Enter the OTP shown below.</p>
 <div class="field"><label>OTP</label><input id="otp" inputmode="numeric" maxlength="6" placeholder="6-digit OTP"></div>
 <div class="otp-box">DEMO OTP — for this prototype only<div class="otp-value">${otp}</div></div>
 <button class="primary" id="verify">Verify OTP</button></div>`;
 document.querySelector("#verify").onclick=()=>{
  if(document.querySelector("#otp").value.trim()!==otp)return toast("Incorrect OTP.");
  sessionStorage.setItem("perago_verified","1");registerDetails(phone);
 };
}

function registerDetails(phone){
 const box=document.querySelector("#authbox");
 box.innerHTML=`<div class="steps"><i class="step on"></i><i class="step on"></i><i class="step on"></i></div>
 <div class="card"><h2>Your details</h2><p class="muted">OTP verified. Complete your registration.</p>
 <div class="field"><label>NAME</label><input id="name" placeholder="Your name"></div>
 <div class="field"><label>EMAIL</label><input id="email" type="email" placeholder="you@example.com"></div>
 <div class="field"><label>MOBILE NUMBER</label><input value="${phone}" disabled></div>
 <button class="primary" id="details">Continue to PIN</button></div>`;
 document.querySelector("#details").onclick=()=>{
  const name=document.querySelector("#name").value.trim(),email=document.querySelector("#email").value.trim();
  if(name.length<2)return toast("Enter your name.");if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast("Enter a valid email.");
  sessionStorage.setItem("perago_name",name);sessionStorage.setItem("perago_email",email);pinSetup(phone);
 };
}

function pinSetup(phone){
 const box=document.querySelector("#authbox");
 box.innerHTML=`<div class="card"><h2>Create your 4-digit PIN</h2><p class="muted">Your mobile number is shown above your PIN.</p>
 <div style="text-align:center;font-size:20px;font-weight:900;color:#ffd21a;margin:18px 0">${phone}</div>
 <div class="field"><label>4-DIGIT PIN</label><input id="pin1" inputmode="numeric" maxlength="4" type="password" placeholder="••••"></div>
 <div class="field"><label>CONFIRM PIN</label><input id="pin2" inputmode="numeric" maxlength="4" type="password" placeholder="••••"></div>
 <button class="primary" id="finish">Create PIN & Register</button></div>`;
 document.querySelector("#finish").onclick=async()=>{
  const p1=document.querySelector("#pin1").value,p2=document.querySelector("#pin2").value;
  if(!validPin(p1))return toast("PIN must be exactly 4 digits.");if(p1!==p2)return toast("PINs do not match.");
  try{
   const u=await ensureSessionUser();
   await setDoc(doc(db,"users",u.uid),{uid:u.uid,name:sessionStorage.getItem("perago_name"),email:sessionStorage.getItem("perago_email"),phone,balance:1000,pin:p1,createdAt:serverTimestamp()});
   sessionStorage.clear();toast("Registration complete.");dashboard(u);
  }catch(e){toast(e.message)}
 };
}

async function pinLogin(user){
 const box=document.querySelector("#authbox");
 box.innerHTML=`<div class="card"><h2>Enter PIN</h2><p class="muted">Your mobile number</p>
 <div style="text-align:center;font-size:22px;font-weight:950;color:#ffd21a;margin:14px 0">${esc(user.data.phone)}</div>
 <div class="field"><label>4-DIGIT PIN</label><input id="pin" inputmode="numeric" maxlength="4" type="password" placeholder="••••"></div>
 <button class="primary" id="loginPin">Login</button>
 <button class="ghost" id="back" style="margin-top:10px">Back</button></div>`;
 document.querySelector("#loginPin").onclick=async()=>{
  const pin=document.querySelector("#pin").value;
  if(!validPin(pin))return toast("Enter your 4-digit PIN.");
  if(pin!==String(user.data.pin||""))return toast("Incorrect PIN.");
  try{const u=await ensureSessionUser();if(u.uid!==user.id){const old=await getDoc(doc(db,"users",user.id));if(old.exists())dashboard({uid:user.id,email:old.data().email});else dashboard(u)}else dashboard(u)}catch(e){toast(e.message)}
 };
 document.querySelector("#back").onclick=()=>authScreen("login");
}

async function dashboard(u){
 const s=await getDoc(doc(db,"users",u.uid));const d=s.data()||{};
 root.innerHTML=`<div class="shell"><div class="top"><div class="brand"><img src="assets/perago-logo.svg">PeraGo</div><button class="ghost" style="width:auto;padding:8px 12px" id="logout">Log out</button></div>
 <section class="card hero"><div class="eyebrow">Available balance</div><div class="balance">${peso(d.balance)}</div></section>
 <section class="card"><h2>Hello, ${esc(d.name||"PeraGo User")}!</h2><p class="muted">${esc(d.phone||"")}</p></section>
 </div>`;
 document.querySelector("#logout").onclick=()=>{sessionStorage.clear();authScreen("login")};
}

onAuthStateChanged(auth,()=>{if(!sessionStorage.getItem("perago_logged"))authScreen("login")});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {
        updateViaCache: "none"
      });

      await registration.update();

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;

        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    } catch (error) {
      console.error("Service worker update failed:", error);
    }
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}
