export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  name?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

// Default locations for common Indian cities
export const DEFAULT_LOCATIONS: Record<string, LocationData> = {
  "Varanasi, UP": { lat: 25.3176, lng: 82.9739, name: "Varanasi, UP" },
  "Lucknow, UP": { lat: 26.8467, lng: 80.9462, name: "Lucknow, UP" },
  "Kanpur, UP": { lat: 26.4499, lng: 80.3319, name: "Kanpur, UP" },
  "Patna, Bihar": { lat: 25.5941, lng: 85.1376, name: "Patna, Bihar" },
  "Jaipur, Rajasthan": { lat: 26.9124, lng: 75.7873, name: "Jaipur, Rajasthan" },
  "Delhi": { lat: 28.6139, lng: 77.209, name: "Delhi" },
  "Mumbai, Maharashtra": { lat: 19.076, lng: 72.8777, name: "Mumbai, Maharashtra" },
  "Bengaluru, Karnataka": { lat: 12.9716, lng: 77.5946, name: "Bengaluru, Karnataka" },
  "Chennai, Tamil Nadu": { lat: 13.0827, lng: 80.2707, name: "Chennai, Tamil Nadu" },
  "Hyderabad, Telangana": { lat: 17.385, lng: 78.4867, name: "Hyderabad, Telangana" },
};

// Check if geolocation is supported
export function isGeolocationSupported(): boolean {
  return "geolocation" in navigator;
}

// Get current position with timeout and high accuracy options
export function getCurrentPosition(
  options: PositionOptions = {}
): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: 0,
        message: "Geolocation is not supported by this browser",
      } as GeolocationError);
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes cache
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        // Try to get location name via reverse geocoding
        try {
          const name = await reverseGeocode(location.lat, location.lng);
          location.name = name;
        } catch {
          location.name = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        }

        resolve(location);
      },
      (error) => {
        const errorMessages: Record<number, string> = {
          1: "Location permission denied. Please enable location access.",
          2: "Location unavailable. Please try again.",
          3: "Location request timed out. Please try again.",
        };
        reject({
          code: error.code,
          message: errorMessages[error.code] || error.message,
        } as GeolocationError);
      },
      defaultOptions
    );
  });
}

// Reverse geocode coordinates to get a location name
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // Using a free geocoding service (Nominatim)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        headers: {
          "User-Agent": "CropCure App",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();
    const address = data.address;

    // Build a readable location name
    const parts: string[] = [];
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    if (address.state) {
      // Abbreviate Indian state names
      const stateAbbreviations: Record<string, string> = {
        "Uttar Pradesh": "UP",
        "Madhya Pradesh": "MP",
        "Andhra Pradesh": "AP",
        "Tamil Nadu": "TN",
        "West Bengal": "WB",
        "Maharashtra": "MH",
        "Karnataka": "KA",
        "Gujarat": "GJ",
        "Rajasthan": "RJ",
        "Bihar": "BR",
        "Punjab": "PB",
        "Haryana": "HR",
        "Jharkhand": "JH",
        "Chhattisgarh": "CG",
        "Odisha": "OR",
        "Kerala": "KL",
        "Telangana": "TG",
        "Assam": "AS",
      };
      parts.push(stateAbbreviations[address.state] || address.state);
    }

    return parts.join(", ") || data.display_name.split(",").slice(0, 2).join(",");
  } catch {
    return `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
  }
}

// Watch position for continuous updates
export function watchPosition(
  onUpdate: (location: LocationData) => void,
  onError: (error: GeolocationError) => void,
  options: PositionOptions = {}
): number | null {
  if (!isGeolocationSupported()) {
    onError({
      code: 0,
      message: "Geolocation is not supported",
    });
    return null;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 30000,
    maximumAge: 60000, // 1 minute cache
    ...options,
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      const errorMessages: Record<number, string> = {
        1: "Location permission denied",
        2: "Location unavailable",
        3: "Location request timed out",
      };
      onError({
        code: error.code,
        message: errorMessages[error.code] || error.message,
      });
    },
    defaultOptions
  );
}

// Stop watching position
export function clearWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

// Calculate distance between two points (in km)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get nearest default location
export function getNearestDefaultLocation(lat: number, lng: number): LocationData {
  let nearest = Object.values(DEFAULT_LOCATIONS)[0];
  let minDistance = Infinity;

  for (const location of Object.values(DEFAULT_LOCATIONS)) {
    const distance = calculateDistance(lat, lng, location.lat, location.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }

  return nearest;
}

// Store and retrieve last known location
const LOCATION_STORAGE_KEY = "cropcare_last_location";

export function saveLastLocation(location: LocationData): void {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch {
    console.warn("Could not save location to localStorage");
  }
}

export function getLastLocation(): LocationData | null {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
