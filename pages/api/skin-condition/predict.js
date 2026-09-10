const SKIN_CONDITION_API_URL = (
  process.env.SKIN_CONDITION_API_URL || "https://api.xobazjr.com"
).replace(/\/$/, "");

export const config = {
  api: {
    bodyParser: false,
  },
};

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ detail: "Method not allowed" });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const upstreamResponse = await fetch(`${SKIN_CONDITION_API_URL}/predict`, {
      method: "POST",
      headers: {
        "content-type": request.headers["content-type"] || "multipart/form-data",
      },
      body,
    });
    const contentType = upstreamResponse.headers.get("content-type") || "application/json";
    const responseBody = await upstreamResponse.text();

    response.status(upstreamResponse.status);
    response.setHeader("content-type", contentType);
    response.send(responseBody);
  } catch (error) {
    console.error("Skin Condition API proxy error:", error);
    response.status(502).json({ detail: "Unable to reach the Skin Condition API." });
  }
}
