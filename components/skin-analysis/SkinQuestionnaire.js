import { useState } from "react";
import { analyzeSkin } from "../../services/skinAnalysis";

import GenderQuestion from "./GenderQuestion";
import AgeQuestion from "./AgeQuestion";
import SkinTypeQuestion from "./SkinTypeQuestion";
import SkinConcernQuestion from "./SkinConcernQuestion";
import GoalQuestion from "./GoalQuestion";
import SkinAnalysisLoading from "./SkinAnalysisLoading";

export default function SkinQuestionnaire({
  image,
  value,
  onChange,
  onResult,
  onBack,
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* MARK: Update Field */

  const updateField = (name, fieldValue) => {
    onChange((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    setError("");
  };


  /* MARK: Validation */

  const validateStep = () => {
    // Step 1: Gender ต้องเลือก
    if (step === 1 && !value.gender) {
      setError("กรุณาเลือกเพศ");
      return false;
    }

    // Step 2: Age ต้องเลือก
    if (step === 2 && !value.ageRange) {
      setError("กรุณาเลือกช่วงอายุ");
      return false;
    }

    // Step 3: Skin Type สามารถ Skip ได้

    // Step 4: Concerns สามารถ Skip ได้

    // Step 5: Goal สามารถ Skip ได้

    return true;
  };


  /* MARK: Next */

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setError("");

    // ไป Step ถัดไป
    if (step < 5) {
      setStep((prev) => prev + 1);
      return;
    }

    // Step 5 → วิเคราะห์
    handleAnalyze();
  };


  /* MARK: Skip */

  const handleSkip = (field) => {
    // ส่งค่าเป็น ""
    updateField(field, "");

    // ถ้าเป็น Step 3 หรือ 4
    // ให้ไป Step ถัดไป
    if (step < 5) {
      setStep((prev) => prev + 1);
      return;
    }

    // ถ้าเป็น Step 5
    // ให้เริ่มวิเคราะห์ทันที
    handleAnalyze({
      [field]: "",
    });
  };


  /* MARK: Back */

  const handleBack = () => {
    setError("");

    if (step === 1) {
      onBack?.();
      return;
    }

    setStep((prev) => prev - 1);
  };


  /* MARK: Analyze */

  const handleAnalyze = async (overrideValues = {}) => {
    if (!image) {
      setError(
        "ไม่พบรูปภาพ กรุณากลับไปถ่ายรูปใหม่"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const analysisData = {
        image,

        gender:
          overrideValues.gender ??
          value.gender ??
          "",

        ageRange:
          overrideValues.ageRange ??
          value.ageRange ??
          "",

        skinType:
          overrideValues.skinType ??
          value.skinType ??
          "",

        concerns:
          overrideValues.concerns ??
          value.concerns?.trim() ??
          "",

        goal:
          overrideValues.goal ??
          value.goal ??
          "",
      };

      console.log(
        "Questionnaire completed:",
        {
          gender: analysisData.gender,
          ageRange: analysisData.ageRange,
          skinType: analysisData.skinType,
          concerns: analysisData.concerns,
          goal: analysisData.goal,
        }
      );

      const result = await analyzeSkin(
        analysisData
      );

      onResult(result);

    } catch (error) {
      console.error(
        "Skin Analysis Error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถวิเคราะห์ผิวได้"
      );

      setLoading(false);
    }
  };


  /* MARK: Loading */

  if (loading) {
    return <SkinAnalysisLoading />;
  }


  /* MARK: Error */

  const errorMessage = error ? (
    <div
      role="alert"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "90px",
        zIndex: 30,
        padding: "12px 20px",
        textAlign: "center",
        color: "#8A102F",
      }}
    >
      {error}
    </div>
  ) : null;


  /* MARK: Step 1 */

  if (step === 1) {
    return (
      <>
        <GenderQuestion
          value={value.gender}
          onChange={(gender) =>
            updateField(
              "gender",
              gender
            )
          }
          onNext={handleNext}
          onBack={handleBack}
        />

        {errorMessage}
      </>
    );
  }


  /* MARK: Step 2 */

  if (step === 2) {
    return (
      <>
        <AgeQuestion
          value={value.ageRange}
          onChange={(ageRange) =>
            updateField(
              "ageRange",
              ageRange
            )
          }
          onNext={handleNext}
          onBack={handleBack}
        />

        {errorMessage}
      </>
    );
  }


  /* MARK: Step 3 */

  if (step === 3) {
    return (
      <>
        <SkinTypeQuestion
          value={value.skinType}
          onChange={(skinType) =>
            updateField(
              "skinType",
              skinType
            )
          }
          onNext={handleNext}
          onBack={handleBack}
          onSkip={() =>
            handleSkip("skinType")
          }
        />

        {errorMessage}
      </>
    );
  }


  /* MARK: Step 4 */

  if (step === 4) {
    return (
      <>
        <SkinConcernQuestion
          value={value.concerns}
          onChange={(concerns) =>
            updateField(
              "concerns",
              concerns
            )
          }
          onNext={handleNext}
          onBack={handleBack}
          onSkip={() =>
            handleSkip("concerns")
          }
        />

        {errorMessage}
      </>
    );
  }


  /* MARK: Step 5 */

  if (step === 5) {
    return (
      <>
        <GoalQuestion
          value={value.goal}
          onChange={(goal) =>
            updateField(
              "goal",
              goal
            )
          }
          onNext={handleNext}
          onBack={handleBack}
          onSkip={() =>
            handleSkip("goal")
          }
          loading={loading}
        />

        {errorMessage}
      </>
    );
  }

  return null;
}