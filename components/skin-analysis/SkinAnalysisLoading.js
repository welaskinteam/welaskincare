import { useEffect, useState } from "react";
import styles from "../../styles/skin-analysis/SkinAnalysisLoading.module.css";

export default function SkinAnalysisLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 30000;
    const intervalTime = 300;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) {
          return 96;
        }

        const remaining = 96 - prev;

        return prev + Math.max(1, remaining * 0.08);
      });
    }, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <main className={styles.container}>
      {/* MARK: Background */}

      <img
        src="/images/skin-analysis/analysis-loading.png"
        alt=""
        className={styles.backgroundImage}
      />

      <div className={styles.overlay} />

      {/* MARK: Content */}

      <section className={styles.content}>
        <header className={styles.header}>
          <h1>กำลังวิเคราะห์สภาพผิวของคุณ</h1>

          <p>ใช้เวลาประมาณ 15 - 30 วินาที</p>
        </header>

        {/* MARK: Progress */}

        <div className={styles.progressSection}>
          <p className={styles.progressLabel}>Scanning Your Skin...</p>

          <div className={styles.progressCircle}>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </section>
    </main>
  );
}
