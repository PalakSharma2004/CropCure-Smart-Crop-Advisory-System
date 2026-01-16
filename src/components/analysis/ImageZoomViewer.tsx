import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X, Maximize2 } from "lucide-react";

interface ImageZoomViewerProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageZoomViewer({ src, alt, className = "" }: ImageZoomViewerProps) {
  const [scale, setScale] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1));
  const resetZoom = () => setScale(1);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={`relative group cursor-pointer ${className}`}>
          <img src={src} alt={alt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none">
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/50 hover:bg-black/70 rounded-full"
            onClick={handleZoomOut}
            disabled={scale <= 1}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/50 hover:bg-black/70 rounded-full"
            onClick={handleZoomIn}
            disabled={scale >= 4}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/50 hover:bg-black/70 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* Image */}
        <div
          className="w-full h-full overflow-auto flex items-center justify-center p-4"
          onDoubleClick={resetZoom}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-none transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
