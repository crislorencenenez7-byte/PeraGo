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
 root.innerHTML=`<main class="auth perago-auth">
  <div class="auth-bg">
   <div class="auth-brand">
    <img class="logo" src="assets/perago-logo.svg">
    <div class="auth-brand-name">PeraGo</div>
    <div class="auth-tagline">Your wallet, made simple.</div>
   </div>

   <section class="auth-card">
    <div id="authbox"></div>
   </section>

   <div class="auth-footer">PeraGo • Secure digital wallet</div>
  </div>
 </main>`;

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
 const s=await getDoc(doc(db,"users",u.uid));
 const d=s.data()||{};

 root.innerHTML=`
 <div class="shell perago-dashboard">

  <div class="pg-header">
   <div class="pg-topbar">
    <div class="pg-brand">
     <img src="assets/perago-logo.svg">
     <span>PeraGo</span>
    </div>

    <div class="pg-header-actions">
     <button class="pg-icon" id="notifBtn" aria-label="Notifications">♧</button>
     <button class="pg-icon" id="menuBtn" aria-label="Menu">☰</button>
    </div>
   </div>

   <section class="pg-balance-card">
    <div class="pg-account-row">
     <div>
      <div class="pg-small">Hello,</div>
      <div class="pg-name">${esc(d.name||"PeraGo User")}</div>
      <div class="pg-account">PeraGo Account</div>
     </div>
     <div class="pg-qr">▦</div>
    </div>

    <div class="pg-balance-row">
     <div>
      <div class="pg-balance">${peso(d.balance)}</div>
      <div class="pg-available">Available Balance</div>
     </div>
     <button class="pg-cash-btn" id="cashInBtn">＋ Cash In</button>
    </div>
   </section>
  </div>

  <section class="pg-actions-card">

   <button class="pg-action" id="sendBtn">
    <span class="pg-action-icon">➤</span>
    <span>Send Money</span>
   </button>

   <button class="pg-action" id="receiveBtn">
    <span class="pg-action-icon">⇩</span>
    <span>Receive Money</span>
   </button>

   <button class="pg-action" id="cashInAction">
    <span class="pg-action-icon">▣</span>
    <span>Cash In</span>
   </button>

   <button class="pg-action" id="cashOutBtn">
    <span class="pg-action-icon">▤</span>
    <span>Cash Out</span>
   </button>

   <button class="pg-action" id="billsBtn">
    <span class="pg-action-icon">☷</span>
    <span>Pay Bills</span>
   </button>

   <button class="pg-action" id="loadBtn">
    <span class="pg-action-icon">▯</span>
    <span>Buy Load</span>
   </button>

   <button class="pg-action" id="emoneyBtn">
    <span class="pg-action-icon">▦</span>
    <span>eMoney</span>
   </button>

   <button class="pg-action" id="moreBtn">
    <span class="pg-action-icon">⠿</span>
    <span>More</span>
   </button>

  </section>

  <section class="pg-promo">
   <div>
    <div class="pg-promo-small">Simple. Secure. Go.</div>
    <div class="pg-promo-title">PeraGo</div>
    <div class="pg-promo-text">Your money, your way.</div>
   </div>
   <div class="pg-promo-mark">₱</div>
  </section>

  <div class="pg-dots">
   <i class="active"></i><i></i><i></i>
  </div>

  <section class="pg-recent">
   <div class="pg-section-title">
    <strong>Recent Transactions</strong>
    <button id="viewTransactions">View All ›</button>
   </div>

   <div class="pg-empty-transaction">
    <div class="pg-transaction-icon">₱</div>
    <div>
     <strong>No recent transactions</strong>
     <div>Transactions will appear here.</div>
    </div>
   </div>
  </section>

  <div id="dashboardPanel"></div>

  <nav class="pg-bottom-nav">
   <button class="pg-nav active" id="homeNav">
    <span>⌂</span>
    <small>Home</small>
   </button>

   <button class="pg-nav" id="transactionsNav">
    <span>▦</span>
    <small>Transactions</small>
   </button>

   <button class="pg-nav" id="billsNav">
    <span>♢</span>
    <small>Bills</small>
   </button>

   <button class="pg-nav" id="accountNav">
    <span>♙</span>
    <small>Account</small>
   </button>
  </nav>

 </div>`;

 const panel=()=>document.querySelector("#dashboardPanel");

 const comingSoon=(name)=>{
  toast(name+" is coming soon.");
 };

 document.querySelector("#notifBtn").onclick=()=>comingSoon("Notifications");
 document.querySelector("#menuBtn").onclick=()=>comingSoon("Menu");
 document.querySelector("#cashInBtn").onclick=()=>comingSoon("Cash In");
 document.querySelector("#cashInAction").onclick=()=>comingSoon("Cash In");
 document.querySelector("#receiveBtn").onclick=()=>comingSoon("Receive Money");
 document.querySelector("#cashOutBtn").onclick=()=>comingSoon("Cash Out");
 document.querySelector("#billsBtn").onclick=()=>comingSoon("Pay Bills");
 document.querySelector("#loadBtn").onclick=()=>comingSoon("Buy Load");
 document.querySelector("#emoneyBtn").onclick=()=>comingSoon("eMoney");
 document.querySelector("#moreBtn").onclick=()=>comingSoon("More");
 document.querySelector("#viewTransactions").onclick=()=>comingSoon("Transactions");
 document.querySelector("#transactionsNav").onclick=()=>comingSoon("Transactions");
 document.querySelector("#billsNav").onclick=()=>comingSoon("Bills");

 document.querySelector("#accountNav").onclick=()=>{
  root.innerHTML=`
   <div class="pg-profile-page">

    <header class="pg-profile-header">
     <button class="pg-back" id="profileBack">‹</button>

     <div class="pg-profile-title">
      <img src="assets/perago-logo.svg">
      <span>Profile</span>
     </div>

     <div style="width:40px"></div>
    </header>

    <section class="pg-profile-card">

     <div class="pg-profile-avatar">
      ${esc((d.name||"P").charAt(0).toUpperCase())}
     </div>

     <h2>${esc(d.name||"PeraGo User")}</h2>
     <p>${esc(d.phone||"")}</p>

     <div class="pg-profile-info">

      <div class="pg-info-row">
       <span>Name</span>
       <strong>${esc(d.name||"")}</strong>
      </div>

      <div class="pg-info-row">
       <span>Number</span>
       <strong>${esc(d.phone||"")}</strong>
      </div>

      <div class="pg-info-row">
       <span>Email</span>
       <strong>${esc(d.email||"")}</strong>
      </div>

      <div class="pg-info-row">
       <span>Verified</span>
       <strong>${d.verified===true?"Yes":"No"}</strong>
      </div>

      <div class="pg-info-row">
       <span>Birthday</span>
       <strong>${esc(d.birthday||"")}</strong>
      </div>

      <div class="pg-info-row">
       <span>Filipino</span>
       <strong>${esc(d.filipino||"")}</strong>
      </div>

     </div>

     <button class="primary pg-profile-action" id="profileLogout">
      Log out
     </button>

    </section>

   </div>`;

  document.querySelector("#profileBack").onclick=()=>{
   dashboard(u);
  };

  document.querySelector("#profileLogout").onclick=()=>{
   sessionStorage.clear();
   authScreen("login");
  };
 };


 document.querySelector("#sendBtn").onclick=()=>{
  panel().innerHTML=`
   <section class="card pg-panel">
    <div class="pg-panel-head">
     <h2>Send Money</h2>
     <button class="pg-close" id="closeSend">×</button>
    </div>

    <p class="muted">Send money to another PeraGo mobile number.</p>

    <div class="field">
     <label>RECIPIENT MOBILE NUMBER</label>
     <input id="sendPhone" inputmode="numeric" maxlength="11" placeholder="09XXXXXXXXX">
    </div>

    <div class="field">
     <label>AMOUNT</label>
     <input id="sendAmount" inputmode="decimal" type="number" min="1" step="0.01" placeholder="₱0.00">
    </div>

    <button class="primary" id="continueSend">Continue</button>
   </section>`;

  document.querySelector("#closeSend").onclick=()=>panel().innerHTML="";

  document.querySelector("#continueSend").onclick=()=>{
   const phone=document.querySelector("#sendPhone").value.trim();
   const amount=Number(document.querySelector("#sendAmount").value);

   if(!validPhone(phone))
    return toast("Enter a valid 11-digit PH number.");

   if(!Number.isFinite(amount)||amount<=0)
    return toast("Enter a valid amount.");

   panel().innerHTML=`
    <section class="card pg-panel">
     <div class="pg-panel-head">
      <h2>Confirm Transfer</h2>
      <button class="pg-close" id="cancelSend">×</button>
     </div>

     <p class="muted">Please check the details before confirming.</p>

     <div class="field">
      <label>RECIPIENT</label>
      <input value="${esc(phone)}" readonly>
     </div>

     <div class="field">
      <label>AMOUNT</label>
      <input value="${peso(amount)}" readonly>
     </div>

     <button class="primary" id="confirmSend">Confirm Send</button>
    </section>`;

   document.querySelector("#cancelSend").onclick=()=>panel().innerHTML="";

   document.querySelector("#confirmSend").onclick=()=>{
    panel().innerHTML=`
     <section class="card pg-panel pg-success">
      <div class="pg-success-icon">✓</div>
      <h2>Transfer Successful</h2>
      <p class="muted">Prototype transfer completed.</p>

      <div class="field">
       <label>RECIPIENT</label>
       <input value="${esc(phone)}" readonly>
      </div>

      <div class="field">
       <label>AMOUNT</label>
       <input value="${peso(amount)}" readonly>
      </div>

      <button class="primary" id="doneSend">Done</button>
     </section>`;

    document.querySelector("#doneSend").onclick=()=>panel().innerHTML="";
   };
  };
 };

 document.querySelector("#homeNav").onclick=()=>{
  panel().innerHTML="";
 };
}onAuthStateChanged(auth,()=>{if(!sessionStorage.getItem("perago_logged"))authScreen("login")});
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
