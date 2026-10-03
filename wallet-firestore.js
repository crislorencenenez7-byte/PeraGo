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

export async function createWalletProfile(user) {
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
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

export async function getCurrentWallet() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You are not signed in.");
  }

  return await getWalletProfile(user.uid);
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

export async function sendDemoMoney(
  recipientUid,
  amount,
  recipientPhone
) {
  const sender = auth.currentUser;

  if (!sender) {
    throw new Error("You are not signed in.");
  }

  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid amount.");
  }

  if (!recipientUid) {
    throw new Error("Recipient account not found.");
  }

  if (recipientUid === sender.uid) {
    throw new Error("You cannot send money to yourself.");
  }

  const senderRef = doc(db, "users", sender.uid);
  const recipientRef = doc(db, "users", recipientUid);

  await runTransaction(db, async (transaction) => {
    const senderSnap = await transaction.get(senderRef);
    const recipientSnap = await transaction.get(recipientRef);

    if (!senderSnap.exists()) {
      throw new Error("Sender wallet not found.");
    }

    if (!recipientSnap.exists()) {
      throw new Error("Recipient wallet not found.");
    }

    const senderBalance =
      Number(senderSnap.data().balance || 0);

    if (value > senderBalance) {
      throw new Error("Insufficient balance.");
    }

    const recipientBalance =
      Number(recipientSnap.data().balance || 0);

    transaction.update(senderRef, {
      balance: Number((senderBalance - value).toFixed(2))
    });

    transaction.update(recipientRef, {
      balance: Number((recipientBalance + value).toFixed(2))
    });
  });

  await addDoc(collection(db, "transactions"), {
    userId: sender.uid,
    type: "send",
    direction: "out",
    amount: value,
    recipientUid,
    recipientPhone: recipientPhone || "",
    createdAt: serverTimestamp()
  });

  await addDoc(collection(db, "transactions"), {
    userId: recipientUid,
    type: "receive",
    direction: "in",
    amount: value,
    senderUid: sender.uid,
    senderPhone: sender.phoneNumber || "",
    createdAt: serverTimestamp()
  });

  return true;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    await createWalletProfile(user);
  } catch (error) {
    console.error("Wallet profile error:", error);
  }
});

export { auth, db };

export async function createTransferRequest(
  recipientUid,
  amount,
  recipientPhone
) {
  const sender = auth.currentUser;

  if (!sender) {
    throw new Error("You are not signed in.");
  }

  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid amount.");
  }

  if (!recipientUid) {
    throw new Error("Recipient account not found.");
  }

  if (recipientUid === sender.uid) {
    throw new Error("You cannot send money to yourself.");
  }

  const wallet = await getCurrentWallet();

  if (!wallet) {
    throw new Error("Wallet profile not found.");
  }

  const balance = Number(wallet.balance || 0);

  if (value > balance) {
    throw new Error("Insufficient balance.");
  }

  const requestRef = await addDoc(
    collection(db, "transferRequests"),
    {
      senderUid: sender.uid,
      senderPhone: sender.phoneNumber || "",
      recipientUid,
      recipientPhone: recipientPhone || "",
      amount: value,
      status: "pending",
      createdAt: serverTimestamp()
    }
  );

  return requestRef.id;
}
