import {
  geohashForLocation,
  geohashQueryBounds,
  distanceBetween,
} from "geofire-common";

export function encodeGeohash(lat: number, lng: number, precision = 10): string {
  return geohashForLocation([lat, lng], precision);
}

export interface GeohashRange {
  start: string;
  end: string;
}

export function getGeohashRanges(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): GeohashRange[] {
  const radiusMeters = radiusKm * 1000;
  const bounds = geohashQueryBounds([centerLat, centerLng], radiusMeters) as [string, string][];

  return bounds.map(([start, end]) => ({ start, end }));
}

export function isWithinRadius(
  centerLat: number,
  centerLng: number,
  pointLat: number,
  pointLng: number,
  radiusKm: number
): boolean {
  const distanceKm = distanceBetween([centerLat, centerLng], [pointLat, pointLng]);
  return distanceKm <= radiusKm;
}

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return distanceBetween([lat1, lng1], [lat2, lng2]);
}
