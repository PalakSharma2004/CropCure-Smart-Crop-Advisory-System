import { AppLayout } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ArrowRight, Leaf } from "lucide-react";

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - will be replaced with actual data
  const analysisData = {
    id,
    cropType: "Tomato",
    disease: "Early Blight",
    confidence: 92,
    severity: "moderate",
    imageUrl: "/placeholder.svg",
  };

  const severityColor = {
    low: "bg-success text-success-foreground",
    moderate: "bg-accent text-accent-foreground",
    high: "bg-destructive text-destructive-foreground",
  };

  return (
    <AppLayout title="Analysis Results">
      <div className="p-4 space-y-6">
        {/* Image Preview */}
        <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
          <img
            src={analysisData.imageUrl}
            alt="Analyzed crop"
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-3 right-3 ${severityColor[analysisData.severity as keyof typeof severityColor]}`}>
            {analysisData.severity.charAt(0).toUpperCase() + analysisData.severity.slice(1)} Severity
          </Badge>
        </div>

        {/* Detection Result */}
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg font-heading">Disease Detected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Crop Type</span>
                <span className="font-medium">{analysisData.cropType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Disease</span>
                <span className="font-semibold text-destructive">{analysisData.disease}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">{analysisData.confidence}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              About {analysisData.disease}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Early blight is a common fungal disease affecting tomatoes and potatoes.
              It typically starts on lower leaves and spreads upward, causing characteristic
              concentric rings on affected leaves.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => navigate(`/recommendations/${id}`)}
          >
            View Treatment Recommendations
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/chat")}>
            Ask AI Assistant
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
