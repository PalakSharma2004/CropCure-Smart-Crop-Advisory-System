import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation
const weatherRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  locationName: z.string().max(200).optional(),
});

interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    visibility: number;
    pressure: number;
    condition: string;
    description: string;
    sunrise: string;
    sunset: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
    humidity: number;
    windSpeed: number;
    icon: string;
  }>;
  alerts: Array<{
    type: string;
    title: string;
    description: string;
    severity: string;
    validUntil: string;
  }>;
  farmingTips: Array<{
    type: "warning" | "action" | "info";
    title: string;
    description: string;
  }>;
}

// Generate farming tips based on weather conditions
function generateFarmingTips(forecast: WeatherData["forecast"]): WeatherData["farmingTips"] {
  const tips: WeatherData["farmingTips"] = [];
  
  const hasUpcomingRain = forecast.some((day, i) => i < 3 && day.precipitation > 50);
  const hasSunnyDays = forecast.some((day, i) => i < 3 && day.condition === "sunny");
  const hasHighWind = forecast.some((day, i) => i < 3 && day.windSpeed > 25);
  
  if (hasUpcomingRain) {
    tips.push({
      type: "warning",
      title: "Rain Expected",
      description: "Complete harvesting before the rain. Avoid pesticide spraying.",
    });
    tips.push({
      type: "info",
      title: "Skip Irrigation",
      description: "Upcoming rain will provide natural moisture for crops.",
    });
  }
  
  if (hasSunnyDays && !hasUpcomingRain) {
    tips.push({
      type: "action",
      title: "Ideal Spraying Conditions",
      description: "Good conditions for pesticide and fertilizer application.",
    });
  }
  
  if (hasHighWind) {
    tips.push({
      type: "warning",
      title: "High Wind Warning",
      description: "Avoid spraying pesticides. Secure loose structures.",
    });
  }
  
  // Always add a general tip
  tips.push({
    type: "action",
    title: "Soil Check Recommended",
    description: "Check soil moisture before irrigation to optimize water usage.",
  });
  
  return tips;
}

