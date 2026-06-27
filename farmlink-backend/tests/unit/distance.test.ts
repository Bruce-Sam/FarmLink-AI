import { describe, it, expect } from 'vitest';
import { haversineDistanceKm } from '../../src/utils/distance';

describe('Haversine distance', () => {
  it('returns ~0 km for identical coordinates', () => {
    const point = { latitude: 6.6885, longitude: -1.6244 };
    expect(haversineDistanceKm(point, point)).toBe(0);
  });

  it('computes plausible distance between Agogo and Kumasi', () => {
    const agogo = { latitude: 6.8001, longitude: -1.0819 };
    const kumasi = { latitude: 6.6885, longitude: -1.6244 };
    const km = haversineDistanceKm(agogo, kumasi);
    expect(km).toBeGreaterThan(50);
    expect(km).toBeLessThan(70);
  });
});
