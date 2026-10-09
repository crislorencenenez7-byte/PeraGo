import { useState } from "react";

const inputStyle = {
  width: "100%",
  padding: "13px",
  marginTop: "7px",
  border: "1px solid #dce7df",
  borderRadius: "11px",
  boxSizing: "border-box",
  fontSize: "15px",
  background: "#fff",
  color: "#173c2c"
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "20px",
  border: "none",
  borderRadius: "11px",
  background: "#087f5b",
  color: "#fff",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer"
};

function Field({ label, children }) {
  return (
    <label style={{
      display: "block",
      marginTop: "15px",
      fontSize: "14px",
      fontWeight: "600"
    }}>
      {label}
      {children}
    </label>
  );
}

export default function App() {
  const [page, setPage] = useState("register");
  const [showPin, setShowPin] = useState(false);
  const [message, setMessage] = useState("");

  function handleRegister(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const pin = String(form.get("pin") || "");
    const confirmPin = String(form.get("confirmPin") || "");
    const mobile = String(form.get("mobile") || "");
    const birthday = String(form.get("birthday") || "");

    if (!/^\d{4}$/.test(pin)) {
      setMessage("Ang PIN ay dapat eksaktong 4 na numero.");
      return;
    }

    if (pin !== confirmPin) {
      setMessage("Hindi magkatugma ang PIN at Confirm PIN.");
      return;
    }

    if (!/^(09\d{9}|\+639\d{9})$/.test(mobile)) {
      setMessage("Gamitin ang Philippine mobile format: 09XXXXXXXXX o +639XXXXXXXXX.");
      return;
    }

    if (!birthday || birthday >= new Date().toISOString().slice(0, 10)) {
      setMessage("Maglagay ng valid na birthday sa nakaraan.");
      return;
    }

    setMessage("Valid ang form! Hindi pa naka-connect sa account registration.");
  }

  return (
    <main style={{
      minHeight: "100vh",
      padding: "24px 16px",
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f3f7f4",
      color: "#173c2c",
      fontFamily: "Arial, sans-serif"
    }}>
      <section style={{
        width: "100%",
        maxWidth: "430px",
        padding: "26px 22px",
        boxSizing: "border-box",
        borderRadius: "22px",
        background: "#fff",
        boxShadow: "0 10px 35px rgba(20,70,45,.07)"
      }}>
        <header style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{
            width: "58px",
            height: "58px",
            margin: "0 auto",
            display: "grid",
            placeItems: "center",
            borderRadius: "18px",
            background: "#087f5b",
            color: "#fff",
            fontSize: "29px",
            fontWeight: "bold"
          }}>₱</div>
          <h1 style={{ margin: "12px 0 5px" }}>PeraGo</h1>
          <p style={{ margin: 0, color: "#718078", fontSize: "14px" }}>
            Create your account
          </p>
        </header>

        <h2 style={{ marginBottom: "5px" }}>Register</h2>
        <p style={{ color: "#718078", fontSize: "14px", marginTop: 0 }}>
          Fill in your personal details.
        </p>

        <form onSubmit={handleRegister}>
          <Field label="Full Name">
            <input name="name" style={inputStyle}
              placeholder="Enter your full name"
              autoComplete="name" required />
          </Field>

          <Field label="Mobile Number">
            <input name="mobile" style={inputStyle}
              type="tel" placeholder="09XXXXXXXXX"
              autoComplete="tel" inputMode="tel"
              maxLength={13} required />
          </Field>

          <Field label="Email Address">
            <input name="email" style={inputStyle}
              type="email" placeholder="you@example.com"
              autoComplete="email" required />
          </Field>

          <Field label="Filipino?">
            <div style={{
              display: "flex",
              gap: "12px",
              marginTop: "10px"
            }}>
              <label style={{ flex: 1 }}>
                <input type="radio" name="filipino"
                  value="Yes" required />
                {" "}Yes
              </label>
              <label style={{ flex: 1 }}>
                <input type="radio" name="filipino"
                  value="No" required />
                {" "}No
              </label>
            </div>
          </Field>

          <Field label="Birthday">
            <input name="birthday" style={inputStyle}
              type="date" max={new Date().toISOString().slice(0, 10)}
              autoComplete="bday" required />
          </Field>

          <Field label="Create 4-Digit PIN">
            <input name="pin" style={inputStyle}
              type={showPin ? "text" : "password"}
              inputMode="numeric" pattern="[0-9]{4}"
              maxLength={4} minLength={4}
              placeholder="••••" autoComplete="new-password"
              required />
          </Field>

          <Field label="Confirm 4-Digit PIN">
            <input name="confirmPin" style={inputStyle}
              type={showPin ? "text" : "password"}
              inputMode="numeric" pattern="[0-9]{4}"
              maxLength={4} minLength={4}
              placeholder="••••" autoComplete="new-password"
              required />
          </Field>

          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "14px",
            fontSize: "13px",
            color: "#52665c"
          }}>
            <input type="checkbox" checked={showPin}
              onChange={event => setShowPin(event.target.checked)} />
            Show PIN
          </label>

          <button type="submit" style={buttonStyle}>
            Create Account
          </button>
        </form>

        {message && (
          <p role="status" style={{
            padding: "12px",
            borderRadius: "10px",
            background: "#edf8f0",
            color: "#17613f",
            fontSize: "13px",
            lineHeight: 1.5
          }}>
            {message}
          </p>
        )}

        <p style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#89978f",
          marginBottom: 0,
          marginTop: "22px"
        }}>
          PeraGo · Account Registration
        </p>
      </section>
    </main>
  );
}
