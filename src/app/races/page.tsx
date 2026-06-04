import { getAllRaces } from "@/lib/firebase/races";
import { RaceSearch } from "@/components/race/RaceSearch";
import { sortByRelevance } from "@/lib/utils/dates";
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
    races = sortByRelevance(await getAllRaces(300));
  } catch (err) {
    console.error("[/races] Failed to load races:", err);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find Your Next Race
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
              {races.length > 0
                ? `Discover ${races.length} races across India`
                : "Discover upcoming running races across India"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
