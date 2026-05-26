import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDb: vi.fn(),
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    serverTimestamp: vi.fn(() => "__SERVER_TS__"),
    increment: vi.fn((n: number) => ({ __increment: n })),
  },
}));

import { POST } from "../route";
import { getAdminDb } from "@/lib/firebase/admin";

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/races/interest", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    // The route only uses Web-standard Request members (json/headers) so a
    // plain Request satisfies the NextRequest contract for these tests.
  }) as unknown as Parameters<typeof POST>[0];
}

function makeDb(runTxnResult: unknown) {
  return {
    collection: vi.fn(() => ({ doc: vi.fn(() => ({})) })),
    runTransaction: vi.fn().mockResolvedValue(runTxnResult),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/races/interest — input validation", () => {
  it("returns 400 when raceId is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when raceId is not a string", async () => {
    const res = await POST(makeRequest({ raceId: 12345 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when raceId is empty", async () => {
    const res = await POST(makeRequest({ raceId: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when raceId is unreasonably long", async () => {
    const res = await POST(makeRequest({ raceId: "x".repeat(500) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is malformed JSON", async () => {
    const req = new Request("http://localhost/api/races/interest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json",
    }) as unknown as Parameters<typeof POST>[0];
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/races/interest — response mapping", () => {
  it("returns 429 when rate-limited", async () => {
    vi.mocked(getAdminDb).mockReturnValue(makeDb({ rateLimited: true }) as never);
    const res = await POST(makeRequest({ raceId: "abc" }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 404 when race does not exist", async () => {
    vi.mocked(getAdminDb).mockReturnValue(makeDb({ notFound: true }) as never);
    const res = await POST(makeRequest({ raceId: "ghost" }));
    expect(res.status).toBe(404);
  });

  it("returns success + incremented count on first interest", async () => {
    vi.mocked(getAdminDb).mockReturnValue(
      makeDb({ ok: true, interestCount: 13 }) as never
    );
    const res = await POST(makeRequest({ raceId: "real-race-id" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.interestCount).toBe(13);
  });

  it("returns 500 when the transaction throws", async () => {
    vi.mocked(getAdminDb).mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => ({})) })),
      runTransaction: vi.fn().mockRejectedValue(new Error("boom")),
    } as never);
    const res = await POST(makeRequest({ raceId: "abc" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    // Generic message — no error.message leak
    expect(body.error).toBe("Failed to record interest");
  });
});
