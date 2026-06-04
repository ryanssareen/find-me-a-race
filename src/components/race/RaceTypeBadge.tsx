import type { RaceType } from "@/lib/types/race";
import { clsx } from "clsx";

const BADGE_STYLES: Record<RaceType, string> = {
  "5K": "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  "10K": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  "Half Marathon": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  "Full Marathon": "bg-orange-100 text-orange-700 border-orange-200 dark:bg-primary/10 dark:text-primary dark:border-primary/20",
  "Ultra": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
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
