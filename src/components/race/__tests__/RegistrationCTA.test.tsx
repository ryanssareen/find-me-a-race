import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RegistrationCTA } from "../RegistrationCTA";
import "@testing-library/jest-dom/vitest";

describe("RegistrationCTA", () => {
  it("renders open registration status with direct link", () => {
    render(
      <RegistrationCTA
        status="open"
        url="https://example.com/register"
        opensDate={null}
        closesDate={null}
        raceDate="2026-12-01"
      />
    );
    const link = screen.getByRole("link", { name: /register now/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com/register");
  });

  it("surfaces closes in 5 days urgency warning message when closesDate is 5 days from today", () => {
    // Mock the current date to 2026-05-26
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00Z"));

    render(
      <RegistrationCTA
        status="open"
        url="https://example.com/register"
        opensDate={null}
        closesDate="2026-05-31" // 5 days after 2026-05-26
        raceDate="2026-12-01"
        showUrgency={true}
      />
    );

    expect(screen.getByText(/registration closes in 5 days/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("surfaces last day to register message when closesDate is today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00Z"));

    render(
      <RegistrationCTA
        status="open"
        url="https://example.com/register"
        opensDate={null}
        closesDate="2026-05-26" // Today
        raceDate="2026-12-01"
        showUrgency={true}
      />
    );

    expect(screen.getByText(/last day to register!/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("surfaces opens in 3 days warning when registration is opening in 3 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00Z"));

    render(
      <RegistrationCTA
        status="not_yet_open"
        url={null}
        opensDate="2026-05-29" // 3 days in future
        closesDate={null}
        raceDate="2026-12-01"
        showUrgency={true}
      />
    );

    expect(screen.getByText(/registration opens in 3 days/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
