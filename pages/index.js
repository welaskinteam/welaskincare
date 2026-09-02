import { useState } from "react";
import { useRouter } from "next/router";

import PrivacyConsent from "../components/PrivacyConsent";
import ScanIntro from "../components/skin-analysis/ScanIntro";
import FaceCamera from "../components/skin-analysis/FaceCamera";
import ScanResultPreview from "../components/skin-analysis/ScanResultPreview";
import SkinQuestionnaire from "../components/skin-analysis/SkinQuestionnaire";
import SkinAnalysisResult from "../components/skin-analysis/SkinAnalysisResult";
import Head from "@/components/head";

export default function Home() {
  const router = useRouter();
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
            onViewAllProducts={() => router.push("/recommendations")}
          />
        </>
      );

    default:
      return null;
  }
}
