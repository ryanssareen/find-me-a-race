import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDateRange,
  formatRaceDate,
  formatShortDate,
  formatDateRange,
  isUpcoming,
  isWithinRange,
} from "../dates";

describe("getDateRange", () => {
  beforeEach(() => {
    // Fix time to Wednesday, 2026-06-10 12:00:00 IST
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T06:30:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns this weekend (Saturday to Sunday)", () => {
    const { from, to } = getDateRange("this-weekend");
    expect(from.getDay()).toBe(6); // Saturday
    expect(to.getDay()).toBe(0); // Sunday
  });

  it("returns this month range", () => {
    const { from, to } = getDateRange("this-month");
    expect(from.getDate()).toBe(10); // Today
    expect(to.getMonth()).toBe(5); // June (0-indexed)
    expect(to.getDate()).toBe(30); // End of June
  });

  it("returns next 3 months range", () => {
    const { from, to } = getDateRange("next-3-months");
    expect(from.getDate()).toBe(10); // Today
    expect(to.getMonth()).toBe(7); // August (0-indexed)
  });

  it("returns a year for unknown preset", () => {
    const { from, to } = getDateRange("unknown");
    expect(from.getDate()).toBe(10);
    expect(to.getFullYear()).toBe(2027);
  });
});

describe("formatRaceDate", () => {
  it("formats a date object", () => {
    const result = formatRaceDate(new Date("2026-01-18"));
    expect(result).toBe("Sun, 18 Jan 2026");
  });

  it("formats an ISO string", () => {
    const result = formatRaceDate("2026-12-06");
    expect(result).toBe("Sun, 6 Dec 2026");
  });
});

describe("formatShortDate", () => {
  it("formats a date without day name", () => {
    const result = formatShortDate(new Date("2026-05-17"));
    expect(result).toBe("17 May 2026");
  });
});

describe("formatDateRange", () => {
  it("returns single date when from and to are same day", () => {
    const date = new Date("2026-05-17");
    const result = formatDateRange(date, date);
    expect(result).toBe("Sun, 17 May 2026");
  });

  it("returns range format for different dates", () => {
    const from = new Date("2026-05-17");
    const to = new Date("2026-05-19");
    const result = formatDateRange(from, to);
    expect(result).toBe("17 May – 19 May 2026");
  });
});

describe("isUpcoming", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T06:30:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for future dates", () => {
    expect(isUpcoming("2026-12-01")).toBe(true);
  });

  it("returns true for today (end of day hasn't passed)", () => {
    expect(isUpcoming("2026-06-10")).toBe(true);
  });

  it("returns false for past dates", () => {
    expect(isUpcoming("2026-01-01")).toBe(false);
  });
});

describe("isWithinRange", () => {
  it("returns true when date is within range", () => {
    const date = new Date("2026-06-15");
    const from = new Date("2026-06-01");
    const to = new Date("2026-06-30");
    expect(isWithinRange(date, from, to)).toBe(true);
  });

  it("returns false when date is before range", () => {
    const date = new Date("2026-05-15");
    const from = new Date("2026-06-01");
    const to = new Date("2026-06-30");
    expect(isWithinRange(date, from, to)).toBe(false);
  });

  it("returns true when no bounds specified", () => {
    const date = new Date("2026-06-15");
    expect(isWithinRange(date, undefined, undefined)).toBe(true);
  });
});
