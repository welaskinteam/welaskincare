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

  const skinType = result.skin_type?.class_name || "-";
  const skinTypeLabels = {
    dry: "ผิวแห้ง",
    oily: "ผิวมัน",
    normal: "ผิวธรรมดา",
    combination: "ผิวผสม",
    sensitive: "ผิวบอบบางแพ้ง่าย",
  };
  const skinTypeLabel = skinTypeLabels[skinType.toLowerCase()] || skinType;
  const detections = Array.isArray(result.detections) ? result.detections : [];
  const totalDetectionCount = detections.length;
  // This score is an easy-to-read estimate based only on the number of
  // detected concern points, not the model confidence.
  const skinQualityScore = Math.max(0, 100 - totalDetectionCount * 8);
  const skinQualityLabel =
    skinQualityScore >= 90
      ? "ดีมาก"
      : skinQualityScore >= 70
        ? "ดี"
        : skinQualityScore >= 50
          ? "ปานกลาง"
          : "ควรดูแล";
  const regionCounts = detections.reduce(
    (counts, detection) => {
      const { bbox } = detection;
      if (!bbox) return counts;

      const centerX = ((Number(bbox.x1) || 0) + (Number(bbox.x2) || 0)) / 2;
      const centerY = ((Number(bbox.y1) || 0) + (Number(bbox.y2) || 0)) / 2;
      const region = centerY < 0.3 ? "forehead" : centerY > 0.75 ? "chin" : centerX < 0.35 ? "left_cheek" : centerX > 0.65 ? "right_cheek" : "nose";
      counts[region] += 1;
      return counts;
    },
    { forehead: 0, left_cheek: 0, right_cheek: 0, nose: 0, chin: 0 },
  );

  const products = Array.isArray(result.product_recommendations)
    ? result.product_recommendations
    : [];

  /* MARK: Detection Data */

  // The API returns detected points, not a separate clinical score.
  // Keep the existing one-point-per-detection scale, capped at ten.
  const concernDefinitions = [
    { key: "acne", label: "สิว", aliases: ["acne", "blackhead", "blackheads", "whitehead", "whiteheads", "pimple", "pimples"] },
    { key: "pores", label: "รูขุมขน", aliases: ["pores", "pore", "large_pores", "enlarged_pores"] },
    { key: "wrinkle", label: "ริ้วรอย", aliases: ["wrinkle", "wrinkles"] },
    { key: "oiliness", label: "ความมัน", aliases: ["oiliness", "oil", "oily", "oily_skin"] },
  ];
  const groups = new Map(concernDefinitions.map((item) => [item.key, { ...item, count: 0 }]));
  for (const detection of detections) {
    const rawKey = String(detection.class_name || "unknown").trim().toLowerCase().replace(/[\s-]+/g, "_");
    const definition = concernDefinitions.find((item) => item.aliases.includes(rawKey));
    const key = definition?.key || (["darkspot", "dark_spot", "dark_spots"].includes(rawKey) ? "dark_spot" : rawKey);
    if (!groups.has(key)) {
      groups.set(key, { key, label: key === "dark_spot" ? "จุดด่างดำ" : key.replace(/_/g, " "), count: 0 });
    }
    groups.get(key).count += 1;
  }
  const concerns = Array.from(groups.values(), (item) => ({
    ...item,
    score: Math.min(item.count, 10),
  }));

  return (
    <main className={styles.container}>
      {/* MARK: Header */}

      <header className={styles.header}>
        <p className={styles.eyebrow}>ผลการวิเคราะห์ผิว</p>

        <h1>
          เราแมตช์กับสกินแคร์
          <br />
          ที่เหมาะสำหรับผิวคุณ
        </h1>
      </header>

      {/* MARK: Skin Score */}

      <section className={styles.scoreCard}>
        {/* MARK: Face Image */}

        <div className={styles.faceImageWrapper}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="รูปภาพที่ใช้วิเคราะห์ผิว"
              className={styles.faceImage}
            />
          ) : (
            <div className={styles.imagePlaceholder}>ไม่มีรูปภาพ</div>
          )}
        </div>

        {/* MARK: Score */}

        <div className={styles.scoreContent}>
          <div className={styles.scoreHeading}>
            <p className={styles.scoreLabel}>Skin Score</p>
            <span className={styles.skinTypeBadge} aria-label={`ประเภทผิว: ${skinTypeLabel}`}>
              {skinType === "-" ? "ยังไม่มีข้อมูลประเภทผิว" : skinTypeLabel}
            </span>
          </div>

          <div className={styles.score}>
            <strong>{skinQualityScore}</strong>
            <span>/100</span>
          </div>

          <p className={styles.scoreDescription}>
            ผิวของคุณอยู่ในเกณฑ์ <strong>{skinQualityLabel}</strong>{" "}
            <span aria-hidden="true">✨</span>
          </p>

          {/* MARK: Score Bar */}

          <div className={styles.scoreBar}>
            <div
              className={styles.scoreBarValue}
              style={{
                width: `${skinQualityScore}%`,
              }}
            />

            <div
              className={styles.scoreMarker}
              style={{
                left: `${skinQualityScore}%`,
              }}
            />
          </div>

          <div className={styles.scoreScale}>
            <span>ควรดูแล</span>
            <span>ปานกลาง</span>
            <span>ดี</span>
            <span>ดีมาก</span>
          </div>
          <p className={styles.scoreNote}>ประเมินจากจำนวนจุดที่ตรวจพบ</p>
        </div>
      </section>

      {/* MARK: API Information */}

      <section className={styles.apiInfoCard}>
        <div className={styles.apiInfoItem}>
          <span>จำนวนจุดที่ตรวจพบ</span>

          <strong>{totalDetectionCount}</strong>
        </div>

        <div className={styles.apiInfoItem}>
          <span>คุณภาพผิวโดยรวม</span>

          <strong>{skinQualityScore}/100</strong>
        </div>

        <div className={styles.apiInfoItem}>
          <span>เวลาในการวิเคราะห์</span>

          <strong>{Number(result.inference_ms || 0).toFixed(0)} ms</strong>
        </div>
      </section>

      {/* MARK: Details */}

      <section className={styles.detailCard}>
        <div className={styles.sectionHeader}>
          <h2>รายละเอียดแต่ละด้าน</h2>

          <button
            type="button"
            className={styles.viewAllButton}
            onClick={onViewAllDetails}
          >
            ดูทั้งหมด
            <span>›</span>
          </button>
        </div>

        <p className={styles.scoreNote}>คะแนนตามจำนวนจุดที่ตรวจพบ สูงสุด 10 · ไม่มีข้อมูลแสดง 0/10</p>

        {/* MARK: Concern List */}

        <div className={styles.concernList}>
          {concerns.map((item) => (
            <div key={item.key} className={styles.concernItem}>
              <div className={styles.concernIcon} aria-hidden="true">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  { /wrinkle/.test(item.key) ? <path d="M4 12Q12 5 20 12T36 12M4 20Q12 13 20 20T36 20M4 28Q12 21 20 28T36 28" /> : <><path d="M3 14h12l3 12q2 5 4 0l3-12h12M5 21h5m20 0h5M9 28h1m20 0h1M14 33h1m10 0h1M20 5v4M9 6l3 4M31 6l-3 4" /></> }
                </svg>
              </div>

              <span className={styles.concernLabel}>{item.label}</span>

              <div className={styles.concernMeter}>
                <span className={styles.concernStatus}>ตรวจพบ {item.count} จุด</span>
                <div className={styles.concernBar}>
                <div
                  className={styles.concernBarValue}
                  style={{
                    width: `${item.score * 10}%`,
                  }}
                />
                </div>
              </div>

              <strong className={styles.concernScore}>
                {item.score}/10
              </strong>
            </div>
          ))}

        </div>
      </section>

      {/* MARK: Detection Regions */}

      <section className={styles.regionCard}>
        <div className={styles.sectionHeader}>
          <h2>ตำแหน่งที่ตรวจพบ</h2>
        </div>

        <div className={styles.regionList}>
          <div>
            <span>หน้าผาก</span>
            <strong>{regionCounts.forehead ?? 0}</strong>
          </div>

          <div>
            <span>แก้มซ้าย</span>
            <strong>{regionCounts.left_cheek ?? 0}</strong>
          </div>

          <div>
            <span>แก้มขวา</span>
            <strong>{regionCounts.right_cheek ?? 0}</strong>
          </div>

          <div>
            <span>จมูก</span>
            <strong>{regionCounts.nose ?? 0}</strong>
          </div>

          <div>
            <span>คาง</span>
            <strong>{regionCounts.chin ?? 0}</strong>
          </div>
        </div>
      </section>

      {/* MARK: Products */}

      <section className={styles.productCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.productEyebrow}>ชุดสกินแคร์ที่เหมาะกับคุณ</p>

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
                key={`${product.category}-${index}`}
                className={styles.product}
              >
                <div className={styles.productImageWrapper}>
                  {product.image ? <img className={styles.productImage} src={product.image} alt={product.name || product.category || "สกินแคร์แนะนำ"} /> : <span className={styles.productImagePlaceholder}>ไม่มีรูปสินค้า</span>}
                </div>
                <h3>{product.category || "Skincare"}</h3>

                <p>{product.name || "-"}</p>

                {(product.focus || product.rationale) && (
                  <small>{product.focus || product.rationale}</small>
                )}
              </article>
            ))
          ) : (
            <div className={styles.noProducts}>ยังไม่มีผลิตภัณฑ์แนะนำสำหรับผลวิเคราะห์นี้</div>
          )}
        </div>
      </section>
    </main>
  );
}
