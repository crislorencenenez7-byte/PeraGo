import { useState } from "react";

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      boxSizing: "border-box",
      background: "#f3f7f4",
      color: "#173c2c",
      fontFamily: "Arial, sans-serif",
      textAlign: "center"
    }}>
      <div style={{
        width: "72px",
        height: "72px",
        display: "grid",
        placeItems: "center",
        borderRadius: "22px",
        background: "#087f5b",
        color: "white",
        fontSize: "36px",
        fontWeight: "bold"
      }}>₱</div>

      <h1 style={{ marginBottom: "8px" }}>PeraGo</h1>

      <p style={{ color: "#52665c" }}>
        Your money, made simpler.
      </p>

      <p>
        {started
          ? "React is working. Ready to build PeraGo!"
          : "Welcome to the new PeraGo."}
      </p>

      <button
        onClick={() => setStarted(true)}
        style={{
          marginTop: "12px",
          padding: "14px 24px",
          border: "none",
          borderRadius: "12px",
          background: "#087f5b",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Get Started
      </button>

      <small style={{ marginTop: "28px", color: "#718078" }}>
        PeraGo · React + Vite
      </small>
    </main>
  );
}
