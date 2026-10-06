import { db } from "./firebase-admin.js";

export async function findUserByPhone(phone) {
  const snapshot = await db
    .collection("users")
    .where("phone", "==", phone)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  const data = userDoc.data();

  return {
    uid: userDoc.id,
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    pinHash: data.pinHash || ""
  };
}
