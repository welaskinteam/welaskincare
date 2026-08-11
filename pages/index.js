import { useState } from "react";

import PrivacyConsent from "../components/PrivacyConsent";
import ScanIntro from "../components/skin-analysis/ScanIntro";
import FaceCamera from "../components/skin-analysis/FaceCamera";
import ScanResultPreview from "../components/skin-analysis/ScanResultPreview";
import SkinQuestionnaire from "../components/skin-analysis/SkinQuestionnaire";
import SkinAnalysisResult from "../components/skin-analysis/SkinAnalysisResult";

export default function Home() {
  const [step, setStep] = useState("privacy");

  const [result, setResult] = useState(null);

  const [image, setImage] = useState(null);

  const [questionnaire, setQuestionnaire] = useState({
    gender: "",
    ageRange: "",
    skinType: "",
    concerns: "",
    goal: "",
  });

  const handleAnalysisResult = (data) => {
    setResult(data);
    setStep("result");
  };

  const handleAcceptPrivacy = () => {
    setStep("scan-intro");
  };

  const handleStartScan = () => {
    setStep("camera");
  };

  const handleImageSelected = (file) => {
    setImage(file);
    setStep("scan-result");
  };

  const handleContinueQuestionnaire = () => {
    setStep("questionnaire");
  };

  const handleSkipQuestionnaire = () => {
    console.log("Analyze immediately");
  };

  switch (step) {
    case "privacy":
      return (
        <PrivacyConsent
          onAccept={handleAcceptPrivacy}
        />
      );

    case "scan-intro":
      return (
        <ScanIntro
          onStart={handleStartScan}
        />
      );

    case "camera":
      return (
        <FaceCamera
          onImageSelected={handleImageSelected}
        />
      );

    case "scan-result":
      return (
        <ScanResultPreview
          image={image}
          onContinue={handleContinueQuestionnaire}
          onAnalyzeNow={handleSkipQuestionnaire}
        />
      );

    case "questionnaire":
      return (
        <SkinQuestionnaire
          image={image}
          value={questionnaire}
          onChange={setQuestionnaire}
          onResult={handleAnalysisResult}
        />
      );

    case "result":
      return (
        <SkinAnalysisResult
          result={result}
        />
      );

    default:
      return null;
  }
}