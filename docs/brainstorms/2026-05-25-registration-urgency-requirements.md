---
date: 2026-05-25
topic: registration-urgency
---

# Registration Urgency (v1)

> From feature ideation [#1](../ideation/2026-05-25-feature-ideation.md). Brainstorm decisions: close the data gap first (admin, agent-assisted curation), surface urgency on the **detail page only**, capture demand as an **interest signal (no email)**.

## Problem Frame
The primary conversion in Find Me a Race is the click from a race detail page to the organizer's registration. Today the app stores `registrationStatus` + `registrationUrl` but **no open/close dates** (0 of 83 races), so a runner can't tell whether a race closes in 3 days or 6 months, and a runner who wants a not-yet-open race has no way to express interest or act later. The result is missed registrations and a passive directory. v1 makes registration timing **visible and trustworthy** on the highest-intent surface, and begins capturing demand for not-yet-open races — which first requires sourcing the missing dates.

## Requirements

**Data sourcing & quality**
- R1. Populate `registrationOpens` / `registrationCloses` via an internal **admin curation** flow (not exposed to public users).
- R2. Curation is **agent-assisted**: for a race, an agent fetches the registration URL and proposes open/close dates; a human confirms with one tap or edits before saving.
- R3. Proposed dates must pass validation before saving — plausible ordering (`opens ≤ closes ≤ raceDate`) and sane range — consistent with the unified write path.
- R4. Each curated date carries a **"last verified" timestamp** so staleness is visible and re-verifiable.
- R5. Curation is **incremental**: urgency must work for any race that has dates, with no requirement for full-catalog coverage first.

**Urgency surfacing — detail page only**
- R6. On `/races/[slug]`, when the race is open and `registrationCloses` exists, show a relative-urgency indicator near `RegistrationCTA` (e.g. "Closes in N days"), with stronger emphasis when very near (e.g. "Last day", ≤2 days).
- R7. When the race is `not_yet_open` and `registrationOpens` exists, show "Opens in N days" / "Opens <date>", extending the existing `not_yet_open` CTA label.
- R8. Optionally show a brief "Just opened" emphasis when a race transitioned to open recently.
- R9. **Graceful degradation**: when dates are absent, show the current status-based label with no regression — never fabricate urgency.
- R10. `closed` / `sold_out` / past states keep their current treatment (no false urgency).

**Interest signal — demand capture, no email**
- R11. On `not_yet_open` races (detail page), a no-account "I'm interested" / 🔔 tap records an anonymous interest event for that race.
- R12. Show an aggregate interest count ("142 runners interested") as social proof once above a small display threshold.
- R13. Interest writes go through the server / Admin-SDK path (client writes are denied by `firestore.rules`); limit duplicates/abuse (e.g. one per device marker).
- R14. Interest data is queryable internally as a demand signal (feeds future organizer lead-gen) — but **no emails are collected and no notification is promised or sent** in v1.

## Success Criteria
- Registration click-through from detail pages showing urgency is measurably higher than those without (once click analytics exist).
- A meaningful, growing share of open / opening-soon races carry curated, fresh dates (set a concrete % + timeframe target in planning).
- Interest taps accumulate on not-yet-open races, yielding a usable demand ranking.
- Zero detail pages display incorrect or stale urgency — graceful fallback verified.

## Scope Boundaries (v1 non-goals)
- Grid card badges, home "closing soon / just opened" rails, and the `/races` closing-soon filter/sort — deferred to v2 (the same curated data powers them later).
- Email capture and "notify me when it opens" sending — deferred; v1 is interest-signal only.
- Building scrapers or an organizer claim flow as date sources — v1 source is admin curation; those are future sources.
- Any public/organizer-facing curation UI — curation is internal/admin in v1.

## Key Decisions
- **Close the data gap first, via admin + agent-assisted curation** — date-based urgency is impossible on current data (0/83 have dates) and scrapers/organizer flows don't exist yet.
- **Detail-page-only surface for v1** — highest-intent surface; prove the pattern and build date coverage before broadening.
- **Interest signal instead of email notify** — captures demand value at near-zero carrying cost and preserves the account-free model; email + consent deferred.
- **Graceful degradation by design** — urgency appears only where real, verified dates exist.

## Dependencies / Assumptions
- Assumes a server / Admin-SDK write path for date + interest writes (`firestore.rules` deny client writes — just shipped). Related: the unified validated write path (open-ideation #3) is the natural home for R3 validation.
- "Last verified" freshness (R4) is the seam shared with the self-healing-data idea (open-ideation #2); v1 needs only the timestamp, not the full automation.
- Interest-as-social-proof (R12) assumes enough volume to avoid a weak "1 interested" state — hence the display threshold.

## Outstanding Questions

### Resolve Before Planning
- (none — scope, success criteria, and boundaries are defined; ready for planning)

### Deferred to Planning
- [Affects R2][Needs research] How the agent extracts dates from heterogeneous registration pages (Townscript, IndianMarathons, organizer sites), and the confidence bar for auto-apply vs. human-confirm.
- [Affects R6/R7][Technical] Exact urgency thresholds + copy (e.g. ≤7d "closing soon", ≤2d "last day", opens-within-7d "opening soon") — tune in planning.
- [Affects R3][Technical] Where date validation lives relative to the unified write path (open-ideation #3), depending on whether that spine exists yet.
- [Affects R13][Technical] Abuse/dedupe mechanism for anonymous interest writes (device marker, rate limit).
- [Affects Success Criteria][Needs research] Click attribution to measure CTR lift — no analytics today (ties to marketplace click-attribution, feature #6).
- [Note] Non-standard Next.js fork — planning must consult `node_modules/next/dist/docs/` before implementation.

## Next Steps
→ `/ce:plan` for structured implementation planning.
