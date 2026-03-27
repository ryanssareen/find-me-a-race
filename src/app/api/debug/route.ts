import { getAdminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const db = getAdminDb();
    const allSnapshot = await db.collection("races").limit(3).get();
    const upcomingSnapshot = await db.collection("races").where("eventStatus", "==", "upcoming").limit(3).get();
    const firstDoc = allSnapshot.docs[0]?.data();
    return Response.json({
      ok: true,
      totalCount: allSnapshot.size,
      upcomingCount: upcomingSnapshot.size,
      firstRace: firstDoc?.name ?? "none",
      firstEventStatus: firstDoc?.eventStatus ?? "missing",
      firstDate: firstDoc?.date?.toDate?.()?.toISOString() ?? String(firstDoc?.date),
      allFields: firstDoc ? Object.keys(firstDoc) : [],
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
