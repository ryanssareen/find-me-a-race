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
    label: "Register",
    className: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  not_yet_open: {
    label: "Coming Soon",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  closed: {
    label: "Closed",
    className: "bg-secondary text-muted cursor-not-allowed",
  },
  sold_out: {
    label: "Sold Out",
    className: "bg-destructive/10 text-destructive cursor-not-allowed",
  },
  past: {
    label: "Completed",
    className: "bg-secondary text-muted-foreground cursor-not-allowed",
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
  const isPast = isRacePast(raceDate);
  const effectiveStatus = isPast ? "past" : status;
  const config = statusConfig[effectiveStatus];
  const hasUrl = effectiveStatus === "open" && url;
  const generic = url ? isGenericUrl(url) : false;

  const noLink = effectiveStatus === "open" && !url;

  const label =
    isPast
      ? "Completed"
      : noLink
        ? "Unavailable"
        : effectiveStatus === "not_yet_open" && opensDate
          ? `Opens ${new Date(opensDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
          : generic
            ? "Find Race"
            : config.label;

  const className = clsx(
    "inline-flex items-center justify-center rounded-full font-semibold transition-all",
    size === "sm" ? "px-4 py-1.5 text-xs" : "px-6 py-2.5 text-sm",
    config.className
  );

  // Urgency calculation
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
        urgencyMessage = "Last day!";
        urgencyType = "danger";
      } else if (diffDays === 1) {
        urgencyMessage = "Closes tomorrow";
        urgencyType = "danger";
      } else if (diffDays > 1 && diffDays <= 7) {
        urgencyMessage = `${diffDays} days left`;
        urgencyType = "warning";
      }
    } else if (effectiveStatus === "not_yet_open" && opensDate) {
      const opens = new Date(opensDate);
      opens.setHours(0, 0, 0, 0);
      
      const diffTime = opens.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        urgencyMessage = "Opens today!";
        urgencyType = "info";
      } else if (diffDays === 1) {
        urgencyMessage = "Opens tomorrow";
        urgencyType = "info";
      } else if (diffDays > 1 && diffDays <= 7) {
        urgencyMessage = `Opens in ${diffDays} days`;
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
      onClick={(e) => e.stopPropagation()}
    >
      {label}
      <svg
        className="ml-1.5 h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
        />
      </svg>
    </a>
  ) : (
    <span className={className}>{label}</span>
  );

  if (urgencyMessage) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {ctaElement}
        <span
          className={clsx(
            "text-[10px] font-medium px-2 py-0.5 rounded-full",
            urgencyType === "danger" && "bg-destructive/10 text-destructive animate-pulse",
            urgencyType === "warning" && "bg-amber-500/10 text-amber-400",
            urgencyType === "info" && "bg-blue-500/10 text-blue-400"
          )}
        >
          {urgencyMessage}
        </span>
      </div>
    );
  }

  return ctaElement;
}
