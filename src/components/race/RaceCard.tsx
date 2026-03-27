import Link from "next/link";
import type { SerializedRace } from "@/lib/types/race";
import { formatRaceDate } from "@/lib/utils/dates";
import { RaceTypeBadge } from "./RaceTypeBadge";
import { RegistrationCTA } from "./RegistrationCTA";

export function RaceCard({ race }: { race: SerializedRace }) {
  const isFirstEdition = race.editionNumber === undefined || race.editionNumber === null;

  return (
    <article className="group rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md">
      <Link href={`/races/${race.slug}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-primary truncate">
              {race.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {formatRaceDate(race.date)} &middot; {race.city}, {race.state}
            </p>
          </div>
          {isFirstEdition && (
            <span className="shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              New
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {race.distances.map((d) => (
            <RaceTypeBadge key={d} type={d} />
          ))}
        </div>

        {race.terrain && (
          <p className="mt-2 text-xs text-zinc-400 capitalize">
            {race.terrain} course
            {race.elevationGain ? ` · ${race.elevationGain}m elevation` : ""}
          </p>
        )}
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-zinc-400">by {race.organizerName}</p>
        <RegistrationCTA
          status={race.registrationStatus}
          url={race.registrationUrl}
          opensDate={race.registrationOpens}
          raceDate={race.date}
          size="sm"
        />
      </div>
    </article>
  );
}
