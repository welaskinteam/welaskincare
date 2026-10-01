import styles from "../styles/Welcome.module.css";

export default function Welcome({ onStart }) {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-label="เริ่มต้นใช้งาน Wela">
        <div className={styles.backgroundImage} aria-hidden="true" />

        <img className={styles.logo} src="/images/wela-white.png" alt="Wela" />

        <div className={styles.skinGrid} aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
        </div>
      </section>

      <div className={styles.fadeOverlay} aria-hidden="true" />

      <section className={styles.content}>
        <h1 className={styles.title}>
          เริ่มต้นจากการเข้าใจผิว
          <br />
          เพื่อ<span className={styles.emphasis}>การดูแลที่เหมาะกับคุณ</span>
        </h1>

        <button type="button" className={styles.startButton} onClick={onStart}>
          เริ่มต้นวิเคราะห์ผิว
        </button>

        <p className={styles.note}>
          ลงชื่อเข้าใช้ด้วยเบอร์โทรหรืออีเมลเพื่อทำการวิเคราะห์ผิว
        </p>
      </section>
    </main>
  );
}
