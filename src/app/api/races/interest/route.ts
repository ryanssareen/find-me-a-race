import { NextRequest } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// One interest per (ip, race) per 24 hours. Pairs with client-side
// localStorage dedupe in InterestButton for the common case, and provides
// a server-enforced backstop the client cannot bypass.
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const MAX_RACE_ID_LEN = 200;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function ipHash(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const raceId = (body as { raceId?: unknown })?.raceId;

    if (
      typeof raceId !== "string" ||
      raceId.length === 0 ||
      raceId.length > MAX_RACE_ID_LEN
    ) {
      return Response.json({ error: "Invalid raceId" }, { status: 400 });
    }

    const ip = clientIp(request);
    const limitId = `${ipHash(ip)}_${raceId}`;

    const db = getAdminDb();
    const raceRef = db.collection("races").doc(raceId);
    const limitRef = db.collection("interestLimits").doc(limitId);

    const result = await db.runTransaction(async (txn) => {
      const limitSnap = await txn.get(limitRef);
      if (limitSnap.exists) {
        const at = limitSnap.data()?.at;
        const lastMs: number | undefined =
          typeof at?.toMillis === "function" ? at.toMillis() : undefined;
        if (typeof lastMs === "number" && Date.now() - lastMs < COOLDOWN_MS) {
          return { rateLimited: true as const };
        }
      }

      const raceSnap = await txn.get(raceRef);
      if (!raceSnap.exists) return { notFound: true as const };

      txn.set(limitRef, { at: FieldValue.serverTimestamp(), raceId });
      txn.update(raceRef, { interestCount: FieldValue.increment(1) });

      const prev = raceSnap.data()?.interestCount;
      const nextCount = (typeof prev === "number" ? prev : 0) + 1;
      return { ok: true as const, interestCount: nextCount };
    });

    if ("rateLimited" in result && result.rateLimited) {
      return Response.json({ error: "Already counted" }, { status: 429 });
    }
    if ("notFound" in result && result.notFound) {
      return Response.json({ error: "Race not found" }, { status: 404 });
    }
    return Response.json({
      success: true,
      interestCount: result.interestCount,
    });
  } catch (err) {
    // Log full detail server-side; return generic message to client.
    console.error("Failed to record interest:", err);
    return Response.json(
      { error: "Failed to record interest" },
      { status: 500 }
    );
  }
}
