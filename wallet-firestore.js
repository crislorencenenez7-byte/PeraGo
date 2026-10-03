import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  limit,
  getDocs,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function formatPeso(amount) {
  return Number(amount).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP"
  });
}

export async function createWalletProfile(user) {
  if (!user) {
    throw new Error("User is not signed in.");
  }

  const userRef = doc(db, "users", user.uid);
  const publicRef = doc(db, "publicProfiles", user.uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      phoneNumber: user.phoneNumber || "",
      balance: 1000,
      createdAt: serverTimestamp()
    });
  }

  await setDoc(
    publicRef,
    {
      uid: user.uid,
      phoneNumber: user.phoneNumber || ""
    },
    { merge: true }
  );
}

export async function getWalletProfile(uid) {
  if (!uid) {
    throw new Error("User ID is missing.");
  }

  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const balance = Number(data.balance);

  return {
    ...data,
    balance: Number.isFinite(balance) ? balance : 0
  };
}

export async function getCurrentWallet() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You are not signed in.");
  }

  const wallet = await getWalletProfile(user.uid);

  if (!wallet) {
    throw new Error("Wallet profile not found.");
  }

  return wallet;
}

export async function findWalletByPhone(phoneNumber) {
  const normalizedPhone = String(phoneNumber || "").trim();

  if (!normalizedPhone) {
    return null;
  }

  const profilesRef = collection(db, "publicProfiles");

  const q = query(
    profilesRef,
    where("phoneNumber", "==", normalizedPhone),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const profileDoc = snapshot.docs[0];

  return {
    uid: profileDoc.id,
    ...profileDoc.data()
  };
}

export async function createTransferRequest(
  recipientUid,
  amount,
  recipientPhone
) {
  const sender = auth.currentUser;

  if (!sender) {
    throw new Error("You are not signed in.");
  }

  if (!recipientUid) {
    throw new Error("Recipient account not found.");
  }

  if (recipientUid === sender.uid) {
    throw new Error("You cannot send money to yourself.");
  }

  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Enter a valid amount.");
  }

  const senderRef = doc(db, "users", sender.uid);
  const recipientRef = doc(db, "users", recipientUid);

  const requestId = await runTransaction(db, async (transaction) => {
    const senderSnap = await transaction.get(senderRef);
    const recipientSnap = await transaction.get(recipientRef);

    if (!senderSnap.exists()) {
      throw new Error("Sender wallet not found.");
    }

    if (!recipientSnap.exists()) {
      throw new Error("Recipient wallet not found.");
    }

    const senderBalance = Number(senderSnap.data().balance);
    const recipientBalance = Number(recipientSnap.data().balance);

    if (!Number.isFinite(senderBalance)) {
      throw new Error("Sender wallet balance is invalid.");
    }

    if (!Number.isFinite(recipientBalance)) {
      throw new Error("Recipient wallet balance is invalid.");
    }

    if (value > senderBalance) {
      throw new Error(
        `Insufficient balance. Available balance: ${formatPeso(senderBalance)}`
      );
    }

    const requestRef = doc(collection(db, "transferRequests"));

    transaction.update(senderRef, {
      balance: senderBalance - value
    });

    transaction.update(recipientRef, {
      balance: recipientBalance + value
    });

    transaction.set(requestRef, {
      senderUid: sender.uid,
      senderPhone: sender.phoneNumber || "",
      recipientUid,
      recipientPhone: recipientPhone || "",
      amount: value,
      status: "completed",
      createdAt: serverTimestamp()
    });

    return requestRef.id;
  });

  return requestId;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    return;
  }

  try {
    await createWalletProfile(user);
  } catch (error) {
    console.error("Wallet profile error:", error);
  }
});

export { auth, db };
