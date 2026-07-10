"use client";

import { Component, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { stops, type Stop } from "@/data/journey";
import StopPanel from "./StopPanel";
import FallbackTimeline from "./FallbackTimeline";
import type { JourneyView } from "./Scene";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="coord animate-pulse tracking-[0.3em]">SPINNING UP THE EARTH…</p>
    </div>
  );
}

/** If the 3D scene (or its chunk) ever fails, degrade to the timeline instead of a void. */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="h-full w-full overflow-y-auto px-4 py-8 sm:px-8">
          <p className="coord mb-6 tracking-[0.3em]">3D VIEW UNAVAILABLE — FLAT ROUTE</p>
          <FallbackTimeline />
        </div>
      );
    }
    return this.props.children;
  }
}

type Veil = { stop: Stop; mode: "dive" | "return" } | null;

export default function JourneySection() {
  const reduce = Boolean(useReducedMotion());
  const [view, setView] = useState<JourneyView>("globe");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [originId, setOriginId] = useState<string | null>(null);
  const [veil, setVeil] = useState<Veil>(null);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useRef(false);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

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
  const busy = focusId !== null || veil !== null;

  /** Globe finished most of the dive — raise the veil. */
  const handleAlmostArrived = useCallback((id: string) => {
    const stop = stops.find((s) => s.id === id);
    if (stop) setVeil({ stop, mode: "dive" });
  }, []);

  /** Globe finished the dive — cut to street level under the veil. */
  const handleArrived = useCallback(
    (id: string) => {
      setView("city");
      setSelectedId(id);
      setFocusId(null);
      setOriginId(null);
      later(() => setVeil(null), reduce ? 120 : 380);
    },
    [later, reduce]
  );

  /** Fly to a stop from wherever we are. */
  const flyTo = useCallback(
    (id: string) => {
      if (busy) return;
      if (view === "globe") {
        setFocusId(id);
        return;
      }
      if (id === selectedId) return;
      // city → city: veil up, cut back to orbit above the old city, dive again
      const target = stops.find((s) => s.id === id);
      const origin = selectedId;
      if (!target) return;
      setVeil({ stop: target, mode: "dive" });
      later(() => {
        setOriginId(origin);
        setSelectedId(null);
        setView("globe");
        setVeil(null);
        later(() => setFocusId(id), reduce ? 60 : 420);
      }, reduce ? 80 : 300);
    },
    [busy, view, selectedId, later, reduce]
  );

  /** Leave street level, zoom back out to the spinning earth. */
  const goOrbit = useCallback(() => {
    if (view !== "city" || !selected || veil) return;
    const origin = selectedId;
    setVeil({ stop: selected, mode: "return" });
    later(() => {
      setOriginId(origin);
      setSelectedId(null);
      setView("globe");
      later(() => setVeil(null), reduce ? 80 : 260);
    }, reduce ? 80 : 300);
  }, [view, selected, selectedId, veil, later, reduce]);

  // keyboard: arrows hop the route, escape returns to orbit — only while on screen
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
      },
      { threshold: 0.25 }
    );
    observer.observe(section);

    const onKey = (e: KeyboardEvent) => {
      if (!inView.current || busy) return;
      if (e.key === "Escape" && view === "city") {
        goOrbit();
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const current = stops.find((s) => s.id === (selectedId ?? focusId));
      let nextIndex: number;
      if (!current) {
        nextIndex = e.key === "ArrowRight" ? 0 : stops.length - 1;
      } else {
        nextIndex = current.index - 1 + (e.key === "ArrowRight" ? 1 : -1);
        if (nextIndex < 0 || nextIndex >= stops.length) return;
      }
      flyTo(stops[nextIndex].id);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [busy, view, selectedId, focusId, flyTo, goOrbit]);

  const focusStop = stops.find((s) => s.id === focusId);

  return (
    <section id="journey" ref={sectionRef} className="scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-10">
        <p className="section-label">
          <span className="idx">01</span> / THE JOURNEY
        </p>
        <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-6xl">
          Six years, six cities, one&nbsp;route.
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
          {view === "globe"
            ? "Indore to Miami the long way. Click a city light — the earth will take you there. Drag to spin it yourself."
            : "Street level. Drag to orbit, scroll to zoom — or head back to orbit for the next stop."}
        </p>
      </div>

      {webglOk === false ? (
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-10">
          <FallbackTimeline />
        </div>
      ) : (
        <>
          <div className="relative mx-auto h-[78vh] min-h-[560px] max-w-[110rem] overflow-hidden border-y border-line md:mx-4 md:border lg:mx-8">
            {webglOk === null ? (
              <MapPlaceholder />
            ) : (
              <SceneErrorBoundary>
                <Scene
                  view={view}
                  selectedId={selectedId}
                  focusId={focusId}
                  originId={originId}
                  onSelect={flyTo}
                  onAlmostArrived={handleAlmostArrived}
                  onArrived={handleArrived}
                  reducedMotion={reduce}
                  interactive={view === "globe" && !busy}
                />
              </SceneErrorBoundary>
            )}

            {/* corner readouts — cartography chrome */}
            <div className="pointer-events-none absolute left-4 top-4 hidden font-mono text-[0.58rem] uppercase tracking-[0.24em] text-muted sm:block">
              NIGHT ATLAS — CAREER ROUTE v2
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 hidden font-mono text-[0.58rem] uppercase tracking-[0.24em] text-muted sm:block">
              {view === "city" && selected
                ? `${selected.coords} — ${selected.org.toUpperCase()}`
                : focusStop
                  ? `EN ROUTE — ${focusStop.city.toUpperCase()}`
                  : "DRAG TO SPIN — CLICK A CITY LIGHT TO FLY"}
            </div>
            <div className="pointer-events-none absolute bottom-4 right-4 hidden font-mono text-[0.58rem] uppercase tracking-[0.24em] text-muted/80 sm:block">
              {view === "globe"
                ? "SCROLL / PINCH — ZOOM · DRAG — SPIN · ← → KEYS — HOP"
                : "SCROLL — ZOOM · DRAG — ORBIT · ESC — BACK"}
            </div>

            {/* back to orbit */}
            <AnimatePresence>
              {view === "city" && (
                <motion.button
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  onClick={goOrbit}
                  className="absolute left-1/2 top-4 z-20 -translate-x-1/2 border border-line bg-bg/70 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-dim backdrop-blur-sm transition-colors hover:border-amber/50 hover:text-amber md:left-auto md:right-4 md:translate-x-0"
                >
                  ← BACK TO ORBIT
                </motion.button>
              )}
            </AnimatePresence>

            {/* stop panel — right rail on desktop, bottom sheet on mobile */}
            {view === "city" && (
              <div className="pointer-events-none absolute inset-x-3 bottom-3 top-auto z-20 flex max-h-[58%] md:inset-y-4 md:left-auto md:right-4 md:max-h-none md:items-stretch">
                <StopPanel stop={selected} onNavigate={flyTo} onClose={goOrbit} />
              </div>
            )}

            {/* the veil — the cut in the middle of the Google Earth move */}
            <AnimatePresence>
              {veil && (
                <motion.div
                  key={`${veil.stop.id}-${veil.mode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.05 : veil.mode === "dive" ? 0.2 : 0.24 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2.5 bg-bg"
                >
                  {veil.mode === "dive" ? (
                    <>
                      <p className="coord tracking-[0.3em]">{veil.stop.coords}</p>
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-amber">
                        {veil.stop.city} — {veil.stop.org}
                      </p>
                    </>
                  ) : (
                    <p className="coord tracking-[0.3em]">RETURNING TO ORBIT</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* quick-jump strip — keyboard & mobile friendly */}
          <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-10">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {stops.map((stop) => {
                const active = selectedId === stop.id || focusId === stop.id;
                return (
                  <button
                    key={stop.id}
                    onClick={() => flyTo(stop.id)}
                    disabled={busy && !active}
                    className={`link-keyline font-mono text-[0.62rem] uppercase tracking-[0.18em] transition-colors disabled:opacity-50 ${
                      active ? "text-amber" : "text-muted hover:text-ink"
                    }`}
                  >
                    {String(stop.index).padStart(2, "0")} {stop.city}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
