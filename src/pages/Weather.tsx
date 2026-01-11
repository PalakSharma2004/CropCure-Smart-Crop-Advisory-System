import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer,
  AlertTriangle
} from "lucide-react";

export default function Weather() {
  // Mock weather data
  const currentWeather = {
    temperature: 28,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    feelsLike: 30,
    uvIndex: 6,
  };

  const forecast = [
    { day: "Today", icon: Cloud, high: 28, low: 22, condition: "Partly Cloudy" },
    { day: "Tomorrow", icon: Sun, high: 32, low: 24, condition: "Sunny" },
    { day: "Wed", icon: CloudRain, high: 26, low: 21, condition: "Rain" },
    { day: "Thu", icon: Cloud, high: 27, low: 22, condition: "Cloudy" },
    { day: "Fri", icon: Sun, high: 30, low: 23, condition: "Sunny" },
  ];

  const farmingTips = [
    {
      type: "warning",
      message: "Rain expected on Wednesday - complete spraying by Tuesday",
    },
    {
      type: "info",
      message: "Good conditions for harvesting today and tomorrow",
    },
  ];

  return (
    <AppLayout title="Weather">
      <div className="p-4 space-y-6">
        {/* Current Weather */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Your Location</p>
                <p className="text-4xl font-bold mt-1">{currentWeather.temperature}°C</p>
                <p className="text-primary-foreground/80 mt-1">{currentWeather.condition}</p>
              </div>
              <Cloud className="h-20 w-20 text-primary-foreground/50" />
            </div>
          </CardContent>
        </Card>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Thermometer className="h-5 w-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Feels Like</p>
                <p className="font-semibold">{currentWeather.feelsLike}°C</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Droplets className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="font-semibold">{currentWeather.humidity}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Wind className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Wind</p>
                <p className="font-semibold">{currentWeather.windSpeed} km/h</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Sun className="h-5 w-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">UV Index</p>
                <p className="font-semibold">{currentWeather.uvIndex}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5-Day Forecast */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecast.map((day) => {
                const Icon = day.icon;
                return (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-20">{day.day}</span>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground flex-1 text-center">
                      {day.condition}
                    </span>
                    <span className="text-sm font-medium">
                      {day.high}° / {day.low}°
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Farming Tips */}
        <div className="space-y-3">
          <h3 className="font-heading font-semibold">Farming Tips</h3>
          {farmingTips.map((tip, index) => (
            <Card 
              key={index} 
              className={`border-l-4 ${tip.type === 'warning' ? 'border-l-accent' : 'border-l-secondary'}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 shrink-0 ${tip.type === 'warning' ? 'text-accent' : 'text-secondary'}`} />
                <p className="text-sm">{tip.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
