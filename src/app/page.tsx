import Link from "next/link";
import { getUpcomingRaces } from "@/lib/firebase/races";
import { RaceCard } from "@/components/race/RaceCard";
import { HeroSearch } from "@/components/home/HeroSearch";

export default async function Home() {
  let races: Awaited<ReturnType<typeof getUpcomingRaces>> = [];
  try {
    races = await getUpcomingRaces(6);
  } catch {
    // Firebase may not be seeded yet
  }

  return (
    <div>
      {/* Hero — search-first */}
      <section className="bg-zinc-50 px-4 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-600">
            India&apos;s Race Directory
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            Find your next{" "}
            <span className="text-blue-600">race.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-zinc-500 sm:text-lg">
            80+ upcoming races across India. Marathons, trail runs, ultras, 5Ks
            — search by city and register in one click.
          </p>
        </div>

        <div className="mt-10">
          <HeroSearch />
        </div>
      </section>

      {/* Upcoming races */}
      {races.length > 0 && (
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

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {races.map((race) => (
              <RaceCard key={race.id} race={race} />
            ))}
          </div>
        </section>
      )}

      {/* Race type quick links */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            Browse by Distance
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { type: "5K", label: "5K", desc: "Great for beginners", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
              { type: "Half Marathon", label: "Half Marathon", desc: "The classic 21.1K", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
              { type: "Full Marathon", label: "Marathon", desc: "The full 42.2K", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" },
              { type: "Ultra", label: "Ultra & Trail", desc: "Beyond the marathon", icon: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" },
            ].map(({ type, label, desc, icon }) => (
              <Link
                key={type}
                href={`/races?type=${encodeURIComponent(type)}`}
                className="group flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">{label}</h3>
                  <p className="mt-0.5 text-sm text-zinc-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-200 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Search", desc: "Enter your city or tap 'Near me' to find races nearby" },
              { step: "2", title: "Filter", desc: "Narrow by distance, terrain, date — find your perfect race" },
              { step: "3", title: "Register", desc: "One click to the official registration page. No middlemen" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="mt-4 font-semibold text-zinc-900">{title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
