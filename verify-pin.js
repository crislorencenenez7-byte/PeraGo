import crypto from "crypto";
import { findUserByPhone } from "./login.js";

function hashPin(pin) {
  return crypto
    .createHash("sha256")
    .update(pin)
    .digest("hex");
}

export async function verifyPin(phone, pin) {
  if (!/^\d{4}$/.test(pin)) {
    return null;
  }

  const user = await findUserByPhone(phone);

  if (!user || !user.pinHash) {
    return null;
  }

  if (hashPin(pin) !== user.pinHash) {
    return null;
  }

  return {
    uid: user.uid,
    name: user.name,
    phone: user.phone,
    email: user.email
  };
}
