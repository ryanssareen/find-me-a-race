import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { SerializedRace, RaceType } from "@/lib/types/race";
import { parseDate } from "@/lib/utils/date-parser";

function docToSerializedRace(
  doc: FirebaseFirestore.DocumentSnapshot
): SerializedRace {
  const data = doc.data()!;
  return {
    id: doc.id,
    slug: data.slug,
    name: data.name,
    date: data.date.toDate().toISOString(),
    dateEnd: data.dateEnd?.toDate().toISOString() ?? null,
    city: data.city,
    state: data.state,
    venue: data.venue ?? null,
    lat: data.location.latitude,
    lng: data.location.longitude,
    distances: data.distances,
    terrain: data.terrain,
    routeDescription: data.routeDescription ?? null,
    elevationGain: data.elevationGain ?? null,
    organizerName: data.organizerName,
    organizerWebsite: data.organizerWebsite ?? null,
    registrationUrl: data.registrationUrl ?? null,
    registrationStatus: data.registrationStatus,
    registrationOpens: data.registrationOpens?.toDate().toISOString() ?? null,
    registrationCloses: data.registrationCloses?.toDate().toISOString() ?? null,
    eventStatus: data.eventStatus,
    editionNumber: data.editionNumber ?? null,
    photos: data.photos ?? null,
    description: data.description ?? null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawQuery = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const type = searchParams.get("type") as RaceType | null;
  const state = searchParams.get("state");
  const limitParam = parseInt(searchParams.get("limit") || "0", 10);

  try {
    const db = getAdminDb();
    const firestoreQuery: FirebaseFirestore.Query = db
      .collection("races")
      .where("eventStatus", "==", "upcoming")
      .orderBy("date", "asc");

    const snapshot = await firestoreQuery.get();
    let races = snapshot.docs.map(docToSerializedRace);

    // Parse date tokens from query
    const { month, year, remainingQuery } = parseDate(rawQuery);

    // Filter by month if detected
    if (month !== null) {
      const targetYear = year ?? new Date().getFullYear();
      races = races.filter((r) => {
        const d = new Date(r.date);
        // If year was specified, match exactly; otherwise match the month in any year
        if (year !== null) {
          return d.getMonth() === month && d.getFullYear() === targetYear;
        }
        return d.getMonth() === month;
      });
    } else if (year !== null) {
      races = races.filter((r) => new Date(r.date).getFullYear() === year);
    }

    // Text search on remaining query (after stripping date words)
    const textQuery = remainingQuery || (month === null && year === null ? rawQuery : "");
    if (textQuery) {
      races = races.filter(
        (r) =>
          r.name.toLowerCase().includes(textQuery) ||
          r.city.toLowerCase().includes(textQuery) ||
          r.state.toLowerCase().includes(textQuery) ||
          r.organizerName.toLowerCase().includes(textQuery)
      );
    }

    if (type) {
      races = races.filter((r) => r.distances.includes(type));
    }

    if (state) {
      races = races.filter(
        (r) => r.state.toLowerCase() === state.toLowerCase()
      );
    }

    const finalRaces = limitParam > 0 ? races.slice(0, limitParam) : races;
    return Response.json({ races: finalRaces, total: races.length });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Race search error:", error.message);
    return Response.json({ races: [], total: 0, error: error.message });
  }
}
