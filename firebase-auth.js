import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.registerWithEmail = async function (email, password) {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error.message
    };
  }
};

window.loginWithEmail = async function (email, password) {
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error.message
    };
  }
};

window.logoutUser = async function () {
  await signOut(auth);
};

export { auth };
