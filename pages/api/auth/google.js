const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accessToken = String(req.body?.accessToken || "");

  if (!accessToken) {
    return res.status(400).json({ error: "ไม่พบ Google access token" });
  }

  try {
    const googleResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await googleResponse.json().catch(() => null);

    if (!googleResponse.ok || !profile?.sub || !profile?.email || !profile.email_verified) {
      return res.status(401).json({ error: "ไม่สามารถยืนยันบัญชี Google ได้" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: `google-${profile.sub}`,
        provider: "google",
        identifier: profile.email.toLowerCase(),
        name: profile.name || "",
        picture: profile.picture || "",
        authenticatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Google authentication failed:", error);
    return res.status(502).json({ error: "ไม่สามารถเชื่อมต่อ Google เพื่อยืนยันบัญชีได้" });
  }
}
