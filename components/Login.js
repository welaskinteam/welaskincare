import { useEffect, useRef, useState } from "react";
import styles from "../styles/Login.module.css";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function GoogleIcon() {
  return (
    <img
      className={styles.googleIcon}
      src="/icons/google.svg"
      alt=""
      aria-hidden="true"
    />
  );
}

function MailIcon() {
  return (
    <svg className={styles.mailIcon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export default function Login({ onGoogleSuccess }) {
  const tokenClient = useRef(null);
  const [phone, setPhone] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setMessage("ยังไม่ได้ตั้งค่า Google Client ID");
      return undefined;
    }

    if (window.google?.accounts?.oauth2) {
      setGoogleReady(true);
      return undefined;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    const script = existingScript || document.createElement("script");

    const handleLoad = () => setGoogleReady(true);
    script.addEventListener("load", handleLoad);

    if (!existingScript) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => script.removeEventListener("load", handleLoad);
  }, []);

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID || !googleReady || !window.google?.accounts?.oauth2) {
      setMessage("ไม่สามารถเชื่อมต่อ Google ได้ในขณะนี้");
      return;
    }

    setMessage("");
    tokenClient.current = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid profile email",
      callback: async (response) => {
        if (response.error) {
          setMessage("เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
          return;
        }

        try {
          const userResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${response.access_token}` } },
          );
          const user = await userResponse.json();

          sessionStorage.setItem(
            "wela-auth-user",
            JSON.stringify({ provider: "google", ...user }),
          );
          onGoogleSuccess();
        } catch (error) {
          console.error("Google profile request failed:", error);
          setMessage("ไม่สามารถโหลดข้อมูลบัญชี Google ได้");
        }
      },
    });

    tokenClient.current.requestAccessToken({ prompt: "select_account" });
  };

  const handleUnavailable = (event) => {
    event.preventDefault();
    setMessage("ฟังก์ชันนี้จะเปิดให้ใช้งานในภายหลัง");
  };

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <h1>กรอกเบอร์โทรศัพท์มือถือ</h1>
          <p>รอรับรหัส OTP เพื่อยืนยันเบอร์โทรศัพท์</p>
        </header>

        <form className={styles.phoneForm} onSubmit={handleUnavailable}>
          <label htmlFor="phone">เบอร์โทรศัพท์</label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="080000XXXX"
            disabled
          />
          <button type="submit" disabled>ส่งรหัส OTP</button>
        </form>

        <div className={styles.divider} aria-hidden="true">
          <span />
          <em>Or</em>
          <span />
        </div>

        <div className={styles.alternativeActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleGoogleLogin}
            disabled={!GOOGLE_CLIENT_ID}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleUnavailable}
          >
            <MailIcon />
            <span>Continue with Email</span>
          </button>
        </div>

        <p className={styles.message} role="status">{message}</p>

        <p className={styles.signup}>
          ยังไม่มีบัญชีใช่ไหม?{" "}
          <button type="button" onClick={handleUnavailable}>สมัครสมาชิก</button>
        </p>
      </section>
    </main>
  );
}
