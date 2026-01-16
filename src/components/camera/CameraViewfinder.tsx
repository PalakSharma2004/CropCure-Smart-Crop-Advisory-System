import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, SwitchCamera, Zap, ZapOff, X } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";

interface CameraViewfinderProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function CameraViewfinder({ onCapture, onClose }: CameraViewfinderProps) {
  const {
    videoRef,
    canvasRef,
    state,
    startCamera,
    stopCamera,
    switchCamera,
    toggleFlash,
    captureImage,
  } = useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    const imageData = captureImage();
    if (imageData) {
      onCapture(imageData);
    }
  };

  if (state.error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
        <div className="text-white text-center">
          <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Camera Error</p>
          <p className="text-sm text-white/70 mb-6">{state.error}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => startCamera()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video preview */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
        style={{ transform: state.facingMode === "user" ? "scaleX(-1)" : "none" }}
      />

      {/* Loading overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}

      {/* Crop framing guide */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-12 border-2 border-white/50 rounded-xl">
          {/* Corner indicators */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50" />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50" />
        </div>
      </div>

      {/* Hint text */}
      <div className="absolute top-20 inset-x-0 text-center">
        <p className="text-white text-sm bg-black/30 inline-block px-4 py-2 rounded-full">
          Center the affected leaf in the frame
        </p>
      </div>

      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="text-white bg-black/30 hover:bg-black/50 rounded-full h-12 w-12"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/30 hover:bg-black/50 rounded-full h-12 w-12"
            onClick={toggleFlash}
          >
            {state.flashEnabled ? (
              <Zap className="h-6 w-6 text-yellow-400" />
            ) : (
              <ZapOff className="h-6 w-6" />
            )}
          </Button>

          {state.hasMultipleCameras && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-black/30 hover:bg-black/50 rounded-full h-12 w-12"
              onClick={switchCamera}
            >
              <SwitchCamera className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center">
        <button
          onClick={handleCapture}
          disabled={state.isLoading}
          className="w-20 h-20 rounded-full bg-white border-4 border-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
        >
          <div className="w-16 h-16 rounded-full bg-primary" />
        </button>
      </div>
    </div>
  );
}
