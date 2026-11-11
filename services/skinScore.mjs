const ACNE_ALIASES = new Set([
  "acne",
  "blackhead",
  "blackheads",
  "whitehead",
  "whiteheads",
  "pimple",
  "pimples",
  "papule",
  "papules",
  "pustule",
  "pustules",
]);

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null);

const roundToOne = (value) => Math.round(value * 10) / 10;

function unwrapAnalysisData(result) {
  const candidates = [
    result,
    result?.data,
    result?.result,
    result?.data?.result,
    result?.result?.data,
  ];

  return (
    candidates.find(
      (candidate) =>
        candidate &&
        typeof candidate === "object" &&
        (candidate.skin_features ||
          candidate.skin_evenness ||
          candidate.detections ||
          candidate.skin_type),
    ) ?? result ?? {}
  );
}

function numericScore(value) {
  const rawValue = typeof value === "object" ? value?.score : value;
  const score = Number(rawValue);
  return Number.isFinite(score) ? score : null;
}

export function metricToScore(value, { inverse = false } = {}) {
  const score = numericScore(value);

  if (score === null) {
    return null;
  }

  const normalized =
    score <= 1 ? score * 10 : score <= 10 ? score : score <= 100 ? score / 10 : score / 25.5;
  const bounded = Math.max(0, Math.min(10, normalized));

  return inverse ? 10 - bounded : bounded;
}

export function getScoreLabel(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) return "ไม่มีข้อมูล";
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 3) return "Worth Monitoring";
  return "Needs Attention";
}

function average(values) {
  const available = values.filter((value) => value !== null);

  if (!available.length) {
    return null;
  }

  return roundToOne(
    available.reduce((total, value) => total + value, 0) / available.length,
  );
}

export function getWeightedSkinScore(result) {
  const data = unwrapAnalysisData(result);
  const features = data.skin_features ?? {};
  const detections = Array.isArray(data.detections) ? data.detections : [];
  const acneCount = detections.filter((detection) => {
    const className = String(detection?.class_name || detection?.condition || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    return ACNE_ALIASES.has(className);
  }).length;

  const skinTypeScore = metricToScore(
    firstValue(
      data.skin_type?.score,
      data.skin_type?.confidence,
      data.skin_type_confidence,
    ),
  );
  const acneScore = Math.max(0, 10 - acneCount);
  const trainedScore = average([skinTypeScore, acneScore]);

  const opencvScore = average([
    metricToScore(firstValue(data.pore_ratio, features.pore_ratio), {
      inverse: true,
    }),
    metricToScore(firstValue(data.skin_evenness, features.skin_evenness)),
    metricToScore(firstValue(data.smoothness, features.smoothness)),
    metricToScore(firstValue(data.redness_ratio, features.redness_ratio), {
      inverse: true,
    }),
    metricToScore(firstValue(data.glow, features.glow)),
    metricToScore(
      firstValue(data.skin_cleanliness, data.cleanliness, features.cleanliness),
    ),
  ]);

  const weightedGroups = [
    { score: trainedScore, weight: 0.8 },
    { score: opencvScore, weight: 0.2 },
  ].filter((group) => group.score !== null);
  const totalWeight = weightedGroups.reduce(
    (total, group) => total + group.weight,
    0,
  );
  const weightedScore = totalWeight
    ? weightedGroups.reduce(
        (total, group) => total + group.score * group.weight,
        0,
      ) / totalWeight
    : 0;

  return {
    score: Math.round(weightedScore * 10),
    trainedScore,
    skinTypeScore,
    acneScore,
    opencvScore,
    weights: { trained: 0.8, opencv: 0.2 },
  };
}
