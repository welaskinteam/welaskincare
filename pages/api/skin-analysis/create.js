const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const SAVE_API_URL = (process.env.SKIN_ANALYSIS_SAVE_API_URL || "").replace(/\/$/, "");
const WRITE_API_KEY = process.env.SKIN_ANALYSIS_WRITE_API_KEY || "";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "512kb",
    },
  },
};

function sendError(response, status, code, message) {
  response.status(status).json({
    success: false,
    error: { code, message },
  });
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendError(response, 405, "METHOD_NOT_ALLOWED", "POST only");
    return;
  }

  if (!SAVE_API_URL || !WRITE_API_KEY) {
    sendError(response, 500, "SERVER_MISCONFIGURED", "Analysis storage is not configured");
    return;
  }

  const authorization = request.headers.authorization || "";
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);

  if (!tokenMatch) {
    sendError(response, 401, "UNAUTHORIZED", "Google authentication is required");
    return;
  }

  try {
    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenMatch[1]}` },
    });

    if (!userResponse.ok) {
      sendError(response, 401, "UNAUTHORIZED", "Google authentication is invalid or expired");
      return;
    }

    const user = await userResponse.json();

    if (!user?.sub) {
      sendError(response, 401, "UNAUTHORIZED", "Google account information is incomplete");
      return;
    }

    const body = request.body && typeof request.body === "object" ? request.body : {};
    const payload = {
      ...body,
      customer: {
        provider: "google",
        provider_user_id: user.sub,
        email: typeof user.email === "string" ? user.email : null,
        display_name: typeof user.name === "string" ? user.name : null,
        email_verified: user.email_verified === true,
      },
    };

    const upstreamResponse = await fetch(SAVE_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": WRITE_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const contentType = upstreamResponse.headers.get("content-type") || "application/json";
    const responseBody = await upstreamResponse.text();

    response.status(upstreamResponse.status);
    response.setHeader("content-type", contentType);
    response.send(responseBody);
  } catch (error) {
    console.error("Skin analysis storage proxy error:", error);
    sendError(response, 502, "UPSTREAM_ERROR", "Unable to save skin analysis");
  }
}
