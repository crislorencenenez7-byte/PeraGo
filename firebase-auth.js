import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let confirmationResult = null;

function normalizePhoneNumber(phone) {
  phone = phone.trim().replace(/[^0-9+]/g, "");

  // 091XXXXXXXX -> +639XXXXXXXXX
  if (phone.startsWith("09") && phone.length === 11) {
    return "+63" + phone.substring(1);
  }

  // 9XXXXXXXXX -> +639XXXXXXXXX
  if (phone.startsWith("9") && phone.length === 10) {
    return "+63" + phone;
  }

  // +639XXXXXXXXX
  if (phone.startsWith("+639") && phone.length === 13) {
    return phone;
  }

  // 639XXXXXXXXX
  if (phone.startsWith("639") && phone.length === 12) {
    return "+" + phone;
  }

  throw new Error("Invalid Philippine mobile number.");
}

window.setupRecaptcha = function () {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal"
      }
    );
  }

  return window.recaptchaVerifier;
};

window.sendOTP = async function (phone) {
  try {
    const formattedPhone = normalizePhoneNumber(phone);
    const appVerifier = setupRecaptcha();

    confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      appVerifier
    );

    return {
      success: true,
      message: "OTP sent successfully."
    };
  } catch (error) {
    console.error(error);

    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    return {
      success: false,
      message: error.message
    };
  }
};

window.verifyOTP = async function (otp) {
  try {
    if (!confirmationResult) {
      throw new Error("Please request an OTP first.");
    }

    const result = await confirmationResult.confirm(otp);

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

export { auth };
