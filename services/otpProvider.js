const TWILIO_VERIFY_URL = "https://verify.twilio.com/v2/Services";

function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) return null;

  return { accountSid, authToken, serviceSid };
}

export function isPhoneOtpConfigured() {
  return Boolean(getTwilioConfig());
}

export function toE164ThaiPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("+66")) return digits;
  if (digits.startsWith("66")) return `+${digits}`;
  if (digits.startsWith("0")) return `+66${digits.slice(1)}`;
  return `+${digits}`;
}

async function twilioRequest(path, body) {
  const config = getTwilioConfig();
  if (!config) {
    throw new Error("ยังไม่ได้ตั้งค่าบริการส่ง OTP (Twilio)");
  }

  const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const response = await fetch(`${TWILIO_VERIFY_URL}/${config.serviceSid}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "ไม่สามารถส่งหรือตรวจสอบรหัส OTP ได้");
  }

  return data;
}

export function sendPhoneOtp(phone) {
  return twilioRequest("/Verifications", {
    To: toE164ThaiPhone(phone),
    Channel: "sms",
  });
}

export function verifyPhoneOtp(phone, code) {
  return twilioRequest("/VerificationCheck", {
    To: toE164ThaiPhone(phone),
    Code: code,
  });
}
