import Head from "next/head";
import { useEffect, useState } from "react";

import SkinAnalysisDetails from "../components/skin-analysis/SkinAnalysisDetails";

export default function SkinAnalysisDetailsPage() {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    try {
      const storedAnalysis = sessionStorage.getItem("wela-skin-analysis-details");
      setAnalysis(storedAnalysis ? JSON.parse(storedAnalysis) : null);
    } catch (error) {
      console.error("Unable to load skin analysis details:", error);
      setAnalysis(null);
    }
  }, []);

  return (
    <>
      <Head>
        <title>รายละเอียดการวิเคราะห์ผิว | Wela</title>
        <meta
          name="description"
          content="รายละเอียดผลการวิเคราะห์ผิวและคำแนะนำเฉพาะด้านจาก Wela"
        />
      </Head>

      {analysis?.result ? (
        <SkinAnalysisDetails result={analysis.result} image={analysis.image} />
      ) : (
        <main style={{ padding: "var(--space-12) var(--page-padding-x)" }}>
          ไม่พบข้อมูลการวิเคราะห์ผิว กรุณากลับไปวิเคราะห์ผิวอีกครั้ง
        </main>
      )}
    </>
  );
}
