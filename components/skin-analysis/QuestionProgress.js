import styles from "../../styles/skin-analysis/QuestionProgress.module.css";

export default function QuestionProgress({ step, total = 5 }) {
  const progress = (step / total) * 100;

  return (
    <div className={styles.progress}>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressValue}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <span className={styles.progressText}>
        {step}/{total}
      </span>
    </div>
  );
}
