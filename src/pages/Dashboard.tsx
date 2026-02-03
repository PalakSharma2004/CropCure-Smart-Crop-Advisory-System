import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWeather } from "@/hooks/useWeather";
import { formatDistanceToNow } from "date-fns";

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
  
  // Real data hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { weather, isLoading: weatherLoading } = useWeather();

  // Auto-rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % dailyTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case "low": 
      case null: 
        return "bg-success text-success-foreground";
      case "medium": 
        return "bg-accent text-accent-foreground";
      case "high":
      case "critical":
        return "bg-destructive text-destructive-foreground";
      default: 
        return "bg-muted text-muted-foreground";
    }
  };

  const getCropEmoji = (cropType: string) => {
    const emojiMap: Record<string, string> = {
      tomato: "🍅",
      wheat: "🌾",
      rice: "🌾",
      cotton: "🌿",
      potato: "🥔",
      corn: "🌽",
      sugarcane: "🎋",
    };
    return emojiMap[cropType.toLowerCase()] || "🌱";
  };

  const getDisplayResult = (analysis: { disease_prediction: string | null; severity_level: string | null }) => {
    if (!analysis.disease_prediction || 
        analysis.disease_prediction.toLowerCase() === 'healthy' ||
        analysis.disease_prediction.toLowerCase().includes('no disease')) {
      return "Healthy";
    }
    return analysis.disease_prediction;
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
            {weatherLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : weather?.current ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-secondary" />
                    <span className="font-heading font-medium">{t("dashboard.weatherToday")}</span>
                  </div>
                  <span className="text-3xl font-bold text-primary">{weather.current.temperature}°C</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {weather.current.condition} • {t("dashboard.goodForSpraying")}
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>{weather.current.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Wind className="h-4 w-4 text-slate-500" />
                    <span>{weather.current.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span>Feels {weather.current.feelsLike}°</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Cloud className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Weather data unavailable</p>
              </div>
            )}
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
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-7 w-8 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-foreground">{stats?.scansThisMonth || 0}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.scansThisMonth")}</p>
                    </>
                  )}
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
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-7 w-12 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-foreground">{stats?.healthyPercentage || 0}%</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.healthyCrops")}</p>
                    </>
                  )}
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
            {statsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
              stats.recentAnalyses.slice(0, 3).map((analysis) => (
                <Card 
                  key={analysis.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                        {getCropEmoji(analysis.crop_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate capitalize">{analysis.crop_type}</p>
                          <Badge className={`text-xs ${getSeverityColor(analysis.severity_level)}`}>
                            {getDisplayResult(analysis)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(analysis.analysis_date), { addSuffix: true })}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Leaf className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No analyses yet</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate("/capture")}
                  >
                    Take your first scan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Alerts Section */}
        {stats && stats.issuesCount > 0 && (
          <div className="space-y-3">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              {t("dashboard.recentAlerts")}
            </h3>
            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-4">
                <p className="font-medium text-sm">Active Issues: {stats.issuesCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You have {stats.issuesCount} crop{stats.issuesCount > 1 ? 's' : ''} that may need attention.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
