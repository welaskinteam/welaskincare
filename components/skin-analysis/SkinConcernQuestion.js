import QuestionHeader from "./QuestionHeader";

import styles from "../../styles/skin-analysis/SkinConcernQuestion.module.css";

const concernOptions = [
  {
    value: "acne",
    label: "สิวและรอยสิว",
  },
  {
    value: "dark_spots",
    label: "จุดด่างดำ",
  },
  {
    value: "wrinkles",
    label: "ริ้วรอย",
  },
  {
    value: "pores",
    label: "รูขุมขนกว้าง",
  },
  {
    value: "dullness",
    label: "ผิวหมองคล้ำ",
  },
  {
    value: "freckles",
    label: "ฝ้า / กระ",
  },
  {
    value: "uneven_tone",
    label: "สีผิวไม่สม่ำเสมอ",
  },
  {
    value: "dryness",
    label: "ผิวแห้งลอก",
  },
];

export default function SkinConcernQuestion({
  value,
  onChange,
  onNext,
  onBack,
}) {
  const selectedValues = value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  /* MARK: Select */

  const handleSelect = (concern) => {
    let nextValues;

    if (selectedValues.includes(concern)) {
      nextValues = selectedValues.filter((item) => item !== concern);
    } else {
      nextValues = [...selectedValues, concern];
    }

    onChange(nextValues.join(","));
  };

  /* MARK: Skip */

  const handleSkip = () => {
    onChange("");
    onNext();
  };

  return (
    <main className={styles.container}>
      <img
        className={styles.bottomWave}
        src="/images/skin-analysis/bottom-wave.png"
        alt=""
        aria-hidden="true"
      />

      <div className={styles.content}>
        {/* MARK: Header */}

        <QuestionHeader step={4} total={5} onBack={onBack} />

        {/* MARK: Question */}

        <section className={styles.question}>
          <h1>คุณกังวลเรื่องผิวด้านใดมากที่สุด</h1>

          <p>เลือกได้มากกว่า 1 ข้อ</p>
        </section>

        {/* MARK: Concerns */}

        <section className={styles.options} aria-label="เลือกปัญหาผิว">
          {concernOptions.map((option) => {
            const selected = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.option} ${
                  selected ? styles.optionSelected : ""
                }`}
                onClick={() => handleSelect(option.value)}
                aria-pressed={selected}
              >
                <span>{option.label}</span>
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
          onClick={handleSkip}
        >
          ข้ามไปก่อน
        </button>

        {/* Next */}

        <button
          type="button"
          className={styles.nextButton}
          disabled={selectedValues.length === 0}
          onClick={onNext}
        >
          ถัดไป
        </button>
      </div>
    </main>
  );
}
