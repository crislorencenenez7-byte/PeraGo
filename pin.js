import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
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

const PIN_LENGTH = 4;

async function hashPin(pin) {
  const data = new TextEncoder().encode(String(pin));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hasPin() {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() && typeof snap.data().pinHash === "string" && !!snap.data().pinHash;
}

export async function savePin(pin) {
  const value = String(pin || "").trim();

  if (!new RegExp(`^\\d{${PIN_LENGTH}}$`).test(value)) {
    throw new Error(`PIN must be exactly ${PIN_LENGTH} digits.`);
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be logged in.");
  }

  const pinHash = await hashPin(value);

  await setDoc(
    doc(db, "users", user.uid),
    { pinHash },
    { merge: true }
  );
}

export async function checkPin(pin) {
  const value = String(pin || "").trim();

  if (!new RegExp(`^\\d{${PIN_LENGTH}}$`).test(value)) {
    return false;
  }

  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return false;

  const savedHash = snap.data().pinHash;
  if (typeof savedHash !== "string" || !savedHash) return false;

  const enteredHash = await hashPin(value);
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

export { auth, db, PIN_LENGTH };

onAuthStateChanged(auth, () => {});
