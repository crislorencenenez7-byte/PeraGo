import { useState } from "react";
import { auth, db } from "../services/firebase";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function SendMoney({ user, onBack }) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMoney = async () => {
    setMessage("");

    const cleanPhone = phone.replace(/\D/g, "");
    const numericAmount = Number(amount);

    if (!/^09\d{9}$/.test(cleanPhone)) {
      setMessage("Enter a valid 11-digit PH number.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    if (numericAmount > Number(user.balance || 0)) {
      setMessage("Insufficient balance.");
      return;
    }

    if (cleanPhone === user.phone) {
      setMessage("You cannot send money to yourself.");
      return;
    }

    setLoading(true);

    try {
      if (!auth.currentUser) {
        setMessage("Session expired. Please login again.");
        return;
      }

      const q = query(
        collection(db, "users"),
        where("phone", "==", cleanPhone),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage("Recipient is not registered.");
        return;
      }

      const recipientDoc = snapshot.docs[0];

      await addDoc(collection(db, "transferRequests"), {
        senderUid: auth.currentUser.uid,
        senderPhone: user.phone,
        senderName: user.name || "PeraGo User",

        recipientUid: recipientDoc.id,
        recipientPhone: cleanPhone,
        recipientName: recipientDoc.data().name || "PeraGo User",

        amount: numericAmount,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setPhone("");
      setAmount("");
      setMessage("Transfer request sent successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="service-page">
      <div className="service-top">
        <button onClick={onBack}>←</button>
        <h2>Send Money</h2>
        <span />
      </div>

      <section className="service-card">
        <div className="service-icon">↗</div>

        <h1>Send Money</h1>
        <p>Transfer money to another PeraGo user.</p>

        <label>Recipient Mobile Number</label>

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

        <label>Amount</label>

        <div className="amount-input">
          <span>₱</span>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button
          className="primary-service-btn"
          onClick={sendMoney}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Money"}
        </button>

        {message && (
          <div className="service-message">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}

export default SendMoney;
