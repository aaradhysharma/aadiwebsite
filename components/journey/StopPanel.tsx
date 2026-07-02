"use client";

import { AnimatePresence, motion } from "framer-motion";
import { stops, type Stop } from "@/data/journey";
import { byId } from "@/data/projects";

type StopPanelProps = {
  stop: Stop | null;
  onNavigate: (id: string) => void;
  onClose: () => void;
};

export default function StopPanel({ stop, onNavigate, onClose }: StopPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {stop && (
        <motion.aside
          key={stop.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto flex max-h-full w-full flex-col overflow-hidden border border-line bg-bg-panel/95 backdrop-blur-md md:w-[26rem]"
        >
          {/* header */}
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 pb-4 pt-5">
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-amber">
                {String(stop.index).padStart(2, "0")} / {stop.city.toUpperCase()} —{" "}
                {stop.region.toUpperCase()}
              </p>
              <p className="coord mt-1.5">{stop.coords}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="font-mono text-sm text-muted transition-colors hover:text-ink"
            >
              ✕
            </button>
          </div>

          {/* body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <h3 className="font-display text-2xl leading-tight text-ink">{stop.chapter}</h3>
            <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-dim">
              {stop.org} — {stop.role}
            </p>
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted">
              {stop.dates}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-ink-dim">{stop.summary}</p>

            <ul className="mt-5 space-y-2.5">
              {stop.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[0.82rem] leading-relaxed text-muted">
                  <span aria-hidden className="mt-0.5 select-none text-amber">
                    —
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            {stop.clients && (
              <div className="mt-5 border-t border-line pt-4">
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
              <div className="mt-5 border-t border-line pt-4">
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
                        className="group border border-line px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-dim transition-colors hover:border-amber/50 hover:bg-amber-soft hover:text-ink"
                      >
                        {project.name}{" "}
                        <span className="text-muted transition-colors group-hover:text-amber">↗</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* prev / next */}
          <div className="flex items-center justify-between border-t border-line px-6 py-3.5">
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
                className="link-keyline font-mono text-[0.62rem] uppercase tracking-[0.18em] text-amber transition-colors hover:text-ink"
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
