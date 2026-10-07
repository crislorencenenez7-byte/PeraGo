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
const makeOtp=()=>String(Math.floor(Math.random()*1000000)).padStart(6,"0");

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
 <div class="card"><h2>Create account</h2>
 <p class="muted">Enter your mobile number to begin.</p>

 <div class="field"><label>MOBILE NUMBER</label>
 <input id="regPhone" inputmode="numeric" maxlength="11" placeholder="09XXXXXXXXX">
 </div>

 <button class="primary" id="otpBtn">Generate OTP</button>

 <div id="registrationFields"></div>

 <button class="ghost" id="back" style="margin-top:10px">Back to login</button>
 </div>`;

 document.querySelector("#otpBtn").onclick=async()=>{
  const phone=document.querySelector("#regPhone").value.trim();

  if(!validPhone(phone))
   return toast("Enter a valid 11-digit PH number.");

  try{
   await ensureSessionUser();

   if(await findUser(phone))
    return toast("Number is already registered.");

   const otp=makeOtp();

  sessionStorage.setItem("perago_demo_otp",otp);
  sessionStorage.setItem("perago_reg_phone",phone);

  document.querySelector("#otpBtn").style.display="none";
  document.querySelector("#regPhone").readOnly=true;

  document.querySelector("#registrationFields").innerHTML=`
   <div class="otp-box">
    <div>DEMO OTP — prototype only</div>
    <div class="otp-value">${otp}</div>
   </div>

   <div class="field">
    <label>OTP</label>
    <input id="otp" inputmode="numeric" maxlength="6" placeholder="6-digit OTP">
   </div>

   <button class="primary" id="verifyOtp">Verify OTP</button>
   <div id="detailsFields"></div>
  `;

  document.querySelector("#verifyOtp").onclick=()=>{
   const entered=document.querySelector("#otp").value.trim();

   if(entered!==otp)
    return toast("Incorrect OTP.");

   document.querySelector("#verifyOtp").style.display="none";
   document.querySelector("#otp").readOnly=true;

   document.querySelector("#detailsFields").innerHTML=`
    <div class="otp-box">
     <div>Mobile number verified</div>
     <div class="otp-value">Verified</div>
    </div>

    <div class="field">
     <label>NAME</label>
     <input id="name" placeholder="Your name">
    </div>

    <div class="field">
     <label>NUMBER</label>
     <input value="${phone}" readonly>
    </div>

    <div class="field">
     <label>EMAIL</label>
     <input id="email" type="email" placeholder="you@example.com">
    </div>

    <div class="field">
     <label>BIRTHDAY</label>
     <input id="birthday" type="date">
    </div>

    <div class="field">
     <label>FILIPINO</label>
     <select id="filipino">
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
     </select>
    </div>

    <div class="field">
     <label>4-DIGIT PIN</label>
     <input id="pin1" inputmode="numeric" maxlength="4" type="password" placeholder="••••">
    </div>

    <div class="field">
     <label>CONFIRM PIN</label>
     <input id="pin2" inputmode="numeric" maxlength="4" type="password" placeholder="••••">
    </div>

    <button class="primary" id="finish">Create Account</button>
   `;

   document.querySelector("#finish").onclick=async()=>{
    const name=document.querySelector("#name").value.trim();
    const email=document.querySelector("#email").value.trim();
    const birthday=document.querySelector("#birthday").value;
    const filipino=document.querySelector("#filipino").value;
    const pin1=document.querySelector("#pin1").value;
    const pin2=document.querySelector("#pin2").value;

    if(name.length<2)return toast("Enter your name.");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast("Enter a valid email.");
    if(!birthday)return toast("Enter your birthday.");
    if(!filipino)return toast("Select Yes or No for Filipino.");
    if(!validPin(pin1))return toast("PIN must be exactly 4 digits.");
    if(pin1!==pin2)return toast("PINs do not match.");

    try{
     const u=await ensureSessionUser();

     await setDoc(doc(db,"users",u.uid),{
      uid:u.uid,
      name,
      phone,
      email,
      birthday,
      filipino,
      verified:false,
      balance:1000,
      pin:pin1,
      createdAt:serverTimestamp()
     });

     sessionStorage.clear();
     sessionStorage.setItem("perago_logged","1");

     toast("Registration complete.");
     dashboard(u);
    }catch(e){
     toast(e.message);
    }
   };
  };
  }catch(e){
   console.error("Generate OTP error:",e);
   toast(e.message||"Unable to generate OTP.");
  }
 };

 document.querySelector("#back").onclick=()=>authScreen("login");
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
