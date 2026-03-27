import { describe, it, expect } from "vitest";
import { slugify, raceSlug } from "../slugify";

describe("slugify", () => {
  it("converts text to lowercase kebab-case", () => {
    expect(slugify("Tata Mumbai Marathon")).toBe("tata-mumbai-marathon");
  });

  it("removes special characters", () => {
    expect(slugify("Race @ Chennai!")).toBe("race-chennai");
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(slugify("  multiple   spaces  ")).toBe("multiple-spaces");
  });

  it("handles already slugified text", () => {
    expect(slugify("already-slugified")).toBe("already-slugified");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("-leading-and-trailing-")).toBe("leading-and-trailing");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles numbers", () => {
    expect(slugify("TCS World 10K")).toBe("tcs-world-10k");
  });

  it("handles apostrophes and quotes", () => {
    expect(slugify("Runner's Choice 5K")).toBe("runners-choice-5k");
  });
});

describe("raceSlug", () => {
  it("appends year to slugified name", () => {
    expect(raceSlug("Mumbai Marathon", 2026)).toBe("mumbai-marathon-2026");
  });

  it("handles race names with special characters", () => {
    expect(raceSlug("TCS World 10K Bengaluru", 2026)).toBe(
      "tcs-world-10k-bengaluru-2026"
    );
  });
});
