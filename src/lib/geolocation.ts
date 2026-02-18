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
  // Andhra Pradesh
  "Vijayawada, AP": { lat: 16.5062, lng: 80.6480, name: "Vijayawada, AP" },
  "Visakhapatnam, AP": { lat: 17.6868, lng: 83.2185, name: "Visakhapatnam, AP" },
  // Arunachal Pradesh
  "Itanagar, Arunachal Pradesh": { lat: 27.0844, lng: 93.6053, name: "Itanagar, Arunachal Pradesh" },
  // Assam
  "Guwahati, Assam": { lat: 26.1445, lng: 91.7362, name: "Guwahati, Assam" },
  // Bihar
  "Patna, Bihar": { lat: 25.5941, lng: 85.1376, name: "Patna, Bihar" },
  "Gaya, Bihar": { lat: 24.7955, lng: 84.9994, name: "Gaya, Bihar" },
  // Chhattisgarh
  "Raipur, Chhattisgarh": { lat: 21.2514, lng: 81.6296, name: "Raipur, Chhattisgarh" },
  // Delhi
  "Delhi": { lat: 28.6139, lng: 77.2090, name: "Delhi" },
  // Goa
  "Panaji, Goa": { lat: 15.4909, lng: 73.8278, name: "Panaji, Goa" },
  // Gujarat
  "Ahmedabad, Gujarat": { lat: 23.0225, lng: 72.5714, name: "Ahmedabad, Gujarat" },
  "Surat, Gujarat": { lat: 21.1702, lng: 72.8311, name: "Surat, Gujarat" },
  // Haryana
  "Chandigarh, Haryana": { lat: 30.7333, lng: 76.7794, name: "Chandigarh, Haryana" },
  "Hisar, Haryana": { lat: 29.1492, lng: 75.7217, name: "Hisar, Haryana" },
  // Himachal Pradesh
  "Shimla, HP": { lat: 31.1048, lng: 77.1734, name: "Shimla, HP" },
  // Jharkhand
  "Ranchi, Jharkhand": { lat: 23.3441, lng: 85.3096, name: "Ranchi, Jharkhand" },
  // Karnataka
  "Bengaluru, Karnataka": { lat: 12.9716, lng: 77.5946, name: "Bengaluru, Karnataka" },
  "Mysuru, Karnataka": { lat: 12.2958, lng: 76.6394, name: "Mysuru, Karnataka" },
  // Kerala
  "Thiruvananthapuram, Kerala": { lat: 8.5241, lng: 76.9366, name: "Thiruvananthapuram, Kerala" },
  "Kochi, Kerala": { lat: 9.9312, lng: 76.2673, name: "Kochi, Kerala" },
  // Madhya Pradesh
  "Bhopal, MP": { lat: 23.2599, lng: 77.4126, name: "Bhopal, MP" },
  "Indore, MP": { lat: 22.7196, lng: 75.8577, name: "Indore, MP" },
  // Maharashtra
  "Mumbai, Maharashtra": { lat: 19.0760, lng: 72.8777, name: "Mumbai, Maharashtra" },
  "Nagpur, Maharashtra": { lat: 21.1458, lng: 79.0882, name: "Nagpur, Maharashtra" },
  "Pune, Maharashtra": { lat: 18.5204, lng: 73.8567, name: "Pune, Maharashtra" },
  // Manipur
  "Imphal, Manipur": { lat: 24.8170, lng: 93.9368, name: "Imphal, Manipur" },
  // Meghalaya
  "Shillong, Meghalaya": { lat: 25.5788, lng: 91.8933, name: "Shillong, Meghalaya" },
  // Mizoram
  "Aizawl, Mizoram": { lat: 23.7271, lng: 92.7176, name: "Aizawl, Mizoram" },
  // Nagaland
  "Kohima, Nagaland": { lat: 25.6751, lng: 94.1086, name: "Kohima, Nagaland" },
  // Odisha
  "Bhubaneswar, Odisha": { lat: 20.2961, lng: 85.8245, name: "Bhubaneswar, Odisha" },
  // Punjab
  "Ludhiana, Punjab": { lat: 30.9010, lng: 75.8573, name: "Ludhiana, Punjab" },
  "Amritsar, Punjab": { lat: 31.6340, lng: 74.8723, name: "Amritsar, Punjab" },
  // Rajasthan
  "Jaipur, Rajasthan": { lat: 26.9124, lng: 75.7873, name: "Jaipur, Rajasthan" },
  "Jodhpur, Rajasthan": { lat: 26.2389, lng: 73.0243, name: "Jodhpur, Rajasthan" },
  // Sikkim
  "Gangtok, Sikkim": { lat: 27.3389, lng: 88.6065, name: "Gangtok, Sikkim" },
  // Tamil Nadu
  "Chennai, Tamil Nadu": { lat: 13.0827, lng: 80.2707, name: "Chennai, Tamil Nadu" },
  "Coimbatore, Tamil Nadu": { lat: 11.0168, lng: 76.9558, name: "Coimbatore, Tamil Nadu" },
  // Telangana
  "Hyderabad, Telangana": { lat: 17.3850, lng: 78.4867, name: "Hyderabad, Telangana" },
  // Tripura
  "Agartala, Tripura": { lat: 23.8315, lng: 91.2868, name: "Agartala, Tripura" },
  // Uttar Pradesh
  "Lucknow, UP": { lat: 26.8467, lng: 80.9462, name: "Lucknow, UP" },
  "Varanasi, UP": { lat: 25.3176, lng: 82.9739, name: "Varanasi, UP" },
  "Kanpur, UP": { lat: 26.4499, lng: 80.3319, name: "Kanpur, UP" },
  "Agra, UP": { lat: 27.1767, lng: 78.0081, name: "Agra, UP" },
  // Uttarakhand
  "Dehradun, Uttarakhand": { lat: 30.3165, lng: 78.0322, name: "Dehradun, Uttarakhand" },
  // West Bengal
  "Kolkata, West Bengal": { lat: 22.5726, lng: 88.3639, name: "Kolkata, West Bengal" },
  // Jammu & Kashmir
  "Srinagar, J&K": { lat: 34.0837, lng: 74.7973, name: "Srinagar, J&K" },
  // Ladakh
  "Leh, Ladakh": { lat: 34.1526, lng: 77.5771, name: "Leh, Ladakh" },
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
