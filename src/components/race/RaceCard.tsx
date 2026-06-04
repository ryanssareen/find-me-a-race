import Link from "next/link";
import type { SerializedRace } from "@/lib/types/race";
import { formatRaceDate } from "@/lib/utils/dates";
import { RaceTypeBadge } from "./RaceTypeBadge";
import { RegistrationCTA } from "./RegistrationCTA";

function isRacePast(dateStr: string): boolean {
  // Parse as UTC noon to avoid timezone-related hydration mismatches
  // Handle both date-only strings (YYYY-MM-DD) and full ISO strings
  const race = dateStr.includes("T")
    ? new Date(dateStr)
    : new Date(dateStr + "T12:00:00Z");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return race < today;
}

export function RaceCard({ race }: { race: SerializedRace }) {
  const isFirstEdition = race.editionNumber === undefined || race.editionNumber === null;
  const isPast = isRacePast(race.date);

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${
        isPast ? "border-border/50 opacity-60" : "border-border"
      }`}
    >
      {/* Top accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 transition-all duration-300 ${
          isPast
            ? "bg-muted-foreground/30"
            : "bg-gradient-to-r from-primary to-accent group-hover:h-1.5"
        }`}
      />

      <Link href={`/races/${race.slug}`} className="block p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className={`text-lg font-bold leading-tight transition-colors ${
                isPast
                  ? "text-muted"
                  : "text-foreground group-hover:text-primary"
              }`}
            >
              {race.name}
            </h3>
          </div>
          {isPast ? (
            <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted">
              Completed
            </span>
          ) : isFirstEdition ? (
            <span className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              New
            </span>
          ) : null}
        </div>

        {/* Date & Location */}
        <div className="mt-3 flex items-center gap-2 text-sm text-muted">
          <svg
            className="h-4 w-4 shrink-0 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <span className="font-medium text-foreground">{formatRaceDate(race.date)}</span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-muted">
          <svg
            className="h-4 w-4 shrink-0 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          <span>
            {race.city}, {race.state}
          </span>
        </div>

        {/* Distance badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {race.distances.map((d) => (
            <RaceTypeBadge key={d} type={d} />
          ))}
        </div>

        {/* Terrain info */}
        {race.terrain && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="capitalize">
              {race.terrain} course
              {race.elevationGain ? ` · ${race.elevationGain}m elevation` : ""}
            </span>
          </div>
        )}
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-5 py-3">
        <p className="text-xs text-muted">by {race.organizerName}</p>
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
