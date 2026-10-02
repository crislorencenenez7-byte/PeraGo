const PIN_KEY = "perago_pin";

export function hasPin() {
  return !!localStorage.getItem(PIN_KEY);
}

export function savePin(pin) {
  if (!/^\d{6}$/.test(pin)) {
    throw new Error("PIN must be exactly 6 digits.");
  }

  localStorage.setItem(PIN_KEY, pin);
}

export function checkPin(pin) {
  return localStorage.getItem(PIN_KEY) === pin;
}

export function removePin() {
  localStorage.removeItem(PIN_KEY);
}
