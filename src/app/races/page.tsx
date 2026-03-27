import { getAllRaces } from "@/lib/firebase/races";
import { RaceSearch } from "@/components/race/RaceSearch";
import type { Metadata } from "next";
import type { RaceType } from "@/lib/types/race";

export const metadata: Metadata = {
  title: "Browse Races",
  description:
    "Browse upcoming running races across India. Filter by distance, date, and location.",
};

export default async function RacesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; state?: string; q?: string }>;
}) {
  const params = await searchParams;
  let races: Awaited<ReturnType<typeof getAllRaces>> = [];
  try {
    races = await getAllRaces(300);
  } catch {
    // Firebase may not be seeded yet
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-900">Find a Race</h1>
      <p className="mt-2 text-zinc-500">
        {races.length > 0
          ? `${races.length} upcoming races across India`
          : "Search upcoming running races across India"}
      </p>

      <div className="mt-6">
        <RaceSearch
          initialRaces={races}
          defaultType={(params.type as RaceType) || ""}
          defaultState={params.state || ""}
          defaultQuery={params.q || ""}
        />
      </div>
    </div>
  );
}
