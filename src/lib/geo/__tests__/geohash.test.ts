import { describe, it, expect } from "vitest";
import { encodeGeohash, getGeohashRanges, isWithinRadius, getDistanceKm } from "../geohash";

describe("encodeGeohash", () => {
  it("encodes Mumbai coordinates to a geohash", () => {
    const hash = encodeGeohash(19.076, 72.8777);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe("string");
    expect(hash.length).toBe(10); // default precision
  });

  it("encodes with custom precision", () => {
    const hash = encodeGeohash(19.076, 72.8777, 6);
    expect(hash.length).toBe(6);
  });

  it("produces different hashes for distant locations", () => {
    const mumbai = encodeGeohash(19.076, 72.8777);
    const delhi = encodeGeohash(28.6139, 77.209);
    expect(mumbai).not.toBe(delhi);
  });

  it("produces similar prefixes for nearby locations", () => {
    const point1 = encodeGeohash(19.076, 72.8777, 5);
    const point2 = encodeGeohash(19.08, 72.88, 5);
    // Nearby points should share at least some prefix characters
    expect(point1.substring(0, 3)).toBe(point2.substring(0, 3));
  });
});

describe("getGeohashRanges", () => {
  it("returns non-empty ranges for a valid query", () => {
    const ranges = getGeohashRanges(19.076, 72.8777, 50);
    expect(ranges.length).toBeGreaterThan(0);
    expect(ranges.length).toBeLessThanOrEqual(9);
  });

  it("each range has start and end", () => {
    const ranges = getGeohashRanges(19.076, 72.8777, 50);
    for (const range of ranges) {
      expect(range.start).toBeTruthy();
      expect(range.end).toBeTruthy();
      expect(range.start <= range.end).toBe(true);
    }
  });

  it("smaller radius produces fewer/smaller ranges", () => {
    const smallRanges = getGeohashRanges(19.076, 72.8777, 5);
    const largeRanges = getGeohashRanges(19.076, 72.8777, 100);
    // Larger radius should generally have equal or more ranges
    expect(largeRanges.length).toBeGreaterThanOrEqual(smallRanges.length);
  });
});

describe("isWithinRadius", () => {
  it("returns true for a point within radius", () => {
    // Mumbai to Navi Mumbai (~20km)
    expect(isWithinRadius(19.076, 72.8777, 19.033, 73.0297, 50)).toBe(true);
  });

  it("returns false for a point outside radius", () => {
    // Mumbai to Delhi (~1400km)
    expect(isWithinRadius(19.076, 72.8777, 28.6139, 77.209, 50)).toBe(false);
  });

  it("returns true for same point", () => {
    expect(isWithinRadius(19.076, 72.8777, 19.076, 72.8777, 1)).toBe(true);
  });
});

describe("getDistanceKm", () => {
  it("calculates distance between Mumbai and Pune (~150km)", () => {
    const distance = getDistanceKm(19.076, 72.8777, 18.5204, 73.8567);
    expect(distance).toBeGreaterThan(120);
    expect(distance).toBeLessThan(180);
  });

  it("returns 0 for same point", () => {
    const distance = getDistanceKm(19.076, 72.8777, 19.076, 72.8777);
    expect(distance).toBe(0);
  });
});
