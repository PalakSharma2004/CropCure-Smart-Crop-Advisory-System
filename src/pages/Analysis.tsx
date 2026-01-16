import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Leaf, Bookmark, BookmarkCheck, Share2, Download, MessageSquare } from "lucide-react";
import { ImageZoomViewer, ConfidenceIndicator, SeverityBadge } from "@/components/analysis";
import { useToast } from "@/hooks/use-toast";

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock data - will be replaced with actual data
  const analysisData = {
    id,
    cropType: "Tomato",
    cropTypeHi: "टमाटर",
    disease: "Early Blight",
    diseaseHi: "अगेती झुलसा",
    confidence: 92,
    severity: "moderate" as const,
    imageUrl: "/placeholder.svg",
    analyzedAt: new Date().toISOString(),
    description: "Early blight is a common fungal disease affecting tomatoes and potatoes. It typically starts on lower leaves and spreads upward, causing characteristic concentric rings on affected leaves.",
    descriptionHi: "अगेती झुलसा टमाटर और आलू को प्रभावित करने वाला एक सामान्य कवक रोग है। यह आमतौर पर निचली पत्तियों पर शुरू होता है और ऊपर की ओर फैलता है।",
    symptoms: [
      "Dark brown spots with concentric rings",
      "Yellowing around lesions",
      "Leaf drop starting from bottom",
      "Stem lesions in severe cases",
    ],
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from saved" : "Saved!",
      description: isBookmarked 
        ? "Analysis removed from your saved items" 
        : "Analysis saved to your history",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `CropCare Analysis - ${analysisData.disease}`,
      text: `${analysisData.cropType} analysis: ${analysisData.disease} detected with ${analysisData.confidence}% confidence`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Analysis link copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    // Create a simple text report
    const report = `
CropCare Disease Analysis Report
================================
Date: ${new Date(analysisData.analyzedAt).toLocaleString()}
Crop: ${analysisData.cropType}
Disease: ${analysisData.disease}
Confidence: ${analysisData.confidence}%
Severity: ${analysisData.severity}

Description:
${analysisData.description}

Symptoms:
${analysisData.symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n")}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cropcare-analysis-${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report downloaded",
      description: "Analysis report saved to your device",
    });
  };

  return (
    <AppLayout title="Analysis Results">
      <div className="p-4 space-y-6 pb-24">
        {/* Image with Zoom */}
        <div className="relative">
          <ImageZoomViewer
            src={analysisData.imageUrl}
            alt="Analyzed crop"
            className="aspect-video bg-muted rounded-xl overflow-hidden"
          />
          <SeverityBadge
            severity={analysisData.severity}
            className="absolute top-3 right-3"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4 mr-2" />
            )}
            {isBookmarked ? "Saved" : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Detection Result */}
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg font-heading">Disease Detected</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Crop Type</span>
                <span className="font-medium">
                  {analysisData.cropType}
                  <span className="text-muted-foreground text-sm ml-1">
                    ({analysisData.cropTypeHi})
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Disease</span>
                <span className="font-semibold text-destructive">
                  {analysisData.disease}
                </span>
              </div>
            </div>

            {/* Confidence Indicator */}
            <div className="pt-2 border-t">
              <ConfidenceIndicator confidence={analysisData.confidence} />
            </div>
          </CardContent>
        </Card>

        {/* About Disease */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              About {analysisData.disease}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {analysisData.description}
            </p>
            <p className="text-xs text-muted-foreground italic">
              {analysisData.descriptionHi}
            </p>

            {/* Symptoms */}
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2">Common Symptoms:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {analysisData.symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="space-y-3 max-w-lg mx-auto">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate(`/recommendations/${id}`)}
            >
              View Treatment Recommendations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full" 
              onClick={() => navigate("/chat")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
