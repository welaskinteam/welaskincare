import { useRef, useState } from "react";
import styles from "../styles/ImageUploader.module.css";

export default function ImageUploader({ onImageChange }) {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);
    onImageChange(file);
  };

  const handleSelectImage = () => {
    inputRef.current?.click();
  };

  return (
    <section className={styles.container}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className={styles.input}
      />

      {!preview ? (
        <button
          type="button"
          className={styles.uploadButton}
          onClick={handleSelectImage}
        >
          <span className={styles.uploadIcon}>＋</span>

          <span className={styles.uploadText}>เลือกรูปภาพ</span>

          <span className={styles.uploadDescription}>
            เลือกรูปจากอัลบั้ม หรือถ่ายรูปใหม่
          </span>
        </button>
      ) : (
        <div className={styles.previewContainer}>
          <img
            src={preview}
            alt="รูปภาพสำหรับวิเคราะห์ผิว"
            className={styles.preview}
          />

          <button
            type="button"
            className={styles.changeButton}
            onClick={handleSelectImage}
          >
            เปลี่ยนรูป
          </button>
        </div>
      )}
    </section>
  );
}