import { useEffect, useState } from "react";

const GREEN = "#087f5b";
const INK = "#173c2c";
const KEY = "perago_demo_account";

const inputStyle = {
  width: "100%", padding: "11px 12px", marginTop: 5,
  border: "1px solid #dce7df", borderRadius: 10,
  boxSizing: "border-box", fontSize: 14,
  background: "#fff", color: INK, minWidth: 0
};

const buttonStyle = {
  width: "100%", padding: 12, border: 0, borderRadius: 10,
  background: GREEN, color: "#fff", fontWeight: 700,
  fontSize: 14, cursor: "pointer", marginTop: 14
};

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginTop: 12, fontSize: 13, fontWeight: 650 }}>
      {label}{children}
    </label>
  );
}

function readAccount() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
  catch { return null; }
}

function go(path) {
  history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

async function hashPin(pin) {
  const bytes = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(x => x.toString(16).padStart(2, "0")).join("");
}

function PinPad({ value, onChange, onSubmit, buttonText = "Magpatuloy" }) {
  function press(key) {
    if (key === "⌫") onChange(value.slice(0, -1));
    else if (value.length < 4 && /^\d$/.test(key)) onChange(value + key);
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", gap: 13, margin: "18px 0" }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 13, height: 13, borderRadius: "50%",
            background: value.length > i ? GREEN : "#dce7df"
          }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((key, i) => (
          <button key={i} type="button" disabled={!key} onClick={() => press(key)}
            style={{
              height: 43, border: "1px solid #e1eae4", borderRadius: 10,
              background: key ? "#f7faf8" : "transparent",
              color: INK, fontSize: 17, fontWeight: 650
            }}>{key}</button>
        ))}
      </div>
      <button style={buttonStyle} onClick={onSubmit}>{buttonText}</button>
    </>
  );
}

