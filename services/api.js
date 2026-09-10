const API_URL = (
  process.env.NEXT_PUBLIC_SKIN_CONDITION_API_URL ||
  process.env.NEXT_PUBLIC_SKIN_AI_API_URL ||
  ""
).replace(/\/$/, "");

export async function apiFetch(
  endpoint,
  options = {}
) {
  const url = endpoint.startsWith("/api/")
    ? endpoint
    : API_URL
      ? `${API_URL}/${endpoint.replace(/^\/+/, "")}`
      : null;

  if (!url) {
    throw new Error("Skin Condition API URL is not configured.");
  }

  console.log("API Request:", url);

  const response = await fetch(
    url,
    options
  );

  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    console.error(
      "API returned non-JSON:",
      text
    );

    data = {
      detail: text,
    };
  }

  if (!response.ok) {
    const detail = data?.detail;

    throw new Error(
      detail
        ? typeof detail === "string"
          ? detail
          : JSON.stringify(detail)
        : `API Error: ${response.status}`
    );
  }

  return data;
}
