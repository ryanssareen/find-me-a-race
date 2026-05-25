---
date: 2026-05-25
topic: open-ideation
focus: open-ended (DX, reliability, features, leverage)
---

# Ideation: Find Me a Race — Open-Ended Improvements

## Codebase Context

**Product:** Mobile-first web app for discovering upcoming running/endurance races across India. Browse without an account; search by location/type/date; map + list views; SEO race detail pages at `/races/[slug]`. Planned v2: freemium for organizers.

**Stack:** Next.js 16.2 (App Router, React 19, *non-standard modified fork* — read `node_modules/next/dist/docs/` before coding per AGENTS.md), TypeScript, TailwindCSS v4, Firebase/Firestore (firebase-admin server-side), Leaflet/react-leaflet, Nominatim geocoding, geofire-common geohash + haversine. Vitest + MSW (unit only), Playwright configured but no e2e.

**Architecture:** Server Components fetch data; 3 client components (`HeroSearch`, `Header`, `RaceSearch`). Data layer `src/lib/firebase/races.ts` → `SerializedRace` (Timestamps→ISO). API: `/api/races/search`, `/api/debug`.

**High-signal findings (independently confirmed by multiple ideation agents):**
- 🔴 `firestore.rules:13` is the default open rule expiring `2026-04-26` — already past (today 2026-05-25). DB locked or world-writable.
- 🔴 `/api/debug` publicly leaks service-account key length + stack traces; `/api/races/search` swallows DB errors into `200 OK {races:[], error}`.
- `docToSerializedRace` is **triplicated** (drifting): `races.ts`, `api/races/search/route.ts`, and reverse-mapped in `scripts/seed-races.ts`.
- **"Near me" is silently broken:** `HeroSearch` reverse-geocodes GPS → city string → text search, discarding lat/lng; `/races/page.tsx` never reads `lat`/`lng`. The entire geohash/haversine path is dead code.
- `/races` calls `getAllRaces(300)` and ships the whole collection to the client; `RaceSearch` filters client-side. Full-collection scan; no pagination.
- Dead UI: `DATE_FILTER_PRESETS` + `SORT_OPTIONS` ("distance from you") exist in `constants.ts` but are wired to nothing. No date chips, no distance sort.
- No map rendered anywhere despite Leaflet installed and lat/lng present on every race.
- Data quality is manual — a recent commit was literally "Mark past races + fix 50 broken links in Firestore." No auto-status, no link-health checks.
- No sitemap/robots/feed; only flat `/races` browse; no programmatic landing pages despite `getAllRaceSlugs()` existing.
- Search is naive `.toLowerCase().includes()`; brittle date-token parser duplicated between client and API with subtly different fallback logic.

**Past learnings:** none — `docs/solutions/` does not exist yet (run `/ce:compound` after solving problems).

