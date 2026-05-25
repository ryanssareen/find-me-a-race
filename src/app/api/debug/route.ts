import { getAdminDb } from "@/lib/firebase/admin";

export async function GET() {
  // Debug-only endpoint: never exposed in production to avoid leaking internals.
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }

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
    // Log detail server-side; never return stack traces or key material.
    console.error("Debug route error:", err);
    return Response.json(
      { ok: false, error: "Internal error", hasServiceKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY },
      { status: 500 }
    );
  }
}
