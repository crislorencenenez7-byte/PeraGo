import crypto from "crypto";
import { db } from "./firebase-admin.js";

function hashPin(pin) {
  return crypto
    .createHash("sha256")
    .update(pin)
    .digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { uid, currentPin, newPin } = req.body || {};

    if (!uid || !/^\d{6}$/.test(String(currentPin || "")) || !/^\d{6}$/.test(String(newPin || ""))) {
      return res.status(400).json({
        success: false,
        message: "User ID, current PIN, and new 6-digit PIN are required."
      });
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "Account not found."
      });
    }

    const data = userSnap.data();

    if (!data.pinHash || hashPin(String(currentPin)) !== data.pinHash) {
      return res.status(401).json({
        success: false,
        message: "Current PIN is incorrect."
      });
    }

    if (String(currentPin) === String(newPin)) {
      return res.status(400).json({
        success: false,
        message: "New PIN must be different from the current PIN."
      });
    }

    await userRef.update({
      pinHash: hashPin(String(newPin))
    });

    return res.status(200).json({
      success: true,
      message: "PIN changed successfully."
    });
  } catch (error) {
    console.error("Change PIN API error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change PIN."
    });
  }
}
