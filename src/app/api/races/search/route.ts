import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { SerializedRace, RaceType } from "@/lib/types/race";

function docToSerializedRace(
  doc: FirebaseFirestore.DocumentSnapshot
): SerializedRace {
  const data = doc.data()!;
  return {
    id: doc.id,
    slug: data.slug,
    name: data.name,
    date: data.date.toDate().toISOString(),
    dateEnd: data.dateEnd?.toDate().toISOString(),
    city: data.city,
    state: data.state,
    venue: data.venue,
    lat: data.location.latitude,
    lng: data.location.longitude,
    distances: data.distances,
    terrain: data.terrain,
    routeDescription: data.routeDescription,
    elevationGain: data.elevationGain,
    organizerName: data.organizerName,
    organizerWebsite: data.organizerWebsite,
    registrationUrl: data.registrationUrl,
    registrationStatus: data.registrationStatus,
    registrationOpens: data.registrationOpens?.toDate().toISOString(),
    registrationCloses: data.registrationCloses?.toDate().toISOString(),
    eventStatus: data.eventStatus,
    editionNumber: data.editionNumber,
    photos: data.photos,
    description: data.description,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const type = searchParams.get("type") as RaceType | null;
  const state = searchParams.get("state");

  try {
    const db = getAdminDb();
    let firestoreQuery: FirebaseFirestore.Query = db
      .collection("races")
      .where("eventStatus", "==", "upcoming")
      .orderBy("date", "asc");

    const snapshot = await firestoreQuery.get();
    let races = snapshot.docs.map(docToSerializedRace);

    if (query) {
      races = races.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query) ||
          r.state.toLowerCase().includes(query) ||
          r.organizerName.toLowerCase().includes(query)
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

    return Response.json({ races, total: races.length });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Race search error:", error.message);
    return Response.json({ races: [], total: 0, error: error.message });
  }
}
