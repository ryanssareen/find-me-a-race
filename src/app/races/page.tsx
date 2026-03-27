import { getUpcomingRaces } from "@/lib/firebase/races";
import { RaceList } from "@/components/race/RaceList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Races",
  description:
    "Browse upcoming running races across India. Filter by distance, date, and location.",
};

export default async function RacesPage() {
  let races: Awaited<ReturnType<typeof getUpcomingRaces>> = [];
  try {
    races = await getUpcomingRaces(50);
  } catch {
    // Firebase may not be seeded yet
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-900">Upcoming Races</h1>
      <p className="mt-2 text-zinc-500">
        {races.length > 0
          ? `${races.length} upcoming races across India`
          : "Browse running races across India"}
      </p>

      <div className="mt-8">
        <RaceList races={races} />
      </div>
    </div>
  );
}
