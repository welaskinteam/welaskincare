import { getAuthenticatedIdentity } from "../../../lib/lineAuth";

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

  try {
    const identity = await getAuthenticatedIdentity(request);

    if (!identity) {
      sendError(response, 401, "UNAUTHORIZED", "LINE or Google authentication is invalid or expired");
      return;
    }

    const body = request.body && typeof request.body === "object" ? request.body : {};
    const payload = {
      ...body,
      customer: {
        provider: identity.provider,
        provider_user_id: identity.providerUserId,
        email: identity.email,
        display_name: identity.displayName,
        picture_url: identity.pictureUrl,
        email_verified: identity.emailVerified,
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
