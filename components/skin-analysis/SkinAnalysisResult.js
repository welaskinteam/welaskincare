import { useEffect, useState } from "react";
import styles from "../../styles/skin-analysis/SkinAnalysisResult.module.css";

export default function SkinAnalysisResult({
  image,
  result,
  onViewAllDetails,
  onViewAllProducts,
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  /* MARK: Image Preview */

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    if (typeof image === "string") {
      setPreviewUrl(image);
      return;
    }

    if (image instanceof Blob) {
      const objectUrl = URL.createObjectURL(image);

      console.log("Result Image Blob URL:", objectUrl);

      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setPreviewUrl("");
  }, [image]);

  /* MARK: Empty Result */

  if (!result) {
    return null;
  }

  /* MARK: API Data */

  const aiSkinType =
    result.skin_type?.skin_type ||
    result.skin_type?.prediction ||
    "-";

  const skinTypeConfidence =
    Number(result.skin_type?.confidence) || 0;

  const detections = Array.isArray(
    result.skin_condition?.detections
  )
    ? result.skin_condition.detections
    : [];

  const totalDetectionCount =
    Number(result.skin_condition?.total_detected) ||
    detections.length ||
    0;

  const insights = Array.isArray(result.insights)
    ? result.insights
    : [];

  const products = Array.isArray(result.product_recommendations)
    ? result.product_recommendations
    : [];

  console.log("Full Skin AI Result:", result);
  console.log("Product Recommendations:", products);

  /* MARK: Skin Type Label */

  const getSkinTypeLabel = (skinType) => {
    const labels = {
      combination: "ผิวผสม",
      dry: "ผิวแห้ง",
      normal: "ผิวธรรมดา",
      oily: "ผิวมัน",
    };

    return labels[String(skinType).toLowerCase()] || skinType;
  };

  /* MARK: Condition Label */

  const getConditionLabel = (condition) => {
    const labels = {
      blackhead: "สิวหัวดำ",
      nodule: "สิวอักเสบชนิดก้อน",
      papule: "สิวอักเสบ",
      pustule: "สิวหนอง",
      whitehead: "สิวหัวขาว",
    };

    return labels[String(condition).toLowerCase()] || condition;
  };

  /* MARK: Confidence */

  const formatConfidence = (confidence) => {
    const value = Number(confidence) || 0;

    if (value <= 1) {
      return `${(value * 100).toFixed(1)}%`;
    }

    return `${value.toFixed(1)}%`;
  };

  /* MARK: Detection Summary */

  const conditionCounts = detections.reduce(
    (counts, detection) => {
      const condition =
        detection.class ||
        detection.condition ||
        detection.label ||
        "unknown";

      counts[condition] =
        (counts[condition] || 0) + 1;

      return counts;
    },
    {}
  );

  const concerns = Object.entries(conditionCounts).map(
    ([condition, count]) => ({
      key: condition,
      label: getConditionLabel(condition),
      score: Math.min(count, 10),
      count,
    })
  );

  /* MARK: Detection Confidence */

  const confidenceValues = detections
    .map((detection) => Number(detection.confidence) || 0)
    .filter((confidence) => confidence > 0);

  const meanDetectionConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce(
        (total, confidence) => total + confidence,
        0
      ) / confidenceValues.length
      : 0;

  return (
    <main className={styles.container}>
      {/* MARK: Header */}

      <header className={styles.header}>
        <p className={styles.eyebrow}>ผลการวิเคราะห์ผิว</p>

        <h1>
          เราวิเคราะห์สภาพผิว
          <br />
          เพื่อช่วยดูแลผิวของคุณ
        </h1>
      </header>

      {/* MARK: Skin Type */}

      <section
  className={`
    ${styles.scoreCard}
    ${styles.animateCard}
  `}
>
        {/* MARK: Face Image */}

        <div className={styles.faceImageWrapper}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="รูปภาพที่ใช้วิเคราะห์ผิว"
              className={styles.faceImage}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              ไม่มีรูปภาพ
            </div>
          )}
        </div>

        {/* MARK: Skin Type Result */}

        <div className={styles.scoreContent}>
          <p className={styles.scoreLabel}>Skin Type</p>

          <div className={styles.score}>
            <strong>
              {getSkinTypeLabel(aiSkinType)}
            </strong>
          </div>

          <p className={styles.scoreDescription}>
            AI วิเคราะห์ว่าผิวของคุณเป็นประเภท{" "}
            <strong>
              {getSkinTypeLabel(aiSkinType)}
            </strong>
          </p>

          <p className={styles.scoreDescription}>
            ความมั่นใจ{" "}
            <strong>
              {formatConfidence(skinTypeConfidence)}
            </strong>
          </p>
        </div>
      </section>

      {/* MARK: API Information */}

      <section
  className={`
    ${styles.apiInfoCard}
    ${styles.animateCard}
    ${styles.animateDelay1}
  `}
