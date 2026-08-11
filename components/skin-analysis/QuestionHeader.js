import QuestionProgress from "./QuestionProgress";

import styles from "../../styles/skin-analysis/QuestionHeader.module.css";

export default function QuestionHeader({
  step,
  total = 5,
  onBack,
}) {
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        aria-label="ย้อนกลับ"
      >
        <svg
          width="10"
          height="18"
          viewBox="0 0 10 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8.5 1L1.5 9L8.5 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <QuestionProgress
        step={step}
        total={total}
      />
    </header>
  );
}