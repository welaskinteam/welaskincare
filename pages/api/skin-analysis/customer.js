const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const CUSTOMER_API_URL = (
  process.env.SKIN_ANALYSIS_CUSTOMER_API_URL ||
  (process.env.SKIN_ANALYSIS_SAVE_API_URL || "").replace(/\/create\.php\/?$/, "/customer.php")
).replace(/\/$/, "");
const WRITE_API_KEY = process.env.SKIN_ANALYSIS_WRITE_API_KEY || "";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "16kb",
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

  if (!CUSTOMER_API_URL || !WRITE_API_KEY) {
    sendError(response, 500, "SERVER_MISCONFIGURED", "Customer API is not configured");
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
    const limit = Number.isInteger(Number(body.limit)) ? Math.min(50, Math.max(1, Number(body.limit))) : 20;
    const offset = Number.isInteger(Number(body.offset)) ? Math.max(0, Number(body.offset)) : 0;

    const upstreamResponse = await fetch(CUSTOMER_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": WRITE_API_KEY,
      },
      body: JSON.stringify({
        provider: "google",
        provider_user_id: user.sub,
        limit,
        offset,
      }),
    });

    const contentType = upstreamResponse.headers.get("content-type") || "application/json";
    const responseBody = await upstreamResponse.text();

    response.status(upstreamResponse.status);
    response.setHeader("content-type", contentType);
    response.send(responseBody);
  } catch (error) {
    console.error("Customer analysis proxy error:", error);
    sendError(response, 502, "UPSTREAM_ERROR", "Unable to load customer analysis");
  }
}
