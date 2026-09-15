import { isPhoneOtpConfigured, sendPhoneOtp } from "../../../services/otpProvider";

const PHONE_PATTERN = /^0[689]\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { identifier, channel } = req.body || {};
  const value = String(identifier || "").trim().toLowerCase();
  const valid = channel === "phone" ? PHONE_PATTERN.test(value) : EMAIL_PATTERN.test(value);

  if (!valid) {
    return res.status(400).json({ error: "ข้อมูลสำหรับรับรหัส OTP ไม่ถูกต้อง" });
  }

  if (channel === "phone" && isPhoneOtpConfigured()) {
    try {
      await sendPhoneOtp(value);
      return res.status(200).json({
        success: true,
        expiresIn: 300,
      });
    } catch (error) {
      console.error("OTP send failed:", error.message);
      return res.status(502).json({ error: "ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง" });
    }
  }

  // Keep a local development adapter when no real provider is configured.
  if (process.env.NODE_ENV !== "production") {
    return res.status(200).json({
      success: true,
      expiresIn: 300,
      devOtp: "123456",
    });
  }

  return res.status(501).json({
    error: "ยังไม่ได้ตั้งค่าบริการส่ง OTP สำหรับ production",
  });
}
