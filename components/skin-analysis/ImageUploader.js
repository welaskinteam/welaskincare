import { useRef } from "react";

export default function ImageUploader({ onImageChange }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    onImageChange(file);

    /*
     * Reset input เพื่อให้สามารถเลือกรูปเดิมซ้ำได้
     */
    event.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        hidden
      />

      <button
        type="button"
        onClick={handleClick}
        aria-label="เลือกรูปจากแกลเลอรี่"
      >
        <img src="/images/gallery.png" alt="" className="galleryIcon" />
        <small>แกลเลอรี่</small>
      </button>
    </>
  );
}
