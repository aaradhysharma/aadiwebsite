"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { stops, type Stop } from "@/data/journey";
import { byId } from "@/data/projects";

type StopPanelProps = {
  stop: Stop | null;
  onNavigate: (id: string) => void;
  onClose: () => void;
};

export default function StopPanel({ stop, onNavigate, onClose }: StopPanelProps) {
  // On phones the panel starts collapsed so the building stays visible;
  // desktop (md+) always shows the full rail.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [stop?.id]);

  return (
    <AnimatePresence mode="wait">
      {stop && (
        <motion.aside
          key={stop.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={
            {
              "--accent": stop.accent,
              "--accent-soft": stop.accentSoft,
            } as React.CSSProperties
          }
          className="pointer-events-none flex max-h-full w-full flex-col gap-2 md:w-[26rem]"
        >
          {/* header card — tap anywhere on it to expand/collapse on phones */}
          <div
            onClick={() => setExpanded((v) => !v)}
            className="pointer-events-auto flex cursor-pointer items-start justify-between gap-4 border border-line bg-bg-panel/60 px-5 pb-3.5 pt-4 backdrop-blur-[3px] md:cursor-default md:px-6 md:pb-4 md:pt-5"
          >
            <div className="min-w-0">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-[var(--accent)]">
                {String(stop.index).padStart(2, "0")} / {stop.city.toUpperCase()} —{" "}
                {stop.region.toUpperCase()}
              </p>
              <p className="coord mt-1.5">{stop.coords}</p>
              <p className="mt-1.5 truncate font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-dim md:hidden">
                {stop.org} — {stop.role}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                aria-expanded={expanded}
                className="border border-line px-2.5 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink-dim transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] md:hidden"
              >
                {expanded ? "HIDE ▾" : "DETAILS ▴"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Close panel"
                className="font-mono text-sm text-muted transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>
          </div>

          {/* body — a scrollable stack of small translucent cards; the scene
              stays visible through them and between the gaps */}
          <div
            className={`pointer-events-auto min-h-0 flex-1 overflow-y-auto md:block ${
              expanded ? "block" : "hidden"
            }`}
          >
            <div className="flex flex-col gap-2">
              {/* chapter card */}
              <div className="border border-line bg-bg-panel/60 px-5 py-4 backdrop-blur-[3px] md:px-6">
                <h3 className="font-display text-2xl leading-tight text-ink">{stop.chapter}</h3>
                <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-dim">
                  {stop.org} — {stop.role}
                </p>
                <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted">
                  {stop.dates}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">{stop.summary}</p>
              </div>

              {/* highlights card */}
              <div className="border border-line bg-bg-panel/60 px-5 py-4 backdrop-blur-[3px] md:px-6">
                <ul className="space-y-2.5">
                  {stop.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-[0.82rem] leading-relaxed text-muted">
                      <span aria-hidden className="mt-0.5 select-none text-[var(--accent)]">
                        —
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {stop.clients && (
                <div className="border border-line bg-bg-panel/60 px-5 py-4 backdrop-blur-[3px] md:px-6">
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-muted">
                    CLIENTS
                  </p>
                  <ul className="mt-2 space-y-1">
                    {stop.clients.map((c) => (
                      <li key={c} className="font-mono text-[0.66rem] tracking-[0.08em] text-ink-dim">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {stop.projectIds && stop.projectIds.length > 0 && (
                <div className="border border-line bg-bg-panel/60 px-5 py-4 backdrop-blur-[3px] md:px-6">
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-muted">
                    SHIPPED HERE — CLICK TO OPEN REPO
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stop.projectIds.map((pid) => {
                      const project = byId[pid];
                      if (!project) return null;
                      return (
                        <a
                          key={pid}
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group border border-line px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-dim transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-ink"
                        >
                          {project.name}{" "}
                          <span className="text-muted transition-colors group-hover:text-[var(--accent)]">↗</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* prev / next card */}
          <div className="pointer-events-auto flex items-center justify-between border border-line bg-bg-panel/60 px-6 py-3.5 backdrop-blur-[3px]">
            {stop.index > 1 ? (
              <button
                onClick={() => onNavigate(stops[stop.index - 2].id)}
                className="link-keyline font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-dim transition-colors hover:text-ink"
              >
                ← {stops[stop.index - 2].city}
              </button>
            ) : (
              <span />
            )}
            {stop.index < stops.length ? (
              <button
                onClick={() => onNavigate(stops[stop.index].id)}
                className="link-keyline font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--accent)] transition-colors hover:text-ink"
              >
                {stops[stop.index].city} →
              </button>
            ) : (
              <span />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
