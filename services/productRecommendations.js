import { apiFetch } from "./api";

export async function getProductRecommendations({ skinType, concerns, goal }) {
  return apiFetch("/api/products/recommend", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      skin_type: skinType,
      concerns,
      goal,
    }),
  });
}
