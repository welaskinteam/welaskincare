import { useState } from "react";
import { analyzeSkin } from "../services/skinAnalysis";

import PrivacyConsent from "../components/PrivacyConsent";
import ScanIntro from "../components/skin-analysis/ScanIntro";
import FaceCamera from "../components/skin-analysis/FaceCamera";
import ScanResultPreview from "../components/skin-analysis/ScanResultPreview";
import SkinQuestionnaire from "../components/skin-analysis/SkinQuestionnaire";
import SkinAnalysisResult from "../components/skin-analysis/SkinAnalysisResult";
import Head from "@/components/head";

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

const handleSkipQuestionnaire = async () => {
  if (!image) {
    console.error("ไม่พบรูปภาพ");
    return;
  }

  try {
    console.log("Analyzing immediately with Skin AI...");

    const result = await analyzeSkin({
      image,
      gender: "",
      ageRange: "",
      skinType: "",
      concerns: "",
      goal: "",
    });

    console.log("Skin AI Result:", result);

    handleAnalysisResult(result);

  } catch (error) {
    console.error("Skin Analysis Error:", error);
  }
};

  switch (step) {
    case "privacy":
      return (
        <>
          <Head />
          <PrivacyConsent onAccept={handleAcceptPrivacy} />
        </>
      );

    case "scan-intro":
      return (
        <>
          <Head />
          <ScanIntro onStart={handleStartScan} />
        </>
      );

    case "camera":
      return (
        <>
          <Head />
          <FaceCamera onImageSelected={handleImageSelected} />
        </>
      );

    case "scan-result":
      return (
        <>
          <Head />
          <ScanResultPreview
            image={image}
            onContinue={handleContinueQuestionnaire}
            onAnalyzeNow={handleSkipQuestionnaire}
          />
        </>
      );

    case "questionnaire":
      return (
        <>
          <Head />
          <SkinQuestionnaire
            image={image}
            value={questionnaire}
            onChange={setQuestionnaire}
            onResult={handleAnalysisResult}
          />
        </>
      );

    case "result":
      return (
        <>
          <Head />
          <SkinAnalysisResult
            image={image}
            result={result}
            onViewAllDetails={() => {}}
            onViewAllProducts={() => {}}
          />
        </>
      );

    default:
      return null;
  }
}
