import { useRef, useState } from "react";
import { useRouter } from "next/router";

import { analyzeSkin } from "../services/skinAnalysis";
import SkinAnalysisLoading from "../components/skin-analysis/SkinAnalysisLoading";
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

  const analyzing = useRef(false);
  const [analysisError, setAnalysisError] = useState("");
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
    if (analyzing.current) return;
    analyzing.current = true;
    setAnalysisError("");
    setStep("analyzing");
    try {
      handleAnalysisResult(await analyzeSkin({ image }));
    } catch (error) {
      setAnalysisError("ไม่สามารถรับผลวิเคราะห์ได้ กรุณาลองอีกครั้ง");
      setStep("scan-result");
    } finally {
      analyzing.current = false;
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

    case "analyzing":
      return <><Head /><SkinAnalysisLoading /></>;

    case "scan-result":
      return (
        <>
          <Head />
          {analysisError && <p role="alert" style={{ padding: 16, color: "#8A102F" }}>{analysisError}</p>}
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
