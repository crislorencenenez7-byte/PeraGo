import { useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { collection, doc, getDocs, limit, query, setDoc, where } from "firebase/firestore";

export function Login({ onRegister, onLogin }) {
  const [phone,setPhone]=useState(""); const [pin,setPin]=useState("");
  const [step,setStep]=useState("phone"); const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(false); const [message,setMessage]=useState("");
  const findUser=async()=>{const q=query(collection(db,"users"),where("phone","==",phone),limit(1));const s=await getDocs(q);if(s.empty)return null;return {id:s.docs[0].id,...s.docs[0].data()};};
  const next=async()=>{setMessage("");if(!/^09\d{9}$/.test(phone)){setMessage("Enter a valid 11-digit PH number.");return;}setLoading(true);try{if(!auth.currentUser)await signInAnonymously(auth);const found=await findUser();if(!found){setMessage("Number is not registered.");return;}setUser(found);setStep("pin");}catch(e){setMessage(e.message)}finally{setLoading(false)}};
  const login=async()=>{setMessage("");if(!/^\d{4}$/.test(pin)){setMessage("Enter your 4-digit PIN.");return;}if(pin!==String(user.pin||"")){setMessage("Incorrect PIN.");return;}setLoading(true);try{const u=auth.currentUser||await signInAnonymously(auth);onLogin({...user,firebaseUid:u.uid});}catch(e){setMessage(e.message)}finally{setLoading(false)}};
  return <main className="auth-page"><div className="auth-card"><div className="brand">₱</div><h1>PeraGo</h1><p>{step==="phone"?"Your wallet, made simple.":"Enter your 4-digit PIN."}</p>
    {step==="phone"?<><label>Mobile Number</label><input value={phone} maxLength="11" inputMode="numeric" placeholder="09XXXXXXXXX" onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}/><button onClick={next} disabled={loading}>{loading?"Checking...":"Continue"}</button><button className="secondary" onClick={onRegister}>Create new account</button></>:<><div className="account-number">{user.phone}</div><label>4-DIGIT PIN</label><input type="password" value={pin} maxLength="4" inputMode="numeric" placeholder="••••" onChange={e=>setPin(e.target.value.replace(/\D/g,""))}/><button onClick={login} disabled={loading}>{loading?"Logging in...":"Login"}</button><button className="secondary" onClick={()=>{setStep("phone");setPin("");}}>Back</button></>}
    {message&&<div className="message">{message}</div>}</div></main>;
}

export function Register({ onBack, onRegistered }) {
  const [name,setName]=useState(""); const [birthday,setBirthday]=useState(""); const [isFilipino,setIsFilipino]=useState("");
  const [phone,setPhone]=useState(""); const [pin,setPin]=useState(""); const [confirmPin,setConfirmPin]=useState("");
  const [loading,setLoading]=useState(false); const [message,setMessage]=useState("");
  const register=async()=>{setMessage("");if(!name.trim())return setMessage("Enter your full name.");if(!birthday)return setMessage("Enter your birthday.");if(isFilipino==="")return setMessage("Please select Filipino or Not Filipino.");if(!/^09\d{9}$/.test(phone))return setMessage("Enter a valid 11-digit PH number.");if(!/^\d{4}$/.test(pin))return setMessage("PIN must be exactly 4 digits.");if(pin!==confirmPin)return setMessage("PINs do not match.");setLoading(true);
    try{if(!auth.currentUser)await signInAnonymously(auth);const q=query(collection(db,"users"),where("phone","==",phone),limit(1));const s=await getDocs(q);if(!s.empty){setMessage("This mobile number is already registered.");return;}const uid=auth.currentUser.uid;const account={name:name.trim(),birthday,isFilipino:isFilipino==="yes",phone,pin,balance:0,createdAt:new Date().toISOString()};await setDoc(doc(db,"users",uid),account);onRegistered({id:uid,...account,firebaseUid:uid});}catch(e){setMessage(e.message)}finally{setLoading(false)}};
  return <main className="auth-page"><div className="auth-card wide"><button className="back" onClick={onBack}>← Back</button><div className="brand">₱</div><h1>Create Account</h1><p>Open your PeraGo wallet.</p>
    <label>Full Name</label><input value={name} placeholder="Your full name" onChange={e=>setName(e.target.value)}/><label>Birthday</label><input type="date" value={birthday} onChange={e=>setBirthday(e.target.value)}/>
    <label>Are you Filipino?</label><div className="choices"><button className={isFilipino==="yes"?"choice active":"choice"} onClick={()=>setIsFilipino("yes")}>Yes</button><button className={isFilipino==="no"?"choice active":"choice"} onClick={()=>setIsFilipino("no")}>No</button></div>
    <label>Mobile Number</label><input value={phone} maxLength="11" inputMode="numeric" placeholder="09XXXXXXXXX" onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}/><label>4-Digit PIN</label><input type="password" value={pin} maxLength="4" inputMode="numeric" placeholder="••••" onChange={e=>setPin(e.target.value.replace(/\D/g,""))}/><label>Confirm PIN</label><input type="password" value={confirmPin} maxLength="4" inputMode="numeric" placeholder="••••" onChange={e=>setConfirmPin(e.target.value.replace(/\D/g,""))}/><button onClick={register} disabled={loading}>{loading?"Creating account...":"Create Account"}</button>{message&&<div className="message">{message}</div>}</div></main>;
}