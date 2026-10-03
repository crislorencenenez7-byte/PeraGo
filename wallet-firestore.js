import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function createWalletProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      phoneNumber: user.phoneNumber || "",
      balance: 1000,
      createdAt: new Date().toISOString()
    });

    console.log("PeraGo wallet profile created.");
  }
}

export async function getWalletProfile(uid) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

onAuthStateChanged(auth, async (user) => {
  console.log("PeraGo Firebase Auth:", user ? user.uid : "NO USER");

  if (!user) {
    alert("PeraGo: Firebase Auth user not found.");
    return;
  }

  try {
    await createWalletProfile(user);

    alert("PeraGo: Firestore wallet profile checked successfully.");
  } catch (error) {
    console.error("Firestore ERROR:", error);

    alert(
      "PeraGo Firestore ERROR:\n\n" +
      error.code +
      "\n\n" +
      error.message
    );
  }
});

export { auth, db };
