import { verifyLineIdToken } from "../../../lib/lineAuth";

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

  const idToken = request.body?.idToken;

  if (typeof idToken !== "string" || !idToken.trim()) {
    sendError(response, 400, "INVALID_REQUEST", "LINE ID token is required");
    return;
  }

  try {
    const identity = await verifyLineIdToken(idToken);

    if (!identity) {
      sendError(response, 401, "UNAUTHORIZED", "LINE authentication is invalid or expired");
      return;
    }

    response.status(200).json({
      success: true,
      user: {
        provider: identity.provider,
        id: identity.providerUserId,
        email: identity.email,
        name: identity.displayName,
        picture: identity.pictureUrl,
        email_verified: identity.emailVerified,
      },
    });
  } catch (error) {
    console.error("LINE authentication proxy error:", error);
    sendError(response, 502, "UPSTREAM_ERROR", "Unable to verify LINE authentication");
  }
}
