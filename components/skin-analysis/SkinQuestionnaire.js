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

    if (loading) {
        return <SkinAnalysisLoading />;
    }

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
    if (step === 1 && !value.gender) {
      setError("กรุณาเลือกเพศ");
      return false;
    }

    if (step === 2 && !value.ageRange) {
      setError("กรุณาเลือกช่วงอายุ");
      return false;
    }

    if (step === 3 && !value.skinType) {
      setError("กรุณาเลือกสภาพผิว");
      return false;
    }

    if (step === 4 && !value.concerns.trim()) {
      setError("กรุณาเลือกปัญหาผิว");
      return false;
    }

    if (step === 5 && !value.goal) {
        setError("กรุณาเลือกเป้าหมาย");
        return false;
    }

    return true;
  };


  /* MARK: Next */

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setError("");

    if (step < 5) {
        setStep((prev) => prev + 1);
        return;
    }

    handleAnalyze();

    console.log("Questionnaire completed:", {
      gender: value.gender,
      ageRange: value.ageRange,
      skinType: value.skinType,
      concerns: value.concerns,
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

  const handleAnalyze = async () => {
    if (!image) {
      setError(
        "ไม่พบรูปภาพ กรุณากลับไปถ่ายรูปใหม่"
      );
      return;
    }

    if (!value.goal) {
      setError(
        "ยังไม่ได้เลือกเป้าหมายในการดูแลผิว"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await analyzeSkin({
        image,
        gender: value.gender,
        ageRange: value.ageRange,
        skinType: value.skinType,
        concerns: value.concerns.trim(),
        goal: value.goal,
      });

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
    } finally {
      setLoading(false);
    }
  };


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
            updateField("gender", gender)
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
            updateField("goal", goal)
            }
            onNext={handleNext}
            onBack={handleBack}
            loading={loading}
        />

        {errorMessage}
        </>
    );
    }

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
      />

      {errorMessage}
    </>
  );
}