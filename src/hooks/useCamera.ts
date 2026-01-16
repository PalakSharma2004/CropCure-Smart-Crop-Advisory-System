import { useState, useRef, useCallback, useEffect } from "react";

export interface CameraState {
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  facingMode: "user" | "environment";
  flashEnabled: boolean;
  hasMultipleCameras: boolean;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<CameraState>({
    stream: null,
    error: null,
    isLoading: false,
    facingMode: "environment",
    flashEnabled: false,
    hasMultipleCameras: false,
  });

  const checkCameraCount = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setState((prev) => ({ ...prev, hasMultipleCameras: videoDevices.length > 1 }));
    } catch (e) {
      console.error("Error checking cameras:", e);
    }
  }, []);

  const startCamera = useCallback(async (facingMode: "user" | "environment" = "environment") => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Stop existing stream
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState((prev) => ({
        ...prev,
        stream,
        facingMode,
        isLoading: false,
        error: null,
      }));

      await checkCameraCount();
    } catch (error) {
      let errorMessage = "Failed to access camera";
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Camera access denied. Please allow camera permissions.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application.";
        }
      }
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [state.stream, checkCameraCount]);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState((prev) => ({ ...prev, stream: null }));
  }, [state.stream]);

  const switchCamera = useCallback(async () => {
    const newFacingMode = state.facingMode === "environment" ? "user" : "environment";
    await startCamera(newFacingMode);
  }, [state.facingMode, startCamera]);

  const toggleFlash = useCallback(async () => {
    if (!state.stream) return;

    const track = state.stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };

    if (capabilities?.torch) {
      const newFlashState = !state.flashEnabled;
      await track.applyConstraints({
        advanced: [{ torch: newFlashState } as MediaTrackConstraintSet],
      });
      setState((prev) => ({ ...prev, flashEnabled: newFlashState }));
    }
  }, [state.stream, state.flashEnabled]);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Flip horizontally if using front camera
    if (state.facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, [state.facingMode]);

  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [state.stream]);

  return {
    videoRef,
    canvasRef,
    state,
    startCamera,
    stopCamera,
    switchCamera,
    toggleFlash,
    captureImage,
  };
}
