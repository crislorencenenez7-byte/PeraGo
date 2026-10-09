import { useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth, db } from "../services/firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

function Register({ onBack, onRegistered }) {
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [isFilipino, setIsFilipino] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const register = async () => {
    setMessage("");

    if (!name.trim()) {
      setMessage("Enter your full name.");
      return;
    }

    if (!birthday) {
      setMessage("Enter your birthday.");
      return;
    }

    if (isFilipino === "") {
      setMessage("Please select if you are Filipino.");
      return;
    }

    if (!/^09\d{9}$/.test(phone)) {
      setMessage("Enter a valid 11-digit PH number.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setMessage("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setMessage("PINs do not match.");
      return;
    }

    setLoading(true);

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const existingQuery = query(
        collection(db, "users"),
        where("phone", "==", phone),
        limit(1)
      );

      const existing = await getDocs(existingQuery);

      if (!existing.empty) {
        setMessage("This mobile number is already registered.");
        return;
      }

      const uid = auth.currentUser.uid;

      const account = {
        name: name.trim(),
        birthday,
        isFilipino: isFilipino === "yes",
        phone,
        pin,
        balance: 0,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", uid), account);

      onRegistered({
        id: uid,
        ...account,
        firebaseUid: uid,
      });
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-card">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="login-logo">₱</div>

        <h1>Create Account</h1>

        <p>Open your PeraGo wallet.</p>

        <label>Full Name</label>

        <input
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Birthday</label>

        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />

        <label>Are you Filipino?</label>

        <div className="choice-group">
          <button
            type="button"
            className={isFilipino === "yes" ? "choice active" : "choice"}
            onClick={() => setIsFilipino("yes")}
          >
            Yes
          </button>

          <button
            type="button"
            className={isFilipino === "no" ? "choice active" : "choice"}
            onClick={() => setIsFilipino("no")}
          >
            No
          </button>
        </div>

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

        <label>4-Digit PIN</label>

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

        <label>Confirm PIN</label>

        <input
          type="password"
          inputMode="numeric"
          maxLength="4"
          placeholder="••••"
          value={confirmPin}
          onChange={(e) =>
            setConfirmPin(e.target.value.replace(/\D/g, ""))
          }
        />

        <button
          className="register-submit"
          onClick={register}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {message && (
          <div className="login-message">
            {message}
          </div>
        )}

      </div>
    </main>
  );
}

export default Register;
