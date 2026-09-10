import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import styles from "../../styles/skin-analysis/SkinAnalysisDetails.module.css";

const skinTypeLabels = {
  dry: "ผิวแห้ง",
  oily: "ผิวมัน",
  normal: "ผิวธรรมดา",
  combination: "ผิวผสม",
  sensitive: "ผิวบอบบางแพ้ง่าย",
};

const skinTypeEnglishLabels = {
  dry: "Dry Skin",
  oily: "Oily Skin",
  normal: "Normal Skin",
  combination: "Combination Skin",
  sensitive: "Sensitive Skin",
};

const concernDefinitions = [
  {
    key: "acne",
    label: "สิว",
    aliases: ["acne", "blackhead", "blackheads", "whitehead", "whiteheads", "pimple", "pimples"],
    icon: "acne",
  },
  {
    key: "pores",
    label: "รูขุมขน",
    aliases: ["pores", "pore", "large_pores", "enlarged_pores"],
    icon: "pores",
  },
  {
    key: "wrinkle",
    label: "ริ้วรอย",
    aliases: ["wrinkle", "wrinkles"],
    icon: "wrinkle",
  },
  {
    key: "oiliness",
    label: "ความมัน",
    aliases: ["oiliness", "oil", "oily", "oily_skin"],
    icon: "oiliness",
  },
];

