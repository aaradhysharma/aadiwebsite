export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  url: string;
  /** featured = big card, recent = standard grid, archive = compact NEU-era card */
  tier: "featured" | "recent" | "archive";
  era: string;
};

export const projects: Project[] = [
  {
    id: "clara-voiceops",
    name: "Clara VoiceOps",
    tagline: "An AI voice agent that phones patients — in their doctor's voice",
    description:
      "Staff click a button, Twilio places a real outbound call, Gemini holds the two-way conversation, and ElevenLabs speaks in a cloned voice of the actual provider. Guardrails block medical advice; every turn is audit-logged to Postgres. Ships with Docker, Kubernetes + ArgoCD GitOps, and Terraform — production plumbing, not a demo script.",
    tech: ["FastAPI", "Twilio", "Gemini", "ElevenLabs", "Kubernetes", "Terraform"],
    url: "https://github.com/aaradhysharma/claradocpharma",
    tier: "featured",
    era: "2026 · Miami",
  },
  {
    id: "property-management",
    name: "Happy Everyday Property Management",
    tagline: "AI does the property inspections, the pricing, and the dispatch",
    description:
      "A full property-management platform where GPT-4V reads inspection photos to detect damage and estimate repair costs, Claude writes the market intelligence, and a dispatch engine routes contractors. Next.js dashboard over a FastAPI/Django backend with Celery workers, Postgres, and Redis — plus a live BI board for occupancy, NOI, and cash flow.",
    tech: ["Next.js", "GPT-4V", "Claude", "FastAPI", "Django", "Celery"],
    url: "https://github.com/aaradhysharma/happyeverydaypropertymanagement",
    tier: "featured",
    era: "2026 · Miami",
  },
  {
    id: "rag-zifo",
    name: "RAG-zifo",
    tagline: "Local-first RAG over a folder of anything",
    description:
      "Point it at a folder of PDFs, Word docs, spreadsheets, and HTML — it chunks sentence-aware, embeds via Gemini, and serves cited answers from SQLite vectors. Incremental re-indexing by SHA-256, rate-limit retries, and a cosine fallback when sqlite-vec won't build. No cloud database, no telemetry.",
    tech: ["TypeScript", "React 19", "Express", "sqlite-vec", "Gemini"],
    url: "https://github.com/aaradhysharma/RAG-zifo",
    tier: "recent",
    era: "2026",
  },
  {
    id: "multillm",
    name: "multillm",
    tagline: "Ask four LLMs at once, keep the best answer",
    description:
      "A Python CLI that fans a prompt out to GPT-4, Claude, Gemini, and Command-R concurrently, then runs GPT-4 as judge to merge the strongest parts into one answer. Rich terminal UI, interactive mode, per-provider failure handling.",
    tech: ["Python", "OpenAI", "Anthropic", "Gemini", "Cohere"],
    url: "https://github.com/aaradhysharma/multillm",
    tier: "recent",
    era: "2025",
  },
  {
    id: "alert-dispatcher",
    name: "alert-dispatcher",
    tagline: "Notification routing with retries and PII masking",
    description:
      "A FastAPI service that routes events to email and Slack by per-user channel preference and mute state. Failed sends land in a SQLite retry queue; PII is masked before anything leaves. Cleanly layered with pytest, ruff, and CI on every commit.",
    tech: ["Python", "FastAPI", "SQLite", "pytest", "GitHub Actions"],
    url: "https://github.com/aaradhysharma/alert-dispatcher",
    tier: "recent",
    era: "2026",
  },
  {
    id: "ergowellness",
    name: "ErgoWellness",
    tagline: "Desk-health monitor on web, desktop, and mobile — one monorepo",
    description:
      "Break reminders, guided stretches, ergonomic assessments, and pain tracking with gamified streaks — shipped to web (Vercel), desktop (Electron), and Android (Expo) from a shared component layer. All health data stays on-device.",
    tech: ["React", "Electron", "React Native", "SQLite", "Tailwind"],
    url: "https://github.com/aaradhysharma/recovery_buddy",
    tier: "recent",
    era: "2025",
  },
  {
    id: "goi-schemes",
    name: "GOI Schemes Finder",
    tagline: "Find the Indian government scheme you actually qualify for",
    description:
      "A Next.js app for searching Government of India welfare schemes, backed by Prisma with real SQL migrations. Live on Vercel.",
    tech: ["Next.js", "TypeScript", "Prisma", "Vercel"],
    url: "https://github.com/aaradhysharma/goi-schemes-finder",
    tier: "recent",
    era: "2026",
  },
  {
    id: "northeastern-projects",
    name: "Northeastern Projects",
    tagline: "Two years of graduate data engineering, archived",
    description:
      "Course-by-course archive of the master's — data engineering, ML, and information systems work across 7+ graduate courses, Fall 2020 through Summer 2022.",
    tech: ["Python", "Jupyter", "Data Engineering"],
    url: "https://github.com/aaradhysharma/NortheasternProjects",
    tier: "archive",
    era: "2020 – 2022 · NEU",
  },
  {
    id: "imdb-warehouse",
    name: "IMDB Data Warehouse",
    tagline: "Dimensional modeling coursework on the IMDB dataset",
    description:
      "Data architecture & business intelligence course project: designing a warehouse over the IMDB dataset.",
    tech: ["Data Warehousing", "BI"],
    url: "https://github.com/aaradhysharma/Designing_data_arch_busn_intel",
    tier: "archive",
    era: "2021 · NEU",
  },
];

export const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
