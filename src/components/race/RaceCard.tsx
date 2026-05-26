import Link from "next/link";
import type { SerializedRace } from "@/lib/types/race";
import { formatRaceDate } from "@/lib/utils/dates";
import { RaceTypeBadge } from "./RaceTypeBadge";
import { RegistrationCTA } from "./RegistrationCTA";

function isRacePast(dateStr: string): boolean {
  const race = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return race < today;
}

export function RaceCard({ race }: { race: SerializedRace }) {
  const isFirstEdition = race.editionNumber === undefined || race.editionNumber === null;
  const isPast = isRacePast(race.date);

  return (
    <article className={`group rounded-xl border bg-white p-5 transition-shadow hover:shadow-md ${isPast ? "border-zinc-100 opacity-60" : "border-zinc-200"}`}>
      <Link href={`/races/${race.slug}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={`text-lg font-semibold truncate ${isPast ? "text-zinc-500" : "text-zinc-900 group-hover:text-primary"}`}>
              {race.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {formatRaceDate(race.date)} &middot; {race.city}, {race.state}
            </p>
          </div>
          {isPast ? (
            <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-400">
              Completed
            </span>
          ) : isFirstEdition ? (
            <span className="shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              New
            </span>
          ) : null}
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
          closesDate={race.registrationCloses}
          raceDate={race.date}
          size="sm"
          showUrgency
        />
      </div>
    </article>
  );
}
