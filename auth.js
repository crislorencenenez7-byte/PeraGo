import "./firebase-auth.js";

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");
const registerButton = document.querySelector("#registerBtn");
const message = document.querySelector("#authMessage");

function showMessage(text) {
  if (message) {
    message.textContent = text;
  } else {
    alert(text);
  }
}

if (registerButton) {
  registerButton.addEventListener("click", async () => {
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const confirmPassword = confirmPasswordInput?.value || "";

    if (!email) {
      showMessage("Enter your email address.");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }

    registerButton.disabled = true;
    showMessage("Creating account...");

    const result = await window.registerWithEmail(email, password);

    if (result.success) {
      showMessage("Account created successfully!");

      setTimeout(() => {
        window.location.href = "set-pin.html";
      }, 500);
    } else {
      showMessage("Registration failed: " + result.message);
      registerButton.disabled = false;
    }
  });
}
