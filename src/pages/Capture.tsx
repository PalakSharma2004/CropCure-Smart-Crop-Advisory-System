import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Image, Upload, Zap } from "lucide-react";
import { CameraViewfinder, ImagePreview } from "@/components/camera";
import { processImage, validateImageFormat, dataURLtoFile } from "@/lib/imageProcessing";
import { useToast } from "@/hooks/use-toast";
import { useCropAnalysis } from "@/hooks/useCropAnalysis";

const cropOptions = [
  { value: "tomato", label: "Tomato" },
  { value: "wheat", label: "Wheat" },
  { value: "rice", label: "Rice" },
  { value: "cotton", label: "Cotton" },
  { value: "potato", label: "Potato" },
  { value: "corn", label: "Corn" },
  { value: "sugarcane", label: "Sugarcane" },
  { value: "chili", label: "Chili" },
  { value: "onion", label: "Onion" },
  { value: "other", label: "Other" },
];

export default function Capture() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { analyzeImage, isAnalyzing } = useCropAnalysis();

  const handleCameraCapture = (imageData: string) => {
    setShowCamera(false);
    setCapturedImage(imageData);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFormat(file)) {
      toast({
        title: "Invalid format",
        description: "Please select a JPEG or PNG image",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const processed = await processImage(file);
      setCapturedImage(processed.preview);
    } catch {
      toast({
        title: "Processing failed",
        description: "Unable to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAnalysis = async () => {
    if (!capturedImage) return;

    if (!selectedCrop) {
      toast({
        title: "Select crop first",
        description: "Please choose your crop type before analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const file = dataURLtoFile(capturedImage, `capture-${Date.now()}.jpg`);
      const result = await analyzeImage(file, selectedCrop);

      if (result?.id) {
        setCapturedImage(null);
        navigate(`/analysis/${result.id}`);
      }
    } catch {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowCamera(true);
  };

  const handleClosePreview = () => {
    setCapturedImage(null);
  };

  const isBusy = isProcessing || isAnalyzing;

  if (showCamera) {
    return (
      <CameraViewfinder
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (capturedImage) {
    return (
      <ImagePreview
        imageUrl={capturedImage}
        onConfirm={handleConfirmAnalysis}
        onRetake={handleRetake}
        onClose={handleClosePreview}
        isProcessing={isBusy}
      />
    );
  }

  return (
    <AppLayout title="Scan Crop">
      <div className="p-4 space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileSelect}
        />

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">Select crop before scanning</p>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger>
                <SelectValue placeholder="Choose crop type" />
              </SelectTrigger>
              <SelectContent>
                {cropOptions.map((crop) => (
                  <SelectItem key={crop.value} value={crop.value}>
                    {crop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div
          className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={() => selectedCrop && setShowCamera(true)}
        >
          <div className="text-center text-muted-foreground">
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm font-medium">Tap to open camera</p>
            {!selectedCrop && <p className="text-xs mt-1">Select crop type first</p>}
          </div>

          <div className="absolute inset-8 border-2 border-dashed border-primary/50 rounded-xl pointer-events-none" />
        </div>

        <Card className="bg-secondary/10 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Tips for best results</p>
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li>• Ensure good lighting on the leaf</li>
                  <li>• Focus on the affected area</li>
                  <li>• Keep the camera steady</li>
                  <li>• Include both healthy and affected parts if possible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full h-14 text-lg"
            onClick={() => setShowCamera(true)}
            disabled={!selectedCrop || isBusy}
          >
            <Camera className="mr-2 h-5 w-5" />
            Open Camera
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedCrop || isBusy}
            >
              <Image className="mr-2 h-4 w-4" />
              Gallery
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedCrop || isBusy}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

