import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  const decoded = Buffer.from(serviceAccountKey, "base64").toString("utf-8");
  // Strip control characters that may sneak in from env var encoding
  const cleaned = decoded.replace(/[\x00-\x09\x0b\x0c\x0e-\x1f]/g, "");
  const serviceAccount = JSON.parse(cleaned) as ServiceAccount;

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
