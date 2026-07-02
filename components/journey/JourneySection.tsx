"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { stops } from "@/data/journey";
import StopPanel from "./StopPanel";
import FallbackTimeline from "./FallbackTimeline";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="coord animate-pulse tracking-[0.3em]">PLOTTING ROUTE…</p>
    </div>
  );
}

export default function JourneySection() {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      setWebglOk(Boolean(gl));
    } catch {
      setWebglOk(false);
    }
  }, []);

  const selected = stops.find((s) => s.id === selectedId) ?? null;

  return (
    <section id="journey" className="scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-10">
        <p className="section-label">
          <span className="idx">01</span> / THE JOURNEY
        </p>
        <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-6xl">
          Six years, six cities, one&nbsp;route.
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
          Indore to Miami by way of Boston, Cambridge, Cary, and Chicago. Each building is a
          chapter — click one. Drag to orbit.
        </p>
      </div>

      {webglOk === false ? (
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-10">
          <FallbackTimeline />
        </div>
      ) : (
        <>
          <div className="relative mx-auto h-[76vh] min-h-[540px] max-w-[110rem] overflow-hidden border-y border-line md:mx-4 md:border lg:mx-8">
            {webglOk === null ? (
              <MapPlaceholder />
            ) : (
              <Scene
                selectedId={selectedId}
                onSelect={setSelectedId}
                reducedMotion={Boolean(reduce)}
              />
            )}

            {/* corner readouts — cartography chrome */}
            <div className="pointer-events-none absolute left-4 top-4 hidden font-mono text-[0.58rem] uppercase tracking-[0.24em] text-muted sm:block">
              NIGHT ATLAS — CAREER ROUTE v1
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 hidden font-mono text-[0.58rem] uppercase tracking-[0.24em] text-muted sm:block">
              {selected
                ? `${selected.coords} — ${selected.org.toUpperCase()}`
                : "CLICK A BUILDING TO OPEN A CHAPTER"}
            </div>

            {/* stop panel — right rail on desktop, bottom sheet on mobile */}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 top-auto z-20 flex max-h-[72%] md:inset-y-4 md:left-auto md:right-4 md:max-h-none md:items-stretch">
              <StopPanel
                stop={selected}
                onNavigate={(id) => setSelectedId(id)}
                onClose={() => setSelectedId(null)}
              />
            </div>
          </div>

          {/* quick-jump strip — keyboard & mobile friendly */}
          <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-10">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {stops.map((stop) => (
                <button
                  key={stop.id}
                  onClick={() => setSelectedId(stop.id === selectedId ? null : stop.id)}
                  className={`link-keyline font-mono text-[0.62rem] uppercase tracking-[0.18em] transition-colors ${
                    selectedId === stop.id ? "text-amber" : "text-muted hover:text-ink"
                  }`}
                >
                  {String(stop.index).padStart(2, "0")} {stop.city}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
