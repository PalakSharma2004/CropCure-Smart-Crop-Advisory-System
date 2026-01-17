import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Wind,
  MapPin,
  Navigation,
  AlertTriangle,
  Leaf,
  Calendar,
  Sunrise,
  Sunset,
  Eye,
  Gauge,
  CloudFog,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  "partly-cloudy": CloudSun,
  foggy: CloudFog,
};

const locations = ["Varanasi, UP", "Lucknow, UP", "Kanpur, UP", "Patna, Bihar", "Jaipur, Rajasthan"];

export default function Weather() {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [isLocating, setIsLocating] = useState(false);

  const currentWeather = {
    temperature: 28,
    feelsLike: 31,
    condition: "partly-cloudy" as const,
    humidity: 65,
    wind: 12,
    uvIndex: 7,
    visibility: 10,
    pressure: 1013,
    sunrise: "6:15 AM",
    sunset: "6:45 PM",
    description: "Partly cloudy with light breeze",
  };

  const forecast = [
    { day: "Today", date: "Jan 10", high: 28, low: 18, condition: "partly-cloudy" as const, precipitation: 10, wind: 12 },
    { day: "Fri", date: "Jan 11", high: 30, low: 19, condition: "sunny" as const, precipitation: 0, wind: 10 },
    { day: "Sat", date: "Jan 12", high: 27, low: 17, condition: "cloudy" as const, precipitation: 30, wind: 15 },
    { day: "Sun", date: "Jan 13", high: 24, low: 16, condition: "rainy" as const, precipitation: 80, wind: 20 },
    { day: "Mon", date: "Jan 14", high: 25, low: 15, condition: "rainy" as const, precipitation: 60, wind: 18 },
    { day: "Tue", date: "Jan 15", high: 26, low: 16, condition: "cloudy" as const, precipitation: 20, wind: 14 },
    { day: "Wed", date: "Jan 16", high: 29, low: 18, condition: "sunny" as const, precipitation: 5, wind: 10 },
  ];

  const alerts = [
    { type: "warning", title: "Heavy Rain Expected", description: "Rainfall of 50-80mm expected on Sunday.", validUntil: "Jan 14" },
  ];

  const farmingTips = [
    { type: "warning", title: "Delay Harvesting", description: "Rain expected Sunday-Monday. Complete harvesting by Saturday.", icon: AlertTriangle },
    { type: "action", title: "Ideal Spraying Conditions", description: "Friday morning is optimal for pesticide application.", icon: Leaf },
    { type: "info", title: "Skip Irrigation", description: "Upcoming rain will provide adequate moisture.", icon: Droplets },
    { type: "action", title: "Good Planting Window", description: "After Tuesday's rain, soil moisture will be perfect for sowing.", icon: Calendar },
  ];

  const handleGetLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setSelectedLocation("Varanasi, UP");
    }, 1500);
  };

  const CurrentWeatherIcon = weatherIcons[currentWeather.condition];

  return (
    <AppLayout title="Weather">
      <div className="p-4 space-y-4">
        {/* Location Selector */}
        <div className="flex gap-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="flex-1">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleGetLocation} disabled={isLocating}>
            <Navigation className={cn("h-4 w-4", isLocating && "animate-spin")} />
          </Button>
          <Button variant="outline" size="icon">
            <Map className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Weather Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-5xl font-bold">{currentWeather.temperature}°</p>
                <p className="text-sm text-muted-foreground mt-1">Feels like {currentWeather.feelsLike}°</p>
                <p className="text-sm font-medium mt-2">{currentWeather.description}</p>
              </div>
              <CurrentWeatherIcon className="h-16 w-16 text-accent" />
            </div>

            <div className="grid grid-cols-4 gap-3 mt-6">
              <div className="text-center">
                <Droplets className="h-5 w-5 mx-auto text-primary" />
                <p className="text-xs text-muted-foreground mt-1">Humidity</p>
                <p className="font-semibold text-sm">{currentWeather.humidity}%</p>
              </div>
              <div className="text-center">
                <Wind className="h-5 w-5 mx-auto text-primary" />
                <p className="text-xs text-muted-foreground mt-1">Wind</p>
                <p className="font-semibold text-sm">{currentWeather.wind} km/h</p>
              </div>
              <div className="text-center">
                <Sun className="h-5 w-5 mx-auto text-accent" />
                <p className="text-xs text-muted-foreground mt-1">UV Index</p>
                <p className="font-semibold text-sm">{currentWeather.uvIndex}</p>
              </div>
              <div className="text-center">
                <Eye className="h-5 w-5 mx-auto text-primary" />
                <p className="text-xs text-muted-foreground mt-1">Visibility</p>
                <p className="font-semibold text-sm">{currentWeather.visibility} km</p>
              </div>
            </div>

            <div className="flex justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Sunrise className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Sunrise</p>
                  <p className="text-sm font-medium">{currentWeather.sunrise}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sunset className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Sunset</p>
                  <p className="text-sm font-medium">{currentWeather.sunset}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Pressure</p>
                  <p className="text-sm font-medium">{currentWeather.pressure} hPa</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Alert */}
        {alerts.map((alert, i) => (
          <Card key={i} className="border-l-4 border-l-destructive bg-destructive/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <Badge variant="outline" className="text-xs">warning</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Valid until: {alert.validUntil}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Tabs */}
        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
            <TabsTrigger value="farming">Farming Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="mt-4 space-y-2">
            {forecast.map((day, i) => {
              const WeatherIcon = weatherIcons[day.condition];
              return (
                <Card key={i} className={cn(i === 0 && "border-primary")}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <WeatherIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{day.day}</p>
                        <p className="text-xs text-muted-foreground">{day.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-3 w-3 text-primary" />
                          <span className="text-xs">{day.precipitation}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{day.wind} km/h</span>
                        </div>
                      </div>
                      <div className="text-right w-16">
                        <p className="font-semibold">{day.high}°</p>
                        <p className="text-sm text-muted-foreground">{day.low}°</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="farming" className="mt-4 space-y-3">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  Weather-Based Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Based on the 7-day forecast for {selectedLocation}
                </p>
              </CardContent>
            </Card>

            {farmingTips.map((tip, i) => {
              const TipIcon = tip.icon;
              return (
                <Card
                  key={i}
                  className={cn(
                    "border-l-4",
                    tip.type === "warning" && "border-l-destructive",
                    tip.type === "action" && "border-l-success",
                    tip.type === "info" && "border-l-primary"
                  )}
                >
                  <CardContent className="p-4 flex gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        tip.type === "warning" && "bg-destructive/10",
                        tip.type === "action" && "bg-success/10",
                        tip.type === "info" && "bg-primary/10"
                      )}
                    >
                      <TipIcon
                        className={cn(
                          "h-5 w-5",
                          tip.type === "warning" && "text-destructive",
                          tip.type === "action" && "text-success",
                          tip.type === "info" && "text-primary"
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tip.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
