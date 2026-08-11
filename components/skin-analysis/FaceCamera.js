import { useEffect, useRef, useState } from "react";
import ImageUploader from "./ImageUploader";
import styles from "../../styles/skin-analysis/FaceCamera.module.css";

export default function FaceCamera({ onImageSelected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  /* MARK: Camera */

  const startCamera = async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "กล้องไม่สามารถใช้งานได้บนอุปกรณ์นี้"
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: 1080,
            },
            height: {
              ideal: 1920,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        setCameraReady(true);
      }
    } catch (error) {
      console.error("Camera Error:", error);

      setCameraError(
        "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตให้เว็บไซต์เข้าถึงกล้อง"
      );
    }
  };

  /* MARK: Stop Camera */

  const stopCamera = () => {
    if (!streamRef.current) {
      return;
    }

    streamRef.current
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    streamRef.current = null;

    setCameraReady(false);
  };

  /* MARK: Capture */

  const handleCapture = () => {
    if (
      !videoRef.current ||
      !cameraReady ||
      isCapturing
    ) {
      return;
    }

    setIsCapturing(true);

    const video = videoRef.current;

    const canvas =
      document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setIsCapturing(false);
      return;
    }

    /*
     * Mirror ภาพกล้องหน้า
     */

    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsCapturing(false);
          return;
        }

        const file = new File(
          [blob],
          `skin-scan-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        stopCamera();

        onImageSelected(file);

        setIsCapturing(false);
      },
      "image/jpeg",
      0.9
    );
  };

  /* MARK: Gallery */

  const handleGalleryImage = (file) => {
    stopCamera();

    onImageSelected(file);
  };

  /* MARK: Flash */

  const handleFlash = () => {
    setFlash((prev) => !prev);
  };

  return (
    <main className={styles.container}>
      <div className={styles.cameraArea}>

        {/* MARK: Camera */}

        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          muted
          playsInline
        />


        {/* MARK: Header */}

        <div className={styles.header}>
          <h1>
            เขยิบมาใกล้กล้องอีกนิดได้ไหม?
          </h1>

          <p>
            คุณใกล้กล้องเกินไปนิด
          </p>
        </div>


        {/* MARK: Camera Error */}

        {cameraError && (
          <div className={styles.error}>
            <p>{cameraError}</p>

            <button
              type="button"
              onClick={startCamera}
            >
              เปิดกล้องอีกครั้ง
            </button>
          </div>
        )}


        {/* MARK: Controls */}

        <div className={styles.controls}>

          {/* Gallery */}

          <ImageUploader
            onImageChange={handleGalleryImage}
          />


          {/* Capture */}

          <button
            type="button"
            className={styles.captureButton}
            onClick={handleCapture}
            disabled={
              !cameraReady ||
              isCapturing
            }
            aria-label="ถ่ายภาพ"
          >
            <img
              src="/images/capture.png"
              alt=""
              className={styles.captureIcon}
            />
          </button>


          {/* Flash */}

          <button
            type="button"
            className={`${styles.flashButton} ${
              flash
                ? styles.flashActive
                : ""
            }`}
            onClick={handleFlash}
            aria-label="เปิดแฟลช"
          >
            <img
              src="/images/flash.png"
              alt=""
              className={styles.flashIcon}
            />

            <small>
              แฟลช
            </small>
          </button>

        </div>
      </div>
    </main>
  );
}