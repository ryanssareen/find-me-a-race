/**
 * One-off backup of the public `races` Firestore collection to local JSON.
 *
 * Uses the client SDK with the public web config (no service-account key needed)
 * and relies on the public-read rule on `races`. Run: `npx tsx scripts/backup-races.ts`
 */
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  collection,
  getDocs,
  Timestamp,
  GeoPoint,
} from "firebase/firestore";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// Public web config (safe to embed — same values shipped to the browser).
const firebaseConfig = {
  apiKey: "AIzaSyCvTIhGTdf15ZCLtqQ-pTBAqohzMM57Zos",
  authDomain: "find-me-a-race.firebaseapp.com",
  projectId: "find-me-a-race",
  storageBucket: "find-me-a-race.firebasestorage.app",
  messagingSenderId: "948823934341",
  appId: "1:948823934341:web:396f95a116c4a7244070ec",
};

// Serialize Firestore types into portable, restorable JSON.
function serialize(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return { __type: "timestamp", iso: value.toDate().toISOString() };
  }
  if (value instanceof GeoPoint) {
    return { __type: "geopoint", latitude: value.latitude, longitude: value.longitude };
  }
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serialize(v)])
    );
  }
  return value;
}

async function main() {
  const app = initializeApp(firebaseConfig);
  // Long-polling avoids gRPC streams hanging the Node process.
  const db = initializeFirestore(app, { experimentalForceLongPolling: true });

  console.log("Reading races collection from Firestore...");
  const snap = await getDocs(collection(db, "races"));
  const docs = snap.docs.map((d) => ({ id: d.id, data: serialize(d.data()) }));

  const exportedAt = new Date().toISOString();
  const stamp = exportedAt.replace(/[:.]/g, "-");
  const dir = join(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `races-${stamp}.json`);

  writeFileSync(
    file,
    JSON.stringify(
      { exportedAt, projectId: firebaseConfig.projectId, collection: "races", count: docs.length, docs },
      null,
      2
    )
  );

  console.log(`Backed up ${docs.length} races -> ${file}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Backup failed:", err?.message ?? err);
  process.exit(1);
});
