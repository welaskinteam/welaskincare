const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";

function getHeader(request, name) {
  const value = request.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function getLineChannelId() {
  return (
    process.env.LINE_CHANNEL_ID ||
    process.env.NEXT_PUBLIC_LIFF_ID?.split("-")[0] ||
    ""
  );
}

export async function verifyLineIdToken(idToken) {
  const channelId = getLineChannelId();

  if (!channelId || typeof idToken !== "string" || !idToken.trim()) {
    return null;
  }

  const response = await fetch(LINE_VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: channelId,
    }).toString(),
  });

  if (!response.ok) return null;

  const user = await response.json();
  if (!user?.sub) return null;

  return {
    provider: "line",
    providerUserId: user.sub,
    email: typeof user.email === "string" ? user.email : null,
    displayName: typeof user.name === "string" ? user.name : null,
    pictureUrl: typeof user.picture === "string" ? user.picture : null,
    emailVerified: user.email_verified === true,
  };
}

export async function getAuthenticatedIdentity(request) {
  const lineIdToken = getHeader(request, "x-line-id-token");

  if (lineIdToken) {
    return verifyLineIdToken(lineIdToken);
  }

  const authorization = getHeader(request, "authorization") || "";
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);

  if (!tokenMatch) return null;

  const userResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenMatch[1]}` },
  });

  if (!userResponse.ok) return null;

  const user = await userResponse.json();
  if (!user?.sub) return null;

  return {
    provider: "google",
    providerUserId: user.sub,
    email: typeof user.email === "string" ? user.email : null,
    displayName: typeof user.name === "string" ? user.name : null,
    pictureUrl: typeof user.picture === "string" ? user.picture : null,
    emailVerified: user.email_verified === true,
  };
}
