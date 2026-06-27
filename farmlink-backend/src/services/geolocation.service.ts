import { haversineDistanceKm, type GeoPoint } from '../utils/distance';

export interface GhanaLocation {
  town: string;
  district: string;
  region: string;
  latitude: number;
  longitude: number;
}

// A small gazetteer of Ghanaian towns used for AI extraction enrichment and
// distance-based matching demonstrations. Not exhaustive — extend as needed.
export const GHANA_LOCATIONS: GhanaLocation[] = [
  { town: 'Agogo', district: 'Asante Akim North', region: 'Ashanti', latitude: 6.8001, longitude: -1.0819 },
  { town: 'Kumasi', district: 'Kumasi Metropolitan', region: 'Ashanti', latitude: 6.6885, longitude: -1.6244 },
  { town: 'Ejura', district: 'Ejura Sekyedumase', region: 'Ashanti', latitude: 7.3853, longitude: -1.3565 },
  { town: 'Accra', district: 'Accra Metropolitan', region: 'Greater Accra', latitude: 5.6037, longitude: -0.187 },
  { town: 'Kasoa', district: 'Awutu Senya East', region: 'Central', latitude: 5.5345, longitude: -0.4248 },
  { town: 'Cape Coast', district: 'Cape Coast Metropolitan', region: 'Central', latitude: 5.1053, longitude: -1.2466 },
  { town: 'Koforidua', district: 'New Juaben', region: 'Eastern', latitude: 6.0941, longitude: -0.2591 },
  { town: 'Techiman', district: 'Techiman Municipal', region: 'Bono East', latitude: 7.5907, longitude: -1.9389 },
  { town: 'Tamale', district: 'Tamale Metropolitan', region: 'Northern', latitude: 9.4008, longitude: -0.8393 },
  { town: 'Ho', district: 'Ho Municipal', region: 'Volta', latitude: 6.6118, longitude: 0.4712 },
  { town: 'Sunyani', district: 'Sunyani Municipal', region: 'Bono', latitude: 7.3349, longitude: -2.3268 },
  { town: 'Wa', district: 'Wa Municipal', region: 'Upper West', latitude: 10.0607, longitude: -2.5099 },
  { town: 'Bolgatanga', district: 'Bolgatanga Municipal', region: 'Upper East', latitude: 10.7856, longitude: -0.8514 },
  { town: 'Takoradi', district: 'Sekondi-Takoradi', region: 'Western', latitude: 4.8845, longitude: -1.7554 },
  { town: 'Nkawkaw', district: 'Kwahu West', region: 'Eastern', latitude: 6.5519, longitude: -0.7714 },
];

const TOWN_INDEX = new Map<string, GhanaLocation>(
  GHANA_LOCATIONS.map((loc) => [loc.town.toLowerCase(), loc]),
);

export function findLocationByTown(town: string): GhanaLocation | null {
  return TOWN_INDEX.get(town.trim().toLowerCase()) ?? null;
}

// Detects the first known town mentioned anywhere in free text.
export function detectLocationInText(text: string): GhanaLocation | null {
  const lower = text.toLowerCase();
  for (const loc of GHANA_LOCATIONS) {
    const re = new RegExp(`\\b${loc.town.toLowerCase()}\\b`);
    if (re.test(lower)) return loc;
  }
  return null;
}

export function distanceBetween(a: GeoPoint, b: GeoPoint): number {
  return haversineDistanceKm(a, b);
}
