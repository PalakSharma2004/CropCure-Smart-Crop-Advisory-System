import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image, Upload, Zap, X } from "lucide-react";
import { CameraViewfinder, ImagePreview } from "@/components/camera";
import { AnalysisProgress } from "@/components/analysis";
import { processImage, validateImageFormat, dataURLtoFile } from "@/lib/imageProcessing";
import { useToast } from "@/hooks/use-toast";

export default function Capture() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    } catch (error) {
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

    setIsProcessing(true);
    try {
      // Process the captured image
      const file = dataURLtoFile(capturedImage, "capture.jpg");
      await processImage(file);
      
      setIsProcessing(false);
      setIsAnalyzing(true);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Processing failed",
        description: "Unable to process the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    // Navigate to analysis results with mock ID
    navigate("/analysis/new-analysis");
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowCamera(true);
  };

  const handleClosePreview = () => {
    setCapturedImage(null);
  };

  // Show camera viewfinder
  if (showCamera) {
    return (
      <CameraViewfinder
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  // Show image preview
  if (capturedImage) {
    return (
      <>
        <ImagePreview
          imageUrl={capturedImage}
          onConfirm={handleConfirmAnalysis}
          onRetake={handleRetake}
          onClose={handleClosePreview}
          isProcessing={isProcessing}
        />
        <AnalysisProgress
          isAnalyzing={isAnalyzing}
          onComplete={handleAnalysisComplete}
        />
      </>
    );
  }

  return (
    <AppLayout title="Scan Crop">
      <div className="p-4 space-y-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Camera Preview Area */}
        <div 
          className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={() => setShowCamera(true)}
        >
          <div className="text-center text-muted-foreground">
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm font-medium">Tap to open camera</p>
            <p className="text-xs mt-1">कैमरा खोलने के लिए टैप करें</p>
          </div>

          {/* Camera Frame Overlay */}
          <div className="absolute inset-8 border-2 border-dashed border-primary/50 rounded-xl pointer-events-none" />
        </div>

        {/* Tips */}
        <Card className="bg-secondary/10 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Tips for best results</p>
                <p className="text-xs text-muted-foreground mb-2">बेहतर परिणामों के लिए सुझाव</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Ensure good lighting on the leaf</li>
                  <li>• Focus on the affected area</li>
                  <li>• Keep the camera steady</li>
                  <li>• Include both healthy and affected parts if possible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg"
            onClick={() => setShowCamera(true)}
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
            >
              <Image className="mr-2 h-4 w-4" />
              Gallery
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>

        {/* Analysis Progress Overlay */}
        <AnalysisProgress
          isAnalyzing={isAnalyzing}
          onComplete={handleAnalysisComplete}
        />
      </div>
    </AppLayout>
  );
}
