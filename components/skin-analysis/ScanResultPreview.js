import { useEffect, useState } from "react";
import styles from "../../styles/skin-analysis/ScanResultPreview.module.css";

export default function ScanResultPreview({ image, onContinue, onAnalyzeNow }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(image);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  if (!image) {
    return null;
  }

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        {/* MARK: Image */}

        <div className={styles.imageWrapper}>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="รูปภาพสำหรับวิเคราะห์สภาพผิว"
              className={styles.image}
            />
          )}
        </div>

        {/* MARK: Result */}

        <section className={styles.result}>
          {/* Status */}

          <div className={styles.status}>
            <div className={styles.statusIcon}>
              <svg
                width="14"
                height="11"
                viewBox="0 0 14 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.3778 0.510897C13.5244 0.66638 13.6388 0.849209 13.7147 1.04894C13.7905 1.24867 13.8263 1.46139 13.82 1.67495C13.8136 1.8885 13.7652 2.09871 13.6776 2.29357C13.59 2.48843 13.4648 2.66411 13.3093 2.81059L5.87668 9.81476C5.56609 10.1074 5.15294 10.2662 4.7263 10.2571C4.29967 10.2479 3.89373 10.0714 3.59601 9.76572L0.461019 6.54515C0.160109 6.23601 -0.00567099 5.81999 0.000148181 5.38862C0.00596736 4.95726 0.182909 4.54586 0.492048 4.24496C0.801187 3.94405 1.2172 3.77827 1.64857 3.78408C2.07994 3.7899 2.49133 3.96685 2.79224 4.27598L4.81066 6.34946L11.0791 0.442832C11.3931 0.146982 11.8117 -0.0120514 12.2428 0.000713098C12.674 0.0134774 13.0825 0.196995 13.3783 0.510897Z"
                  fill="white"
                />
              </svg>
            </div>

            <h1>เสร็จสิ้นพร้อมวิเคราะห์</h1>
          </div>

          {/* Description */}

          <p className={styles.description}>
            ตอบคำถามไลฟ์สไตล์ของคุณจะช่วยให้ AI วิเคราะห์
            และแนะนำการดูแลผิวได้ตรงกับคุณมากยิ่งขึ้น
          </p>
        </section>

        {/* MARK: Actions */}

        <section className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onContinue}
          >
            ตอบคำถามเพิ่มเติม
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onAnalyzeNow}
          >
            รับผลวิเคราะห์ทันที
          </button>
        </section>
      </section>
    </main>
  );
}
