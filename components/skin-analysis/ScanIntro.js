import styles from "../../styles/skin-analysis/ScanIntro.module.css";

export default function ScanIntro({ onStart }) {
  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <header className={styles.header}>
          <h1>
            สแกนใบหน้า
            <br />
            วิเคราะห์ผิวด้วย AI
          </h1>

          <p>ใช้เวลาเพียง 30 วินาที</p>
        </header>

        <div className={styles.facePreview}>
          <img src="/images/face-analysis.png" alt="ตัวอย่างการสแกนใบหน้า" />

          <div className={styles.scanFrame}>
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className={styles.instructions}>
          <div className={styles.instruction}>
            <div className={styles.instructionIcon}>☼</div>

            <p>
              อยู่บริเวณที่มี
              <br />
              แสงสว่างเพียงพอ
            </p>
          </div>

          <div className={styles.instruction}>
            <div className={styles.instructionIcon}>♧</div>

            <p>
              ไม่สวมแว่น
              <br />
              หรือหมวก
            </p>
          </div>

          <div className={styles.instruction}>
            <div className={styles.instructionIcon}>☺</div>

            <p>
              มองตรง
              <br />
              ไม่เอียงหน้า
            </p>
          </div>
        </div>

        <button type="button" className={styles.startButton} onClick={onStart}>
          <svg
            className={styles.startIcon}
            aria-hidden="true"
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.21786 1.08887H3.50251C2.86237 1.08887 2.24845 1.34316 1.79581 1.79581C1.34316 2.24845 1.08887 2.86237 1.08887 3.50251V6.21786M23.4151 6.21786V3.50251C23.4151 2.86237 23.1608 2.24845 22.7081 1.79581C22.2555 1.34316 21.6416 1.08887 21.0014 1.08887H18.2861M18.2861 23.4151H21.0014C21.6416 23.4151 22.2555 23.1608 22.7081 22.7081C23.1608 22.2555 23.4151 21.6416 23.4151 21.0014V18.2861M1.08887 18.2861V21.0014C1.08887 21.6416 1.34316 22.2555 1.79581 22.7081C2.24845 23.1608 2.86237 23.4151 3.50251 23.4151H6.21786M7.59425 9.87635V7.72639M16.9097 9.87635V7.72639M10.8189 14.8919H11.5357C11.9158 14.8919 12.2803 14.7409 12.5491 14.4722C12.8178 14.2034 12.9688 13.8389 12.9688 13.4588V7.72639M16.5513 17.244C15.3831 18.7924 13.5994 19.1912 12.252 19.1912C10.9046 19.1912 9.12088 18.793 7.95267 17.244"
              stroke="white"
              stroke-width="2.17843"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <span>เริ่มสแกน</span>
        </button>
      </section>
    </main>
  );
}
