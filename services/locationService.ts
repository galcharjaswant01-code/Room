/**
 * StayHub Location & Geocoding Service
 *
 * Primary Provider: Photon by Komoot (Built on OpenStreetMap data, designed for search-as-you-type).
 * Key: Not strictly required for Photon (100% free open geocoder).
 * Optional Key: VITE_GEOCODING_API_KEY (if using Geoapify / LocationIQ).
 */

export interface LocationSuggestion {
  displayName: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
}

// In-memory cache to prevent duplicate network calls
const suggestionsCache = new Map<string, LocationSuggestion[]>();
const geocodeCache = new Map<string, { lat: number; lng: number; displayName: string }>();

/**
 * Search location suggestions for autocomplete dropdown.
 * Throttled and cached to protect providers and optimize responsiveness.
 */
export const searchLocationSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  if (suggestionsCache.has(cacheKey)) {
    return suggestionsCache.get(cacheKey)!;
  }

  const apiKey = import.meta.env.VITE_GEOCODING_API_KEY;

  // 1. If user supplied an optional Geoapify API Key
  if (apiKey && apiKey !== '') {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(trimmed)}&limit=5&apiKey=${apiKey}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.features && Array.isArray(data.features)) {
          const results: LocationSuggestion[] = data.features.map((f: any) => ({
            displayName: f.properties.formatted || f.properties.name,
            name: f.properties.name || f.properties.city || trimmed,
            city: f.properties.city,
            state: f.properties.state,
            country: f.properties.country,
            lat: f.properties.lat,
            lng: f.properties.lon,
          }));
          suggestionsCache.set(cacheKey, results);
          return results;
        }
      }
    } catch (e) {
      console.warn('Optional geocoding provider failed, falling back to Photon:', e);
    }
  }

  // 2. Primary Provider: Photon (Komoot OSM) - Free, reliable place/city search
  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=5&lang=en`
    );
    if (!response.ok) throw new Error('Photon API error');
    const data = await response.json();

    if (data && Array.isArray(data.features)) {
      const results: LocationSuggestion[] = data.features.map((item: any) => {
        const p = item.properties || {};
        const coords = item.geometry?.coordinates || [0, 0];
        
        // Build readable label: e.g. "Alkapuri, Vadodara, Gujarat, India"
        const parts = [p.name, p.district, p.city, p.state, p.country].filter(Boolean);
        const uniqueParts = Array.from(new Set(parts));
        const displayName = uniqueParts.join(', ') || p.name || trimmed;

        return {
          displayName,
          name: p.name || p.city || trimmed,
          city: p.city || p.county || p.state,
          state: p.state,
          country: p.country,
          lat: coords[1], // GeoJSON is [lon, lat]
          lng: coords[0],
        };
      });

      suggestionsCache.set(cacheKey, results);
      return results;
    }
  } catch (error) {
    console.warn('Photon autocomplete query failed, attempting standard lookup:', error);
  }

  // 3. Graceful Fallback: direct geocode
  try {
    const geo = await geocodeLocation(trimmed);
    if (geo) {
      const fallbackResults = [{
        displayName: geo.displayName,
        name: trimmed,
        lat: geo.lat,
        lng: geo.lng
      }];
      suggestionsCache.set(cacheKey, fallbackResults);
      return fallbackResults;
    }
  } catch {
    // Ignore fallback errors
  }

  return [];
};

/**
 * Convert location name or address into Latitude + Longitude.
 */
export const geocodeLocation = async (
  locationName: string
): Promise<{ lat: number; lng: number; displayName: string } | null> => {
  const trimmed = locationName?.trim();
  if (!trimmed) return null;

  const cacheKey = trimmed.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    // Try Photon first
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=1&lang=en`
    );
    if (response.ok) {
      const data = await response.json();
      if (data?.features?.[0]) {
        const item = data.features[0];
        const p = item.properties || {};
        const coords = item.geometry?.coordinates || [];
        const parts = [p.name, p.district, p.city, p.state, p.country].filter(Boolean);
        const displayName = Array.from(new Set(parts)).join(', ') || p.name || trimmed;

        const result = {
          lat: coords[1],
          lng: coords[0],
          displayName,
        };
        geocodeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Photon geocode error:', err);
  }

  // Fallback to OpenStreetMap single search with headers
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const list = await res.json();
      if (list && list.length > 0) {
        const result = {
          lat: parseFloat(list[0].lat),
          lng: parseFloat(list[0].lon),
          displayName: list[0].display_name,
        };
        geocodeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.error('Geocoding fallback failed:', err);
  }

  return null;
};

/**
 * Reverse geocode latitude and longitude into a readable location string.
 */
export const reverseGeocodeLocation = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.address) {
        const a = data.address;
        const place = a.suburb || a.neighbourhood || a.locality || a.city_district;
        const city = a.city || a.town || a.village || a.county;
        const state = a.state;
        return [place, city, state].filter(Boolean).join(', ') || data.display_name;
      }
      return data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  } catch (e) {
    console.warn('Reverse geocode failed:', e);
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

/**
 * Retrieve user's current GPS location via browser Geolocation API.
 * Never crashes the application if permission is denied.
 */
export const getCurrentBrowserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Could not access your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access or search manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  });
};

/**
 * Calculate distance in kilometers between two GPS coordinates using Haversine formula.
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
