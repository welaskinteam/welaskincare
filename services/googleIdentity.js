const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";

let googleIdentityPromise = null;

function loadGoogleIdentity() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Login ใช้งานได้บน browser เท่านั้น"));
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }

  if (!googleIdentityPromise) {
    googleIdentityPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.oauth2) {
          resolve(window.google);
        } else {
          googleIdentityPromise = null;
          reject(new Error("ไม่สามารถเริ่ม Google Identity Services ได้"));
        }
      };
      script.onerror = () => {
        googleIdentityPromise = null;
        reject(new Error("ไม่สามารถโหลด Google Identity Services ได้"));
      };
      document.head.appendChild(script);
    });
  }

  return googleIdentityPromise;
}

export async function requestGoogleAccessToken(clientId) {
  if (!clientId) {
    throw new Error("ไม่พบ Google Client ID กรุณาตรวจสอบไฟล์ .env.local");
  }

  const google = await loadGoogleIdentity();

  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error("Google Login ถูกยกเลิกหรือไม่สำเร็จ"));
          return;
        }

        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: "select_account" });
  });
}
