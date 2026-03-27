import { RACE_TYPE_COLORS } from "@/lib/utils/constants";
import type { RaceType } from "@/lib/types/race";
import { clsx } from "clsx";

export function RaceTypeBadge({ type }: { type: RaceType }) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
        RACE_TYPE_COLORS[type] ?? "bg-zinc-100 text-zinc-800"
      )}
    >
      {type}
    </span>
  );
}
