import "./firebase-auth.js";

const phoneInput =
  document.querySelector("#phone") ||
  document.querySelector("#phoneNumber") ||
  document.querySelector("#mobile");

const otpInput =
  document.querySelector("#otp") ||
  document.querySelector("#otpCode");

const sendOtpButton =
  document.querySelector("#sendOtpBtn") ||
  document.querySelector("#sendOTP") ||
  document.querySelector("#send-otp");

const verifyOtpButton =
  document.querySelector("#verifyOtpBtn") ||
  document.querySelector("#verifyOTP") ||
  document.querySelector("#verify-otp");

const message =
  document.querySelector("#authMessage") ||
  document.querySelector("#message");

function showMessage(text) {
  if (message) {
    message.textContent = text;
  } else {
    alert(text);
  }
}

if (sendOtpButton) {
  sendOtpButton.addEventListener("click", async () => {
    if (!phoneInput) {
      showMessage("Phone number field not found.");
      return;
    }

    const phone = phoneInput.value.trim();

    if (!phone) {
      showMessage("Enter your mobile number first.");
      return;
    }

    sendOtpButton.disabled = true;
    showMessage("Sending OTP...");

    const result = await window.sendOTP(phone);

    if (result.success) {
      showMessage("OTP sent. Check your SMS.");

      if (otpInput) {
        otpInput.style.display = "block";
        otpInput.focus();
      }

      if (verifyOtpButton) {
        verifyOtpButton.style.display = "block";
      }
    } else {
      showMessage("OTP failed: " + result.message);
      sendOtpButton.disabled = false;
    }
  });
}

if (verifyOtpButton) {
  verifyOtpButton.addEventListener("click", async () => {
    if (!otpInput) {
      showMessage("OTP field not found.");
      return;
    }

    const otp = otpInput.value.trim();

    if (!/^\d{6}$/.test(otp)) {
      showMessage("Enter the 6-digit OTP.");
      return;
    }

    verifyOtpButton.disabled = true;
    showMessage("Verifying OTP...");

    const result = await window.verifyOTP(otp);

    if (result.success) {
      showMessage("Verified successfully!");

      setTimeout(() => {
        window.location.href = "set-pin.html";
      }, 500);
    } else {
      showMessage("Verification failed: " + result.message);
      verifyOtpButton.disabled = false;
    }
  });
}
