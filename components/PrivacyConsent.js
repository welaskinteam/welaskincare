import { useState } from "react";
import styles from "../styles/PrivacyConsent.module.css";

export default function PrivacyConsent({ onAccept }) {
  const [imageConsent, setImageConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const canContinue = imageConsent && privacyConsent;

  const handleAccept = () => {
    if (!canContinue) {
      return;
    }

    onAccept();
  };

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <p className={styles.eyebrow}>ความเป็นส่วนตัวของคุณ</p>

        <h1 className={styles.title}>
          เราจะดูแลข้อมูลของคุณ
          <br />
          อย่างปลอดภัย
        </h1>

        <p className={styles.description}>
          เพื่อความแม่นยำในการวิเคราะห์ Welaskin จะใช้รูปใบหน้าของคุณ
          <br className={styles.desktopBreak} />
          เฉพาะขั้นตอนนี้เท่านั้น โดยไม่มีการนำไปใช้อย่างอื่น
          และจัดการข้อมูลอย่างรัดกุมตามนโยบายของเรา
        </p>

        <div className={styles.featureList}>
          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <img src="/icons/face-scan.svg" alt="" className={styles.icon} />
            </div>

            <div className={styles.featureContent}>
              <h2>ใช้รูปภาพเพื่อวิเคราะห์สภาพผิวเท่านั้น</h2>
              <p>ไม่ใช้เพื่อวัตถุประสงค์อื่นนอกเหนือจากการวิเคราะห์ผิว</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <img src="/icons/lock.svg" alt="" className={styles.icon} />
            </div>

            <div className={styles.featureContent}>
              <h2>ไม่เผยแพร่หรือแบ่งปันให้บุคคลภายนอก</h2>
              <p>จัดเก็บข้อมูลของคุณด้วยระบบที่เชื่อถือได้</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <img src="/icons/shield.svg" alt="" className={styles.icon} />
            </div>

            <div className={styles.featureContent}>
              <h2>เก็บรักษาข้อมูลอย่างปลอดภัย</h2>
              <p>ด้วยระบบที่ได้มาตรฐานและเชื่อถือได้</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <img src="/icons/trash.svg" alt="" className={styles.icon} />
            </div>

            <div className={styles.featureContent}>
              <h2>ลบรูปภาพเมื่อสิ้นสุดการวิเคราะห์</h2>
              <p>จัดเก็บข้อมูลของคุณด้วยระบบที่เชื่อถือได้</p>
            </div>
          </div>
        </div>

        <div className={styles.consentBox}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={imageConsent}
              onChange={(event) => setImageConsent(event.target.checked)}
            />

            <span>ฉันยินยอมให้ Wela ใช้รูปภาพของฉันเพื่อวิเคราะห์สภาพผิว</span>
          </label>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(event) => setPrivacyConsent(event.target.checked)}
            />

            <span>
              ฉันได้อ่านและยอมรับ{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                นโยบายความเป็นส่วนตัว
              </a>{" "}
              และ{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                ข้อกำหนดการใช้งาน
              </a>
            </span>
          </label>
        </div>

        <button
          type="button"
          className={styles.acceptButton}
          disabled={!canContinue}
          onClick={handleAccept}
        >
          ฉันยินยอม
        </button>
      </section>
    </main>
  );
}
