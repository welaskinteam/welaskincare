let currentAnalysisImage = null;

export function setAnalysisImage(image) {
  currentAnalysisImage = image || null;
}

export function getAnalysisImage() {
  return currentAnalysisImage;
}

export function clearAnalysisImage() {
  currentAnalysisImage = null;
}
