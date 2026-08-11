const API_URL =
  process.env.NEXT_PUBLIC_SKIN_AI_API_URL;

export async function apiFetch(
  endpoint,
  options = {}
) {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_SKIN_AI_API_URL is not configured."
    );
  }

  const url = `${API_URL}${endpoint}`;

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