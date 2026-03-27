import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRaceBySlug, getAllRaceSlugs } from "@/lib/firebase/races";
import { formatRaceDate, formatDateRange } from "@/lib/utils/dates";
import { RaceTypeBadge } from "@/components/race/RaceTypeBadge";
import { RegistrationCTA } from "@/components/race/RegistrationCTA";
import Link from "next/link";

interface RacePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const race = await getRaceBySlug(slug);

  if (!race) {
    return { title: "Race Not Found" };
  }

  return {
    title: race.name,
    description: `${race.name} — ${race.distances.join(", ")} on ${formatRaceDate(race.date)} in ${race.city}, ${race.state}. Find details and register.`,
    openGraph: {
      title: race.name,
      description: `${race.distances.join(", ")} race in ${race.city}, ${race.state}`,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllRaceSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function RaceDetailPage({ params }: RacePageProps) {
  const { slug } = await params;
  const race = await getRaceBySlug(slug);

  if (!race) {
    notFound();
  }

  const isFirstEdition =
    race.editionNumber === undefined || race.editionNumber === null;
  const isPast = new Date(race.date) < new Date(new Date().toDateString());

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Past event banner */}
      {isPast && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>This event has already occurred.</strong> Registration is no longer available.
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-400">
        <Link href="/" className="hover:text-zinc-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/races" className="hover:text-zinc-600">
          Races
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-600">{race.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-900">{race.name}</h1>
            {isFirstEdition && (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                New Race
              </span>
            )}
            {!isFirstEdition && race.editionNumber && (
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                Edition #{race.editionNumber}
              </span>
            )}
          </div>
          <p className="mt-2 text-lg text-zinc-500">
            {formatRaceDate(race.date)}
            {race.dateEnd && ` – ${formatRaceDate(race.dateEnd)}`}
          </p>
        </div>

        <RegistrationCTA
          status={race.registrationStatus}
          url={race.registrationUrl}
          opensDate={race.registrationOpens}
          raceDate={race.date}
        />
      </div>

      {/* Distance badges */}
      <div className="mt-6 flex flex-wrap gap-2">
        {race.distances.map((d) => (
          <RaceTypeBadge key={d} type={d} />
        ))}
      </div>

      {/* Info grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Location */}
        <div className="rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Location
          </h2>
          <p className="mt-2 text-lg font-medium text-zinc-900">
            {race.city}, {race.state}
          </p>
          {race.venue && (
            <p className="mt-1 text-sm text-zinc-500">{race.venue}</p>
          )}
        </div>

        {/* Organizer */}
        <div className="rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Organizer
          </h2>
          <p className="mt-2 text-lg font-medium text-zinc-900">
            {race.organizerName}
          </p>
          {race.organizerWebsite && (
            <a
              href={race.organizerWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-primary hover:text-primary-dark"
            >
              Visit website &rarr;
            </a>
          )}
        </div>

        {/* Course details */}
        {(race.terrain || race.elevationGain) && (
          <div className="rounded-xl border border-zinc-200 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Course
            </h2>
            <div className="mt-2 space-y-1">
              {race.terrain && (
                <p className="text-zinc-700 capitalize">
                  {race.terrain} course
                </p>
              )}
              {race.elevationGain && (
                <p className="text-zinc-700">
                  {race.elevationGain}m elevation gain
                </p>
              )}
            </div>
          </div>
        )}

        {/* Registration window */}
        {(race.registrationOpens || race.registrationCloses) && (
          <div className="rounded-xl border border-zinc-200 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Registration Window
            </h2>
            <div className="mt-2 space-y-1 text-zinc-700">
              {race.registrationOpens && (
                <p>
                  Opens:{" "}
                  {new Date(race.registrationOpens).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </p>
              )}
              {race.registrationCloses && (
                <p>
                  Closes:{" "}
                  {new Date(race.registrationCloses).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {race.description && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            About This Race
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 whitespace-pre-line">
            {race.description}
          </p>
        </div>
      )}

      {/* Route description */}
      {race.routeDescription && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Route
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 whitespace-pre-line">
            {race.routeDescription}
          </p>
        </div>
      )}

      {/* Back link */}
      <div className="mt-12 border-t border-zinc-200 pt-6">
        <Link
          href="/races"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          &larr; Back to all races
        </Link>
      </div>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: race.name,
            startDate: race.date,
            endDate: race.dateEnd || race.date,
            location: {
              "@type": "Place",
              name: race.venue || `${race.city}, ${race.state}`,
              address: {
                "@type": "PostalAddress",
                addressLocality: race.city,
                addressRegion: race.state,
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: race.lat,
                longitude: race.lng,
              },
            },
            organizer: {
              "@type": "Organization",
              name: race.organizerName,
              url: race.organizerWebsite,
            },
            url: race.registrationUrl,
            eventStatus:
              race.eventStatus === "cancelled"
                ? "https://schema.org/EventCancelled"
                : "https://schema.org/EventScheduled",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            sport: "Running",
          }),
        }}
      />
    </div>
  );
}
