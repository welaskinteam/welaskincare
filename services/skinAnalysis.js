import { apiFetch } from "./api";

export async function analyzeSkin({
  image,
  gender,
  ageRange,
  skinType,
  concerns,
  goal,
}) {
  const data = new FormData();

  data.append("image", image);
  data.append("gender", gender);
  data.append("ageRange", ageRange);
  data.append("skinType", skinType);
  data.append("concerns", concerns);
  data.append("goal", goal);

  return apiFetch("/predict", {
    method: "POST",
    body: data,
  });
}