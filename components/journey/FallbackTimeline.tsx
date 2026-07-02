import { stops } from "@/data/journey";
import { byId } from "@/data/projects";

/** Plain vertical timeline shown when WebGL isn't available. */
export default function FallbackTimeline() {
  return (
    <div className="relative border-l border-line-strong pl-8 md:pl-12">
      {stops.map((stop) => (
        <article key={stop.id} className="relative pb-14 last:pb-0">
          <span
            aria-hidden
            className="absolute -left-[2.05rem] top-1.5 h-2 w-2 rounded-full bg-amber md:-left-[3.05rem]"
          />
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-amber">
            {String(stop.index).padStart(2, "0")} / {stop.city.toUpperCase()} — {stop.dates}
          </p>
          <h3 className="mt-2 font-display text-2xl text-ink">{stop.chapter}</h3>
          <p className="mt-1 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-dim">
            {stop.org} — {stop.role}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{stop.summary}</p>
          <ul className="mt-4 space-y-2">
            {stop.highlights.map((h) => (
              <li key={h} className="flex max-w-2xl gap-3 text-[0.82rem] leading-relaxed text-muted">
                <span aria-hidden className="mt-0.5 select-none text-amber">
                  —
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
          {stop.projectIds && (
            <div className="mt-4 flex flex-wrap gap-2">
              {stop.projectIds.map((pid) => {
                const project = byId[pid];
                if (!project) return null;
                return (
                  <a
                    key={pid}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-line px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-dim transition-colors hover:border-amber/50 hover:text-ink"
                  >
                    {project.name} ↗
                  </a>
                );
              })}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
