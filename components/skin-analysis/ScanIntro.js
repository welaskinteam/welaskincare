import styles from "../../styles/skin-analysis/ScanIntro.module.css";

export default function ScanIntro({ onStart }) {
  return (
    <main className={styles.container}>
      <section className={styles.content}>

        {/* MARK: Header */}

        <header className={styles.header}>
          <h1>
            สแกนใบหน้าวิเคราะห์ผิว
            <br />
            ด้วย Welaskin.AI
          </h1>

          <p>
            ใช้เวลาเพียง 30 วินาที
          </p>
        </header>


        <div className={styles.facePreview}>

          {/* MARK: Ellipse Background */}

          <img
            className={styles.ellipse}
            src="/images/ellipse.png"
            alt=""
            aria-hidden="true"
          />


          {/* MARK: Face Analysis */}

          <img
            className={styles.faceImage}
            src="/images/face-analysis.gif"
            alt="ตัวอย่างการสแกนใบหน้า"
          />

        </div>


        {/* MARK: Instructions */}

        <div className={styles.instructions}>

          <div className={styles.instruction}>
            <div className={styles.instructionIcon}>
              <span role="img" aria-label="แสงสว่าง">💡</span>
            </div>

            <p>
              อยู่บริเวณที่มี
              <br />
              แสงสว่างเพียงพอ
            </p>
          </div>


          <div className={styles.instruction}>
            <div className={styles.instructionIcon}>
              <span role="img" aria-label="ไม่สวมแว่น">🕶️</span>
            </div>

            <p>
              ไม่สวมแว่น
              <br />
              หรือหมวก
            </p>
          </div>


          <div className={styles.instruction}>
            <div className={styles.instructionIcon}>
              <span role="img" aria-label="มองตรง">🙂</span>
            </div>

            <p>
              มองตรง
              <br />
              ไม่เอียงหน้า
            </p>
          </div>

        </div>


        {/* MARK: Start */}

        <button
          type="button"
          className={styles.startButton}
          onClick={onStart}
        >
        <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.21835 1.08984H3.503C2.86286 1.08984 2.24894 1.34414 1.7963 1.79678C1.34365 2.24943 1.08936 2.86335 1.08936 3.50349V6.21884M23.4156 6.21884V3.50349C23.4156 2.86335 23.1613 2.24943 22.7086 1.79678C22.256 1.34414 21.6421 1.08984 21.0019 1.08984H18.2866M18.2866 23.4161H21.0019C21.6421 23.4161 22.256 23.1618 22.7086 22.7091C23.1613 22.2565 23.4156 21.6426 23.4156 21.0024V18.2871M1.08936 18.2871V21.0024C1.08936 21.6426 1.34365 22.2565 1.7963 22.7091C2.24894 23.1618 2.86286 23.4161 3.503 23.4161H6.21835M7.59473 9.87732V7.72737M16.9102 9.87732V7.72737M10.8194 14.8929H11.5362C11.9163 14.8929 12.2808 14.7419 12.5496 14.4731C12.8183 14.2044 12.9693 13.8399 12.9693 13.4598V7.72737M16.5518 17.245C15.3836 18.7933 13.5999 19.1922 12.2525 19.1922C10.905 19.1922 9.12136 18.7939 7.95316 17.245" stroke="white" stroke-width="2.17843" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
          <span>
            เริ่มสแกน
          </span>
        </button>

      </section>
    </main>
  );
}
