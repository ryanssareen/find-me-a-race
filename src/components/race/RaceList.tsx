import type { SerializedRace } from "@/lib/types/race";
import { RaceCard } from "./RaceCard";

export function RaceList({ races }: { races: SerializedRace[] }) {
  if (races.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center">
        <p className="text-lg font-medium text-zinc-500">No races found</p>
        <p className="mt-1 text-sm text-zinc-400">
          Try adjusting your filters or search in a different area.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {races.map((race) => (
        <RaceCard key={race.id} race={race} />
      ))}
    </div>
  );
}
