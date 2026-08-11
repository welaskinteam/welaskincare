import styles from "../../styles/skin-analysis/SkinAnalysisResult.module.css";

const regionLabels = {
  forehead: "หน้าผาก",
  left_cheek: "แก้มซ้าย",
  right_cheek: "แก้มขวา",
  nose: "จมูก",
  chin: "คาง",
};

const categoryLabels = {
  cleanser: "คลีนเซอร์",
  serum: "เซรั่ม",
  moisturiser: "มอยส์เจอไรเซอร์",
  sunscreen: "กันแดด",
  "optional spot care": "ดูแลเฉพาะจุด",
};

export default function SkinAnalysisResult({ result }) {
  if (!result) {
    return null;
  }

  const {
    prototype_skin_score = 0,
    prototype_breakout_level = "none_marked",
    dominant_region = "none",
    total_detection_count = 0,
    mean_detection_confidence = 0,
    approximate_face_region_counts = {},
    insights = [],
    product_recommendations = [],
    disclaimer = "",
  } = result;

  const score = Math.max(
    0,
    Math.min(100, prototype_skin_score)
  );

  const regionName =
    regionLabels[dominant_region] || "ไม่พบ";

  const breakoutLabel =
    prototype_breakout_level === "none_marked"
      ? "ไม่พบจุดที่ระบบตรวจพบ"
      : prototype_breakout_level;

  const confidence =
    mean_detection_confidence > 0
      ? `${Math.round(mean_detection_confidence * 100)}%`
      : "ไม่มีข้อมูล";

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        {/* MARK: Header */}

        <header className={styles.header}>
          <p className={styles.eyebrow}>
            WELA AI SKIN ANALYSIS
          </p>

          <h1>
            ผลวิเคราะห์ผิว
            <br />
            ของคุณ
          </h1>

          <p className={styles.description}>
            ผลการวิเคราะห์จากภาพถ่าย
            และข้อมูลที่คุณให้ไว้
          </p>
        </header>


        {/* MARK: Score */}

        <section className={styles.scoreCard}>
          <p className={styles.scoreLabel}>
            Skin Score
          </p>

          <div className={styles.score}>
            <strong>{score}</strong>
            <span>/100</span>
          </div>

          <p className={styles.scoreDescription}>
            คะแนนนี้เป็นดัชนีสำหรับการแสดงผล
            ของระบบต้นแบบเท่านั้น
          </p>
        </section>


        {/* MARK: Summary */}

        <section className={styles.section}>
          <h2>สรุปผลการวิเคราะห์</h2>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>
                จุดที่ตรวจพบ
              </span>

              <strong>
                {total_detection_count}
              </strong>

              <span className={styles.summaryUnit}>
                จุด
              </span>
            </div>

            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>
                บริเวณหลัก
              </span>

              <strong>
                {regionName}
              </strong>
            </div>

            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>
                ระดับการตรวจพบ
              </span>

              <strong>
                {breakoutLabel}
              </strong>
            </div>

            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>
                ความมั่นใจเฉลี่ย
              </span>

              <strong>
                {confidence}
              </strong>
            </div>
          </div>
        </section>


        {/* MARK: Region */}

        <section className={styles.section}>
          <h2>บริเวณที่ตรวจพบ</h2>

          <div className={styles.regionList}>
            {Object.entries(regionLabels).map(
              ([key, label]) => {
                const count =
                  approximate_face_region_counts[key] || 0;

                return (
                  <div
                    key={key}
                    className={styles.regionItem}
                  >
                    <span>{label}</span>

                    <div className={styles.regionBar}>
                      <span
                        style={{
                          width: `${Math.min(
                            count * 10,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <strong>{count}</strong>
                  </div>
                );
              }
            )}
          </div>

          <p className={styles.note}>
            ตำแหน่งบริเวณเป็นการประมาณจากพิกัดภาพ
            ไม่ใช่การตรวจจับโครงสร้างใบหน้าโดยตรง
          </p>
        </section>


        {/* MARK: Insights */}

        {insights.length > 0 && (
          <section className={styles.section}>
            <h2>ข้อมูลจากการวิเคราะห์</h2>

            <div className={styles.insightList}>
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={styles.insight}
                >
                  <span>✓</span>

                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* MARK: Recommendations */}

        {product_recommendations.length > 0 && (
          <section className={styles.section}>
            <h2>
              คำแนะนำสำหรับการดูแลผิว
            </h2>

            <p className={styles.sectionDescription}>
              หมวดหมู่ผลิตภัณฑ์ด้านล่างเป็นคำแนะนำ
              สำหรับ routine ตามข้อมูลที่คุณให้ไว้
            </p>

            <div className={styles.productList}>
              {product_recommendations.map(
                (product, index) => (
                  <article
                    key={`${product.category}-${index}`}
                    className={styles.productCard}
                  >
                    <div className={styles.productIcon}>
                      {index + 1}
                    </div>

                    <div>
                      <h3>
                        {categoryLabels[
                          product.category
                        ] || product.category}
                      </h3>

                      <p className={styles.focus}>
                        {product.focus}
                      </p>

                      <p className={styles.rationale}>
                        {product.rationale}
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        )}


        {/* MARK: Disclaimer */}

        {disclaimer && (
          <section className={styles.disclaimer}>
            <strong>
              หมายเหตุ
            </strong>

            <p>{disclaimer}</p>
          </section>
        )}
      </div>
    </main>
  );
}