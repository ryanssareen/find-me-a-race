import type { RaceType } from "@/lib/types/race";
import { clsx } from "clsx";

const BADGE_STYLES: Record<RaceType, string> = {
  "5K": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "10K": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Half Marathon": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Full Marathon": "bg-primary/10 text-primary border-primary/20",
  "Ultra": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function RaceTypeBadge({ type }: { type: RaceType }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        BADGE_STYLES[type] ?? "bg-secondary text-muted border-border"
      )}
    >
      {type}
    </span>
  );
}
