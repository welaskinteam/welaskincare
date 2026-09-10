const PRODUCT_RECOMMENDATION_API_URL =
  process.env.PRODUCT_RECOMMENDATION_API_URL ||
  "https://welaskin.com/api/products/recommend.php";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const upstreamResponse = await fetch(PRODUCT_RECOMMENDATION_API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request.body),
    });
    const contentType = upstreamResponse.headers.get("content-type") || "application/json";
    const responseBody = await upstreamResponse.text();

    response.status(upstreamResponse.status);
    response.setHeader("content-type", contentType);
    response.send(responseBody);
  } catch (error) {
    console.error("Product recommendation API proxy error:", error);
    response.status(502).json({ message: "Unable to reach the product recommendation API." });
  }
}
