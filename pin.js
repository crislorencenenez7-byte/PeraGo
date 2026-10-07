import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteField
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function hashPin(pin) {
  const data = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hasPin() {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() && !!snap.data().pinHash;
}

export async function savePin(pin) {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error("PIN must be exactly 4 digits.");
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be logged in.");
  }

  const pinHash = await hashPin(pin);

  await setDoc(
    doc(db, "users", user.uid),
    { pinHash },
    { merge: true }
  );
}

export async function checkPin(pin) {
  if (!/^\d{4}$/.test(pin)) return false;

  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, "users", user.uid));

  if (!snap.exists()) return false;

  const savedHash = snap.data().pinHash;
  if (!savedHash) return false;

  const enteredHash = await hashPin(pin);

  return savedHash === enteredHash;
}

export async function removePin() {
  const user = auth.currentUser;
  if (!user) return;

  await setDoc(
    doc(db, "users", user.uid),
    { pinHash: deleteField() },
    { merge: true }
  );
}
