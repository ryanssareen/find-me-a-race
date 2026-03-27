import { describe, it, expect } from "vitest";
import { haversineDistance, formatDistance } from "../distance";

describe("haversineDistance", () => {
  it("calculates distance between Mumbai and Pune (~150km)", () => {
    const distance = haversineDistance(19.076, 72.8777, 18.5204, 73.8567);
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(130);
  });

  it("calculates distance between Delhi and Agra (~200km)", () => {
    const distance = haversineDistance(28.6139, 77.209, 27.1767, 78.0081);
    expect(distance).toBeGreaterThan(170);
    expect(distance).toBeLessThan(190);
  });

  it("returns 0 for same point", () => {
    const distance = haversineDistance(19.076, 72.8777, 19.076, 72.8777);
    expect(distance).toBe(0);
  });

  it("calculates short distances accurately", () => {
    // Two points ~1km apart in Mumbai
    const distance = haversineDistance(19.076, 72.8777, 19.085, 72.8777);
    expect(distance).toBeGreaterThan(0.9);
    expect(distance).toBeLessThan(1.1);
  });

  it("handles antipodal points", () => {
    const distance = haversineDistance(0, 0, 0, 180);
    expect(distance).toBeGreaterThan(20000);
    expect(distance).toBeLessThan(20100);
  });
});

describe("formatDistance", () => {
  it("formats distances less than 1km in meters", () => {
    expect(formatDistance(0.5)).toBe("500 m");
    expect(formatDistance(0.123)).toBe("123 m");
  });

  it("formats distances 1-10km with one decimal", () => {
    expect(formatDistance(3.456)).toBe("3.5 km");
    expect(formatDistance(9.99)).toBe("10.0 km");
  });

  it("formats distances 10+km as whole numbers", () => {
    expect(formatDistance(15.7)).toBe("16 km");
    expect(formatDistance(150.3)).toBe("150 km");
  });
});
