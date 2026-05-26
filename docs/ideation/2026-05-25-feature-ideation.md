---
date: 2026-05-25
topic: feature-ideation
focus: feature (user-facing capabilities)
---

# Ideation: Find Me a Race — Feature Ideas

> Companion to [2026-05-25-open-ideation.md](2026-05-25-open-ideation.md) (open-ended). This run is feature-scoped; agents were fed the open doc's survivors + rejects and told to go net-new or deeper, not restate.

## Codebase Context

Mobile-first Next.js 16.2 / Firestore app for discovering upcoming running races across India. Browse without an account; `/` (HeroSearch), `/races` (client-side filter), `/races/[slug]` (detail + RegistrationCTA). Reused from the open-ended scan earlier today (codebase unchanged except the shipped security fixes).

**Feature-relevant assets & gaps:**
- **Rich data model, thinly surfaced** (`SerializedRace`): `distances[]`, `terrain`, `elevationGain`, `editionNumber`, `source` (manual/community/scrape_*), `registrationStatus`/`registrationOpens`/`registrationCloses`, `lat`/`lng`, `venue`, `photos`, `description` — most are stored but never shown or filtered on.
- **Dead UI scaffolding:** `DATE_FILTER_PRESETS` + `SORT_OPTIONS` ("distance from you") defined in `constants.ts`, wired to nothing.
- **Leaflet installed but no map rendered anywhere**; `lat`/`lng` present on every race.
- **`source: "community"` enum value exists with no write path** — a dormant hook for UGC.
- **Client Firebase config exists but is unused** (no auth, no client reads/writes) — the smallest step to optional accounts.
- **`RegistrationCTA` already detects generic/aggregator URLs** (`isGenericUrl`, `GENERIC_DOMAINS`) and special-cases `not_yet_open` with an opens-date — half-built hooks for urgency + organizer recapture.
- **Stateless today:** no save, no reminders, no reviews/results, no social, no organizer surface, no analytics.

