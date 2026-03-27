import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";
import races from "./sample-races.json";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seed() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error("Error: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    console.error("Set it to a base64-encoded Firebase service account JSON.");
    process.exit(1);
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountKey, "base64").toString("utf-8")
  ) as ServiceAccount;

  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);

  console.log(`Seeding ${races.length} races...`);

  const batch = db.batch();

  for (const race of races) {
    const year = new Date(race.date).getFullYear();
    const slug = `${slugify(race.name)}-${year}`;
    const ref = db.collection("races").doc();

    const doc: Record<string, unknown> = {
      slug,
      name: race.name,
      date: Timestamp.fromDate(new Date(race.date)),
      city: race.city,
      state: race.state,
      venue: race.venue || null,
      location: new GeoPoint(race.lat, race.lng),
      geohash: geohashForLocation([race.lat, race.lng], 10),
      distances: race.distances,
      terrain: race.terrain || null,
      routeDescription: null,
      elevationGain: (race as Record<string, unknown>).elevationGain || null,
      organizerName: race.organizerName,
      organizerWebsite: (race as Record<string, unknown>).organizerWebsite || null,
      registrationUrl: race.registrationUrl || null,
      registrationStatus: race.registrationStatus,
      registrationOpens: null,
      registrationCloses: null,
      eventStatus: race.eventStatus,
      editionNumber: (race as Record<string, unknown>).editionNumber || null,
      photos: null,
      description: race.description || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      source: "manual",
    };

    batch.set(ref, doc);
    console.log(`  + ${race.name} (${slug})`);
  }

  await batch.commit();
  console.log(`\nDone! Seeded ${races.length} races to Firestore.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
