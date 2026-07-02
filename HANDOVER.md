# HANDOVER — Aaradhy Sharma Portfolio

**From:** Claude Code (site build) · **To:** Cursor (Vercel deploy + anything DB/infra)
**Last updated:** July 2, 2026 · site version 0.0.2 + journey v2.1 (Google Earth globe + zoom)

---

## Current state — verified working

`npm run build` passes clean (Next 15.5, TypeScript strict, fully static, 164 kB first load).
Verified against the **production server** (`next start`) at 1440px and 375px: globe → dive →
street level → back to orbit, wheel zoom in/out, stop panel with clickable repo chips, altitude
scroll section, zero console errors. A `SceneErrorBoundary` degrades the journey to the flat
timeline if the 3D chunk ever fails, so the section can never strand on the loading text.

### Globe controls (implemented)

- **Scroll / pinch** — zoom (clamped 1.5–5.4 earth radii); drag sensitivity scales with zoom
- **Drag** — spin the earth (one finger rotates; vertical swipe still scrolls the page on touch)
- **Click a city light** — spin-and-dive to street level; **← / →** hop the route; **Esc** back
- Street level: OrbitControls — drag orbits, scroll zooms (5–18 units)
- Extras: world night-lights speckle (~60 cities), stars, atmosphere shader, route comet

## What this site is

Single-page portfolio for Aaradhy Sharma (AI Engineer @ ChenMed, Miami):

1. **Hero** — editorial type, contour-line backdrop
2. **01 / The Journey** — the centerpiece. A night-atlas **3D earth** (real coastlines) with
   amber city lights at the six career stops (Indore → Boston → Cambridge → Cary → Chicago →
   Miami), connected by animated great-circle arcs. **Click a city light: the earth spins that
   city to face you while the camera dives — the Google Earth move — cuts through a coordinate
   veil, and lands at street level**: a low-poly diorama of the real place (brick NEU quad with
   clocktower, Eisai lab, Cary office park in pines, Willis Tower with blinking beacons,
   ChenMed's three buildings under palms with the animated B3 → B1 "promotion hop"). A panel
   shows the chapter: role, dates, highlights, clients, and clickable GitHub repo chips.
   "Back to orbit" zooms out; arrow keys hop the route; Esc returns to orbit.
3. **02 / Selected Work** — 9 clickable project cards (all link to GitHub repos)
4. **03 / Off Duty** — scroll-driven descent, +13,500 ft skydive → −100 ft scuba, live altimeter
5. **04 / Contact** — email, GitHub, LinkedIn, toolbox, certs, education + footer

## File map

```
app/                    layout (fonts/meta), page.tsx (section order), globals.css (DESIGN SYSTEM)
data/                   ★ ALL CONTENT LIVES HERE — never hardcode content in components
  profile.ts            name, headline, email, links, skills, certs, education
  journey.ts            six stops: latLon (drives globe), buildingStyle, highlights, projectIds
  projects.ts           project cards; tier: featured | recent | archive
components/
  journey/
    JourneySection.tsx  state machine: globe ⇄ (dive/veil) ⇄ city; keyboard; chrome
    Scene.tsx           Canvas + view switch
    Globe.tsx           the earth: coastlines (world-atlas TopoJSON, bundled), graticule,
                        atmosphere shader, markers, arcs, drag-to-spin, spin+dive animation
    CityScene.tsx       street level: island, lights, orbit controls, settle-in camera
    Building.tsx        six building kits (real-place silhouettes) + island plinth
    StopPanel.tsx       chapter panel with repo chips
    FallbackTimeline.tsx no-WebGL fallback
  altitude/             skydive→scuba scroll section (built by Cursor, working — don't rebuild)
  projects/, Hero, Nav, ContactSection, VersionBadge
lib/geo.ts              lat/lon→sphere math, coastline/graticule geometry, great-circle arcs
```

## Design system — read before touching UI

"Night Atlas": deep-ink cartography, warm amber city lights. Tokens in `app/globals.css`.

- Fonts: `font-display` (Fraunces, headlines), `font-sans` (Inter), `font-mono` (IBM Plex Mono —
  labels/coords/chips). Utility classes: `.section-label`, `.hairline`, `.coord`, `.link-keyline`.
- Colors via Tailwind tokens: `bg, bg-raised, bg-panel, line, line-strong, ink, ink-dim, muted,
  amber, amber-soft, ocean, sky`. Amber is an **accent**, used sparingly.
- **Hard bans** (keeps it from looking AI-generated): no purple/blue gradient washes, no emoji,
  no glassmorphism bubbles, no rounded-3xl, no stock photos. Type does the talking.
- All external links `target="_blank" rel="noopener noreferrer"`. `prefers-reduced-motion`
  respected everywhere (globe dive becomes an instant cut).

## Deploy notes (your side)

- **Zero config**: static Next.js, no env vars, no database, no API routes. Import repo → deploy.
- Coastline data is bundled (`world-atlas` npm pkg) — no runtime fetches, works offline/edge.
- ⚠️ **Privacy**: `source-materials/` holds resumes with a personal phone number. It is
  gitignored — keep it that way. Site deliberately shows only email/GitHub/LinkedIn.
- Contact email on site: `aaradhya14sharma@gmail.com` (owner's account email; swap in
  `data/profile.ts` if he prefers the northeastern.edu one).
- Git repo is initialized but nothing committed by me — commit history is yours to manage.
- Suggested next: custom domain, OG image (`app/opengraph-image.png`, 1200×630 — screenshot of
  the globe would be perfect), maybe Vercel Analytics.

## Editing content later

- New job/city → add a stop in `data/journey.ts` (needs `latLon`; pick a `buildingStyle` or add
  a kit in `Building.tsx`) — globe, arcs, rail, keyboard nav all derive from the array.
- New project → add to `data/projects.ts`, optionally reference its id in a stop's `projectIds`.
- Do not use `Math.random()`/`Date.now()` during render — everything is prerendered; hydration
  will break. Precompute constants (see altitude section's pattern).

## Known trade-offs (deliberate, not bugs)

- Globe idle-spins very slowly (route stays framed ~1 min), so it can eventually drift until the
  user drags or clicks — authentic globe behavior; rail buttons always work.
- Dev-only Next.js badge bottom-left disappears in production builds.
- `npm audit` reports 2 moderate advisories in transitive dev tooling — not user-facing.
- ⚠️ If a dev server was started **before** `npm install` added `world-atlas`/`topojson-client`,
  it can't resolve them until restarted — restart `next dev` after pulling these changes.
  (Port 3000 on this machine is a *different* project — `profile automate/command-center`.)
