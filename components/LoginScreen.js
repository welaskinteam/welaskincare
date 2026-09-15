import { useEffect, useRef, useState } from "react";

import {
  isValidThaiPhone,
  normalizePhone,
  requestOtp,
  saveAuthSession,
  verifyOtp,
} from "../services/auth";
import { requestGoogleAccessToken } from "../services/googleIdentity";
import styles from "../styles/LoginScreen.module.css";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function GoogleIcon() {
  return (
    <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.31 2.99-7.39Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.22-2.51c-.89.6-2.02.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.59A9.98 9.98 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.89A6 6 0 0 1 6.08 12c0-.66.11-1.3.31-1.89V7.52H3.06A10 10 0 0 0 2 12c0 1.61.39 3.13 1.06 4.48l3.33-2.59Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.8.51 3.84 1.51l2.88-2.88C16.96 2.9 14.7 2 12 2a9.98 9.98 0 0 0-8.94 5.52l3.33 2.59C7.18 7.74 9.39 5.98 12 5.98Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className={styles.emailIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="2" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LoginScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const otpInputRef = useRef(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const identifier = mode === "phone" ? normalizePhone(phone) : email.trim().toLowerCase();

  useEffect(() => {
    if (resendIn <= 0) return undefined;

    const timer = window.setInterval(() => {
      setResendIn((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendIn]);

  useEffect(() => {
    if (otpSent) otpInputRef.current?.focus();
  }, [otpSent]);

  const resetFeedback = () => {
    setError("");
    setMessage("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setOtpSent(false);
    setOtp("");
    setResendIn(0);
    resetFeedback();
  };

  const validateIdentifier = () => {
    if (mode === "phone" && !isValidThaiPhone(phone)) {
      setError("กรุณากรอกเบอร์โทรศัพท์มือถือให้ถูกต้อง เช่น 0812345678");
      return false;
    }

    if (mode === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return false;
    }

    return true;
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!validateIdentifier()) return;

    setLoading(true);
    try {
      const result = await requestOtp({ identifier, channel: mode });
      setOtpSent(true);
      setResendIn(RESEND_SECONDS);
      setMessage(
        result.devOtp
          ? `โหมดพัฒนา: ใช้รหัส ${result.devOtp} เพื่อทดสอบ`
          : `ส่งรหัส OTP ไปที่ ${mode === "phone" ? identifier : email.trim()} แล้ว`,
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!/^\d{6}$/.test(otp)) {
      setError("กรุณากรอกรหัส OTP 6 หลัก");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp({ identifier, channel: mode, code: otp });
      saveAuthSession(result.user);
      onAuthenticated(result.user);
    } catch (verifyError) {
      setError(verifyError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    resetFeedback();
    setLoading(true);

    try {
      const accessToken = await requestGoogleAccessToken(googleClientId);
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
      }

      saveAuthSession(result.user);
      onAuthenticated(result.user);
    } catch (googleError) {
      setError(googleError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <div className={styles.header}>
          <h1>
            {otpSent
              ? "กรอกรหัส OTP"
              : mode === "phone"
                ? "กรอกเบอร์โทรศัพท์มือถือ"
                : "กรอกอีเมล"}
          </h1>
          <p>
            {otpSent
              ? `รหัสยืนยันถูกส่งไปที่ ${mode === "phone" ? identifier : email.trim()}`
              : mode === "phone"
                ? "รอรับรหัส OTP เพื่อยืนยันเบอร์โทรศัพท์"
                : "รอรับรหัสยืนยันเพื่อยืนยันอีเมล"}
          </p>
        </div>

        {otpSent ? (
          <form className={styles.form} onSubmit={handleVerifyOtp}>
            <label htmlFor="otp">รหัส OTP</label>
            <input
              ref={otpInputRef}
              id="otp"
              className={styles.input}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              placeholder="กรอกรหัส 6 หลัก"
              aria-invalid={Boolean(error)}
            />
            <button className={styles.primaryButton} type="submit" disabled={loading}>
              {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
            </button>
            <div className={styles.otpActions}>
              <button type="button" onClick={() => { setOtpSent(false); setOtp(""); resetFeedback(); }}>
                เปลี่ยนช่องทาง
              </button>
              <button type="button" disabled={resendIn > 0 || loading} onClick={handleRequestOtp}>
                {resendIn > 0 ? `ส่งอีกครั้งใน ${resendIn} วินาที` : "ส่งรหัสอีกครั้ง"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <form className={styles.form} onSubmit={handleRequestOtp}>
              {mode === "email" && (
                <button type="button" className={styles.backToPhone} onClick={() => switchMode("phone")}>
                  ← กลับไปใช้เบอร์โทรศัพท์
                </button>
              )}
              <label htmlFor={mode === "phone" ? "phone" : "email"}>
                {mode === "phone" ? "เบอร์โทรศัพท์" : "อีเมล"}
              </label>
              <input
                id={mode === "phone" ? "phone" : "email"}
                className={styles.input}
                type={mode === "phone" ? "tel" : "email"}
                inputMode={mode === "phone" ? "tel" : "email"}
                autoComplete={mode === "phone" ? "tel" : "email"}
                value={mode === "phone" ? phone : email}
                onChange={(event) => mode === "phone" ? setPhone(event.target.value) : setEmail(event.target.value)}
                placeholder={mode === "phone" ? "080000XXXX" : "you@example.com"}
                aria-invalid={Boolean(error)}
              />
              <button className={styles.primaryButton} type="submit" disabled={loading}>
                {loading ? "กำลังส่งรหัส..." : "ส่งรหัส OTP"}
              </button>
            </form>

            <div className={styles.divider}><span>หรือ</span></div>

            <div className={styles.socialButtons}>
              <button type="button" className={styles.socialButton} onClick={handleGoogle} disabled={loading}>
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
              <button type="button" className={styles.socialButton} onClick={() => switchMode("email")}>
                <EmailIcon />
                <span>Continue with Email</span>
              </button>
            </div>
          </>
        )}

        {message && <p className={styles.message} role="status">{message}</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}

        {!otpSent && (
          <p className={styles.register}>
            ยังไม่มีบัญชีใช่ไหม? <button type="button" onClick={() => switchMode("phone")}>สมัครสมาชิก</button>
          </p>
        )}
      </section>
    </main>
  );
}