**Already explored (don't re-propose):** `docs/brainstorms/2026-03-21-findmearace-mvp-requirements.md` — full MVP requirements (location search, filters, map, detail pages, registration CTA, SEO URLs, hybrid sourcing, data model, freemium).

## Ranked Ideas

### 1. Security & error-handling hardening (urgent remediation)
**Description:** Replace the expired open `firestore.rules` with explicit rules (public `read` on `races`, deny all client `write` — writes go through admin SDK/seed only). Delete or auth-gate `/api/debug`. Stop returning `error.message`/stack/`keyLength` to unauthenticated callers and make `/api/races/search` return real HTTP error codes instead of `200 {error}` so failures are distinguishable from "no results."
**Rationale:** The rule expired 2026-04-26, so the DB is either fully locked (app broken) or world-writable (anyone can wipe the dataset). `/api/debug` leaks infrastructure details. This is live and the single highest-urgency item — more "just fix it" than brainstorm material.
**Downsides:** Not a growth feature; pure hygiene. Needs the non-standard Next.js error-handling conventions checked.
**Confidence:** 95%
**Complexity:** Low
**Status:** Unexplored
**Grounding:** `firestore.rules:13`, `src/app/api/debug/route.ts`, `src/app/api/races/search/route.ts:97-101`

### 2. Self-healing data + visible trust layer
**Description:** A scheduled job (Vercel Cron / Cloud Function) that (a) flips `eventStatus` upcoming→completed when `date < today`, (b) auto-closes registration when `registrationCloses` passes, and (c) HEAD/GET-pings every `registrationUrl`/`organizerWebsite`, recording HTTP status + `lastChecked` and flagging 404s. Then surface the output as user-facing trust: "Last verified [date]", "8th annual edition" (`editionNumber`), source provenance (`source` enum), "Registration closes in 4 days" urgency, and a "Report a problem" link.
**Rationale:** Directly removes the documented manual toil ("Mark past races + fix 50 broken links") AND converts data hygiene into a credibility differentiator — the core value prop of an aggregator competing with organizers' own sites. The automated freshness data literally *is* the "verified" signal.
**Downsides:** Cron infra + crawl politeness/rate-limiting; false-positive 404s on flaky sites need a retry/grace window.
**Confidence:** 88%
**Complexity:** Medium
**Status:** Unexplored
**Grounding:** "Mark past races" commit; `eventStatus`/`registrationCloses`/`source`/`editionNumber`/`updatedAt` in `src/lib/types/race.ts`; `getUpcomingRaces` keys on `eventStatus`.

### 3. Unified validated data spine
**Description:** Collapse the triplicated `docToSerializedRace` into one `serialize`/`toFirestoreDoc` codec module used everywhere. Add a single Zod `raceSchema` that every write path (seed, future scraper, organizer form) passes through — validating required fields, enum membership, lat/lng-in-India, parseable dates, well-formed URLs; deriving slug + geohash. Make ingestion idempotent (deterministic doc IDs by `name-year` slug + content hash) so re-runs update in place. Add golden-snapshot tests over the fixtures.
**Rationale:** The substrate every future data effort depends on. Kills drift bugs structurally, makes bad data impossible to write, and makes any scraper/agent ingestion safe and re-runnable. Pure leverage on all future work.
**Downsides:** Adds Zod (ask first — dependency); refactor touches several files; no immediate user-visible payoff.
**Confidence:** 85%
**Complexity:** Medium
**Status:** Unexplored
**Grounding:** `races.ts:11-41`, `api/races/search/route.ts:6-36`, `scripts/seed-races.ts:39-66`; `seed-scraped.ts` slug-set dedupe; `(race as Record<string, unknown>)` casts.

### 4. Location-first, actually — fix near-me + maps + activate dead filters
**Description:** Make "Near me" real: pass precise lat/lng from `HeroSearch` through to `/races`, have the page read `lat`/`lng`/`radius`, call the existing `queryByLocation`/`searchRaces` geohash path, rank by `haversineDistance`, and show "12 km away" on each card. Add a Leaflet mini-map to the detail page (lat/lng already present). Wire the already-defined `DATE_FILTER_PRESETS` chips ("This Weekend", "This Month") and `SORT_OPTIONS` distance sort into `RaceSearch`. Route Nominatim through a server `/api/geo` proxy with cache + timeout + rate-limit.
**Rationale:** The location-first promise is the product's reason to exist and it currently doesn't work — a runner in Gurgaon searching "near me" gets Delhi string-matches and misses a race 8 km away. The geo machinery is already written and tested but unreachable; this is mostly activation, not new infra.
**Downsides:** Firestore geo queries need composite indexes; Nominatim usage policy must be honored (the proxy handles this).
**Confidence:** 90%
**Complexity:** Medium
**Status:** Unexplored
**Grounding:** `HeroSearch.tsx:88-110`, `races/page.tsx:14-31` (ignores lat/lng), `races.ts:86-166` (dead geo path), `constants.ts` (`DATE_FILTER_PRESETS`/`SORT_OPTIONS`), `src/lib/maps/nominatim.ts`.

### 5. India-aware search & empty-result rescue
**Description:** Add an India synonym/alias + transliteration layer so "Bangalore"→"Bengaluru", "Bombay"→"Mumbai", "10 k"→10K, "daud"/Hinglish, and minor misspellings resolve correctly over the current naive `.includes()`. Harden + de-duplicate the brittle date-token parser (share one impl between client and API; handle "may" month-vs-word, year-only, ranges). On zero results, auto-broaden (drop date filter, widen to state, suggest nearest 3 upcoming) instead of a dead-end empty state.
**Rationale:** India has dual city names and heavy spelling/script variance; a runner typing "Bangalore" or "Bombay" hits an empty state and bounces even though matching races exist. Real regional differentiation, not table stakes, and it plugs a silent first-interaction funnel killer.
**Downsides:** Synonym map needs curation/maintenance; transliteration is fuzzy. Pairs best after a search-layer decision (Firebase-native vs Algolia/Typesense — still open).
**Confidence:** 78%
**Complexity:** Medium
**Status:** Unexplored
**Grounding:** `.includes()` filtering in `api/races/search/route.ts` + `RaceSearch.tsx`; `date-parser.ts:16-59` consumed differently at `route.ts:56-83` vs `RaceSearch.tsx:55-80`; static empty state.

### 6. SEO compounding engine
**Description:** Programmatic landing pages — `/races/[city]`, `/[city]/[distance]` (e.g. `/bengaluru/half-marathon`), `/[distance]/[state]` — generated from existing data via `generateStaticParams` + `INDIAN_STATES`/`RACE_TYPES`. Add `app/sitemap.ts`, `app/robots.ts`, and an RSS `/feed.xml`. Expand structured data (ItemList on listings, BreadcrumbList, FAQPage, `superEvent` series linking via `editionNumber`). Keep completed races live as evergreen archive pages, chaining `...-2026`→`...-2027` so authority inherits across editions.
**Rationale:** Matches the stated success criterion (rank for "[city] marathon"). Multiplies indexable surface from N races to N×cities×types, and each new race auto-populates multiple pages — organic traffic compounds with the dataset, not with per-page labor.
**Downsides:** Thin landing pages risk low quality at small catalog size (48 races today); needs curated intro copy to avoid doorway-page penalties. Largest scope of the set.
**Confidence:** 80%
**Complexity:** Medium-High
**Status:** Unexplored
**Grounding:** `getAllRaceSlugs()` exists; only `/races/[slug]` leaf + flat `/races?type=` query params today; single `SportsEvent` JSON-LD on detail only; no sitemap/robots/feed.

### 7. Save / add-to-calendar / share (no-account intent capture)
**Description:** localStorage "saved races" shortlist (no login, fits the browse model), an "Add to Google/Apple Calendar" `.ics` button on detail pages (race day + a separate registration-close reminder event), and WhatsApp/native share — since Indian runners coordinate group entries over WhatsApp.
**Rationale:** Race decisions are multi-session and social — people shortlist a few, sleep on it, rope in club friends. Without save/share/calendar the app is a dead-end lookup that loses the path back to registration. All needed date fields + `SportsEvent` JSON-LD already exist; `.ics` is a pure function.
**Downsides:** localStorage doesn't sync across devices; lower strategic leverage than 1-4. The reminder value depends on accurate `registrationCloses` data (see #2).
**Confidence:** 72%
**Complexity:** Low-Medium
**Status:** Unexplored
**Grounding:** `races/[slug]/page.tsx` (date fields + JSON-LD present); no persistence/share/calendar anywhere; no-account architecture → localStorage is the natural fit.

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | Server-side paginated/indexed search (standalone) | Real scale cliff, but premature at 48 races; folds into #4/#5 search rework — revisit at scale |
| 2 | Agent-native data curation toolkit (MCP tools / LLM enrichment loop) | Promising and on-brand, but sequenced after #3 (needs the validated write path first); better as a dedicated brainstorm |
| 3 | Organizer self-serve submission → moderation queue | High leverage but v2-scoped; needs auth + moderation; depends on #1 rules + #3 spine landing first |
| 4 | Saved searches + race alerts (web push / email digest) | Retention loop is valuable but premature without traffic; needs notification infra + stored subscriptions |
| 5 | Distance-fit / "Can I run this?" trainability guidance | Good for first-timers but speculative + content-heavy; lower groundedness; better as a brainstorm variant |
| 6 | Side-by-side race comparison tray | Decent and built from existing fields, but medium value; overlaps general browse improvements |
| 7 | Community results / "I ran this" per edition | UGC needs moderation + traffic to be worth it; folded into #2 trust layer as a future extension |
| 8 | Date-preset chips / distance sort (standalone) | Real dead-UI win, but folded into #4 (Location-first) |
| 9 | Course map on detail page (standalone) | Clear win, folded into #4 |
| 10 | Resilient geocoding gateway (standalone) | Folded into #4 as the `/api/geo` proxy |
| 11 | Golden-dataset snapshot tests (standalone) | Folded into #3 as the regression net |
| 12 | First e2e/route coverage (standalone) | Foundational maintenance; error-contract half folds into #1; e2e net is table-stakes, do alongside any of the above |

## Session Log
- 2026-05-25: Initial ideation — 5 frame-biased agents → ~40 raw candidates → ~26 deduped → 4 cross-cutting combos synthesized → 7 survivors kept. Open-ended focus.
