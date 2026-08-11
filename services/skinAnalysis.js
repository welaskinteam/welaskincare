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

  data.append("gender", gender ?? "");
  data.append("ageRange", ageRange ?? "");
  data.append("skinType", skinType ?? "");
  data.append("concerns", concerns ?? "");
  data.append("goal", goal ?? "");

  console.log("Sending FormData:", {
    gender: gender ?? "",
    ageRange: ageRange ?? "",
    skinType: skinType ?? "",
    concerns: concerns ?? "",
    goal: goal ?? "",
    image: image?.name,
  });

  return apiFetch("/predict", {
    method: "POST",
    body: data,
  });
}