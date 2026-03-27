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

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountKey, "base64").toString("utf-8")
  ) as ServiceAccount;

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminApp = getAdminApp();
const adminDb = getFirestore(adminApp);

export { adminApp, adminDb };
