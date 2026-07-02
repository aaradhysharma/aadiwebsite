"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  SKYDIVE,
  SCUBA,
  SEA_LINE,
  CLOSING,
  CLOUD_LAYERS,
  STREAKS,
  RAYS,
  BUBBLES,
  type Hobby,
} from "./constants";

/* ————————————————————————————————————————————————
   03 / OFF DUTY — a scroll-driven descent.
   +13,500 ft freefall → sea level → −100 ft scuba.
   One sticky viewport over a 520vh track; every layer
   is keyed to scroll progress.
   ———————————————————————————————————————————————— */

function AltimeterReadout({ progress }: { progress: MotionValue<number> }) {
  const alt = useTransform(progress, [0, 0.58, 0.66, 1], [13500, 800, 0, -100]);
  const label = useTransform(alt, (v) => {
    const n = Math.round(v);
    if (n > 0) return `+${n.toLocaleString("en-US")}`;
    if (n < 0) return `−${Math.abs(n).toLocaleString("en-US")}`;
    return "0";
  });
  const phase = useTransform(progress, (p): string => {
    if (p < 0.5) return "FREEFALL — 120 MPH";
    if (p < 0.62) return "CANOPY OPEN";
    if (p < 0.7) return "SEA LEVEL";
    return "NEUTRAL BUOYANCY";
  });

  return (
    <div className="absolute right-5 top-20 z-20 text-right sm:right-8 md:top-24">
      <p className="font-mono text-[0.56rem] uppercase tracking-[0.3em] text-muted">ALTIMETER</p>
      <p className="mt-1 font-mono text-2xl tabular-nums tracking-tight text-ink md:text-4xl">
        <motion.span>{label}</motion.span>
        <span className="ml-1.5 text-sm text-muted md:text-base">FT</span>
      </p>
      <motion.p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-amber">
        {phase}
      </motion.p>
    </div>
  );
}

