# Aaradhy Sharma — Portfolio

Personal portfolio for Aaradhy Sharma, AI Engineer at ChenMed. A "night atlas" of the journey from Indore → Northeastern (Boston) → Eisai (Cambridge) → Zifo (Cary, Chicago) → ChenMed (Miami): a 3D earth with real coastlines where clicking a city light spins the globe to face it and dives to a street-level diorama of the real place (Google Earth style), plus a scroll-driven skydive-to-scuba hobbies section.

> Working handoff notes for the Claude Code ⇄ Cursor collaboration live in [HANDOVER.md](HANDOVER.md).

## Stack

- **Next.js 15** (App Router, TypeScript strict) — static, no database, no env vars
- **three.js / @react-three/fiber / drei** — the 3D globe and street-level scenes
- **world-atlas + topojson-client** — bundled real coastlines (no runtime fetches)
- **framer-motion** — scroll choreography and micro-interactions
- **Tailwind CSS v4** — design tokens in `app/globals.css`

## Structure

```
app/            layout (fonts, metadata), page, globals.css (design system)
components/
  journey/      3D earth: globe, spin-and-dive camera, street-level building kits, stop panel
  altitude/     scroll-driven +13,500 ft → −100 ft hobbies section
  projects/     clickable project cards (all link to GitHub repos)
  Hero.tsx, Nav.tsx, ContactSection.tsx
data/           single source of truth: profile.ts, journey.ts, projects.ts
```

All site content (career stops, projects, skills) lives in `data/` — edit there, never in components.

## Run locally

```bash
npm install
npm run dev
```

## Deployment (Vercel)

Zero configuration: standard `next build`, fully static output, no environment variables, no database. Import the repo in Vercel and deploy.

> **Note:** `source-materials/` (resume documents with personal contact info) is gitignored on purpose — do not commit or deploy it.
