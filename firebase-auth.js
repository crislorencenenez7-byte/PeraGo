import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const actionCodeSettings = {
  url: window.location.origin + "/register.html",
  handleCodeInApp: true
};

window.sendEmailVerificationLink = async function (email) {
  try {
    await sendSignInLinkToEmail(
      auth,
      email.trim(),
      actionCodeSettings
    );

    localStorage.setItem("perago_email_for_signin", email.trim());

    return {
      success: true,
      message: "Verification link sent to your email."
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error.message
    };
  }
};

window.completeEmailVerification = async function () {
  try {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return {
        success: false,
        message: "This is not a valid PeraGo verification link."
      };
    }

    const email = localStorage.getItem("perago_email_for_signin");

    if (!email) {
      return {
        success: false,
        message: "Please enter your email again."
      };
    }

    const result = await signInWithEmailLink(
      auth,
      email,
      window.location.href
    );

    const name = localStorage.getItem("perago_pending_name") || "";
    const phone = localStorage.getItem("perago_pending_phone") || "";

    await setDoc(
      doc(db, "users", result.user.uid),
      {
        uid: result.user.uid,
        name: name,
        phone: phone,
        email: result.user.email || email
      },
      { merge: true }
    );

    localStorage.removeItem("perago_email_for_signin");
    localStorage.removeItem("perago_pending_name");
    localStorage.removeItem("perago_pending_phone");

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
