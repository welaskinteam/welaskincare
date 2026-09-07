import { useEffect, useState } from "react";
import styles from "../../styles/skin-analysis/SkinAnalysisLoading.module.css";

export default function SkinAnalysisLoading() {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const intervalTime = 300;

    const interval = setInterval(() => {
      setProgress((prev) => {
        // ไม่ให้แสดง 100% ก่อนที่ผลจาก API จะกลับมาจริง
        return Math.min(96, prev + 1);
      });
    }, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <main className={styles.container}>
      {/* MARK: Background */}

      <video
        className={styles.backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
        poster="/images/skin-analysis/analysis-loading.png"
        aria-hidden="true"
      >
        <source src="/videos/skin-analysis/loading.mp4" type="video/mp4" />
      </video>

      <div className={styles.overlay} />

      {/* MARK: Content */}

      <section className={styles.content}>
        <img
          src="/images/wela.png"
          alt="Wela"
          className={styles.logo}
        />

        {/* MARK: Progress */}

        <div className={styles.progressCircle}>
          <div className={styles.progressTrack} aria-hidden="true" />

          <div
            className={styles.progressValue}
            style={{ "--progress": `${progress * 3.6}deg` }}
            aria-hidden="true"
          />

          <div className={styles.progressOrb}>
            <span aria-live="polite">{progress}%</span>
          </div>
        </div>

        <div className={styles.message}>
          <h2>กำลังวิเคราะห์สภาพผิวของคุณ</h2>
          <p>ใช้เวลาประมาณ 15 - 30 วินาที</p>
        </div>
      </section>
    </main>
  );
}
