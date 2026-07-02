/* ————————————————————————————————————————————————
   OFF DUTY / altitude descent — static configuration.
   All "random" values are precomputed so server and
   client render identically (no Math.random at render).
   ———————————————————————————————————————————————— */

export type Hobby = {
  tone: "amber" | "ocean";
  eyebrow: string;
  title: string;
  copy: string;
  chips: string[];
};

export const SKYDIVE: Hobby = {
  tone: "amber",
  eyebrow: "+13,500 FT — TERMINAL VELOCITY",
  title: "Skydiving",
  copy: "Out the door at 13,500 feet. Sixty seconds of freefall at 120 mph before the canopy opens and the world goes quiet.",
  chips: ["120 MPH", "60 SEC FREEFALL", "13,500 FT EXIT"],
};

export const SCUBA: Hobby = {
  tone: "ocean",
  eyebrow: "−100 FT — NEUTRAL BUOYANCY",
  title: "Scuba",
  copy: "Certified and happiest at depth. Different kind of silence down here — just breath, bubbles, and whatever swims past.",
  chips: ["PADI", "NITROGEN MATH", "SLOW ASCENT"],
};

export const SEA_LINE = "0 FT — sea level is just a checkpoint.";

export const CLOSING = {
  line: "Adrenaline junkie, with an audit trail.",
  sub: "The same person monitors production AI agents. Make of that what you will.",
};

/* Parallax cloud layers. Each layer is a 240vh strip of soft
   radial-gradient ellipses; `travel` is how far (vh) the strip
   slides upward across the freefall range. Bigger travel = nearer. */
export type CloudBlob = { x: number; y: number; w: number; h: number; a: number };
export type CloudLayerSpec = { travel: number; blobs: CloudBlob[] };

export const CLOUD_LAYERS: CloudLayerSpec[] = [
  {
    // far — small, dim, slow
    travel: 60,
    blobs: [
      { x: 5, y: 6, w: 30, h: 7, a: 0.05 },
      { x: 55, y: 18, w: 24, h: 6, a: 0.04 },
      { x: 25, y: 34, w: 34, h: 8, a: 0.05 },
      { x: 65, y: 52, w: 28, h: 6, a: 0.04 },
      { x: 12, y: 68, w: 30, h: 7, a: 0.05 },
    ],
  },
  {
    // mid
    travel: 115,
    blobs: [
      { x: 40, y: 4, w: 38, h: 9, a: 0.07 },
      { x: 2, y: 22, w: 44, h: 10, a: 0.06 },
      { x: 58, y: 40, w: 36, h: 9, a: 0.07 },
      { x: 18, y: 58, w: 42, h: 10, a: 0.06 },
      { x: 48, y: 74, w: 38, h: 9, a: 0.07 },
    ],
  },
  {
    // near — big, brighter, fast
    travel: 180,
    blobs: [
      { x: -8, y: 10, w: 55, h: 13, a: 0.1 },
      { x: 50, y: 28, w: 48, h: 12, a: 0.09 },
      { x: 8, y: 46, w: 58, h: 14, a: 0.1 },
      { x: 42, y: 64, w: 50, h: 12, a: 0.09 },
      { x: -4, y: 80, w: 52, h: 13, a: 0.1 },
    ],
  },
];

/* Speed streaks — thin vertical lines racing upward mid-freefall.
   left/start in %, len/travel in vh. */
export type Streak = { left: number; start: number; len: number; travel: number; alpha: number };

export const STREAKS: Streak[] = [
  { left: 10, start: 40, len: 14, travel: 260, alpha: 0.16 },
  { left: 22, start: 120, len: 10, travel: 210, alpha: 0.12 },
  { left: 31, start: 70, len: 16, travel: 300, alpha: 0.18 },
  { left: 45, start: 160, len: 12, travel: 240, alpha: 0.12 },
  { left: 54, start: 30, len: 18, travel: 320, alpha: 0.2 },
  { left: 66, start: 110, len: 11, travel: 220, alpha: 0.12 },
  { left: 75, start: 60, len: 15, travel: 280, alpha: 0.16 },
  { left: 86, start: 140, len: 12, travel: 230, alpha: 0.13 },
  { left: 93, start: 90, len: 16, travel: 300, alpha: 0.17 },
];

/* Underwater light rays — skewed translucent wedges from the surface. */
export type Ray = { left: string; width: number; delay: number; duration: number };

export const RAYS: Ray[] = [
  { left: "14%", width: 150, delay: 0, duration: 10 },
  { left: "42%", width: 220, delay: 2.4, duration: 12.5 },
  { left: "72%", width: 130, delay: 1.2, duration: 9 },
];

/* Rising bubbles — deterministic sizes/delays (hydration-safe). */
export type Bubble = { left: number; size: number; delay: number; duration: number; drift: number };

export const BUBBLES: Bubble[] = [
  { left: 6, size: 5, delay: 0.0, duration: 12, drift: 16 },
  { left: 12, size: 3, delay: 2.3, duration: 9.5, drift: -12 },
  { left: 19, size: 6, delay: 4.1, duration: 13, drift: 10 },
  { left: 26, size: 4, delay: 1.2, duration: 10, drift: -18 },
  { left: 33, size: 3, delay: 5.6, duration: 8.5, drift: 8 },
  { left: 41, size: 7, delay: 0.8, duration: 14, drift: -10 },
  { left: 48, size: 4, delay: 3.4, duration: 9, drift: 14 },
  { left: 55, size: 5, delay: 6.2, duration: 12.5, drift: -8 },
  { left: 62, size: 3, delay: 2.0, duration: 8, drift: 12 },
  { left: 69, size: 6, delay: 4.8, duration: 13.5, drift: -16 },
  { left: 76, size: 4, delay: 1.6, duration: 10.5, drift: 10 },
  { left: 83, size: 5, delay: 5.2, duration: 11.5, drift: -12 },
  { left: 90, size: 3, delay: 0.4, duration: 9, drift: 18 },
  { left: 95, size: 4, delay: 3.0, duration: 11, drift: -6 },
];
