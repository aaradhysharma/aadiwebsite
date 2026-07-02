"use client";

import { motion, useReducedMotion } from "framer-motion";
import { projects, type Project } from "@/data/projects";

const featured = projects.filter((p) => p.tier === "featured");
const recent = projects.filter((p) => p.tier === "recent");
const archive = projects.filter((p) => p.tier === "archive");

/* ————————————————————————————————————————————————
   Bespoke flourishes for the two featured cards.
   Inline SVG, very low opacity, warms slightly on hover.
   ———————————————————————————————————————————————— */

function WaveformFlourish() {
  // Call-waveform / phone-line motif for Clara VoiceOps
  const bars = [8, 18, 11, 26, 15, 32, 20, 12, 24, 9, 17, 6];
  return (
    <svg
      viewBox="0 0 140 60"
      aria-hidden="true"
      className="pointer-events-none absolute right-5 top-5 h-12 w-28 text-ink opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.22] group-hover:text-amber"
    >
      <line x1="0" y1="30" x2="140" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={6 + i * 11}
          y={30 - h / 2}
          width="2.5"
          height={h}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function FloorPlanFlourish() {
  // Minimal house / floor-plan grid motif for Property Management
  return (
    <svg
      viewBox="0 0 140 70"
      aria-hidden="true"
      className="pointer-events-none absolute right-5 top-5 h-14 w-28 text-ink opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.22] group-hover:text-amber"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {/* roofline */}
        <path d="M20 28 L70 6 L120 28" />
        {/* outer walls */}
        <rect x="28" y="28" width="84" height="38" />
        {/* interior floor-plan partitions */}
        <line x1="62" y1="28" x2="62" y2="52" />
        <line x1="62" y1="52" x2="112" y2="52" />
        <line x1="86" y1="28" x2="86" y2="52" />
        {/* door swing */}
        <path d="M62 66 A14 14 0 0 1 48 52" strokeDasharray="2 3" />
      </g>
    </svg>
  );
}

const flourishes: Record<string, () => React.ReactElement> = {
  "clara-voiceops": WaveformFlourish,
  "property-management": FloorPlanFlourish,
};

/* ———————————————————————————————————————————————— */

function TechChips({ tech, className = "" }: { tech: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {tech.map((t) => (
        <li
          key={t}
          className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="font-mono text-sm text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber"
    >
      ↗
    </span>
  );
}

type RiseProps = {
  index?: number;
  children: React.ReactNode;
  className?: string;
};

function Rise({ index = 0, children, className }: RiseProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ———————————————————————————————————————————————— */

function FeaturedCard({ project, index }: { project: Project; index: number }) {
  const Flourish = flourishes[project.id];
  return (
    <Rise index={index} className="h-full">
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hairline group relative flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber/40 md:p-9"
      >
        {Flourish ? <Flourish /> : null}
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            {project.era}
          </p>
          <Arrow />
        </div>
        <h3 className="mt-6 font-display text-2xl leading-tight text-ink md:text-3xl">
          {project.name}
        </h3>
        <p className="mt-2 font-display text-base italic leading-snug text-ink-dim">
          {project.tagline}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">{project.description}</p>
        <TechChips tech={project.tech} className="mt-auto pt-6" />
      </a>
    </Rise>
  );
}

function RecentCard({ project, index }: { project: Project; index: number }) {
  return (
    <Rise index={index} className="h-full">
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hairline group flex h-full flex-col p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber/40"
      >
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            {project.era}
          </p>
          <Arrow />
        </div>
        <h3 className="mt-4 font-display text-lg leading-snug text-ink">{project.name}</h3>
        <p className="mt-1.5 text-sm leading-snug text-ink-dim">{project.tagline}</p>
        <TechChips tech={project.tech.slice(0, 4)} className="mt-auto pt-5" />
      </a>
    </Rise>
  );
}

function ArchiveCard({ project, index }: { project: Project; index: number }) {
  return (
    <Rise index={index}>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-baseline justify-between gap-4 border-b border-line py-4 transition-colors duration-300 hover:border-line-strong sm:gap-6"
      >
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">
            {project.era}
          </span>
          <span className="font-display text-base text-ink-dim transition-colors duration-300 group-hover:text-ink">
            {project.name}
          </span>
          <span className="hidden text-sm text-muted md:inline">{project.tagline}</span>
        </div>
        <Arrow />
      </a>
    </Rise>
  );
}

/* ———————————————————————————————————————————————— */

export default function ProjectsSection() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-28 md:px-8 md:py-40">
      {/* Header */}
      <Rise>
        <p className="section-label">
          <span className="idx">02</span> / SELECTED WORK
        </p>
        <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-ink md:text-6xl">
          Shipped on nights and&nbsp;weekends.
        </h2>
        <p className="mt-5 text-sm text-muted">
          Click any card — everything links to the repo.
        </p>
      </Rise>

      {/* Featured */}
      <div className="mt-16 grid gap-5 md:grid-cols-2 md:gap-6">
        {featured.map((p, i) => (
          <FeaturedCard key={p.id} project={p} index={i} />
        ))}
      </div>

      {/* Recent */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 md:mt-6 md:gap-6 lg:grid-cols-3">
        {recent.map((p, i) => (
          <RecentCard key={p.id} project={p} index={i} />
        ))}
      </div>

      {/* Archive */}
      <div className="mt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted/70">
          From the Northeastern archive — 2020–2022
        </p>
        <div className="mt-4">
          {archive.map((p, i) => (
            <ArchiveCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>

      {/* Footer link */}
      <Rise className="mt-14">
        <a
          href="https://github.com/aaradhysharma"
          target="_blank"
          rel="noopener noreferrer"
          className="link-keyline font-mono text-xs uppercase tracking-[0.18em] text-ink-dim hover:text-amber"
        >
          All 29 repositories on GitHub ↗
        </a>
      </Rise>
    </section>
  );
}
