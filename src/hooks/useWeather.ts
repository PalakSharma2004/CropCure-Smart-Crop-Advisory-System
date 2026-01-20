import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  LocationData, 
  getCurrentPosition, 
  getLastLocation, 
  saveLastLocation,
  DEFAULT_LOCATIONS 
} from "@/lib/geolocation";
import { useToast } from "@/hooks/use-toast";

export interface CurrentWeather {
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
}

export interface ForecastDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface WeatherAlert {
  type: string;
  title: string;
  description: string;
  severity: string;
  validUntil: string;
}

export interface FarmingTip {
  type: "warning" | "action" | "info";
  title: string;
  description: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  alerts: WeatherAlert[];
  farmingTips: FarmingTip[];
}

const WEATHER_CACHE_KEY = "cropcare_weather_cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CachedWeather {
  data: WeatherData;
  location: LocationData;
  timestamp: number;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load cached weather on mount
  useEffect(() => {
    const cached = getCachedWeather();
    if (cached) {
      setWeather(cached.data);
      setLocation(cached.location);
      setIsLoading(false);
    }

    // Try to get last known location or use default
    const lastLocation = getLastLocation();
    if (lastLocation) {
      setLocation(lastLocation);
      fetchWeather(lastLocation);
    } else {
      // Use default location
      const defaultLoc = DEFAULT_LOCATIONS["Varanasi, UP"];
      setLocation(defaultLoc);
      fetchWeather(defaultLoc);
    }
  }, []);

  const getCachedWeather = useCallback((): CachedWeather | null => {
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (!cached) return null;
      
      const parsed: CachedWeather = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
      
      return isExpired ? null : parsed;
    } catch {
      return null;
    }
  }, []);

  const cacheWeather = useCallback((data: WeatherData, loc: LocationData) => {
    try {
      const cached: CachedWeather = {
        data,
        location: loc,
        timestamp: Date.now(),
      };
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cached));
    } catch {
      console.warn("Could not cache weather data");
    }
  }, []);

  const fetchWeather = useCallback(async (loc: LocationData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("weather", {
        body: {
          lat: loc.lat,
          lon: loc.lng,
          locationName: loc.name,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      setWeather(data);
      setLocation(loc);
      cacheWeather(data, loc);
      saveLastLocation(loc);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch weather";
      setError(message);
      console.error("Weather fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [cacheWeather]);

  const fetchCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    setError(null);

    try {
      const loc = await getCurrentPosition();
      setLocation(loc);
      await fetchWeather(loc);
      toast({
        title: "Location updated",
        description: loc.name || "Using your current location",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not get location";
      setError(message);
      toast({
        title: "Location error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  }, [fetchWeather, toast]);

  const setLocationByName = useCallback(async (locationName: string) => {
    const loc = DEFAULT_LOCATIONS[locationName];
    if (loc) {
      setLocation(loc);
      await fetchWeather(loc);
    }
  }, [fetchWeather]);

  const refresh = useCallback(async () => {
    if (location) {
      await fetchWeather(location);
    }
  }, [location, fetchWeather]);

  return {
    weather,
    location,
    isLoading,
    isLocating,
    error,
    fetchCurrentLocation,
    setLocationByName,
    refresh,
  };
}
