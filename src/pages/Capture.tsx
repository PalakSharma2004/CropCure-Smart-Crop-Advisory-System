import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image, Upload, Zap, X, RotateCcw, Check, SwitchCamera } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type CaptureMode = "camera" | "preview" | "idle";

export default function Capture() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<CaptureMode>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      setIsLoading(true);
      
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setMode("camera");
      setIsLoading(false);
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError(
        error instanceof Error 
          ? error.message 
          : "Unable to access camera. Please check permissions."
      );
      setIsLoading(false);
    }
  }, [facingMode, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setMode("idle");
  }, [stream]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  }, []);

  useEffect(() => {
    if (mode === "camera" && stream) {
      startCamera();
    }
  }, [facingMode]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageData);
      stopCamera();
      setMode("preview");
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setMode("preview");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setMode("idle");
  };

  const analyzeImage = () => {
    if (capturedImage) {
      // Store the image in sessionStorage for the analysis page
      sessionStorage.setItem("capturedImage", capturedImage);
      // Generate a mock analysis ID and navigate
      const analysisId = `analysis-${Date.now()}`;
      navigate(`/analysis/${analysisId}`);
    }
  };

  return (
    <AppLayout title={t("capture.title", "Scan Crop")}>
      <div className="p-4 space-y-6">
        {/* Camera/Preview Area */}
        <div className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
          {/* Idle State */}
          {mode === "idle" && !cameraError && (
            <div className="text-center text-muted-foreground">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">{t("capture.tapToStart", "Tap 'Take Photo' to start camera")}</p>
              <p className="text-xs mt-1">फ़ोटो लेने के लिए नीचे बटन दबाएं</p>
            </div>
          )}

          {/* Camera Error State */}
          {cameraError && (
            <div className="text-center text-destructive p-4">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">{t("capture.cameraError", "Camera Error")}</p>
              <p className="text-xs mt-1">{cameraError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setCameraError(null)}
              >
                {t("capture.tryAgain", "Try Again")}
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {t("capture.startingCamera", "Starting camera...")}
              </p>
            </div>
          )}

          {/* Camera View */}
          {mode === "camera" && (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {/* Camera Frame Overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-white/70 rounded-xl pointer-events-none" />
              
              {/* Camera Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={switchCamera}
                >
                  <SwitchCamera className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={stopCamera}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}

          {/* Preview Mode */}
          {mode === "preview" && capturedImage && (
            <img
              src={capturedImage}
              alt="Captured crop"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Idle Frame Overlay */}
          {mode === "idle" && !cameraError && !isLoading && (
            <div className="absolute inset-8 border-2 border-dashed border-primary/50 rounded-xl pointer-events-none" />
          )}
        </div>

        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Tips - Only show in idle mode */}
        {mode === "idle" && (
          <Card className="bg-secondary/10 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-secondary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{t("capture.tipsTitle", "Tips for best results")}</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• {t("capture.tip1", "Ensure good lighting on the leaf")}</li>
                    <li>• {t("capture.tip2", "Focus on the affected area")}</li>
                    <li>• {t("capture.tip3", "Keep the camera steady")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Actions */}
        {mode === "preview" && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{t("capture.imageReady", "Image Ready")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("capture.reviewImage", "Review your image and proceed to analysis")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Idle Mode Buttons */}
          {mode === "idle" && (
            <>
              <Button 
                size="lg" 
                className="w-full h-14 text-lg"
                onClick={startCamera}
                disabled={isLoading}
              >
                <Camera className="mr-2 h-5 w-5" />
                {t("capture.takePhoto", "Take Photo")}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12"
                  onClick={openGallery}
                >
                  <Image className="mr-2 h-4 w-4" />
                  {t("capture.gallery", "Gallery")}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12"
                  onClick={openGallery}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t("capture.upload", "Upload")}
                </Button>
              </div>
            </>
          )}

          {/* Camera Mode Button */}
          {mode === "camera" && (
            <Button 
              size="lg" 
              className="w-full h-16 text-lg rounded-full"
              onClick={capturePhoto}
            >
              <div className="w-12 h-12 rounded-full border-4 border-white" />
            </Button>
          )}

          {/* Preview Mode Buttons */}
          {mode === "preview" && (
            <>
              <Button 
                size="lg" 
                className="w-full h-14 text-lg"
                onClick={analyzeImage}
              >
                <Check className="mr-2 h-5 w-5" />
                {t("capture.analyzeImage", "Analyze Image")}
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-12"
                onClick={retakePhoto}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("capture.retake", "Retake Photo")}
              </Button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
