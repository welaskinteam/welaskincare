import { isPhoneOtpConfigured, verifyPhoneOtp } from "../../../services/otpProvider";
import { randomUUID } from "node:crypto";

const PHONE_PATTERN = /^0[689]\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { identifier, channel, code } = req.body || {};
  const value = String(identifier || "").trim().toLowerCase();
  const validIdentifier = channel === "phone" ? PHONE_PATTERN.test(value) : EMAIL_PATTERN.test(value);

  if (!validIdentifier || !/^\d{6}$/.test(String(code || ""))) {
    return res.status(400).json({ error: "ข้อมูลยืนยันตัวตนไม่ถูกต้อง" });
  }

  if (channel === "phone" && isPhoneOtpConfigured()) {
    try {
      const result = await verifyPhoneOtp(value, String(code));
      if (result.status !== "approved") {
        return res.status(401).json({ error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: `phone-${value}`,
          provider: "phone",
          identifier: value,
          authenticatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("OTP verification failed:", error.message);
      return res.status(401).json({ error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" });
    }
  }

  if (process.env.NODE_ENV === "production") {
    return res.status(501).json({
      error: "ยังไม่ได้ตั้งค่าบริการตรวจสอบ OTP สำหรับ production",
    });
  }

  if (String(code) !== "123456") {
    return res.status(401).json({ error: "รหัส OTP ไม่ถูกต้อง" });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: `dev-${randomUUID()}`,
      provider: channel,
      identifier: value,
      authenticatedAt: new Date().toISOString(),
    },
  });
}
