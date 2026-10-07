import { verifyPin } from "./verify-pin.js";
import { createLoginToken } from "./create-token.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { phone, pin } = req.body || {};

    if (!phone || !/^\d{6}$/.test(String(pin || ""))) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and 6-digit PIN are required."
      });
    }

    const user = await verifyPin(String(phone).trim(), String(pin));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or PIN."
      });
    }

    const token = await createLoginToken(user.uid);

    return res.status(200).json({
      success: true,
      token,
      user: {
        uid: user.uid,
        name: user.name,
        phone: user.phone,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login API error:", error);

    return res.status(500).json({
      success: false,
      message: "Login service error."
    });
  }
}
