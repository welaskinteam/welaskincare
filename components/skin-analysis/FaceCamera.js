import { useEffect, useRef, useState } from "react";
import ImageUploader from "./ImageUploader";
import styles from "../../styles/skin-analysis/FaceCamera.module.css";

export default function FaceCamera({ onImageSelected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const faceDetectionTimerRef = useRef(null);
  const isDetectingRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [faceStatus, setFaceStatus] = useState("checking");

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
        throw new Error("กล้องไม่สามารถใช้งานได้บนอุปกรณ์นี้");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
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
        startFaceDetection();
      }
    } catch (error) {
      console.error("Camera Error:", error);

      setCameraError(
        "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตให้เว็บไซต์เข้าถึงกล้อง",
      );
    }
  };

  /* MARK: Stop Camera */

  const stopCamera = () => {
    if (faceDetectionTimerRef.current) {
      window.clearInterval(faceDetectionTimerRef.current);
      faceDetectionTimerRef.current = null;
    }

    isDetectingRef.current = false;

    faceDetectorRef.current?.close();
    faceDetectorRef.current = null;

    if (!streamRef.current) {
      return;
    }

    streamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    setCameraReady(false);
  };

  /* MARK: Face Detection */

  const startFaceDetection = async () => {
    if (!videoRef.current) {
      return;
    }

    try {
      const { FaceDetector, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
      );

      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        },
        runningMode: "VIDEO",
        minDetectionConfidence: 0.5,
      });

      faceDetectorRef.current = detector;

      const detectFace = () => {
        const video = videoRef.current;

        if (
          !video ||
          video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
          isDetectingRef.current
        ) {
          return;
        }

        isDetectingRef.current = true;

        try {
          const result = detector.detectForVideo(video, performance.now());
          const face = result.detections[0]?.boundingBox;

          if (!face) {
            setFaceStatus("not-found");
            return;
          }

          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          const faceCenterX = face.originX + face.width / 2;
          const faceCenterY = face.originY + face.height / 2;
          const horizontalOffset = Math.abs(faceCenterX / videoWidth - 0.5);
          const verticalOffset = Math.abs(faceCenterY / videoHeight - 0.43);
          const faceWidthRatio = face.width / videoWidth;

          if (faceWidthRatio < 0.24) {
            setFaceStatus("too-far");
          } else if (faceWidthRatio > 0.68) {
            setFaceStatus("too-close");
          } else if (horizontalOffset > 0.16 || verticalOffset > 0.18) {
            setFaceStatus("off-center");
          } else {
            setFaceStatus("ready");
          }
        } catch (error) {
          console.warn("Face Detection Error:", error);
        } finally {
          isDetectingRef.current = false;
        }
      };

      detectFace();
      faceDetectionTimerRef.current = window.setInterval(detectFace, 250);
    } catch (error) {
      console.warn("MediaPipe Face Detection Error:", error);
      setFaceStatus("unsupported");
    }
  };

  /* MARK: Capture */

  const handleCapture = () => {
    if (!videoRef.current || !cameraReady || isCapturing) {
      return;
    }

    setIsCapturing(true);

    const video = videoRef.current;

    const canvas = document.createElement("canvas");

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

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsCapturing(false);
          return;
        }

        const file = new File([blob], `skin-scan-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        stopCamera();

        onImageSelected(file);

        setIsCapturing(false);
      },
      "image/jpeg",
      0.9,
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
            {faceStatus === "not-found" && "ไม่พบใบหน้า กรุณามองกล้อง"}
            {faceStatus === "too-far" && "เขยิบเข้ามาใกล้กล้องอีกนิดได้ไหม?"}
            {faceStatus === "too-close" && "ถอยออกจากกล้องอีกนิดนะ"}
            {faceStatus === "off-center" && "จัดใบหน้าให้อยู่ตรงกลางกรอบ"}
            {faceStatus === "ready" && "ดีมาก อยู่ในตำแหน่งที่พอดีแล้ว"}
            {faceStatus === "checking" && "กำลังตรวจตำแหน่งใบหน้า..."}
            {faceStatus === "unsupported" &&
              "เบราว์เซอร์นี้ไม่รองรับการตรวจใบหน้าอัตโนมัติ"}
          </h1>

          <p>
            {faceStatus === "ready"
              ? "สามารถกดถ่ายภาพได้เลย"
              : faceStatus === "unsupported"
                ? "กรุณาจัดใบหน้าให้อยู่ในกรอบแล้วกดถ่ายภาพ"
                : "กรุณาจัดใบหน้าให้อยู่ในกรอบ"}
          </p>
        </div>

        {/* MARK: Camera Error */}

        {cameraError && (
          <div className={styles.error}>
            <p>{cameraError}</p>

            <button type="button" onClick={startCamera}>
              เปิดกล้องอีกครั้ง
            </button>
          </div>
        )}

        {/* MARK: Controls */}

        <div className={styles.controls}>
          {/* Gallery */}

          <ImageUploader onImageChange={handleGalleryImage} />

          {/* Capture */}

          <button
            type="button"
            className={styles.captureButton}
            onClick={handleCapture}
            disabled={!cameraReady || isCapturing}
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
              flash ? styles.flashActive : ""
            }`}
            onClick={handleFlash}
            aria-label="เปิดแฟลช"
          >
            <img src="/images/flash.png" alt="" className={styles.flashIcon} />

            <small>แฟลช</small>
          </button>
        </div>
      </div>
    </main>
  );
}
