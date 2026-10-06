import { auth } from "./firebase-admin.js";

export async function createLoginToken(uid) {
  if (!uid) {
    throw new Error("User ID is required.");
  }

  return await auth.createCustomToken(uid);
}
