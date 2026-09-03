import QuestionHeader from "./QuestionHeader";

import styles from "../../styles/skin-analysis/SkinTypeQuestion.module.css";

const skinTypeOptions = [
  {
    value: "normal",
    label: "ผิวธรรมดา (Normal Skin)",
    image: "/images/skin-analysis/skin-normal.png",
  },
  {
    value: "dry",
    label: "ผิวแห้ง (Dry Skin)",
    image: "/images/skin-analysis/skin-dry.png",
  },
  {
    value: "oily",
    label: "ผิวมัน (Oily Skin)",
    image: "/images/skin-analysis/skin-oily.png",
  },
  {
    value: "combination",
    label: "ผิวผสม (Combination Skin)",
    image: "/images/skin-analysis/skin-combination.png",
  },
  {
    value: "sensitive",
    label: "ผิวแพ้ง่าย (Sensitive Skin)",
    image: "/images/skin-analysis/skin-sensitive.png",
  },
];

export default function SkinTypeQuestion({ value, onChange, onNext, onBack }) {
  /*
   * MARK: Skip
   *
   * ถ้าผู้ใช้ไม่ต้องการระบุสภาพผิว
   * ให้ส่งค่า "" ไปยัง parent
   * และไป step ถัดไปทันที
   */
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

        <QuestionHeader step={3} total={5} onBack={onBack} />

        {/* MARK: Question */}

        <section className={styles.question}>
          <h1>ลักษณะผิวของคุณเป็นแบบใด</h1>

          <p>
            ข้อมูลนี้จะช่วยให้ AI วิเคราะห์สภาพผิวของคุณ
            <br />
            ได้ละเอียดและแนะนำผลิตภัณฑ์ที่เหมาะสมยิ่งขึ้น
          </p>
        </section>

        {/* MARK: Skin Type Options */}

        <section className={styles.options} aria-label="เลือกสภาพผิว">
          {skinTypeOptions.map((option) => {
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
                  <img src={option.image} alt="" className={styles.skinImage} />
                </div>

                <span className={styles.label}>{option.label}</span>
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
          disabled={!value}
          onClick={onNext}
        >
          ถัดไป
        </button>
      </div>
    </main>
  );
}
