import type { RegistrationStatus } from "@/lib/types/race";
import { clsx } from "clsx";

interface RegistrationCTAProps {
  status: RegistrationStatus;
  url?: string | null;
  opensDate?: string | null;
  raceDate?: string | null;
  size?: "sm" | "md";
}

const GENERIC_DOMAINS = [
  "indiarunning.com",
  "bhaagoindia.com",
  "townscript.com",
  "allevents.in",
  "worldsmarathons.com",
];

function isGenericUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const pathname = new URL(url).pathname;
    const isLandingPage = pathname === "/" || pathname === "";
    return GENERIC_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`)) && isLandingPage;
  } catch {
    return false;
  }
}

function isRacePast(raceDate: string | null | undefined): boolean {
  if (!raceDate) return false;
  const race = new Date(raceDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return race < today;
}

const statusConfig: Record<
  RegistrationStatus | "past",
  { label: string; className: string }
> = {
  open: {
    label: "Register Now",
    className: "bg-primary text-white hover:bg-primary-dark",
  },
  not_yet_open: {
    label: "Registration Opening Soon",
    className: "bg-amber-100 text-amber-800",
  },
  closed: {
    label: "Registration Closed",
    className: "bg-zinc-100 text-zinc-500 cursor-not-allowed",
  },
  sold_out: {
    label: "Sold Out",
    className: "bg-red-100 text-red-700 cursor-not-allowed",
  },
  past: {
    label: "Event Already Occurred",
    className: "bg-zinc-100 text-zinc-400 cursor-not-allowed",
  },
};

export function RegistrationCTA({
  status,
  url,
  opensDate,
  raceDate,
  size = "md",
}: RegistrationCTAProps) {
  // Override status if race date has passed
  const isPast = isRacePast(raceDate);
  const effectiveStatus = isPast ? "past" : status;
  const config = statusConfig[effectiveStatus];
  const hasUrl = effectiveStatus === "open" && url;
  const generic = url ? isGenericUrl(url) : false;

  // If status is "open" but no URL, show as unavailable
  const noLink = effectiveStatus === "open" && !url;

  const label =
    isPast
      ? "Event Already Occurred"
      : noLink
        ? "Registration Link Unavailable"
        : effectiveStatus === "not_yet_open" && opensDate
          ? `Registration Opens ${new Date(opensDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
          : generic
            ? "Find Registration"
            : config.label;

  const className = clsx(
    "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
    size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3 text-base",
    config.className
  );

  if (hasUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
        <svg
          className="ml-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
      </a>
    );
  }

  return <span className={className}>{label}</span>;
}
