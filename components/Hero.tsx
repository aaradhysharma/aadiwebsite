"use client";

import { motion, useReducedMotion } from "framer-motion";
import { profile } from "@/data/profile";

/* Topographic contour rings — two nested clusters, right half only. */
const contours = [
  "M 430 250 C 440 200, 520 180, 570 210 C 620 240, 610 310, 560 340 C 510 370, 440 350, 425 300 C 418 280, 424 262, 430 250 Z",
  "M 390 240 C 405 170, 530 130, 610 180 C 680 225, 670 340, 590 385 C 505 430, 400 395, 378 315 C 368 282, 375 258, 390 240 Z",
  "M 350 235 C 370 140, 540 80, 650 150 C 745 212, 730 375, 620 435 C 500 495, 360 440, 335 330 C 324 288, 332 258, 350 235 Z",
  "M 560 630 C 575 585, 655 575, 695 615 C 730 650, 715 715, 660 730 C 605 745, 550 705, 552 665 C 553 650, 555 640, 560 630 Z",
  "M 515 615 C 540 540, 685 520, 750 590 C 805 650, 775 755, 685 780 C 595 805, 505 745, 505 670 C 505 648, 508 630, 515 615 Z",
  "M 470 600 C 505 490, 710 460, 800 560 C 875 645, 835 800, 705 835 C 575 870, 455 785, 455 685 C 455 655, 460 625, 470 600 Z",
];

/* City lights — a loose scatter riding the contours. */
const lights: Array<[number, number]> = [
  [480, 262],
  [556, 300],
  [608, 222],
  [640, 642],
  [700, 690],
  [592, 672],
  [522, 432],
  [678, 480],
  [434, 520],
  [728, 322],
];

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Backdrop: contours + city lights, right half */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-3/5"
      >
        <svg
          viewBox="0 0 860 900"
          className="h-full w-full"
          preserveAspectRatio="xMaxYMid slice"
          fill="none"
        >
          {contours.map((d, i) =>
            reduce ? (
              <path
                key={i}
                d={d}
                stroke="var(--line-strong)"
                strokeWidth="1"
                opacity={0.07}
              />
            ) : (
              <motion.path
                key={i}
                d={d}
                stroke="var(--line-strong)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.07 }}
                transition={{
                  duration: 2.2,
                  delay: 0.3 + i * 0.18,
                  ease: "easeInOut",
                }}
              />
            )
          )}
          {lights.map(([cx, cy], i) =>
            reduce ? (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="2"
                fill="var(--amber)"
                opacity={0.55}
              />
            ) : (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r="2"
                fill="var(--amber)"
                initial={{ opacity: 0.15 }}
                animate={{ opacity: [0.15, 0.85, 0.15] }}
                transition={{
                  duration: 3.6,
                  delay: i * 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )
          )}
        </svg>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-10"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
        }}
      >
        <motion.p
          variants={rise}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted sm:text-[0.7rem]"
        >
          AARADHY SHARMA — MIAMI, FL — 25.7617° N, 80.1918° W
        </motion.p>

        <h1 className="mt-8 font-display text-5xl leading-[1.02] tracking-tight text-ink md:text-7xl lg:text-8xl">
          <motion.span
            variants={rise}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="block"
          >
            AI agents in production.
          </motion.span>
          <motion.span
            variants={rise}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="block"
          >
            Infrastructure that <em className="italic text-amber">survives</em>{" "}
            them.
          </motion.span>
        </h1>

        <motion.p
          variants={rise}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg"
        >
          {profile.subhead}
        </motion.p>

        <motion.p
          variants={rise}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted sm:text-[0.68rem]"
        >
          {profile.focus.join(" · ")}
        </motion.p>

        <motion.div
          variants={rise}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-10 flex flex-wrap items-center gap-6 sm:gap-8"
        >
          <a
            href="#journey"
            className="border border-line-strong px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-amber transition-colors duration-300 hover:border-amber/40 hover:bg-amber-soft"
          >
            TRACE THE JOURNEY ↓
          </a>
          <a
            href={profile.links.resume}
            download="Aaradhy-Sharma-Resume.docx"
            className="border border-line px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink-dim transition-colors duration-300 hover:border-amber/50 hover:text-amber"
          >
            DOWNLOAD RESUME ↓
          </a>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="link-keyline font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink-dim hover:text-ink"
          >
            GITHUB ↗
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.3em] text-muted">
          SCROLL
        </span>
        {reduce ? (
          <span className="block h-6 w-px bg-line-strong" />
        ) : (
          <motion.span
            className="block h-6 w-px bg-line-strong"
            animate={{ opacity: [0.25, 1, 0.25], scaleY: [0.6, 1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
          />
        )}
      </div>
    </section>
  );
}