>
        <div className={styles.apiInfoItem}>
          <span>ประเภทผิวจาก AI</span>

          <strong>
            {getSkinTypeLabel(aiSkinType)}
          </strong>
        </div>

        <div className={styles.apiInfoItem}>
          <span>ความมั่นใจ Skin Type</span>

          <strong>
            {formatConfidence(skinTypeConfidence)}
          </strong>
        </div>

        <div className={styles.apiInfoItem}>
          <span>จำนวนจุดที่ตรวจพบ</span>

          <strong>{totalDetectionCount}</strong>
        </div>
      </section>

      {/* MARK: Details */}

      <section className={styles.detailCard}>
        <div className={styles.sectionHeader}>
          <h2>ปัญหาผิวที่ตรวจพบ</h2>

          <button
            type="button"
            className={styles.viewAllButton}
            onClick={onViewAllDetails}
          >
            ดูทั้งหมด
            <span>›</span>
          </button>
        </div>

        {/* MARK: Concern List */}

        <div className={styles.concernList}>
          {concerns.length > 0 ? (
            concerns.map((item) => (
              <div
                key={item.key}
                className={styles.concernItem}
              >
                <div className={styles.concernIcon}>
                  ⌁
                </div>

                <span className={styles.concernLabel}>
                  {item.label}
                </span>

                <div className={styles.concernBar}>
                  <div
                    className={styles.concernBarValue}
                    style={{
                      width: `${item.score * 10}%`,
                    }}
                  />
                </div>

                <strong className={styles.concernScore}>
                  {item.count}
                </strong>
              </div>
            ))
          ) : (
            <div className={styles.noProducts}>
              ไม่พบปัญหาผิวที่โมเดลตรวจจับได้
            </div>
          )}
        </div>
      </section>

      {/* MARK: Detection Summary */}

      <section className={styles.regionCard}>
        <div className={styles.sectionHeader}>
          <h2>สรุปผลการตรวจจับ</h2>
        </div>

        <div className={styles.regionList}>
          <div>
            <span>จำนวนที่ตรวจพบทั้งหมด</span>

            <strong>{totalDetectionCount}</strong>
          </div>

          <div>
            <span>ประเภทปัญหาผิวที่ตรวจพบ</span>

            <strong>{concerns.length}</strong>
          </div>

          <div>
            <span>ความมั่นใจเฉลี่ย</span>

            <strong>
              {formatConfidence(meanDetectionConfidence)}
            </strong>
          </div>
        </div>
      </section>

      {/* MARK: Detection Details */}

      {detections.length > 0 && (
        <section className={styles.insightCard}>
          <div className={styles.sectionHeader}>
            <h2>รายละเอียดการตรวจจับ</h2>
          </div>

          <div className={styles.insightList}>
            {detections.map((detection, index) => {
              const condition =
                detection.class ||
                detection.condition ||
                detection.label ||
                "unknown";

              const confidence =
                Number(detection.confidence) || 0;

              return (
                <p key={index}>
                  <strong>
                    {getConditionLabel(condition)}
                  </strong>

                  {" — "}

                  ความมั่นใจ{" "}

                  {formatConfidence(confidence)}
                </p>
              );
            })}
          </div>
        </section>
      )}

      {/* MARK: Insights */}

      {insights.length > 0 && (
        <section className={styles.insightCard}>
          <div className={styles.sectionHeader}>
            <h2>คำแนะนำจากการวิเคราะห์</h2>
          </div>

          <div className={styles.insightList}>
            {insights.map((insight, index) => (
              <p key={index}>{insight}</p>
            ))}
          </div>
        </section>
      )}

      {/* MARK: Products */}

      <section className={styles.productCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.productEyebrow}>
              ชุดสกินแคร์ที่เหมาะกับคุณ
            </p>

            <h2 className={styles.productTitle}>
              Your Personalized Skincare Set
            </h2>
          </div>

          <button
            type="button"
            className={styles.viewAllButton}
            onClick={onViewAllProducts}
          >
            ดูทั้งหมด
            <span>›</span>
          </button>
        </div>

        {/* MARK: Products */}

        <div className={styles.products}>
          {products.length > 0 ? (
            products.slice(0, 4).map((product, index) => (
              <article
                key={product.id || index}
                className={styles.product}
              >
                <h3>
                  {product.name || "-"}
                </h3>

                <p>
                  {product.brand || product.category || "-"}
                </p>

                {product.recommendation_focus && (
                  <small>
                    {product.recommendation_focus}
                  </small>
                )}
              </article>
            ))
          ) : (
            <div className={styles.noProducts}>
              API ยังไม่มีผลิตภัณฑ์แนะนำ
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