export default function App() {
  const [path, setPath] = useState(location.pathname);
  const [account, setAccount] = useState(readAccount);
  const [number, setNumber] = useState(() => localStorage.getItem("perago_phone") || "");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "", filipino: "Yes", birthday: "" });

  useEffect(() => {
    const listener = () => {
      setPath(location.pathname);
      setMessage("");
      setPin("");
      setConfirmPin("");
    };
    addEventListener("popstate", listener);
    return () => removeEventListener("popstate", listener);
  }, []);

  function updateNumber(value) {
    setNumber(value);
    localStorage.setItem("perago_phone", value);
  }

  function sendOtp() {
    if (!/^(09\d{9}|\+639\d{9})$/.test(number)) {
      setMessage("Ilagay ang valid na Philippine mobile number.");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtp("");
    setMessage("Demo OTP lang ito; walang SMS na ipinadala.");
  }

  function verifyOtp() {
    if (!generatedOtp || otp !== generatedOtp) {
      setMessage("Mali ang OTP o wala pang generated OTP.");
      return;
    }
    if (account && account.number === number) {
      go("/login");
    } else {
      setProfile({ name: "", email: "", filipino: "Yes", birthday: "" });
      go("/register");
    }
  }

  async function createPin() {
    if (!/^\d{4}$/.test(pin) || pin !== confirmPin) {
      setMessage("Dapat 4 digits ang PIN at magkapareho ang dalawang PIN.");
      return;
    }
    const pinHash = await hashPin(pin);
    const next = { ...profile, number, pinHash };
    localStorage.setItem(KEY, JSON.stringify(next));
    setAccount(next);
    setPin("");
    setConfirmPin("");
    setMessage("Registration complete. Mag-login gamit ang iyong PIN.");
    go("/login");
  }

  async function login() {
    if (!account || account.number !== number) {
      setMessage("Walang registered account para sa number na ito.");
      return;
    }
    if (pin.length !== 4 || await hashPin(pin) !== account.pinHash) {
      setMessage("Mali ang 4-digit PIN.");
      setPin("");
      return;
    }
    sessionStorage.setItem("perago_logged_in", "yes");
    go("/dashboard");
  }

  function logout() {
    sessionStorage.removeItem("perago_logged_in");
    setPin("");
    go("/");
  }

  const shell = {
    minHeight: "100dvh", boxSizing: "border-box",
    padding: "14px 12px", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#f3f7f4",
    color: INK, fontFamily: "Arial, sans-serif"
  };
  const card = {
    width: "100%", maxWidth: 360, padding: "20px 17px",
    boxSizing: "border-box", borderRadius: 18,
    background: "#fff", boxShadow: "0 8px 28px #17442b10"
  };

  function Header({ subtitle }) {
    return (
      <header style={{ textAlign: "center", marginBottom: 17 }}>
        <div style={{
          width: 42, height: 42, margin: "0 auto 8px",
          borderRadius: 13, display: "grid", placeItems: "center",
          background: GREEN, color: "#fff", fontSize: 21, fontWeight: 800
        }}>₱</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>PeraGo</div>
        <div style={{ color: "#708277", fontSize: 12, marginTop: 4 }}>{subtitle}</div>
      </header>
    );
  }

  function Notice() {
    return message ? (
      <p role="status" style={{
        background: "#eef8f1", color: INK, padding: 10,
        borderRadius: 9, fontSize: 12, lineHeight: 1.45, overflowWrap: "anywhere"
      }}>{message}</p>
    ) : null;
  }

  if (path === "/dashboard" && sessionStorage.getItem("perago_logged_in") !== "yes") {
    go("/login");
  }

  return (
    <main style={shell}>
      <section style={card}>
        {path === "/register" ? (
          <>
            <Header subtitle="Personal Registration" />
            <form onSubmit={e => {
              e.preventDefault();
              if (!profile.name.trim() || !profile.email.trim() || !profile.birthday) {
                setMessage("Kumpletuhin ang Name, Email, at Birthday.");
                return;
              }
              if (profile.birthday >= new Date().toISOString().slice(0, 10)) {
                setMessage("Pumili ng birthday sa nakaraan.");
                return;
              }
              go("/pin");
            }}>
              <Field label="Full Name">
                <input required autoComplete="name" style={inputStyle} value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </Field>
              <Field label="Email Address">
                <input required type="email" autoComplete="email" style={inputStyle}
                  value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
              </Field>
              <Field label="Mobile Number (fixed)">
                <input readOnly style={{ ...inputStyle, background: "#f1f5f2" }} value={number} />
              </Field>
              <Field label="Filipino?">
                <div style={{ display: "flex", gap: 9, marginTop: 7 }}>
                  {["Yes", "No"].map(v => (
                    <button type="button" key={v} onClick={() => setProfile({ ...profile, filipino: v })}
                      style={{
                        flex: 1, padding: 10, borderRadius: 9,
                        border: `1px solid ${profile.filipino === v ? GREEN : "#dce7df"}`,
                        background: profile.filipino === v ? "#e9f7ef" : "#fff",
                        color: INK
                      }}>{v}</button>
                  ))}
                </div>
              </Field>
              <Field label="Birthday">
                <input required type="date" max={new Date().toISOString().slice(0, 10)}
                  style={inputStyle} value={profile.birthday}
                  onChange={e => setProfile({ ...profile, birthday: e.target.value })} />
              </Field>
              <button style={buttonStyle} type="submit">Done</button>
            </form>
            <Notice />
          </>
        ) : path === "/pin" ? (
          <>
            <Header subtitle="Create your 4-digit PIN" />
            <Field label="Enter 4 Digit PIN">
              <PinPad value={pin} onChange={setPin} onSubmit={() => {
                if (pin.length !== 4) return setMessage("Ilagay ang 4 digits.");
                setMessage("");
                document.getElementById("confirm-pin")?.focus();
              }} buttonText="Continue" />
            </Field>
            <Field label="Confirm 4 Digit PIN">
              <input id="confirm-pin" inputMode="numeric" type="password" maxLength={4}
                style={inputStyle} value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            </Field>
            <button style={buttonStyle} onClick={createPin}>Save PIN</button>
            <button style={{ ...buttonStyle, background: "#eaf2ed", color: INK, marginTop: 8 }}
              onClick={() => go("/register")}>Back</button>
            <Notice />
          </>
        ) : path === "/login" ? (
          <>
            <Header subtitle="Login to PeraGo" />
            <Field label="Registered Mobile Number">
              <input style={inputStyle} value={number} onChange={e => updateNumber(e.target.value)}
                inputMode="tel" placeholder="09XXXXXXXXX" />
            </Field>
            <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, fontWeight: 700 }}>
              Enter 4 Digit PIN <span style={{ color: GREEN }}>→</span>
            </div>
            <PinPad value={pin} onChange={setPin} onSubmit={login} buttonText="Login" />
            <button style={{ ...buttonStyle, background: "#eaf2ed", color: INK, marginTop: 9 }}
              onClick={() => { setGeneratedOtp(""); setOtp(""); go("/"); }}>Register / Verify Number</button>
            <Notice />
          </>
        ) : path === "/dashboard" ? (
          <>
            <Header subtitle="Dashboard" />
            <h2 style={{ fontSize: 20 }}>Kumusta, {account?.name || "User"}!</h2>
            <p style={{ fontSize: 13, color: "#708277" }}>Welcome sa PeraGo.</p>
            <div style={{ padding: 14, background: "#edf8f1", borderRadius: 12, fontSize: 13 }}>
              <b>Account details</b>
              <p style={{ overflowWrap: "anywhere" }}>Number: {account?.number}</p>
              <p>Email: {account?.email}</p>
            </div>
            <button style={buttonStyle} onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <Header subtitle="Register / Login" />
            <Field label="Mobile Number">
              <input style={inputStyle} value={number} onChange={e => updateNumber(e.target.value)}
                inputMode="tel" autoComplete="tel" placeholder="09XXXXXXXXX" />
            </Field>
            <button style={buttonStyle} onClick={sendOtp}>Generate Demo OTP</button>
            {generatedOtp && (
              <div style={{ marginTop: 12, padding: 11, borderRadius: 10, background: "#eaf7ee" }}>
                <div style={{ fontSize: 12 }}>Demo OTP (walang SMS):</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 4, marginTop: 4 }}>
                  {generatedOtp}
                </div>
              </div>
            )}
            <Field label="Enter OTP">
              <input style={inputStyle} inputMode="numeric" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP" />
            </Field>
            <button style={buttonStyle} onClick={verifyOtp}>Verify →</button>
            <Notice />
            <p style={{ fontSize: 11, color: "#718278", lineHeight: 1.5, textAlign: "center" }}>
              Demo lamang: ang OTP at account ay lokal na naka-save sa browser na ito.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
