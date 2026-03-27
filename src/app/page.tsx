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

  const totalRaces = races.length > 0 ? "80+" : "0";
  const totalCities = races.length > 0
    ? new Set(races.map((r) => r.city)).size + "+"
    : "0";

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-24 text-center text-white sm:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zMHY2aC02VjRoNnptMzAgMzB2Nmg2di02aC02em0wLTMwdjZoLTZWNGg2ek0wIDM0djZoLTZ2LTZINnpNMCA0djZIMFY0aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative">
          <div className="mx-auto mb-6 flex items-center justify-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {totalRaces} races across India
            </span>
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Next Race
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-blue-100">
            Discover running races across India — from city marathons to
            Himalayan ultras. Search, filter, and register.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/races"
              className="inline-flex items-center rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
            >
              Browse All Races
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
            <Link
              href="/races?type=Ultra"
              className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Trail & Ultra Races
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-zinc-200 py-6 text-center">
          <div>
            <p className="text-2xl font-bold text-zinc-900">{totalRaces}</p>
            <p className="mt-0.5 text-xs text-zinc-500">Upcoming Races</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{totalCities}</p>
            <p className="mt-0.5 text-xs text-zinc-500">Cities</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">28</p>
            <p className="mt-0.5 text-xs text-zinc-500">States</p>
          </div>
        </div>
      </section>

      {/* Upcoming races */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900">Coming Up Next</h2>
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

      {/* Race type quick links */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            Find by Race Type
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { type: "5K", label: "5K Races", desc: "Perfect for beginners", color: "bg-green-50 border-green-200 text-green-700" },
              { type: "Half Marathon", label: "Half Marathons", desc: "The classic 21.1K", color: "bg-purple-50 border-purple-200 text-purple-700" },
              { type: "Full Marathon", label: "Marathons", desc: "The full 42.2K challenge", color: "bg-orange-50 border-orange-200 text-orange-700" },
              { type: "Ultra", label: "Ultra & Trail", desc: "Beyond the marathon", color: "bg-red-50 border-red-200 text-red-700" },
            ].map(({ type, label, desc, color }) => (
              <Link
                key={type}
                href={`/races?type=${encodeURIComponent(type)}`}
                className={`rounded-xl border p-6 transition-shadow hover:shadow-md ${color}`}
              >
                <h3 className="text-lg font-semibold">{label}</h3>
                <p className="mt-1 text-sm opacity-75">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t border-zinc-200 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900">Pan-India Coverage</h3>
            <p className="mt-1 text-sm text-zinc-500">
              From metro marathons to hill station trail runs — we cover every corner.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900">Smart Filters</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Search by city, distance, terrain, and date to find your perfect race.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900">Direct Registration</h3>
            <p className="mt-1 text-sm text-zinc-500">
              One click to the official registration page. No middlemen, no markups.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
