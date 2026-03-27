export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export async function searchLocations(
  query: string,
  countryCode = "in"
): Promise<NominatimResult[]> {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    limit: "5",
    countrycodes: countryCode,
  });

  const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: {
      "User-Agent": "FindMeARace/1.0 (findmearace.com)",
    },
  });

  if (!response.ok) return [];
  return response.json();
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<NominatimResult | null> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    format: "json",
    addressdetails: "1",
  });

  const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: {
      "User-Agent": "FindMeARace/1.0 (findmearace.com)",
    },
  });

  if (!response.ok) return null;
  return response.json();
}

export function getDisplayName(result: NominatimResult): string {
  const addr = result.address;
  const city = addr.city || addr.town || addr.village || "";
  const state = addr.state || "";
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  return result.display_name.split(",").slice(0, 2).join(",").trim();
}
