import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowRight,
  Leaf,
  Bookmark,
  BookmarkCheck,
  Share2,
  Download,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { ImageZoomViewer, ConfidenceIndicator, SeverityBadge } from "@/components/analysis";
import { useToast } from "@/hooks/use-toast";
import { useAnalysis } from "@/hooks/useAnalyses";

function normalizeConfidence(value: number | null): number {
  if (value === null || value === undefined) return 0;
  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

function normalizeSeverity(
  value: string | null
): "low" | "moderate" | "high" | "critical" {
  const severity = (value || "low").toLowerCase();
  if (severity === "moderate" || severity === "medium") return "moderate";
  if (severity === "high" || severity === "severe") return "high";
  if (severity === "critical") return "critical";
  return "low";
}

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data, isLoading, error } = useAnalysis(id);

  const analysis = data?.analysis;
  const recommendations = data?.recommendations;

  if (isLoading) {
    return (
      <AppLayout title="Analysis Results">
        <div className="p-4 space-y-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error || !analysis) {
    return (
      <AppLayout title="Analysis Results">
        <div className="p-4 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-destructive" />
          <p className="font-medium">Analysis not available</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Could not load this analysis."}
          </p>
          <Button onClick={() => navigate("/history")}>Go to History</Button>
        </div>
      </AppLayout>
    );
  }

  const diseaseName = analysis.disease_prediction || "Healthy";
  const isHealthy =
    diseaseName.toLowerCase() === "healthy" || diseaseName.toLowerCase().includes("no disease");
  const confidence = normalizeConfidence(analysis.confidence_score);
  const severity = normalizeSeverity(analysis.severity_level);
  const expertTips = Array.isArray(recommendations?.expert_tips)
    ? recommendations.expert_tips.map((tip) => String(tip))
    : [];

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
      title: `CropCare Analysis - ${diseaseName}`,
      text: `${analysis.crop_type} analysis: ${diseaseName} detected with ${confidence}% confidence`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Analysis link copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    const report = `
CropCare Disease Analysis Report
================================
Date: ${new Date(analysis.analysis_date).toLocaleString()}
Crop: ${analysis.crop_type}
Disease: ${diseaseName}
Confidence: ${confidence}%
Severity: ${analysis.severity_level || "N/A"}

Timeline:
${recommendations?.timeline || "N/A"}

Expert Tips:
${expertTips.length ? expertTips.map((tip, i) => `${i + 1}. ${tip}`).join("\n") : "No tips available"}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cropcare-analysis-${analysis.id}.txt`;
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
        <div className="relative">
          <ImageZoomViewer
            src={analysis.image_url || "/placeholder.svg"}
            alt={`Analyzed ${analysis.crop_type} crop`}
            className="aspect-video bg-muted rounded-xl overflow-hidden"
          />
          {!isHealthy && (
            <SeverityBadge severity={severity} className="absolute top-3 right-3" />
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleBookmark}>
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4 mr-2" />
            )}
            {isBookmarked ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <Card className={isHealthy ? "border-l-4 border-l-success" : "border-l-4 border-l-destructive"}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {isHealthy ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              <CardTitle className="text-lg font-heading">
                {isHealthy ? "Crop looks healthy" : "Disease Detected"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Crop Type</span>
                <span className="font-medium capitalize">{analysis.crop_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Result</span>
                <span className={isHealthy ? "font-semibold text-success" : "font-semibold text-destructive"}>
                  {diseaseName}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <ConfidenceIndicator confidence={confidence} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              Expert Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expertTips.length > 0 ? (
              <ul className="space-y-2">
                {expertTips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No expert tips available for this scan yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="space-y-3 max-w-lg mx-auto">
            <Button size="lg" className="w-full" onClick={() => navigate(`/recommendations/${analysis.id}`)}>
              View Treatment Recommendations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/chat")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

