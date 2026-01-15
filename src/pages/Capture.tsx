import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image, Upload, Zap } from "lucide-react";

export default function Capture() {
  return (
    <AppLayout title="Scan Crop">
      <div className="p-4 space-y-6">
        {/* Camera Preview Area */}
        <div className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Camera preview will appear here</p>
            <p className="text-xs mt-1">कैमरा प्रीव्यू यहाँ दिखाई देगा</p>
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
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>• Ensure good lighting on the leaf</li>
                  <li>• Focus on the affected area</li>
                  <li>• Keep the camera steady</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button size="lg" className="w-full h-14 text-lg">
            <Camera className="mr-2 h-5 w-5" />
            Take Photo
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" className="h-12">
              <Image className="mr-2 h-4 w-4" />
              Gallery
            </Button>
            <Button variant="outline" size="lg" className="h-12">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
