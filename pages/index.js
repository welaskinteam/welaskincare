import { useRef, useState } from "react";
import { useRouter } from "next/router";

import { analyzeSkin } from "../services/skinAnalysis";
import { getProductRecommendations } from "../services/productRecommendations";
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

  const handleViewAllDetails = async () => {
    let imageDataUrl = "";

    if (typeof image === "string") {
      imageDataUrl = image;
    } else if (image instanceof Blob) {
      imageDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(image);
      });
    }

    sessionStorage.setItem(
      "wela-skin-analysis-details",
      JSON.stringify({ result, image: imageDataUrl }),
    );
    sessionStorage.setItem(
      "wela-product-recommendations",
      JSON.stringify(
        Array.isArray(result?.product_recommendations)
          ? result.product_recommendations
          : [],
      ),
    );
    router.push("/skin-analysis-details");
  };

  const handleViewAllProducts = () => {
    const recommendations = Array.isArray(result?.product_recommendations)
      ? result.product_recommendations
      : [];

    sessionStorage.setItem(
      "wela-product-recommendations",
      JSON.stringify(recommendations),
    );
    router.push("/recommendations");
  };

  const handleSkipQuestionnaire = async () => {
    if (analyzing.current) return;
    analyzing.current = true;
    setAnalysisError("");
    setStep("analyzing");
    try {
      const analysisResult = await analyzeSkin({ image });
      const concerns = [
        ...new Set(
          (Array.isArray(analysisResult.detections)
            ? analysisResult.detections
            : []
          )
            .map((detection) => detection.class_name)
            .filter(Boolean)
            .map((concern) =>
              String(concern).trim().toLowerCase().replace(/[\s-]+/g, "_"),
            ),
        ),
      ];
      const skinType = analysisResult.skin_type?.class_name
        ? String(analysisResult.skin_type.class_name)
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_")
        : null;

      const recommendationResponse = await getProductRecommendations({
        skinType,
        concerns: concerns.length ? concerns : null,
        goal: null,
      }).catch((error) => {
        console.error("Product Recommendation Error:", error);
        return { items: [] };
      });
      const productRecommendations = Array.isArray(recommendationResponse.items)
        ? recommendationResponse.items.map((product) => ({
            ...product,
            image: product.image || product.image_url,
            url: product.url || product.product_url,
            focus: product.recommendation_focus,
          }))
        : [];

      handleAnalysisResult({
        ...analysisResult,
        product_recommendations: productRecommendations,
      });
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
            onViewAllDetails={handleViewAllDetails}
            onViewAllProducts={handleViewAllProducts}
          />
        </>
      );

    default:
      return null;
  }
}
