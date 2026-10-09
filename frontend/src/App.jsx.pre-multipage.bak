import { useEffect, useState } from "react";

const GREEN = "#087f5b";
const INK = "#173c2c";
const KEY = "perago_demo_account";

const inputStyle = {
  width: "100%", padding: 12, border: "1px solid #dce7df",
  borderRadius: 10, boxSizing: "border-box", fontSize: 16,
  background: "#fff", color: INK, textAlign: "center",
  letterSpacing: 2
};

const buttonStyle = {
  width: "100%", padding: 12, border: 0, borderRadius: 10,
  background: GREEN, color: "#fff", fontWeight: 700,
  fontSize: 14, cursor: "pointer", marginTop: 12
};

function readAccount() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
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

function Keypad({ value, onChange, maxLength, onSubmit, buttonText }) {
  function press(key) {
    if (key === "⌫") {
      onChange(value.slice(0, -1));
    } else if (/^\d$/.test(key) && value.length < maxLength) {
      onChange(value + key);
    }
  }

  return (
    <>
      <input
        aria-label="Entered digits"
        style={inputStyle}
        value={value}
        readOnly
        placeholder={"•".repeat(Math.min(maxLength, 6))}
      />
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8, marginTop: 12
      }}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((key, i) => (
          <button
            key={i}
            type="button"
            disabled={!key}
            onClick={() => press(key)}
            style={{
              height: 43, border: "1px solid #e1eae4",
              borderRadius: 10, background: key ? "#f7faf8" : "transparent",
              color: INK, fontSize: 18, fontWeight: 700
            }}
          >
            {key}
          </button>
        ))}
      </div>
      <button style={buttonStyle} onClick={onSubmit}>{buttonText}</button>
    </>
  );
}

function Header({ subtitle }) {
  return (
    <header style={{ textAlign: "center", marginBottom: 16 }}>
      <div style={{
        width: 40, height: 40, margin: "0 auto 7px",
        borderRadius: 12, display: "grid", placeItems: "center",
        background: GREEN, color: "#fff", fontSize: 21, fontWeight: 800
      }}>₱</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>PeraGo</div>
      <div style={{ color: "#708277", fontSize: 12, marginTop: 4 }}>
        {subtitle}
      </div>
    </header>
  );
}

function Field({ label, children }) {
  return (
    <label style={{
      display: "block", marginTop: 12, fontSize: 13, fontWeight: 650
    }}>
      {label}
      {children}
    </label>
  );
}