function HobbyBlock({
  hobby,
  progress,
  range,
}: {
  hobby: Hobby;
  progress: MotionValue<number>;
  range: [number, number, number, number];
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [40, 0, 0, -40]);
  const accent = hobby.tone === "amber" ? "text-amber" : "text-ocean";

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-5 sm:px-8"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p className={`font-mono text-[0.62rem] uppercase tracking-[0.28em] ${accent}`}>
          {hobby.eyebrow}
        </p>
        <h3 className="mt-4 font-display text-5xl tracking-tight text-ink md:text-7xl">
          {hobby.title}
        </h3>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-dim md:text-lg">
          {hobby.copy}
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {hobby.chips.map((chip) => (
            <span
              key={chip}
              className="border border-line px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function AltitudeSection() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  /* sky → sea-level → underwater crossfades */
  const skyOpacity = useTransform(scrollYProgress, [0, 0.5, 0.66], [1, 1, 0]);
  const horizonOpacity = useTransform(scrollYProgress, [0.42, 0.6, 0.7], [0, 1, 0]);
  const oceanOpacity = useTransform(scrollYProgress, [0.6, 0.74], [0, 1]);

  /* cloud strips slide up during freefall */
  const cloudShift0 = useTransform(scrollYProgress, [0, 0.62], [0, -CLOUD_LAYERS[0].travel]);
  const cloudShift1 = useTransform(scrollYProgress, [0, 0.62], [0, -CLOUD_LAYERS[1].travel]);
  const cloudShift2 = useTransform(scrollYProgress, [0, 0.62], [0, -CLOUD_LAYERS[2].travel]);
  const cloudShifts = [cloudShift0, cloudShift1, cloudShift2];
  const cloudsOpacity = useTransform(scrollYProgress, [0, 0.08, 0.52, 0.64], [0.4, 1, 1, 0]);
  const cloudY0 = useTransform(cloudShifts[0], (v) => `${v}vh`);
  const cloudY1 = useTransform(cloudShifts[1], (v) => `${v}vh`);
  const cloudY2 = useTransform(cloudShifts[2], (v) => `${v}vh`);
  const cloudYs = [cloudY0, cloudY1, cloudY2];

  /* speed streaks — race upward mid-freefall */
  const streakOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.5, 0.6], [0, 1, 1, 0]);
  const streakShift = useTransform(scrollYProgress, [0, 0.62], [0, -1]);

  /* sea line sweeps through the viewport around 0.62 */
  const seaLineY = useTransform(scrollYProgress, [0.54, 0.7], ["70vh", "-70vh"]);
  const seaLineOpacity = useTransform(scrollYProgress, [0.54, 0.6, 0.66, 0.7], [0, 1, 1, 0]);

  return (
    <section id="altitude" className="relative scroll-mt-14">
      {/* header — normal flow, before the dive */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 md:pt-36 lg:px-10">
        <p className="section-label">
          <span className="idx">03</span> / OFF DUTY
        </p>
        <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-6xl">
          The ground is negotiable.
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
          Keep scrolling — the altimeter is live.
        </p>
      </div>

      {/* the descent */}
      <div ref={trackRef} className="relative h-[520vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* backdrop crossfade layers */}
          <motion.div
            aria-hidden
            style={{ opacity: reduce ? 1 : skyOpacity }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #04060b 0%, #0a1526 58%, rgba(240,177,60,0.09) 100%)",
              }}
            />
          </motion.div>
          <motion.div aria-hidden style={{ opacity: reduce ? 0 : horizonOpacity }} className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #081020 0%, #0d1e33 55%, rgba(79,195,232,0.16) 100%)",
              }}
            />
          </motion.div>
          <motion.div aria-hidden style={{ opacity: reduce ? 0 : oceanOpacity }} className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(79,195,232,0.14) 0%, #0a2740 32%, #071d33 62%, #03101f 100%)",
              }}
            />
            {/* light rays */}
            {RAYS.map((ray, i) => (
              <div
                key={i}
                className="ray absolute top-0 h-[130%]"
                style={{
                  left: ray.left,
                  width: ray.width,
                  animationDelay: `${ray.delay}s`,
                  animationDuration: `${ray.duration}s`,
                }}
              />
            ))}
            {/* bubbles */}
            {BUBBLES.map((b, i) => (
              <div
                key={i}
                className="bubble absolute bottom-[-20px] rounded-full"
                style={
                  {
                    left: `${b.left}%`,
                    width: b.size,
                    height: b.size,
                    animationDelay: `${b.delay}s`,
                    animationDuration: `${b.duration}s`,
                    "--drift": `${b.drift}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </motion.div>

          {/* parallax clouds */}
          <motion.div aria-hidden style={{ opacity: reduce ? 0 : cloudsOpacity }} className="absolute inset-0">
            {CLOUD_LAYERS.map((layer, li) => (
              <motion.div
                key={li}
                style={{ y: reduce ? 0 : cloudYs[li] }}
                className="absolute inset-x-0 top-0 h-[240vh]"
              >
                {layer.blobs.map((blob, bi) => (
                  <div
                    key={bi}
                    className="absolute rounded-[50%]"
                    style={{
                      left: `${blob.x}%`,
                      top: `${blob.y * 2.4}vh`,
                      width: `${blob.w}vw`,
                      height: `${blob.h}vh`,
                      background: `radial-gradient(ellipse at center, rgba(185,205,234,${blob.a}) 0%, transparent 70%)`,
                    }}
                  />
                ))}
              </motion.div>
            ))}
          </motion.div>

          {/* speed streaks */}
          <motion.div aria-hidden style={{ opacity: reduce ? 0 : streakOpacity }} className="absolute inset-0">
            {STREAKS.map((s, i) => (
              <StreakLine key={i} spec={s} shift={streakShift} />
            ))}
          </motion.div>

          {/* sea line */}
          <motion.div
            aria-hidden={false}
            style={{ y: reduce ? "0vh" : seaLineY, opacity: reduce ? 0 : seaLineOpacity }}
            className="absolute inset-x-0 top-1/2 z-10"
          >
            <div className="mx-auto max-w-5xl px-5 sm:px-8">
              <div className="h-px w-full bg-ocean/50" />
              <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.26em] text-ocean">
                {SEA_LINE}
              </p>
            </div>
          </motion.div>

          {/* copy blocks */}
          <HobbyBlock hobby={SKYDIVE} progress={scrollYProgress} range={[0.05, 0.14, 0.42, 0.52]} />
          <HobbyBlock hobby={SCUBA} progress={scrollYProgress} range={[0.72, 0.8, 0.92, 0.99]} />

          <AltimeterReadout progress={scrollYProgress} />
        </div>
      </div>

      {/* closing line — back on solid ground */}
      <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 md:py-36 lg:px-10">
        <motion.blockquote
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="font-display text-3xl leading-snug tracking-tight text-ink md:text-5xl">
            {CLOSING.line}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">{CLOSING.sub}</p>
        </motion.blockquote>
      </div>
    </section>
  );
}

function StreakLine({
  spec,
  shift,
}: {
  spec: (typeof STREAKS)[number];
  shift: MotionValue<number>;
}) {
  const y = useTransform(shift, (v) => `${v * spec.travel}vh`);
  return (
    <motion.span
      style={{
        left: `${spec.left}%`,
        top: `${spec.start}vh`,
        height: `${spec.len}vh`,
        opacity: spec.alpha,
        y,
      }}
      className="absolute w-px bg-gradient-to-b from-transparent via-sky to-transparent"
    />
  );
}
