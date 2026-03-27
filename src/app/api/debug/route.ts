import { getAdminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("races").limit(3).get();
    return Response.json({
      ok: true,
      count: snapshot.size,
      firstRace: snapshot.docs[0]?.data()?.name ?? "none",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasServiceKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      keyLength: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length ?? 0,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return Response.json({
      ok: false,
      error: error.message,
      stack: error.stack?.split("\n").slice(0, 5),
      hasServiceKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      keyLength: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length ?? 0,
    });
  }
}
