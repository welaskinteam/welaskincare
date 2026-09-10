import { apiFetch } from "./api";

export async function analyzeSkin({
  image,
}) {
  if (!(image instanceof Blob)) throw new Error("กรุณาเลือกรูปภาพก่อนวิเคราะห์");
  const data = new FormData();

  // The browser calls our Next.js proxy, which forwards the upload to the
  // Skin Condition API server-side and avoids the external API's CORS policy.
  data.append("image", image);

  const response = await apiFetch("/api/skin-condition/predict", {
    method: "POST",
    body: data,
    signal: AbortSignal.timeout(60000),
  });
  if (response?.detail || response?.error || response?.success === false) {
    throw new Error("ไม่สามารถรับผลวิเคราะห์ได้");
  }
  return normalizeSkinResult(response);
}

export function normalizeSkinResult(response) {
  const data = response?.data ?? response?.result ?? response ?? {};
  const rawType = data.skin_type;
  const className = typeof rawType === "string" ? rawType : rawType?.class_name ?? rawType?.skin_type ?? null;
  return {
    ...data,
    skin_type: { ...(rawType && typeof rawType === "object" ? rawType : {}), class_name: typeof className === "string" ? className : null },
    detections: Array.isArray(data.detections) ? data.detections.filter(item => item && typeof item === "object").map(item => ({ ...item, class_name: item.class_name ?? item.condition ?? null })) : [],
    inference_ms: Number.isFinite(Number(data.inference_ms)) ? Number(data.inference_ms) : 0,
    product_recommendations: Array.isArray(data.product_recommendations) ? data.product_recommendations : [],
  };
}
