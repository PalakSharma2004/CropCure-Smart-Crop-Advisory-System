import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Cloud, Leaf, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout title="CropCare">
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h2 className="text-xl font-heading font-semibold">
            Welcome back! 👋
          </h2>
          <p className="text-muted-foreground text-sm">
            How can we help your crops today?
          </p>
        </div>

        {/* Quick Action - Scan Crop */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-lg mb-1">
                  Scan Your Crop
                </h3>
                <p className="text-primary-foreground/80 text-sm">
                  Get instant disease detection
                </p>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/capture")}
                className="rounded-full w-14 h-14"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weather Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/weather")}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Cloud className="h-5 w-5 text-secondary" />
                Weather Today
              </CardTitle>
              <span className="text-2xl font-bold text-primary">28°C</span>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Partly cloudy • Good conditions for spraying
            </CardDescription>
          </CardContent>
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
                  <p className="text-xs text-muted-foreground">Scans this month</p>
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
                  <p className="text-xs text-muted-foreground">Healthy crops</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <div className="space-y-3">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            Recent Alerts
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
