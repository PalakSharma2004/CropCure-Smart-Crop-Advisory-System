import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Cloud, 
  Leaf, 
  TrendingUp, 
  AlertTriangle, 
  Upload, 
  Bell,
  ChevronRight,
  Droplets,
  Wind,
  Thermometer,
  Lightbulb
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

// Mock data for recent analyses
const recentAnalyses = [
  { id: "1", crop: "Tomato", disease: "Early Blight", date: "2 hours ago", severity: "medium", thumbnail: "🍅" },
  { id: "2", crop: "Wheat", disease: "Healthy", date: "Yesterday", severity: "healthy", thumbnail: "🌾" },
  { id: "3", crop: "Cotton", disease: "Aphid Infestation", date: "2 days ago", severity: "high", thumbnail: "🌿" },
];

// Daily tips
const dailyTips = [
  { id: 1, titleKey: "tip1", icon: Droplets },
  { id: 2, titleKey: "tip2", icon: Thermometer },
  { id: 3, titleKey: "tip3", icon: Leaf },
  { id: 4, titleKey: "tip4", icon: Lightbulb },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentTip, setCurrentTip] = useState(0);
  const [notificationCount] = useState(3);
  const tipsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % dailyTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "healthy": return "bg-success text-success-foreground";
      case "medium": return "bg-accent text-accent-foreground";
      case "high": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AppLayout 
      title={t("common.appName")}
      rightElement={
        <button className="relative p-2" onClick={() => navigate("/notifications")}>
          <Bell className="h-5 w-5 text-muted-foreground" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
      }
    >
      <div className="p-4 space-y-6 pb-24">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h2 className="text-xl font-heading font-semibold">
            {t("dashboard.welcomeBack")} 👋
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("dashboard.helpToday")}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            size="lg" 
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => navigate("/capture")}
          >
            <Camera className="h-8 w-8" />
            <span className="font-medium">{t("dashboard.takePhoto")}</span>
          </Button>
          <Button 
            size="lg" 
            variant="secondary"
            className="h-auto py-6 flex flex-col gap-2"
            onClick={() => navigate("/capture")}
          >
            <Upload className="h-8 w-8" />
            <span className="font-medium">{t("dashboard.uploadImage")}</span>
          </Button>
        </div>

        {/* Weather Widget */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={() => navigate("/weather")}>
          <div className="bg-gradient-to-r from-secondary/20 to-primary/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-secondary" />
                <span className="font-heading font-medium">{t("dashboard.weatherToday")}</span>
              </div>
              <span className="text-3xl font-bold text-primary">28°C</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Partly cloudy • {t("dashboard.goodForSpraying")}</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>65%</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Wind className="h-4 w-4 text-slate-500" />
                <span>12 km/h</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span>Feels 30°</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/history")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.scansThisMonth")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/history")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">85%</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.healthyCrops")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Tips Carousel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              {t("dashboard.dailyTips")}
            </h3>
            <div className="flex gap-1">
              {dailyTips.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentTip ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div 
                ref={tipsContainerRef}
                className="transition-all duration-300"
              >
                {dailyTips.map((tip, index) => {
                  const TipIcon = tip.icon;
                  return index === currentTip ? (
                    <div key={tip.id} className="flex items-start gap-3 animate-fade-in">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <TipIcon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t(`tips.${tip.titleKey}.title`)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t(`tips.${tip.titleKey}.description`)}</p>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analyses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("dashboard.recentAnalyses")}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="text-primary">
              {t("dashboard.viewAll")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {recentAnalyses.map((analysis) => (
              <Card 
                key={analysis.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/analysis/${analysis.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                      {analysis.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{analysis.crop}</p>
                        <Badge className={`text-xs ${getSeverityColor(analysis.severity)}`}>
                          {analysis.disease}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{analysis.date}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alerts Section */}
        <div className="space-y-3">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            {t("dashboard.recentAlerts")}
          </h3>
          <Card className="border-l-4 border-l-accent">
            <CardContent className="p-4">
              <p className="font-medium text-sm">Pest Alert: Aphids Active</p>
              <p className="text-xs text-muted-foreground mt-1">
                High aphid activity expected this week. Consider preventive measures.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
