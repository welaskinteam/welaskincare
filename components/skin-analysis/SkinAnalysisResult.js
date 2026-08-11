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

  const skinScore =
    Number(result.prototype_skin_score) || 0;

  const totalDetectionCount =
    Number(result.total_detection_count) || 0;

  const detectionConfidence =
    Number(result.mean_detection_confidence) || 0;

  const regionCounts =
    result.approximate_face_region_counts ?? {
      forehead: 0,
      left_cheek: 0,
      right_cheek: 0,
      nose: 0,
      chin: 0,
    };

  const insights =
    Array.isArray(result.insights)
      ? result.insights
      : [];

  const products =
    Array.isArray(result.product_recommendations)
      ? result.product_recommendations
      : [];


  /* MARK: Score Label */

  const getScoreLabel = (score) => {
    if (score >= 80) {
      return "ดีมาก";
    }

    if (score >= 60) {
      return "ปานกลาง";
    }

    if (score >= 40) {
      return "ควรดูแล";
    }

    return "ต้องฟื้นฟู";
  };


  /* MARK: Concern Data */

  /*
   * API ตอนนี้มีข้อมูลจริงเกี่ยวกับ acne detection
   * แต่ยังไม่มี score สำหรับ pores / wrinkles / oiliness
   *
   * ดังนั้น field ที่ API ยังไม่มีจะเป็น 0
   * ไม่ใช่ mock score
   */

  const concerns = [
    {
      key: "acne",
      label: "สิว",
      score: Math.min(totalDetectionCount, 10),
    },
    {
      key: "pores",
      label: "รูขุมขน",
      score: 0,
    },
    {
      key: "wrinkles",
      label: "ริ้วรอย",
      score: 0,
    },
    {
      key: "oiliness",
      label: "ความมัน",
      score: 0,
    },
  ];


  return (
    <main className={styles.container}>

      {/* MARK: Header */}

      <header className={styles.header}>

        <p className={styles.eyebrow}>
          ผลการวิเคราะห์ผิว
        </p>

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
            <div className={styles.imagePlaceholder}>
            ไม่มีรูปภาพ
            </div>
        )}
        </div>

        {/* MARK: Score */}

        <div className={styles.scoreContent}>

          <p className={styles.scoreLabel}>
            Skin Score
          </p>

          <div className={styles.score}>

            <strong>
              {skinScore}
            </strong>

            <span>
              /100
            </span>

          </div>


          <p className={styles.scoreDescription}>
            ผิวของคุณอยู่ในเกณฑ์{" "}
            <strong>
              {getScoreLabel(skinScore)}
            </strong>{" "}
          </p>


          {/* MARK: Score Bar */}

          <div className={styles.scoreBar}>

            <div
              className={styles.scoreBarValue}
              style={{
                width: `${Math.min(
                  Math.max(skinScore, 0),
                  100
                )}%`,
              }}
            />

            <div
              className={styles.scoreMarker}
              style={{
                left: `${Math.min(
                  Math.max(skinScore, 0),
                  100
                )}%`,
              }}
            />

          </div>


          <div className={styles.scoreScale}>
            <span>ต้องฟื้นฟู</span>
            <span>ปานกลาง</span>
            <span>ดี</span>
            <span>ดีเยี่ยม</span>
          </div>

        </div>

      </section>


      {/* MARK: API Information */}

      <section className={styles.apiInfoCard}>

        <div className={styles.apiInfoItem}>
          <span>
            จำนวนจุดที่ตรวจพบ
          </span>

          <strong>
            {totalDetectionCount}
          </strong>
        </div>

        <div className={styles.apiInfoItem}>
          <span>
            ความมั่นใจเฉลี่ย
          </span>

          <strong>
            {(detectionConfidence * 100).toFixed(1)}%
          </strong>
        </div>

        <div className={styles.apiInfoItem}>
          <span>
            บริเวณที่ตรวจพบมากที่สุด
          </span>

          <strong>
            {result.dominant_region || "-"}
          </strong>
        </div>

      </section>


      {/* MARK: Details */}

      <section className={styles.detailCard}>

        <div className={styles.sectionHeader}>

          <h2>
            รายละเอียดแต่ละด้าน
          </h2>

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

          {concerns.map((item) => (

            <div
              key={item.key}
              className={styles.concernItem}
            >

              <div className={styles.concernIcon}>

                {item.key === "acne" && "⌁"}
                {item.key === "pores" && "⌖"}
                {item.key === "wrinkles" && "≋"}
                {item.key === "oiliness" && "♢"}

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
                {item.score}/10
              </strong>

            </div>

          ))}

        </div>

      </section>


      {/* MARK: Detection Regions */}

      <section className={styles.regionCard}>

        <div className={styles.sectionHeader}>
          <h2>
            ตำแหน่งที่ตรวจพบ
          </h2>
        </div>

        <div className={styles.regionList}>

          <div>
            <span>หน้าผาก</span>
            <strong>
              {regionCounts.forehead ?? 0}
            </strong>
          </div>

          <div>
            <span>แก้มซ้าย</span>
            <strong>
              {regionCounts.left_cheek ?? 0}
            </strong>
          </div>

          <div>
            <span>แก้มขวา</span>
            <strong>
              {regionCounts.right_cheek ?? 0}
            </strong>
          </div>

          <div>
            <span>จมูก</span>
            <strong>
              {regionCounts.nose ?? 0}
            </strong>
          </div>

          <div>
            <span>คาง</span>
            <strong>
              {regionCounts.chin ?? 0}
            </strong>
          </div>

        </div>

      </section>


      {/* MARK: Insights */}

      {insights.length > 0 && (
        <section className={styles.insightCard}>

          <div className={styles.sectionHeader}>
            <h2>
              คำแนะนำจากการวิเคราะห์
            </h2>
          </div>

          <div className={styles.insightList}>

            {insights.map((insight, index) => (

              <p key={index}>
                {insight}
              </p>

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

            products
              .slice(0, 4)
              .map((product, index) => (

                <article
                  key={`${product.category}-${index}`}
                  className={styles.product}
                >

                  <h3>
                    {product.category || "-"}
                  </h3>

                  <p>
                    {product.focus || "-"}
                  </p>

                  {product.rationale && (
                    <small>
                      {product.rationale}
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