**Already covered by the open-ended doc (don't duplicate):** location-first fix (near-me + map + filters), India-aware search, self-healing data + trust layer, SEO landing pages, save/calendar/share, unified data spine. Rejected there as premature: trainability index, comparison tray, saved-search alerts, community results, organizer submission.

**Past learnings:** none (`docs/solutions/` absent).

## Ranked Ideas

### 1. Registration urgency engine
**Description:** Make registration windows a first-class, action-driving surface. (a) "Closing soon" + "Just opened" discovery rails and a grid badge ("Closes in 3 days") derived from `registrationCloses`/`registrationOpens`/`registrationStatus`. (b) A one-tap "Closing soon" filter. (c) On `not_yet_open` races, a single-field "Notify me when registration opens" email capture (no account) — which doubles as first-party demand data and an organizer lead-gen asset.
**Rationale:** A race you can't register for right now is a dead end; surfacing the window converts browsing into action and rescues the "found it too late" failure. Activates three live-but-invisible fields, mostly derived (no schema change for the rails/badges), and the email capture bridges into monetization (#6).
**Downsides:** Email capture needs spam/consent handling; urgency accuracy depends on data freshness (ties to open-doc self-healing data).
**Confidence:** 85%
**Complexity:** Medium
**Status:** Explored (brainstorm started 2026-05-25)
**Grounding:** `registrationStatus`/`registrationOpens`/`registrationCloses` in `race.ts`; `RegistrationCTA.tsx` already special-cases `not_yet_open` + opens-date; `RaceSearchParams` supports filtering.

### 2. Goal-based & seasonal discovery
**Description:** Discovery beyond keyword search, matching how runners actually think. (a) Goal entry points / curated destinations: "My First 10K Near Me", "Marathon in 16 Weeks" (composes `distances` + date window + `registrationStatus`). (b) A distance-ladder rail ("Run up the distances") sequencing 5K→10K→Half using the `RaceType` order. (c) Seasonal calendar grid (month-by-month, matching India's Oct–Feb cool-season clustering) — finally wiring `DATE_FILTER_PRESETS`. (d) Terrain/elevation facet chips ("Flat & Fast" <100m, "Hill Beast") + a "Races like this" strip on detail pages.
**Rationale:** Browsers without a precise query need aspiration- and season-based entry points; PR-chasers and trail seekers want terrain/elevation filters that don't exist today. Activates dead constants + the `terrain`/`elevationGain` fields, and the goal/season pages double as SEO surfaces.
**Downsides:** Goal pages risk thinness at 48 races; null-handling needed for sparse elevation; some overlap with the open-doc SEO engine (this is the on-site UX layer, that's the programmatic-page layer).
**Confidence:** 80%
**Complexity:** Medium
**Status:** Unexplored
**Grounding:** `DATE_FILTER_PRESETS`/`SORT_OPTIONS` (dead) in `constants.ts`; `distances`/`terrain`/`elevationGain`/`date` fields; `RaceSearch.tsx` single-select filter; `RaceCard`.

### 3. Decision-grade detail page (beyond the map)
**Description:** Turn the barren, high-intent `/races/[slug]` page into a decision tool with India-relevant signals the data already supports or cheaply derives: (a) **Race-day weather climatology band** — typical temp/humidity/sunrise for that date + `lat`/`lng` with a heat-risk dot (heat is the #1 day-of unknown in India). (b) **Course profile + 1–5 difficulty score** from `elevationGain` + `terrain` (a number like "320m" means nothing; a profile + score does). (c) **Certified-course / chip-timing trust badges**, shown only when verifiable and tied to `source` provenance. (d) **"What you get" inclusions strip** (medal/tee/timing/refreshments) parsed from `description`. *(The map render itself is covered by open-doc #4.)*
**Rationale:** Detail pages are the cold-entry SEO surface where the decision happens; today they show little beyond text. Weather + certification + course difficulty are exactly the India-specific factors serious and first-time runners weigh, and competitors don't surface them.
**Downsides:** Weather needs a historical-climate source; full course profile needs route/elevation data (sparse today) — start with the climatology band + difficulty score from existing fields.
**Confidence:** 75%
**Complexity:** Medium-High
**Status:** Unexplored
**Grounding:** `lat`/`lng`/`date`/`elevationGain`/`terrain`/`source`/`description` in `race.ts`; detail page info grid in `races/[slug]/page.tsx`; Leaflet dep.

### 4. Community social proof: "Who's running this" + WhatsApp Race Pact
**Description:** Lean into club-first Indian running. (a) On each race, a no-account "I'm running this" tap (name + club picked once, stored locally, written via the dormant `source: "community"` path) that shows club-clustered avatars: "Pacemakers Bengaluru: 14 going". (b) A shareable **WhatsApp "Race Pact"** link whose OpenGraph preview image renders a live commitment counter ("5 said they'd run the Mumbai Half — 3 confirmed"), so the social pressure lives in the group chat itself.
**Rationale:** "12 from my club are doing the TCS 10K" is the single strongest registration nudge, and race decisions in India happen inside WhatsApp groups. The dynamic-OG pact is a genuine viral loop needing no install or login — a differentiator no race directory has.
**Downsides:** Needs an Admin-SDK write endpoint + light moderation (firestore.rules deny client writes by design); dynamic OG image infra; cold-start (low counts look weak early).
**Confidence:** 70%
**Complexity:** Medium-High
**Status:** Unexplored
**Grounding:** dormant `source: "community"` enum; `editionNumber`/`name`/`date`; App Router `opengraph-image`; existing WhatsApp-share intent from open-doc #7.

### 5. Runner locker + race plan + deadline push
**Description:** The retention spine that turns a stateless lookup into a returning-user product. (a) Optional **magic-link sign-in** (email, no password) promoting the localStorage shortlist into a synced "locker" — browse stays fully open. (b) A **"My Season" plan**: stack 2–4 target races into a training arc with auto-computed weeks-between gaps. (c) **Post-race re-engagement**: when a saved race flips to `completed`, surface "your race was last week — here are 3 next races 8–16 weeks out". (d) **PWA install + opt-in push** for registration deadlines on locker races only (narrow, high-consent).
**Rationale:** Discovery is recurring, not one-shot; cross-device persistence + countdown psychology + the post-race void (highest-intent re-entry moment) are the levers. Wires the already-present-but-unused client Firebase config to Auth — the smallest step from today's stateless surface.
**Downsides:** Heaviest user-facing build (auth, persistence, service worker, push); introduces account state to a deliberately account-free product. Scope to locker + deadline push first.
**Confidence:** 70%
**Complexity:** High
**Status:** Unexplored
**Grounding:** unused client Firebase config in `src/lib/firebase/config.ts`; `date`/`eventStatus`/`registrationCloses`/`distances` math; extends open-doc #7 (save) with identity + lifecycle.

### 6. Two-sided marketplace on-ramp: claim → analytics → boost
**Description:** The freemium engine that also cleans the dataset for free. (a) **Claim-your-race** via domain-verified email/TXT token matching the listing's `organizerWebsite` (auto-verify, no founder review) → flips `source` to `organizer_verified`, unlocks editing. (b) **"Fix your registration link"** funnel on the `isGenericUrl` listings that currently leak outbound traffic to aggregators — organizers replace the generic URL (recapturing exactly the broken links the founder fixes by hand). (c) **Outbound-click attribution** via an `/api/out/[raceId]` redirect: free public count ("214 viewed this race", social proof) with the breakdown gated behind a paid tier. (d) **Boosted/featured listings** floated in the existing sort.
**Rationale:** Directly realizes the stated v2 freemium plan, and each rung converts a manual founder cost (data cleanup) into organizer-supplied truth. Verified claim is the gate every paid tier sits behind; click analytics is the most sellable thing to an organizer who today has zero traffic visibility.
**Downsides:** Heaviest overall (auth, verification, analytics, billing, moderation); marketplace cold-start; needs the unified write spine (open-doc #3) underneath. Most strategic, least urgent.
**Confidence:** 72%
**Complexity:** High
**Status:** Unexplored
**Grounding:** `organizerWebsite`/`registrationUrl`/`source` in `race.ts`; `isGenericUrl`/`GENERIC_DOMAINS`/hostname parsing already in `RegistrationCTA.tsx`; seed scripts show the Admin-SDK batch write pattern.

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | Vernacular / multilingual UI + race names (Devanagari/Tamil/etc.) | Strong India differentiation + vernacular SEO, but translation sourcing/maintenance is heavy and ongoing; defer until catalog + traffic justify it |
| 2 | Embeddable race-calendar widget + public JSON API | Good compounding distribution, but B2B/growth tooling, not a core runner feature now; partially folds into #6 |
| 3 | Carpool / "reaching the start line" board | Narrow, ops- and trust-heavy, classic cold-start; revisit after the #4 social graph exists |
| 4 | First-timer buddy & pacer matchmaking | Valuable for the first-timer segment but safety/cold-start concerns; better as a #4 extension once rosters have density |
| 5 | "Race Crew" ambassador / curator program | Premature — needs community volume + moderation tooling first; an ops program, not a feature to build now |
| 6 | Finisher-time distribution / cutoff reality check | Excellent reassurance, but requires past-results data the app doesn't have or ingest yet |
| 7 | Registration price history / "price goes up on…" | Needs price-tier data not in the model and hard to source reliably across organizers |
| 8 | Refund / bib-transfer policy surfacing | Depends on unreliable free-text extraction of organizer terms; low confidence |
| 9 | Travel & stay logistics panel | Real for destination races; folds into #3 (uses same lat/lng/map) rather than standing alone |
| 10 | Personal bucket-list / progression tracker | Folded into #5 (locker) and #2 (distance ladder) |
| 11 | Editorial "iconic races" collections | Nice brand/serendipity, but manual curation; do as content once #2's derived shelves exist |
| 12 | "Races like this one" similarity sidebar | Good, folded into #2 as the detail-page discovery strip |
| 13 | Affiliate gear/travel revenue | Folds into #6 monetization; not a standalone feature |

## Session Log
- 2026-05-25: Feature ideation — 5 frame-biased agents (discovery, decision/trust, engagement/retention, community/India, organizer/monetization) → ~40 raw candidates → ~26 deduped → 6 cross-cutting combos synthesized → 6 survivors kept. Built on the same-day open-ended doc (fed as "already covered").
- 2026-05-25: Idea #1 (Registration urgency engine) selected for brainstorm → handed off to /ce:brainstorm.
