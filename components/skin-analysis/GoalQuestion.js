import QuestionHeader from "./QuestionHeader";

import styles from "../../styles/skin-analysis/GoalQuestion.module.css";

const goalOptions = [
  {
    value: "acne_control",
    label: "ควบคุมสิว",
  },
  {
    value: "oil_control",
    label: "ควบคุมความมัน",
  },
  {
    value: "hydration",
    label: "เพิ่มความชุ่มชื้น",
  },
  {
    value: "brightening",
    label: "ผิวกระจ่างใส",
  },
  {
    value: "anti_aging",
    label: "ดูแลริ้วรอย",
  },
  {
    value: "skin_health",
    label: "ดูแลสุขภาพผิวโดยรวม",
  },
];

export default function GoalQuestion({
  value,
  onChange,
  onNext,
  onBack,
  loading,
}) {
  /* MARK: Skip */

  const handleSkip = () => {
    onChange("");
    onNext();
  };

  return (
    <main className={styles.container}>
      <div className={styles.content}>

        {/* MARK: Header */}

        <QuestionHeader
          step={5}
          total={5}
          onBack={onBack}
        />


        {/* MARK: Question */}

        <section className={styles.question}>
          <h1>
            เป้าหมายในการดูแลผิว
            <br />
            ของคุณคืออะไร?
          </h1>

          <p>
            เลือกเป้าหมายที่คุณต้องการ
            <br />
            เพื่อให้เราแนะนำผลิตภัณฑ์ได้ตรงกับคุณ
          </p>
        </section>


        {/* MARK: Goals */}

        <section
          className={styles.options}
          aria-label="เลือกเป้าหมายในการดูแลผิว"
        >
          {goalOptions.map((option) => {
            const selected =
              value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.option} ${
                  selected
                    ? styles.optionSelected
                    : ""
                }`}
                onClick={() =>
                  onChange(option.value)
                }
                aria-pressed={selected}
              >
                <span>
                  {option.label}
                </span>
              </button>
            );
          })}
        </section>
      </div>


      {/* MARK: Footer */}

      <div className={styles.footer}>

        {/* Skip */}

        <button
          type="button"
          className={styles.skipButton}
          disabled={loading}
          onClick={handleSkip}
        >
          ข้ามไปก่อน
        </button>

        {/* Analyze */}

        <button
          type="button"
          className={styles.nextButton}
          disabled={!value || loading}
          onClick={onNext}
        >
          {loading
            ? "กำลังวิเคราะห์..."
            : "วิเคราะห์ผิว"}
        </button>

      </div>
    </main>
  );
}