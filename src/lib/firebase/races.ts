import { getAdminDb } from "./admin";
import { getGeohashRanges, isWithinRadius, getDistanceKm } from "@/lib/geo/geohash";
import type {
  SerializedRace,
  RaceSearchParams,
  RaceType,
} from "@/lib/types/race";

const RACES_COLLECTION = "races";

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

export async function getRaceBySlug(
  slug: string
): Promise<SerializedRace | null> {
  const snapshot = await getAdminDb()
    .collection(RACES_COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return docToSerializedRace(snapshot.docs[0]);
}

export async function getUpcomingRaces(
  limit = 20
): Promise<SerializedRace[]> {
  const snapshot = await getAdminDb()
    .collection(RACES_COLLECTION)
    .where("eventStatus", "==", "upcoming")
    .orderBy("date", "asc")
    .limit(limit)
    .get();

  return snapshot.docs.map(docToSerializedRace);
}

export async function searchRaces(
  params: RaceSearchParams
): Promise<SerializedRace[]> {
  const { lat, lng, radius = 50, types, dateFrom, dateTo, sort = "date" } = params;

  let races: SerializedRace[];

  if (lat !== undefined && lng !== undefined) {
    races = await queryByLocation(lat, lng, radius);
  } else {
    const snapshot = await getAdminDb()
      .collection(RACES_COLLECTION)
      .where("eventStatus", "==", "upcoming")
      .orderBy("date", "asc")
      .get();
    races = snapshot.docs.map(docToSerializedRace);
  }

  if (types && types.length > 0) {
    races = races.filter((race) =>
      race.distances.some((d) => types.includes(d))
    );
  }

  if (dateFrom) {
    const from = new Date(dateFrom);
    races = races.filter((race) => new Date(race.date) >= from);
  }

  if (dateTo) {
    const to = new Date(dateTo);
    races = races.filter((race) => new Date(race.date) <= to);
  }

  if (sort === "distance" && lat !== undefined && lng !== undefined) {
    races.sort((a, b) => {
      const distA = getDistanceKm(lat, lng, a.lat, a.lng);
      const distB = getDistanceKm(lat, lng, b.lat, b.lng);
      return distA - distB;
    });
  } else if (sort === "date") {
    races.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  return races;
}

async function queryByLocation(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<SerializedRace[]> {
  const ranges = getGeohashRanges(lat, lng, radiusKm);

  const queries = ranges.map((range) =>
    getAdminDb()
      .collection(RACES_COLLECTION)
      .where("eventStatus", "==", "upcoming")
      .orderBy("geohash")
      .startAt(range.start)
      .endAt(range.end)
      .get()
  );

  const snapshots = await Promise.all(queries);

  const allDocs = snapshots.flatMap((snap) => snap.docs);

  const uniqueDocs = new Map<string, FirebaseFirestore.DocumentSnapshot>();
  for (const doc of allDocs) {
    uniqueDocs.set(doc.id, doc);
  }

  const races = Array.from(uniqueDocs.values())
    .map(docToSerializedRace)
    .filter((race) => isWithinRadius(lat, lng, race.lat, race.lng, radiusKm));

  return races;
}

export async function getAllRaceSlugs(): Promise<string[]> {
  const snapshot = await getAdminDb()
    .collection(RACES_COLLECTION)
    .select("slug")
    .get();

  return snapshot.docs.map((doc) => doc.data().slug as string);
}
