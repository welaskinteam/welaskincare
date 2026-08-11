const API_URL = process.env.NEXT_PUBLIC_SKIN_AI_API_URL;

export async function apiFetch(
  endpoint,
  options = {}
) {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_SKIN_AI_API_URL is not configured."
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    options
  );

  const data = await response.json();

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