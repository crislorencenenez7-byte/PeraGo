import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("PeraGo render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{
          padding: "24px",
          fontFamily: "sans-serif",
          overflowWrap: "anywhere"
        }}>
          <h2>PeraGo loading error</h2>
          <pre>{String(this.state.error.message || this.state.error)}</pre>
          <p>Pakopya ang error message na ito.</p>
        </main>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>
  );
} else {
  document.body.innerHTML =
    "<p style='padding:24px;font-family:sans-serif'>PeraGo error: missing root element.</p>";
}
