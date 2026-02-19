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

  // Save parsed values for error handler
  let parsedLat = 25;
  let parsedLon = 77;

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
    parsedLat = lat;
    parsedLon = lon;
    
    const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY");
    
    // If no API key, return mock data
    if (!OPENWEATHER_API_KEY) {
      console.log("Using mock weather data - no API key configured");
      const mockData: WeatherData = generateMockWeatherData(locationName || "Your Location", lat, lon);
      return new Response(JSON.stringify(mockData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch current weather and forecast in parallel
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`),
    ]);
    
    if (!currentRes.ok) {
      const errBody = await currentRes.text();
      throw new Error(`Weather API error: ${currentRes.status} - ${errBody}`);
    }
    if (!forecastRes.ok) {
      const errBody = await forecastRes.text();
      throw new Error(`Forecast API error: ${forecastRes.status} - ${errBody}`);
    }
    
    const [currentData, forecastData] = await Promise.all([
      currentRes.json(),
      forecastRes.json(),
    ]);
    
    // Process current weather
    const sunriseDate = new Date(currentData.sys.sunrise * 1000);
    const sunsetDate = new Date(currentData.sys.sunset * 1000);
    
    const current = {
      temperature: Math.round(currentData.main.temp),
      feelsLike: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6),
      uvIndex: 6,
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
      
      const temps = items.map((i: any) => i.main.temp);
      const high = Math.round(Math.max(...temps));
      const low = Math.round(Math.min(...temps));
      const avgPrecip = items.reduce((sum: number, i: any) => sum + (i.pop || 0), 0) / items.length * 100;
      const avgHumidity = items.reduce((sum: number, i: any) => sum + i.main.humidity, 0) / items.length;
      const avgWind = items.reduce((sum: number, i: any) => sum + i.wind.speed, 0) / items.length * 3.6;
      
      const conditions = items.map((i: any) => mapCondition(i.weather[0].id));
      const conditionCounts: Record<string, number> = {};
      conditions.forEach((c: string) => {
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
    // Return location-aware mock data on error
    const mockData = generateMockWeatherData("Your Location", parsedLat, parsedLon);
    return new Response(JSON.stringify(mockData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateMockWeatherData(location: string, lat?: number, lon?: number): WeatherData {
  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Use coordinates to generate deterministic but varied data per location
  const seed = Math.abs((lat || 0) * 1000 + (lon || 0) * 100);
  const seededRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  // Base temperature varies by latitude (closer to equator = hotter)
  const latAbs = Math.abs(lat || 25);
  const baseTemp = latAbs < 15 ? 32 : latAbs < 25 ? 28 : latAbs < 30 ? 22 : 15;
  const baseHumidity = (lon || 77) > 80 ? 75 : 55; // Eastern India more humid
  
  const conditions = ["sunny", "partly-cloudy", "cloudy", "rainy"];
  const conditionIndex = Math.floor(seededRandom(0) * conditions.length);
  const currentCondition = conditions[conditionIndex];
  const descriptions: Record<string, string> = {
    "sunny": "Clear sky",
    "partly-cloudy": "Partly cloudy",
    "cloudy": "Overcast clouds",
    "rainy": "Light rain",
  };
  
  const currentTemp = baseTemp + Math.floor(seededRandom(1) * 6) - 2;
  const currentHumidity = baseHumidity + Math.floor(seededRandom(2) * 20) - 10;
  const currentWind = 5 + Math.floor(seededRandom(3) * 20);
  
  // Sunrise/sunset vary by latitude
  const sunriseHour = latAbs > 28 ? 7 : 6;
  const sunsetHour = latAbs > 28 ? 6 : 7;
  
  return {
    current: {
      temperature: currentTemp,
      feelsLike: currentTemp + Math.floor(seededRandom(4) * 4),
      humidity: Math.min(95, Math.max(20, currentHumidity)),
      windSpeed: currentWind,
      uvIndex: currentCondition === "sunny" ? 8 : currentCondition === "rainy" ? 3 : 5,
      visibility: currentCondition === "rainy" ? 5 : 10,
      pressure: 1008 + Math.floor(seededRandom(5) * 15),
      condition: currentCondition,
      description: descriptions[currentCondition] || "Partly cloudy",
      sunrise: `${sunriseHour}:${String(10 + Math.floor(seededRandom(6) * 30)).padStart(2, "0")} AM`,
      sunset: `${sunsetHour}:${String(10 + Math.floor(seededRandom(7) * 35)).padStart(2, "0")} PM`,
      icon: currentCondition === "sunny" ? "01d" : currentCondition === "rainy" ? "10d" : "02d",
    },
    forecast: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const cIdx = Math.floor(seededRandom(10 + i * 3) * conditions.length);
      const dayCondition = conditions[cIdx];
      const dayHigh = baseTemp + Math.floor(seededRandom(11 + i * 3) * 7) - 1;
      const dayLow = dayHigh - 8 - Math.floor(seededRandom(12 + i * 3) * 5);
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day: i === 0 ? "Today" : days[date.getDay()],
        high: dayHigh,
        low: dayLow,
        condition: dayCondition,
        precipitation: dayCondition === "rainy" ? 60 + Math.floor(seededRandom(13 + i) * 30) : Math.floor(seededRandom(14 + i) * 40),
        humidity: baseHumidity + Math.floor(seededRandom(15 + i) * 25) - 10,
        windSpeed: 5 + Math.floor(seededRandom(16 + i) * 18),
        icon: dayCondition === "sunny" ? "01d" : dayCondition === "rainy" ? "10d" : "02d",
      };
    }),
    alerts: [],
    farmingTips: generateFarmingTips([]),
  };
}