function getAnalysisData(result) {
  const skinType = result.skin_type?.class_name || "-";
  const detections = Array.isArray(result.detections) ? result.detections : [];
  const totalDetectionCount = detections.length;
  const skinQualityScore = Math.max(0, 100 - totalDetectionCount * 8);
  const skinQualityLabel =
    skinQualityScore >= 90
      ? "ดีมาก"
      : skinQualityScore >= 70
        ? "ดี"
        : skinQualityScore >= 50
          ? "ปานกลาง"
          : "ควรดูแล";
  const groups = new Map(
    concernDefinitions.map((item) => [item.key, { ...item, count: 0 }]),
  );

  detections.forEach((detection) => {
    const rawKey = String(detection.class_name || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const definition = concernDefinitions.find((item) => item.aliases.includes(rawKey));
    if (definition) groups.get(definition.key).count += 1;
  });

  const concerns = Array.from(groups.values(), (item) => ({
    ...item,
    score: Math.max(0, 10 - item.count),
  }));
  const activeConcerns = concerns.filter((item) => item.count > 0);
  const detectedLabels = activeConcerns.map((item) => item.label);
  const summary =
    typeof result.analysis_summary === "string"
      ? result.analysis_summary
      : typeof result.summary === "string"
        ? result.summary
        : "";
  const summaryText =
    summary ||
    (detectedLabels.length
      ? `ส่วนล่างของใบหน้าคุณมีลักษณะ${detectedLabels.join(" และ ")} เมื่อผิวของคุณเริ่มมีสัญญาณเหล่านี้ ควรดูแลอย่างสม่ำเสมอและเลือกผลิตภัณฑ์ที่เหมาะกับผิวคุณ`
      : "ผิวของคุณยังไม่พบจุดที่น่ากังวลเป็นพิเศษ ควรดูแลผิวอย่างสม่ำเสมอเพื่อรักษาสมดุลของผิว");

  return {
    skinType,
    skinTypeLabel: skinTypeLabels[skinType.toLowerCase()] || skinType,
    skinTypeEnglishLabel: skinTypeEnglishLabels[skinType.toLowerCase()] || skinType,
    skinQualityScore,
    skinQualityLabel,
    totalDetectionCount,
    detections,
    concerns,
    activeConcerns,
    summaryText,
  };
}

function ConcernIcon({ type }) {
  if (type === "wrinkle") {
    return (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M4 12Q12 5 20 12T36 12M4 20Q12 13 20 20T36 20M4 28Q12 21 20 28T36 28" />
      </svg>
    );
  }

  if (type === "oiliness") {
    return (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M20 4C20 4 10 16 10 23a10 10 0 0 0 20 0C30 16 20 4 20 4Z" />
        <path d="M15 27c2 2 5 3 8 1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M3 14h12l3 12q2 5 4 0l3-12h12M5 21h5m20 0h5M9 28h1m20 0h1M14 33h1m10 0h1M20 5v4M9 6l3 4M31 6l-3 4" />
    </svg>
  );
}

export default function SkinAnalysisDetails({ result, image }) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState(image || "");
  const data = getAnalysisData(result);
  const products = Array.isArray(result.product_recommendations)
    ? result.product_recommendations
    : [];

  useEffect(() => {
    setPreviewUrl(image || "");
  }, [image]);

  const advice = [
    data.activeConcerns.length
      ? "เน้นผลิตภัณฑ์ช่วยปลอบประโลมและเสริม Skin Barrier"
      : "เน้นผลิตภัณฑ์ที่ช่วยรักษาสมดุลและเสริม Skin Barrier",
    "ใช้ routine แบบอ่อนโยนและสม่ำเสมอ",
    "ทากันแดดทุกวัน",
    "อย่า exfoliate หรือใช้ active แรงหลายตัวพร้อมกัน",
  ];

  const handleViewAllProducts = () => {
    sessionStorage.setItem(
      "wela-product-recommendations",
      JSON.stringify(products),
    );
    router.push("/recommendations");
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>รายละเอียดการวิเคราะห์ผิว</h1>
        <p>เจาะลึกรายละเอียดผิวของคุณพร้อมคำแนะนำเฉพาะด้าน</p>
      </header>

      <section className={styles.scoreCard}>
        <div className={styles.faceImageWrapper}>
          {previewUrl ? (
            <img src={previewUrl} alt="รูปภาพที่ใช้วิเคราะห์ผิว" className={styles.faceImage} />
          ) : (
            <span>ไม่มีรูปภาพ</span>
          )}
        </div>

        <div className={styles.scoreContent}>
          <h2>Skin Score</h2>
          <div className={styles.score}>
            <strong>{data.skinQualityScore}</strong>
            <span>/100</span>
          </div>
          <p>ผิวของคุณอยู่ในเกณฑ์ <b>{data.skinQualityLabel}</b> <span aria-hidden="true">✨</span></p>
          <div className={styles.scoreBar}>
            <span style={{ left: `${data.skinQualityScore}%` }} />
          </div>
          <div className={styles.scoreScale}>
            <span>ต้องฟื้นฟู</span><span>ปานกลาง</span><span>ดี</span><span>ดีเยี่ยม</span>
          </div>
        </div>
      </section>

      <section className={styles.typeCard}>
        <strong>ประเภทของผิว</strong>
        <span>{data.skinTypeLabel || "-"} ({data.skinTypeEnglishLabel || "-"})</span>
      </section>

      <section className={styles.summaryCard}>
        <h2>ภาพรวมผลลัพธ์ :</h2>
        <p>{data.summaryText}</p>
      </section>

      <section className={styles.analysisCard}>
        <h2>การวิเคราะห์ผิวด้วย AI ของคุณ</h2>
        <div className={styles.concernList}>
          {data.concerns.map((item) => (
            <div key={item.key} className={styles.concernItem}>
              <div className={styles.concernIcon}><ConcernIcon type={item.icon} /></div>
              <span className={styles.concernLabel}>{item.label}</span>
              <div className={styles.concernMeter}>
                <span>{item.score >= 8 ? "Excellent" : item.score >= 7 ? "good" : "Medium"}</span>
                <div className={styles.concernBar}><i style={{ width: `${item.score * 10}%` }} /></div>
              </div>
              <b className={styles.concernScore}>{item.score}/10</b>
            </div>
          ))}
        </div>

        <div className={styles.advice}>
          <h2>สิ่งที่ผิวคุณต้องการตอนนี้</h2>
          <p>จากผลวิเคราะห์ เราสรุปแนวทางการดูแลที่เหมาะกับสภาพผิวของคุณ<br />เพื่อช่วยให้คุณดูแลผิวได้ตรงจุดมากขึ้น</p>
          <ul>{advice.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className={styles.productCard}>
        <div className={styles.productHeader}>
          <div>
            <p className={styles.productEyebrow}>ชุดสกินแคร์ที่เหมาะกับคุณ</p>
            <h2>Your Personalized Skincare Set</h2>
          </div>

          <button type="button" className={styles.viewAllButton} onClick={handleViewAllProducts}>
            ดูทั้งหมด
            <span>›</span>
          </button>
        </div>

        <div className={styles.products}>
          {products.length > 0 ? (
            products.slice(0, 4).map((product, index) => {
              const productImage =
                product.image && String(product.image).toLowerCase() !== "null"
                  ? product.image
                  : product.image_url || "/images/products/unknow.png";

              return (
                <article key={`${product.category}-${product.id || index}`} className={styles.product}>
                  <div className={styles.productImageWrapper}>
                    <img
                      className={styles.productImage}
                      src={productImage}
                      alt={product.category || "สกินแคร์แนะนำ"}
                    />
                  </div>
                  <h3>{product.category || "Skincare"}</h3>
                  <p>{product.recommendation_focus || "-"}</p>
                </article>
              );
            })
          ) : (
            <p className={styles.noProducts}>ยังไม่มีผลิตภัณฑ์แนะนำสำหรับผลวิเคราะห์นี้</p>
          )}
        </div>
      </section>
    </main>
  );
}
