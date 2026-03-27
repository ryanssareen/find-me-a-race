import Link from "next/link";
import { getUpcomingRaces } from "@/lib/firebase/races";
import { RaceCard } from "@/components/race/RaceCard";

export default async function Home() {
  let races: Awaited<ReturnType<typeof getUpcomingRaces>> = [];
  try {
    races = await getUpcomingRaces(6);
  } catch {
    // Firebase may not be seeded yet
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary px-4 py-20 text-center text-white">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Find Your Next Race
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
          Discover upcoming running races across India. Search by location,
          distance, and date.
        </p>
        <div className="mt-8">
          <Link
            href="/races"
            className="inline-flex items-center rounded-full bg-white px-8 py-3 text-base font-semibold text-primary transition-colors hover:bg-blue-50"
          >
            Browse Races
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Upcoming races */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900">Upcoming Races</h2>
          <Link
            href="/races"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all &rarr;
          </Link>
        </div>

        {races.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {races.map((race) => (
              <RaceCard key={race.id} race={race} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-zinc-300 py-16 text-center">
            <p className="text-lg font-medium text-zinc-500">
              Races coming soon
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              We&apos;re adding races across India. Check back shortly.
            </p>
          </div>
        )}
      </section>

      {/* Value props */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900">Search by Location</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Find races near your city or use GPS to discover nearby events.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900">Filter by Distance</h3>
            <p className="mt-1 text-sm text-zinc-500">
              5K to Ultra — filter by the race distance that suits your goals.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900">Browse by Date</h3>
            <p className="mt-1 text-sm text-zinc-500">
              This weekend, this month, or plan ahead for the next few months.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
