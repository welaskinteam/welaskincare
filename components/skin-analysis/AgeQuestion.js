import QuestionHeader from "./QuestionHeader";

import styles from "../../styles/skin-analysis/AgeQuestion.module.css";

const ageOptions = [
  {
    value: "18-24",
    label: "18 - 24 ปี",
    image: "/images/skin-analysis/age-18-24.png",
  },
  {
    value: "25-34",
    label: "25 - 34 ปี",
    image: "/images/skin-analysis/age-25-34.png",
  },
  {
    value: "35-44",
    label: "35 - 44 ปี",
    image: "/images/skin-analysis/age-35-44.png",
  },
  {
    value: "55+",
    label: "55 ปีขึ้นไป",
    image: "/images/skin-analysis/age-55-plus.png",
  },
];

export default function AgeQuestion({ value, onChange, onNext, onBack }) {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        {/* MARK: Header */}

        <QuestionHeader step={2} total={5} onBack={onBack} />

        {/* MARK: Question */}

        <section className={styles.question}>
          <h1>คุณอายุเท่าไหร่?</h1>

          <p>
            เพื่อให้การวิเคราะห์สภาพผิวแม่นยำยิ่งขึ้น
            <br />
            ตามช่วงวัยของคุณ
          </p>
        </section>

        {/* MARK: Age Options */}

        <section className={styles.options} aria-label="เลือกช่วงอายุ">
          {ageOptions.map((option) => {
            const selected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.option} ${
                  selected ? styles.optionSelected : ""
                }`}
                onClick={() => onChange(option.value)}
                aria-pressed={selected}
              >
                <div className={styles.imageWrapper}>
                  <img src={option.image} alt="" className={styles.ageImage} />
                </div>

                <span className={styles.label}>{option.label}</span>
              </button>
            );
          })}
        </section>
      </div>

      {/* MARK: Footer */}

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.nextButton}
          disabled={!value}
          onClick={onNext}
        >
          ถัดไป
        </button>
      </div>
    </main>
  );
}
