const PRODUCT_LIST_API_URL =
  process.env.PRODUCT_LIST_API_URL || "https://welaskin.com/api/products/";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const upstreamResponse = await fetch(PRODUCT_LIST_API_URL, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";
    const responseBody = await upstreamResponse.text();

    response.status(upstreamResponse.status);
    response.setHeader("content-type", contentType);
    response.send(responseBody);
  } catch (error) {
    console.error("Product list API proxy error:", error);
    response.status(502).json({ message: "Unable to reach the product list API." });
  }
}
