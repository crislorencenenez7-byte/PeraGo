import { useState } from "react";

const fieldStyle = {
  width: "100%",
  padding: "14px 15px",
  marginTop: "7px",
  border: "1px solid #dce7df",
  borderRadius: "12px",
  background: "#fff",
  boxSizing: "border-box",
  fontSize: "15px",
  outlineColor: "#087f5b"
};

const buttonStyle = {
  width: "100%",
  padding: "15px",
  marginTop: "20px",
  border: "none",
  borderRadius: "12px",
  background: "#087f5b",
  color: "#fff",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer"
};

export default function App() {
  const [page, setPage] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const isRegister = page === "register";

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      "UI preview lamang. Hindi pa konektado ang authentication."
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f3f7f4",
      fontFamily: "Arial, sans-serif",
      color: "#173c2c",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px",
      boxSizing: "border-box"
    }}>
      <section style={{
        width: "100%",
        maxWidth: "410px",
        padding: "30px 24px",
        borderRadius: "24px",
        background: "#fff",
        boxShadow: "0 10px 35px rgba(20,70,45,.07)"
      }}>
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: "62px",
            height: "62px",
            margin: "0 auto",
            display: "grid",
            placeItems: "center",
            borderRadius: "19px",
            background: "#087f5b",
            color: "#fff",
            fontSize: "30px",
            fontWeight: "bold"
          }}>₱</div>
          <h1 style={{ margin: "14px 0 6px", fontSize: "28px" }}>
            PeraGo
          </h1>
          <p style={{ margin: 0, color: "#718078", fontSize: "14px" }}>
            {isRegister
              ? "Create your account"
              : "Your money, made simpler."}
          </p>
        </header>

        <h2 style={{ fontSize: "22px", marginBottom: "7px" }}>
          {isRegister ? "Create account" : "Welcome back"}
        </h2>
        <p style={{ color: "#718078", fontSize: "14px", marginTop: 0 }}>
          {isRegister
            ? "Enter your details to get started."
            : "Sign in to continue to PeraGo."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label style={{ display: "block", marginTop: "18px", fontSize: "14px" }}>
              Full name
              <input
                style={fieldStyle}
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label style={{ display: "block", marginTop: "18px", fontSize: "14px" }}>
            Email address
            <input
              style={fieldStyle}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label style={{ display: "block", marginTop: "18px", fontSize: "14px" }}>
            Password
            <input
              style={fieldStyle}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </label>

          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "13px",
            fontSize: "13px",
            color: "#52665c"
          }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={event => setShowPassword(event.target.checked)}
            />
            Show password
          </label>

          <button type="submit" style={buttonStyle}>
            {isRegister ? "Create Account" : "Sign In"}
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
          marginTop: "24px",
          fontSize: "14px",
          color: "#718078"
        }}>
          {isRegister ? "Already have an account? " : "New to PeraGo? "}
          <button
            type="button"
            onClick={() => {
              setPage(isRegister ? "login" : "register");
              setMessage("");
            }}
            style={{
              border: "none",
              background: "none",
              color: "#087f5b",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            {isRegister ? "Sign In" : "Create account"}
          </button>
        </p>

        <p style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#89978f",
          marginBottom: 0
        }}>
          PeraGo · Secure account access
        </p>
      </section>
    </main>
  );
}
