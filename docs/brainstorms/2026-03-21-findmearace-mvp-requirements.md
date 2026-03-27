---
date: 2026-03-21
topic: findmearace-mvp
---

# FindMeARace.com — MVP Requirements

## Problem Frame

Indian runners have no single, comprehensive place to discover upcoming local races. Race information is scattered across organizer websites, social media groups, Townscript listings, and word of mouth. Runners miss races they'd love to do, and smaller organizers struggle to reach runners beyond their immediate community.

FindMeARace.com aggregates upcoming running races across India into a single, searchable, mobile-first platform — making it easy for any runner to answer "what races are near me?"

## Target Users

- **Casual runners** — looking for their first 5K or occasional fun runs. Need simple discovery, beginner-friendly info, low friction.
- **Serious amateur runners** — doing multiple races/year, comparing courses, tracking PRs. Want detailed race data, elevation profiles, past results.

Both segments served from day one, with progressive disclosure: simple search results for casual runners, detailed race pages for serious ones.

## Requirements

### Core Discovery (MVP)

- R1. **Location-based search** — Users can search for races near a city, area, or "near me" (GPS). Autocomplete on location input.
- R2. **Filter by race type** — Filter by distance: 5K, 10K, Half Marathon, Full Marathon, Ultra.
- R3. **Filter by date** — Filter by date range (this weekend, this month, next 3 months, custom range).
- R4. **Map view** — Show matching races on an interactive map alongside a list view.
- R5. **List view with sorting** — Sort results by date, distance from user, or race type.

### Race Detail Pages (MVP)

- R6a. **Race info — required fields** — Each race page must show: name, date(s), location (city + map pin), distances offered, organizer name + website link, and registration link.
- R6b. **Race info — optional fields** — Show when available: registration window (open/close dates), route description, terrain type (road/trail/mixed), elevation profile, race photos, and past edition count.
- R7. **Registration CTA with status** — Prominent CTA button that reflects registration status: "Register" (open), "Registration opens [date]" (not yet open), "Registration closed" or "Sold out" (unavailable). Always links to organizer's page when a URL exists.
- R8. **SEO-friendly URLs** — Each race page has a clean, indexable URL (e.g., `/races/mumbai-marathon-2026`).
- R9. **New vs established race indicator** — Flag whether a race is a first edition or has history.

### Data & Content

- R10. **Hybrid data sourcing** — Seed race database through: (a) scraping structured sites (Townscript, IndianMarathons.com), (b) harvesting from running club calendars (Runners for Life, Mumbai Road Runners, Bangalore Runners, etc.), (c) monitoring social media groups (Facebook running communities, Instagram), and (d) manual research to fill gaps.
- R11. **Race data model** — Each race record stores: name, date(s), location (city + coordinates), organizer, website URL, registration URL, registration window, registration status (open/closed/not yet open/sold out), distances offered, route type/terrain, elevation profile (when available), event status (upcoming/completed/cancelled).

### Platform & UX

- R12. **Mobile-first responsive design** — Optimized for mobile browsers first, with responsive desktop layout.
- R13. **Fast load times** — Target < 3s initial load on mid-range mobile devices over 4G.
- R14. **No account required for browsing** — Users can search and view races without creating an account.

## Tech Stack

- **Frontend:** Next.js (SSR for SEO + React for interactivity)
- **Backend/Database:** Firebase (Firestore for race data, Firebase Auth for future user accounts, Firebase Hosting)
- **Maps:** Google Maps or Mapbox for map view and race location display
- **Search:** Evaluate during planning (Algolia, Typesense, or Firebase-native)

## Monetization Strategy

Freemium model for race organizers:
- **Free tier:** Basic race listing (appears in search results)
- **Premium tier (v2):** Featured placement, analytics dashboard, registration integration, promotional tools

## Scope Boundaries (Not MVP)

- User accounts and profiles
- User reviews and ratings
- Organizer dashboard / self-service race management
- Past race results and participant data
- Cycling, triathlon, swimming, hyrox events (future expansion)
- Native mobile apps (iOS/Android)
- Payment processing or in-app registration
- Multi-language support (English-only for MVP)
- Push notifications or email alerts

## Success Criteria

- S1. Launch with 200+ upcoming races across 10+ Indian cities
- S2. Races are discoverable by location and filterable by type/date within 2 taps on mobile
- S3. Each race page contains enough info for a runner to decide whether to register
- S4. Race pages rank in Google search results for "[city] marathon/running race" queries
- S5. Users can go from landing page to a race registration link in under 30 seconds

## Key Decisions

- **India-first launch:** Less competition than US/global market, booming running scene, opportunity to become the default platform before a competitor does
- **No user accounts for MVP:** Reduces friction for browsing; accounts added later for reviews and saved races
- **Progressive disclosure UX:** Simple cards in search results, full details on race pages — serves both casual and serious runners
- **Freemium over affiliate:** More sustainable than affiliate commissions (Indian race platforms may not have affiliate programs); free listings solve cold-start

## Dependencies / Assumptions

- Google Maps API or Mapbox available and affordable for India-specific geocoding
- Indian race data is scrapable or obtainable from existing platforms without legal issues
- Firebase free tier sufficient for MVP traffic levels
- Sufficient upcoming race data exists to seed 200+ races at launch

## Outstanding Questions

### Resolve Before Planning

_(All resolved)_

### Deferred to Planning
- [Affects R1][Technical] Best approach for location autocomplete in India — Google Places API vs alternatives?
- [Affects R4][Technical] Google Maps vs Mapbox — cost comparison for expected Indian traffic patterns
- [Affects R11][Needs research] What elevation data sources are available for Indian race routes?
- [Affects R2][Needs research] Should we support Indian-specific race types (e.g., stadium runs, timed runs, virtual runs)?
- [Affects R10][Technical] Scraping architecture — scheduled Cloud Functions vs separate scraper service?

## Next Steps

→ `/ce:plan` for structured implementation planning
