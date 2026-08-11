import QuestionHeader from "./QuestionHeader";

import styles from "../../styles/skin-analysis/GenderQuestion.module.css";

const genderOptions = [
  {
    value: "male",
    label: "ผู้ชาย",
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="#47191f" d="M20 4v6h-2V7.425l-3.975 3.95q.475.7.725 1.488T15 14.5q0 2.3-1.6 3.9T9.5 20t-3.9-1.6T4 14.5t1.6-3.9T9.5 9q.825 0 1.625.237t1.475.738L16.575 6H14V4zM7.025 12.025Q6 13.05 6 14.5t1.025 2.475T9.5 18t2.475-1.025T13 14.5t-1.025-2.475T9.5 11t-2.475 1.025" />
        </svg>
    ),
  },
  {
    value: "female",
    label: "ผู้หญิง",
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="#47191f" d="M11 21v-2H9v-2h2v-2.1q-1.975-.35-3.238-1.888T6.5 9.45q0-2.275 1.613-3.862T12 4t3.888 1.588T17.5 9.45q0 2.025-1.263 3.563T13 14.9V17h2v2h-2v2zm3.475-9.025Q15.5 10.95 15.5 9.5t-1.025-2.475T12 6T9.525 7.025T8.5 9.5t1.025 2.475T12 13t2.475-1.025" />
        </svg>
    ),
  },
  {
    value: "other",
    label: "อื่นๆ",
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
            <path d="M0 0h16v16H0z" fill="none" />
            <path fill="#47191f" fill-rule="evenodd" d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1.707L3.5 2.793l.646-.647a.5.5 0 1 1 .708.708l-.647.646l.822.822A4 4 0 0 1 8 3c1.18 0 2.239.51 2.971 1.322L14.293 1H11.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-3.45 3.45A4 4 0 0 1 8.5 10.97V13H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V14H6a.5.5 0 0 1 0-1h1.5v-2.03a4 4 0 0 1-3.05-5.814l-.95-.949l-.646.647a.5.5 0 1 1-.708-.708l.647-.646L1 1.707V3.5a.5.5 0 0 1-1 0zm5.49 4.856a3 3 0 1 0 5.02 3.288a3 3 0 0 0-5.02-3.288" />
        </svg>
    ),
  },
];

export default function GenderQuestion({
  value,
  onChange,
  onNext,
  onBack,
}) {
  return (
    <main className={styles.container}>
      <div className={styles.content}>

        {/* MARK: Header */}

        <QuestionHeader
          step={1}
          total={5}
          onBack={onBack}
        />


        {/* MARK: Question */}

        <section className={styles.question}>
          <h1>
            เพศของคุณคือเพศอะไร?
          </h1>

          <p>
            เพื่อให้เราสามารถวิเคราะห์ผิวคุณได้
            <br />
            แม่นยำยิ่งขึ้นตามเพศของคุณ
          </p>
        </section>


        {/* MARK: Options */}

        <section
          className={styles.options}
          aria-label="เลือกเพศ"
        >
          {genderOptions.map((option) => {
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
                <div className={styles.optionIcon}>
                  {option.icon}
                </div>

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