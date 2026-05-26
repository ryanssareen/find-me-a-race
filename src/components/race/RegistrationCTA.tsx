import type { RegistrationStatus } from "@/lib/types/race";
import { clsx } from "clsx";

interface RegistrationCTAProps {
  status: RegistrationStatus;
  url?: string | null;
  opensDate?: string | null;
  closesDate?: string | null;
  raceDate?: string | null;
  size?: "sm" | "md";
  showUrgency?: boolean;
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
  closesDate,
  raceDate,
  size = "md",
  showUrgency = false,
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

  // Compute relative urgency
  let urgencyMessage: string | null = null;
  let urgencyType: "warning" | "danger" | "info" | null = null;

  if (showUrgency && !isPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (effectiveStatus === "open" && closesDate) {
      const closes = new Date(closesDate);
      closes.setHours(0, 0, 0, 0);
      
      const diffTime = closes.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        urgencyMessage = "Last day to register!";
        urgencyType = "danger";
      } else if (diffDays === 1) {
        urgencyMessage = "Registration closes tomorrow!";
        urgencyType = "danger";
      } else if (diffDays > 1 && diffDays <= 7) {
        urgencyMessage = `Registration closes in ${diffDays} days`;
        urgencyType = "warning";
      }
    } else if (effectiveStatus === "not_yet_open" && opensDate) {
      const opens = new Date(opensDate);
      opens.setHours(0, 0, 0, 0);
      
      const diffTime = opens.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        urgencyMessage = "Registration opens today!";
        urgencyType = "info";
      } else if (diffDays === 1) {
        urgencyMessage = "Registration opens tomorrow!";
        urgencyType = "info";
      } else if (diffDays > 1 && diffDays <= 7) {
        urgencyMessage = `Registration opens in ${diffDays} days`;
        urgencyType = "info";
      }
    }
  }

  const ctaElement = hasUrl ? (
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
  ) : (
    <span className={className}>{label}</span>
  );

  if (urgencyMessage) {
    return (
      <div className="flex flex-col items-stretch sm:items-end gap-2">
        {ctaElement}
        <span
          className={clsx(
            "text-xs font-semibold px-2.5 py-1 rounded-full text-center sm:text-right border self-center sm:self-end animate-pulse",
            urgencyType === "danger" && "bg-red-50 text-red-700 border-red-200",
            urgencyType === "warning" && "bg-amber-50 text-amber-700 border-amber-200",
            urgencyType === "info" && "bg-blue-50 text-blue-700 border-blue-200"
          )}
        >
          {urgencyMessage}
        </span>
      </div>
    );
  }

  return ctaElement;
}
