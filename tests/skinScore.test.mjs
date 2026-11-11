import test from "node:test";
import assert from "node:assert/strict";

import { getScoreLabel, getWeightedSkinScore } from "../services/skinScore.mjs";

test("uses the same score labels across all pages", () => {
  assert.equal(getScoreLabel(10), "Excellent");
  assert.equal(getScoreLabel(9), "Excellent");
  assert.equal(getScoreLabel(8), "Good");
  assert.equal(getScoreLabel(7), "Good");
  assert.equal(getScoreLabel(4), "Worth Monitoring");
  assert.equal(getScoreLabel(3), "Worth Monitoring");
  assert.equal(getScoreLabel(2), "Needs Attention");
});

test("weights trained scores at 80% and OpenCV scores at 20%", () => {
  const result = getWeightedSkinScore({
    skin_type: { class_name: "oily", score: 0.8 },
    detections: [{ class_name: "acne" }, { class_name: "pimple" }],
    skin_features: {
      pore_ratio: 0.4,
      skin_evenness: { score: 0.6 },
      smoothness: { score: 0.7 },
      redness_ratio: 0.2,
      glow: { score: 0.8 },
      cleanliness: { score: 0.9 },
    },
  });

  assert.equal(result.trainedScore, 8);
  assert.equal(result.opencvScore, 7.3);
  assert.equal(result.score, 79);
});

test("OpenCV changes have no more than 20% influence on the final score", () => {
  const base = {
    skin_type: { class_name: "normal", score: 0.8 },
    detections: [{ class_name: "acne" }, { class_name: "pimple" }],
  };

  const lowOpenCv = getWeightedSkinScore({
    ...base,
    skin_features: { cleanliness: 0.2 },
  });
  const highOpenCv = getWeightedSkinScore({
    ...base,
    skin_features: { cleanliness: 1 },
  });

  assert.equal(lowOpenCv.trainedScore, highOpenCv.trainedScore);
  assert.equal(highOpenCv.score - lowOpenCv.score, 16);
});
