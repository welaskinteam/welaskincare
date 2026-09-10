import { useEffect, useState } from "react";
import styles from "../../styles/skin-analysis/SkinAnalysisLoading.module.css";

export default function SkinAnalysisLoading({ complete = false, onComplete }) {
  const [progress, setProgress] = useState(1);
  const progressRadius = 45;
  const progressCircumference = 2 * Math.PI * progressRadius;

  useEffect(() => {
    if (complete) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(100, prev + 5));
      }, 55);

      return () => clearInterval(interval);
    }

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(92, prev + 2));
    }, 300);

    return () => clearInterval(interval);
  }, [complete]);

  useEffect(() => {
    if (!complete || progress < 100) return undefined;

    // Leave 100% visible briefly before transitioning to the result screen.
    const timeout = setTimeout(onComplete, 350);
    return () => clearTimeout(timeout);
  }, [complete, onComplete, progress]);

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
          <svg
            className={styles.progressRing}
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              className={styles.progressRingTrack}
              cx="50"
              cy="50"
              r={progressRadius}
            />
            <circle
              className={styles.progressRingValue}
              cx="50"
              cy="50"
              r={progressRadius}
              strokeDasharray={progressCircumference}
              strokeDashoffset={
                progressCircumference * (1 - progress / 100)
              }
            />
          </svg>

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