export default function App() {
  const [path, setPath] = useState(location.pathname);
  const [account, setAccount] = useState(readAccount);
  const [number, setNumber] = useState(
    () => localStorage.getItem("perago_phone") || ""
  );
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    name: "", email: "", filipino: "Yes", birthday: ""
  });

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
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setNumber(digits);
    localStorage.setItem("perago_phone", digits);
  }

  function startVerification() {
    if (!/^09\d{9}$/.test(number)) {
      setMessage("Ilagay ang 11-digit number na nagsisimula sa 09.");
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtp("");
    setMessage("");
    go("/otp");
  }

  function verifyOtp() {
    if (!generatedOtp || otp !== generatedOtp) {
      setMessage("Mali ang OTP. Subukan ulit.");
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
      setMessage("Dapat 4 digits at magkapareho ang dalawang PIN.");
      return;
    }

    const pinHash = await hashPin(pin);
    const next = { ...profile, number, pinHash };
    localStorage.setItem(KEY, JSON.stringify(next));
    setAccount(next);
    setPin("");
    setConfirmPin("");
    setGeneratedOtp("");
    setOtp("");
    go("/login");
    setMessage("Registration complete. Mag-login gamit ang PIN.");
  }

  async function login() {
    if (!/^09\d{9}$/.test(number)) {
      setMessage("Ilagay ang registered 11-digit mobile number.");
      return;
    }
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
    padding: "12px", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#f3f7f4",
    color: INK, fontFamily: "Arial, sans-serif"
  };

  const card = {
    width: "100%", maxWidth: 350, padding: "18px 16px",
    boxSizing: "border-box", borderRadius: 18,
    background: "#fff", boxShadow: "0 8px 28px #17442b10"
  };

  const notice = message ? (
    <p role="status" style={{
      background: "#eef8f1", color: INK, padding: 10,
      borderRadius: 9, fontSize: 12, lineHeight: 1.4,
      overflowWrap: "anywhere"
    }}>{message}</p>
  ) : null;

  if (path === "/dashboard" &&
      sessionStorage.getItem("perago_logged_in") !== "yes") {
    return (
      <main style={shell}>
        <section style={card}>
          <Header subtitle="Login to PeraGo" />
          <p style={{ fontSize: 13 }}>Mag-login muna upang magpatuloy.</p>
          <button style={buttonStyle} onClick={() => go("/login")}>
            Go to Login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={shell}>
      <section style={card}>
        {path === "/otp" ? (
          <>
            <Header subtitle="Verify Mobile Number" />
            <p style={{ textAlign: "center", fontSize: 13 }}>
              I-enter ang 6-digit OTP para sa {number}.
            </p>
            <Keypad
              value={otp}
              onChange={setOtp}
              maxLength={6}
              onSubmit={verifyOtp}
              buttonText="Verify OTP"
            />
            <p style={{ fontSize: 12, textAlign: "center", color: "#708277" }}>
              Demo OTP lamang; walang SMS na ipinadala.
            </p>
            {generatedOtp && (
              <p style={{
                fontSize: 17, textAlign: "center",
                fontWeight: 800, letterSpacing: 4, color: GREEN
              }}>
                Demo code: {generatedOtp}
              </p>
            )}
            <button
              style={{ ...buttonStyle, background: "#eaf2ed", color: INK }}
              onClick={() => go("/")}
            >
              Back
            </button>
            {notice}
          </>
        ) : path === "/register" ? (
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
              setMessage("");
              go("/pin");
            }}>
              <Field label="Full Name">
                <input required autoComplete="name" style={{
                  ...inputStyle, textAlign: "left", letterSpacing: 0, marginTop: 5
                }} value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </Field>
              <Field label="Email Address">
                <input required type="email" autoComplete="email" style={{
                  ...inputStyle, textAlign: "left", letterSpacing: 0, marginTop: 5
                }} value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })} />
              </Field>
              <Field label="Mobile Number (fixed)">
                <input readOnly style={{
                  ...inputStyle, background: "#f1f5f2", marginTop: 5
                }} value={number} />
              </Field>
              <Field label="Filipino?">
                <div style={{ display: "flex", gap: 9, marginTop: 7 }}>
                  {["Yes", "No"].map(v => (
                    <button
                      type="button" key={v}
                      onClick={() => setProfile({ ...profile, filipino: v })}
                      style={{
                        flex: 1, padding: 10, borderRadius: 9,
                        border: `1px solid ${profile.filipino === v ? GREEN : "#dce7df"}`,
                        background: profile.filipino === v ? "#e9f7ef" : "#fff",
                        color: INK
                      }}
                    >{v}</button>
                  ))}
                </div>
              </Field>
              <Field label="Birthday">
                <input required type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  style={{ ...inputStyle, marginTop: 5, letterSpacing: 0 }}
                  value={profile.birthday}
                  onChange={e => setProfile({ ...profile, birthday: e.target.value })} />
              </Field>
              <button style={buttonStyle} type="submit">Done</button>
            </form>
            {notice}
          </>
        ) : path === "/pin" ? (
          <>
            <Header subtitle="Create your 4-digit PIN" />
            <p style={{ fontSize: 13, textAlign: "center" }}>
              Gumawa ng PIN na gagamitin sa pag-login.
            </p>
            <Field label="Enter 4-digit PIN">
              <Keypad value={pin} onChange={setPin} maxLength={4}
                onSubmit={() => {
                  if (pin.length !== 4) {
                    setMessage("Ilagay ang 4 digits.");
                    return;
                  }
                  setMessage("");
                }}
                buttonText="Enter PIN" />
            </Field>
            <Field label="Confirm 4-digit PIN">
              <Keypad value={confirmPin} onChange={setConfirmPin} maxLength={4}
                onSubmit={createPin} buttonText="Save PIN" />
            </Field>
            <button
              style={{ ...buttonStyle, background: "#eaf2ed", color: INK }}
              onClick={() => go("/register")}
            >Back</button>
            {notice}
          </>
        ) : path === "/login" ? (
          <>
            <Header subtitle="Login to PeraGo" />
            <Field label="Registered Mobile Number">
              <Keypad value={number} onChange={updateNumber} maxLength={11}
                onSubmit={() => {
                  if (!/^09\d{9}$/.test(number)) {
                    setMessage("Ilagay ang 11-digit number na nagsisimula sa 09.");
                  } else {
                    setMessage("Ilagay ang iyong 4-digit PIN sa ibaba.");
                  }
                }}
                buttonText="Confirm Number" />
            </Field>
            <Field label="Enter 4-digit PIN">
              <Keypad value={pin} onChange={setPin} maxLength={4}
                onSubmit={login} buttonText="Login" />
            </Field>
            <button
              style={{ ...buttonStyle, background: "#eaf2ed", color: INK }}
              onClick={() => {
                setOtp("");
                setGeneratedOtp("");
                go("/");
              }}
            >Register / Verify Number</button>
            {notice}
          </>
        ) : path === "/dashboard" ? (
          <>
            <Header subtitle="Dashboard" />
            <h2 style={{ fontSize: 20 }}>
              Kumusta, {account?.name || "User"}!
            </h2>
            <p style={{ fontSize: 13, color: "#708277" }}>
              Welcome sa PeraGo.
            </p>
            <div style={{
              padding: 14, background: "#edf8f1",
              borderRadius: 12, fontSize: 13
            }}>
              <b>Account details</b>
              <p>Number: {account?.number}</p>
              <p style={{ overflowWrap: "anywhere" }}>Email: {account?.email}</p>
            </div>
            <button style={buttonStyle} onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <Header subtitle="Phone Number" />
            <p style={{ textAlign: "center", fontSize: 13 }}>
              Ilagay ang Philippine mobile number mo.
            </p>
            <Keypad value={number} onChange={updateNumber} maxLength={11}
              onSubmit={startVerification} buttonText="Continue / Register" />
            <button
              style={{ ...buttonStyle, background: "#eaf2ed", color: INK }}
              onClick={() => {
                setMessage("");
                go("/login");
              }}
            >Login</button>
            {notice}
          </>
        )}
      </section>
    </main>
  );
}
