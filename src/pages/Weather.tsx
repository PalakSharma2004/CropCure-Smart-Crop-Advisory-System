import { useEffect } from "react";
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
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCATIONS } from "@/lib/geolocation";
import { useWeather } from "@/hooks/useWeather";
import { Skeleton } from "@/components/ui/skeleton";

const weatherIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  "partly-cloudy": CloudSun,
  foggy: CloudFog,
};

const tipIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  warning: AlertTriangle,
  action: Leaf,
  info: Droplets,
};

const locations = Object.keys(DEFAULT_LOCATIONS);

export default function Weather() {
  const {
    weather,
    location,
    isLoading,
    isLocating,
    error,
    fetchCurrentLocation,
    setLocationByName,
    refresh,
  } = useWeather();

  const selectedLocation = location?.name || locations[0];

  const handleLocationChange = (locName: string) => {
    setLocationByName(locName);
  };

  const CurrentWeatherIcon =
    weatherIcons[weather?.current?.condition || "partly-cloudy"] || CloudSun;

  return (
    <AppLayout title="Weather">
      <div className="p-4 space-y-4">
        {/* Location Selector */}
        <div className="flex gap-2">
          <Select value={selectedLocation} onValueChange={handleLocationChange}>
            <SelectTrigger className="flex-1">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchCurrentLocation}
            disabled={isLocating}
          >
            <Navigation
              className={cn("h-4 w-4", isLocating && "animate-spin")}
            />
          </Button>
          <Button variant="outline" size="icon" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-l-4 border-l-destructive bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && !weather && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        )}

        {/* Current Weather Card */}
        {weather?.current && (
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-5xl font-bold">
                    {weather.current.temperature}°
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Feels like {weather.current.feelsLike}°
                  </p>
                  <p className="text-sm font-medium mt-2">
                    {weather.current.description}
                  </p>
                </div>
                <CurrentWeatherIcon className="h-16 w-16 text-accent" />
              </div>

              <div className="grid grid-cols-4 gap-3 mt-6">
                <div className="text-center">
                  <Droplets className="h-5 w-5 mx-auto text-primary" />
                  <p className="text-xs text-muted-foreground mt-1">Humidity</p>
                  <p className="font-semibold text-sm">
                    {weather.current.humidity}%
                  </p>
                </div>
                <div className="text-center">
                  <Wind className="h-5 w-5 mx-auto text-primary" />
                  <p className="text-xs text-muted-foreground mt-1">Wind</p>
                  <p className="font-semibold text-sm">
                    {weather.current.windSpeed} km/h
                  </p>
                </div>
                <div className="text-center">
                  <Sun className="h-5 w-5 mx-auto text-accent" />
                  <p className="text-xs text-muted-foreground mt-1">UV Index</p>
                  <p className="font-semibold text-sm">
                    {weather.current.uvIndex}
                  </p>
                </div>
                <div className="text-center">
                  <Eye className="h-5 w-5 mx-auto text-primary" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Visibility
                  </p>
                  <p className="font-semibold text-sm">
                    {weather.current.visibility} km
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Sunrise className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sunrise</p>
                    <p className="text-sm font-medium">
                      {weather.current.sunrise}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sunset className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sunset</p>
                    <p className="text-sm font-medium">
                      {weather.current.sunset}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pressure</p>
                    <p className="text-sm font-medium">
                      {weather.current.pressure} hPa
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather Alerts */}
        {weather?.alerts?.map((alert, i) => (
          <Card
            key={i}
            className={cn(
              "border-l-4",
              alert.severity === "warning" || alert.severity === "severe"
                ? "border-l-destructive bg-destructive/5"
                : "border-l-primary bg-primary/5"
            )}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle
                className={cn(
                  "h-5 w-5 shrink-0 mt-0.5",
                  alert.severity === "warning" || alert.severity === "severe"
                    ? "text-destructive"
                    : "text-primary"
                )}
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {alert.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Valid until: {alert.validUntil}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Tabs */}
        {weather && (
          <Tabs defaultValue="forecast" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
              <TabsTrigger value="farming">Farming Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="mt-4 space-y-2">
              {weather.forecast?.map((day, i) => {
                const WeatherIcon =
                  weatherIcons[day.condition] || CloudSun;
                return (
                  <Card
                    key={i}
                    className={cn(i === 0 && "border-primary")}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <WeatherIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{day.day}</p>
                          <p className="text-xs text-muted-foreground">
                            {day.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-3 w-3 text-primary" />
                            <span className="text-xs">
                              {day.precipitation}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {day.windSpeed} km/h
                            </span>
                          </div>
                        </div>
                        <div className="text-right w-16">
                          <p className="font-semibold">{day.high}°</p>
                          <p className="text-sm text-muted-foreground">
                            {day.low}°
                          </p>
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

              {weather.farmingTips?.map((tip, i) => {
                const TipIcon = tipIcons[tip.type] || Leaf;
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
                        <p className="text-sm text-muted-foreground mt-1">
                          {tip.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
