import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";

interface ImagePreviewProps {
  imageUrl: string;
  onConfirm: () => void;
  onRetake: () => void;
  onClose: () => void;
  isProcessing?: boolean;
}

export function ImagePreview({
  imageUrl,
  onConfirm,
  onRetake,
  onClose,
  isProcessing = false,
}: ImagePreviewProps) {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent absolute top-0 left-0 right-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={handleZoomIn}
            disabled={scale >= 3}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Image container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt="Captured"
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        />
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-white font-medium">Processing image...</p>
          <p className="text-white/70 text-sm mt-1">Optimizing for analysis</p>
        </div>
      )}

      {/* Bottom controls */}
      {!isProcessing && (
        <div className="p-4 bg-gradient-to-t from-black/70 to-transparent absolute bottom-0 left-0 right-0">
          <div className="flex gap-4 justify-center max-w-sm mx-auto">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 bg-transparent text-white border-white hover:bg-white/20"
              onClick={onRetake}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={onConfirm}
            >
              <Check className="h-5 w-5 mr-2" />
              Analyze
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