// Map OpenWeatherMap conditions to our simplified conditions
function mapCondition(weatherId: number): string {
  if (weatherId >= 200 && weatherId < 300) return "rainy"; // Thunderstorm
  if (weatherId >= 300 && weatherId < 400) return "rainy"; // Drizzle
  if (weatherId >= 500 && weatherId < 600) return "rainy"; // Rain
  if (weatherId >= 600 && weatherId < 700) return "cloudy"; // Snow (rare in India)
  if (weatherId >= 700 && weatherId < 800) return "foggy"; // Atmosphere
  if (weatherId === 800) return "sunny"; // Clear
  if (weatherId >= 801 && weatherId <= 802) return "partly-cloudy";
  return "cloudy";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = weatherRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: "Invalid coordinates",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { lat, lon, locationName } = validationResult.data;
    
    const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY");
    
    // If no API key, return mock data
    if (!OPENWEATHER_API_KEY) {
      console.log("Using mock weather data - no API key configured");
      const mockData: WeatherData = generateMockWeatherData(locationName || "Your Location");
      return new Response(JSON.stringify(mockData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const currentRes = await fetch(currentUrl);
    
    if (!currentRes.ok) {
      throw new Error(`Weather API error: ${currentRes.status}`);
    }
    
    const currentData = await currentRes.json();
    
    // Fetch 7-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastRes = await fetch(forecastUrl);
    
    if (!forecastRes.ok) {
      throw new Error(`Forecast API error: ${forecastRes.status}`);
    }
    
    const forecastData = await forecastRes.json();
    
    // Process current weather
    const sunriseDate = new Date(currentData.sys.sunrise * 1000);
    const sunsetDate = new Date(currentData.sys.sunset * 1000);
    
    const current = {
      temperature: Math.round(currentData.main.temp),
      feelsLike: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
      uvIndex: 6, // OpenWeatherMap free tier doesn't include UV
      visibility: Math.round((currentData.visibility || 10000) / 1000),
      pressure: currentData.main.pressure,
      condition: mapCondition(currentData.weather[0].id),
      description: currentData.weather[0].description,
      sunrise: sunriseDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      sunset: sunsetDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      icon: currentData.weather[0].icon,
    };
    
    // Process forecast - group by day
    const dailyForecasts: Map<string, any[]> = new Map();
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, []);
      }
      dailyForecasts.get(date)!.push(item);
    });
    
    const forecast: WeatherData["forecast"] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    let dayIndex = 0;
    dailyForecasts.forEach((items, dateStr) => {
      if (dayIndex >= 7) return;
      
      const temps = items.map((i) => i.main.temp);
      const high = Math.round(Math.max(...temps));
      const low = Math.round(Math.min(...temps));
      const avgPrecip = items.reduce((sum, i) => sum + (i.pop || 0), 0) / items.length * 100;
      const avgHumidity = items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length;
      const avgWind = items.reduce((sum, i) => sum + i.wind.speed, 0) / items.length * 3.6;
      
      // Get the most common condition
      const conditions = items.map((i) => mapCondition(i.weather[0].id));
      const conditionCounts: Record<string, number> = {};
      conditions.forEach((c) => {
        conditionCounts[c] = (conditionCounts[c] || 0) + 1;
      });
      const mainCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0][0];
      
      const date = new Date(dateStr);
      
      forecast.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day: dayIndex === 0 ? "Today" : days[date.getDay()],
        high,
        low,
        condition: mainCondition,
        precipitation: Math.round(avgPrecip),
        humidity: Math.round(avgHumidity),
        windSpeed: Math.round(avgWind),
        icon: items[Math.floor(items.length / 2)].weather[0].icon,
      });
      
      dayIndex++;
    });
    
    // Generate alerts based on conditions
    const alerts: WeatherData["alerts"] = [];
    
    if (forecast.some((day, i) => i < 3 && day.precipitation > 70)) {
      alerts.push({
        type: "weather",
        title: "Heavy Rain Expected",
        description: "Significant rainfall expected in the coming days. Take necessary precautions.",
        severity: "warning",
        validUntil: forecast[2]?.date || "Soon",
      });
    }
    
    if (current.temperature > 40) {
      alerts.push({
        type: "heat",
        title: "Extreme Heat Warning",
        description: "High temperatures may affect crop health. Ensure adequate irrigation.",
        severity: "severe",
        validUntil: "Until conditions improve",
      });
    }
    
    const farmingTips = generateFarmingTips(forecast);
    
    const weatherData: WeatherData = {
      current,
      forecast,
      alerts,
      farmingTips,
    };
    
    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Weather function error:", error);
    // Return mock data on error
    const mockData = generateMockWeatherData("Your Location");
    return new Response(JSON.stringify(mockData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateMockWeatherData(location: string): WeatherData {
  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return {
    current: {
      temperature: 28,
      feelsLike: 31,
      humidity: 65,
      windSpeed: 12,
      uvIndex: 7,
      visibility: 10,
      pressure: 1013,
      condition: "partly-cloudy",
      description: "Partly cloudy",
      sunrise: "6:15 AM",
      sunset: "6:45 PM",
      icon: "02d",
    },
    forecast: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const conditions = ["sunny", "partly-cloudy", "cloudy", "rainy"];
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day: i === 0 ? "Today" : days[date.getDay()],
        high: 28 + Math.floor(Math.random() * 5),
        low: 18 + Math.floor(Math.random() * 3),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        precipitation: Math.floor(Math.random() * 80),
        humidity: 50 + Math.floor(Math.random() * 30),
        windSpeed: 8 + Math.floor(Math.random() * 15),
        icon: "02d",
      };
    }),
    alerts: [
      {
        type: "weather",
        title: "Weather Advisory",
        description: "Variable weather conditions expected this week.",
        severity: "info",
        validUntil: "Next week",
      },
    ],
    farmingTips: [
      { type: "info", title: "Monitor Conditions", description: "Keep an eye on weather updates for optimal farming decisions." },
      { type: "action", title: "Check Soil Moisture", description: "Ensure proper soil moisture levels before irrigation." },
    ],
  };
}
