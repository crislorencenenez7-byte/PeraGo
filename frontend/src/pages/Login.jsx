import { useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth, db } from "../services/firebase";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

function Login({ onRegister, onLogin }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState("phone");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const findUser = async () => {
    const q = query(
      collection(db, "users"),
      where("phone", "==", phone),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    };
  };

  const continuePhone = async () => {
    if (!/^09\d{9}$/.test(phone)) {
      setMessage("Enter a valid 11-digit PH number.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Authenticate first so Firestore rules allow the query.
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const found = await findUser();

      if (!found) {
        setMessage("Number is not registered.");
        return;
      }

      setUser(found);
      setStep("pin");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!/^\d{4}$/.test(pin)) {
      setMessage("Enter your 4-digit PIN.");
      return;
    }

    if (pin !== String(user.pin || "")) {
      setMessage("Incorrect PIN.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const firebaseUser = await signInAnonymously(auth);

      onLogin({
        ...user,
        firebaseUid: firebaseUser.uid,
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">

        <div className="login-logo">₱</div>

        <h1>PeraGo</h1>
        <p>
          {step === "phone"
            ? "Your wallet, made simple."
            : "Enter your 4-digit PIN."}
        </p>

        {step === "phone" ? (
          <>
            <label>Mobile Number</label>

            <input
              type="tel"
              inputMode="numeric"
              maxLength="11"
              placeholder="09XXXXXXXXX"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
            />

            <button onClick={continuePhone} disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </button>

            <button
              className="secondary"
              onClick={onRegister}
            >
              Create new account
            </button>
          </>
        ) : (
          <>
            <div className="login-number">
              {user.phone}
            </div>

            <label>4-DIGIT PIN</label>

            <input
              type="password"
              inputMode="numeric"
              maxLength="4"
              placeholder="••••"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, ""))
              }
            />

            <button onClick={login} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              className="secondary"
              onClick={() => {
                setStep("phone");
                setPin("");
                setMessage("");
              }}
            >
              Back
            </button>
          </>
        )}

        {message && (
          <div className="login-message">
            {message}
          </div>
        )}

      </div>
    </main>
  );
}

export default Login;
