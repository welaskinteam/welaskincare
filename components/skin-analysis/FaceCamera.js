import { useEffect, useRef, useState } from "react";
import ImageUploader from "./ImageUploader";
import styles from "../../styles/skin-analysis/FaceCamera.module.css";

export default function FaceCamera({ onImageSelected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const meshCanvasRef = useRef(null);
  const faceDetectionTimerRef = useRef(null);
  const isDetectingRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const [faceStatus, setFaceStatus] = useState("checking");
  const [cameraChecks, setCameraChecks] = useState({
    lighting: "checking",
    position: "checking",
    lookingStraight: "checking",
  });

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  /* MARK: Camera */

  const startCamera = async () => {
    try {
      setFlash(false);
      setScreenFlash(false);
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("กล้องไม่สามารถใช้งานได้บนอุปกรณ์นี้");
      }

      const portraitVideo = {
        facingMode: "user",
        // ขอให้ iPhone ส่งภาพ portrait โดยตรง ไม่ใช่รับ landscape แล้วหมุนเอง
        aspectRatio: { exact: 9 / 16 },
        resizeMode: "crop-and-scale",
        width: { ideal: 720, max: 1280 },
        height: { ideal: 1280, max: 1920 },
      };

      let stream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: portraitVideo,
          audio: false,
        });
      } catch (error) {
        // กล้องบางรุ่นไม่รองรับ exact aspect ratio ให้ลองแบบ ideal ต่อ
        if (error.name !== "OverconstrainedError") {
          throw error;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...portraitVideo,
            aspectRatio: { ideal: 9 / 16 },
          },
          audio: false,
        });
      }

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
        "ไม่สามารถเปิดกล้องได้\nกรุณาอนุญาตให้เว็บไซต์เข้าถึงกล้อง",
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

    faceLandmarkerRef.current?.close();
    faceLandmarkerRef.current = null;

    const canvas = meshCanvasRef.current;
    const context = canvas?.getContext("2d");
    context?.clearRect(0, 0, canvas.width, canvas.height);

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
      const { FaceLandmarker, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
      );

      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceLandmarkerRef.current = landmarker;
      const lightCanvas = document.createElement("canvas");
      lightCanvas.width = 32;
      lightCanvas.height = 32;
      const lightContext = lightCanvas.getContext("2d", {
        willReadFrequently: true,
      });

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
          const result = landmarker.detectForVideo(video, performance.now());
          const landmarks = result.faceLandmarks[0];

          drawFaceMesh(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION);

          if (lightContext) {
            lightContext.drawImage(video, 0, 0, 32, 32);
            const pixels = lightContext.getImageData(0, 0, 32, 32).data;
            let brightness = 0;

            for (let index = 0; index < pixels.length; index += 4) {
              brightness +=
                pixels[index] * 0.299 +
                pixels[index + 1] * 0.587 +
                pixels[index + 2] * 0.114;
            }

            brightness /= pixels.length / 4;
            setCameraChecks((previous) => ({
              ...previous,
              lighting:
                brightness >= 55 && brightness <= 220
                  ? "ready"
                  : "not-ready",
            }));
          }

          if (!landmarks?.length) {
            setFaceStatus("not-found");
            setCameraChecks((previous) => ({
              ...previous,
              position: "not-ready",
              lookingStraight: "not-ready",
            }));
            return;
          }

          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          const faceBounds = getFaceBounds(
            landmarks,
            videoWidth,
            videoHeight,
          );
          const faceCenterX = faceBounds.originX + faceBounds.width / 2;
          const faceCenterY = faceBounds.originY + faceBounds.height / 2;
          const horizontalOffset = Math.abs(faceCenterX / videoWidth - 0.5);
          const verticalOffset = Math.abs(faceCenterY / videoHeight - 0.43);
          const faceWidthRatio = faceBounds.width / videoWidth;
          const positionReady =
            faceWidthRatio >= 0.24 &&
            faceWidthRatio <= 0.68 &&
            horizontalOffset <= 0.16 &&
            verticalOffset <= 0.18;

          const leftEye = landmarks[263];
          const rightEye = landmarks[33];
          const nose = landmarks[1];
          let lookingStraight = positionReady;

          if (leftEye && rightEye && nose) {
            const eyeCenterX = (leftEye.x + rightEye.x) / 2;
            const eyeGap = Math.abs(leftEye.x - rightEye.x);
            const eyeTilt = Math.abs(leftEye.y - rightEye.y);
            const noseOffset = Math.abs(nose.x - eyeCenterX);

            lookingStraight =
              eyeGap > 0 &&
              noseOffset / eyeGap < 0.28 &&
              eyeTilt / eyeGap < 0.3;
          }

          setCameraChecks((previous) => ({
            ...previous,
            position: positionReady ? "ready" : "not-ready",
            lookingStraight: lookingStraight ? "ready" : "not-ready",
          }));

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

  const getFaceBounds = (landmarks, videoWidth, videoHeight) => {
    const xValues = landmarks.map((landmark) => landmark.x);
    const yValues = landmarks.map((landmark) => landmark.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    return {
      originX: minX * videoWidth,
      originY: minY * videoHeight,
      width: (maxX - minX) * videoWidth,
      height: (maxY - minY) * videoHeight,
    };
  };

  const drawFaceMesh = (landmarks, connections) => {
    const canvas = meshCanvasRef.current;
    const video = videoRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !video || !context || !landmarks?.length) {
      context?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const scale = Math.max(width / videoWidth, height / videoHeight);
    const renderedWidth = videoWidth * scale;
    const renderedHeight = videoHeight * scale;
    const offsetX = (renderedWidth - width) / 2;
    const offsetY = (renderedHeight - height) / 2;

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(76, 70, 255, 0.72)";
    context.lineWidth = 1;
    context.lineJoin = "round";
    context.lineCap = "round";

    for (const connection of connections) {
      const start = landmarks[connection.start];
      const end = landmarks[connection.end];

      if (!start || !end) {
        continue;
      }

      const startX = width - (start.x * renderedWidth - offsetX);
      const startY = start.y * renderedHeight - offsetY;
      const endX = width - (end.x * renderedWidth - offsetX);
      const endY = end.y * renderedHeight - offsetY;

      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
    }
  };

  /* MARK: Capture */

  const handleCapture = async () => {
    if (!videoRef.current || !cameraReady || isCapturing) {
      return;
    }

    setIsCapturing(true);

    if (flash) {
      setScreenFlash(true);
      await new Promise((resolve) => window.setTimeout(resolve, 120));
    }

    const video = videoRef.current;

    const canvas = document.createElement("canvas");

    const targetAspectRatio = 9 / 16;

    const cropWidth = Math.min(
      video.videoWidth,
      video.videoHeight * targetAspectRatio,
    );
    const cropHeight = Math.min(
      video.videoHeight,
      video.videoWidth / targetAspectRatio,
    );
    const cropX = (video.videoWidth - cropWidth) / 2;
    const cropY = (video.videoHeight - cropHeight) / 2;

    // ให้ไฟล์ที่ถ่ายมีสัดส่วนเดียวกับกรอบเสมอ ไม่ว่ากล้องจะส่งภาพมาแบบใด
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setScreenFlash(false);
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
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setScreenFlash(false);
          setIsCapturing(false);
          return;
        }

        const file = new File([blob], `skin-scan-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        stopCamera();
        setScreenFlash(false);

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

        <canvas
          ref={meshCanvasRef}
          className={styles.faceMesh}
          aria-hidden="true"
        />

        {screenFlash && <div className={styles.screenFlash} aria-hidden="true" />}

        {/* MARK: Header */}

        <div className={styles.header}>
          <div className={styles.cameraChecks} aria-label="สถานะการจัดกล้อง">
            <span
              className={`${styles.cameraCheck} ${
                cameraChecks.lighting === "ready"
                  ? styles.cameraCheckReady
                  : styles.cameraCheckNotReady
              }`}
            >
              แสง
            </span>
            <span
              className={`${styles.cameraCheck} ${
                cameraChecks.position === "ready"
                  ? styles.cameraCheckReady
                  : styles.cameraCheckNotReady
              }`}
            >
              ตำแหน่งของหน้า
            </span>
            <span
              className={`${styles.cameraCheck} ${
                cameraChecks.lookingStraight === "ready"
                  ? styles.cameraCheckReady
                  : styles.cameraCheckNotReady
              }`}
            >
              มองตรง
            </span>
          </div>

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
            aria-pressed={flash}
            aria-label="แฟลช"
          >
            <img
              src={flash ? "/images/flash-on.png" : "/images/flash-off.png"}
              alt=""
              className={styles.flashIcon}
            />

            <small>แฟลช</small>
          </button>
        </div>
      </div>
    </main>
  );
}
