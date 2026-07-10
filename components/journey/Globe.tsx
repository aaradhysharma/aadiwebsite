"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { stops, type Stop } from "@/data/journey";
import {
  latLonToVector3,
  buildCoastlineGeometry,
  buildGraticuleGeometry,
  greatCircleArc,
} from "@/lib/geo";

/* ————————————————————————————————————————————————
   Night-atlas earth. Idle: slow spin, drag to steer.
   Click a marker: the globe rotates the city to face
   the camera (north up) while the camera dives —
   the Google Earth move.
   ———————————————————————————————————————————————— */

const R = 1;
/** Camera sits on this ray; fly-to rotates the target city onto it. */
const VIEW_DIR = new THREE.Vector3(0, 0.16, 0.99).normalize();
const IDLE_DIST = 2.85;
const DIVE_DIST = 1.3;
/** User zoom range (mouse wheel / pinch). */
const MIN_DIST = 1.5;
const MAX_DIST = 5.4;
const FLY_SECONDS = 1.75;
/** Progress at which the parent should raise the veil (we're moving fast by then). */
const VEIL_AT = 0.86;

const AMBER = "#f0b13c";

/** Faint night-lights — the rest of the world going about its evening. */
const WORLD_CITIES: [number, number][] = [
  [35.7, 139.7], [28.6, 77.2], [31.2, 121.5], [-23.55, -46.63], [19.4, -99.1],
  [30.0, 31.2], [19.1, 72.9], [39.9, 116.4], [23.8, 90.4], [34.7, 135.5],
  [40.7, -74.0], [24.9, 67.0], [-34.6, -58.4], [41.0, 28.9], [22.6, 88.4],
  [6.5, 3.4], [51.5, -0.13], [34.05, -118.24], [48.85, 2.35], [55.76, 37.62],
  [13.76, 100.5], [-6.2, 106.8], [37.57, 126.98], [-1.29, 36.82], [-26.2, 28.05],
  [-33.87, 151.21], [-37.81, 144.96], [1.35, 103.82], [25.2, 55.27], [24.71, 46.68],
  [35.69, 51.39], [40.42, -3.7], [41.9, 12.5], [52.52, 13.4], [43.65, -79.38],
  [49.28, -123.12], [37.77, -122.42], [47.61, -122.33], [39.74, -104.99],
  [29.76, -95.37], [33.75, -84.39], [38.9, -77.04], [-12.05, -77.04],
  [4.71, -74.07], [-33.45, -70.67], [-22.91, -43.17], [33.57, -7.59],
  [5.6, -0.19], [9.02, 38.75], [22.32, 114.17], [14.6, 120.98], [10.82, 106.63],
  [-31.95, 115.86], [-36.85, 174.76], [21.31, -157.86], [61.22, -149.9],
  [64.15, -21.94], [59.91, 10.75], [52.23, 21.01], [37.98, 23.73],
];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Rotation that puts the stop's location at VIEW_DIR with north up. */
function targetQuaternionFor(stop: Stop): THREE.Quaternion {
  const d = latLonToVector3(stop.latLon[0], stop.latLon[1], 1).normalize();
  const upWorld = new THREE.Vector3(0, 1, 0);

  // local basis at the marker: outward, north-tangent, east
  const tLocal = upWorld
    .clone()
    .sub(d.clone().multiplyScalar(upWorld.dot(d)))
    .normalize();
  const sLocal = new THREE.Vector3().crossVectors(d, tLocal);

  // world basis at the camera ray: forward, up-tangent, right
  const f = VIEW_DIR.clone();
  const n = upWorld.clone().sub(f.clone().multiplyScalar(upWorld.dot(f))).normalize();
  const e = new THREE.Vector3().crossVectors(f, n);

  const local = new THREE.Matrix4().makeBasis(d, tLocal, sLocal);
  const world = new THREE.Matrix4().makeBasis(f, n, e);
  const rot = world.multiply(local.transpose());
  return new THREE.Quaternion().setFromRotationMatrix(rot);
}

/* ———————————————————————— atmosphere ———————————————————————— */

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
    vec3 glow = vec3(0.23, 0.42, 0.64) * intensity;
    gl_FragColor = vec4(glow, intensity * 0.9);
  }
`;

/* ———————————————————————— city marker ———————————————————————— */

/** Tiny building silhouettes standing on the globe — one kit per stop style.
    Local frame: x/y on the ground, +z points away from the earth's core.
    p = [x, y] footprint offset · s = [width, depth, height] */
const MINI_KITS: Record<Stop["buildingStyle"], Array<{ p: [number, number]; s: [number, number, number] }>> = {
  college: [
    { p: [0, 0], s: [1.2, 0.8, 0.9] },
    { p: [-0.95, 0], s: [0.7, 0.6, 0.5] },
    { p: [0.95, 0], s: [0.7, 0.6, 0.5] },
  ],
  campus: [
    { p: [-0.5, -0.3], s: [0.42, 0.42, 1.9] },
    { p: [0.45, 0], s: [1.0, 0.7, 0.7] },
    { p: [-0.3, 0.7], s: [0.8, 0.5, 0.45] },
  ],
  lab: [
    { p: [-0.35, 0], s: [1.4, 0.8, 0.7] },
    { p: [0.7, -0.1], s: [0.6, 0.6, 1.5] },
  ],
  office: [
    { p: [0, 0], s: [0.9, 0.8, 1.5] },
    { p: [-0.85, 0.2], s: [0.7, 0.6, 0.6] },
  ],
  skyline: [
    { p: [0.2, 0], s: [0.6, 0.6, 2.6] },
    { p: [-0.65, -0.2], s: [0.5, 0.5, 1.7] },
    { p: [0.9, 0.5], s: [0.4, 0.4, 1.1] },
  ],
  chenmed: [
    { p: [0.8, -0.2], s: [0.7, 0.6, 1.6] },
    { p: [-0.7, 0.3], s: [0.6, 0.6, 0.8] },
    { p: [0, -0.8], s: [0.55, 0.5, 0.9] },
  ],
};

const MINI_SCALE = 0.019;

function MiniBuilding({
  style,
  accent,
  hovered,
}: {
  style: Stop["buildingStyle"];
  accent: string;
  hovered: boolean;
}) {
  return (
    <group scale={MINI_SCALE}>
      {MINI_KITS[style].map(({ p, s }, i) => (
        <mesh key={i} position={[p[0], p[1], s[2] / 2]}>
          <boxGeometry args={[s[0], s[1], s[2]]} />
          <meshStandardMaterial
            color="#1a1712"
            emissive={accent}
            emissiveIntensity={hovered ? 1.65 : 1.0}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

type MarkerProps = {
  stop: Stop;
  onSelect: (id: string) => void;
  interactive: boolean;
  reducedMotion: boolean;
};

/** Boston and Cambridge are only a few kilometres apart. Give their globe
    markers a tiny cartographic offset so both models remain clickable; dives
    still use the real coordinates from `stop.latLon`. */
function markerPositionFor(stop: Stop): THREE.Vector3 {
  const base = latLonToVector3(stop.latLon[0], stop.latLon[1], R).normalize();
  if (stop.id !== "boston" && stop.id !== "cambridge") {
    return base.multiplyScalar(R * 1.006);
  }

  const tangent = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), base)
    .normalize();
  const direction = stop.id === "boston" ? -1 : 1;
  return base
    .addScaledVector(tangent, direction * 0.032)
    .normalize()
    .multiplyScalar(R * 1.006);
}

function CityMarker({ stop, onSelect, interactive, reducedMotion }: MarkerProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  const position = useMemo(
    () => markerPositionFor(stop),
    [stop]
  );
  const outward = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize()
      ),
    [position]
  );

  useEffect(() => {
    document.body.style.cursor = hovered && interactive ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered, interactive]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    // fade marker chrome as it rolls to the far side of the earth
    g.getWorldPosition(worldPos);
    const facing = worldPos.normalize().dot(state.camera.position.clone().normalize());
    const vis = THREE.MathUtils.clamp((facing - 0.12) / 0.3, 0, 1);
    if (labelRef.current) {
      labelRef.current.style.opacity = String(vis * (hovered ? 1 : 0.85));
    }
    const ring = ringRef.current;
    if (ring) {
      const mat = ring.material as THREE.MeshBasicMaterial;
      if (reducedMotion) {
        ring.scale.setScalar(1.4);
        mat.opacity = 0.4 * vis;
      } else {
        const t = (state.clock.elapsedTime * 0.55 + stop.index * 0.17) % 1;
        ring.scale.setScalar(1 + t * 2.4);
        mat.opacity = (1 - t) * 0.55 * vis;
      }
    }
  });

  const isNewEnglandPair = stop.id === "boston" || stop.id === "cambridge";
  // A shared cool atlas tone keeps the adjacent pair calm on the globe.
  // Their full street scenes retain Northeastern red and Eisai blue.
  const accent = isNewEnglandPair ? "#9fb6d8" : stop.accent;
  const labelX = stop.id === "boston" ? -0.1 : stop.id === "cambridge" ? 0.1 : 0;

  return (
    <group ref={groupRef} position={position} quaternion={outward}>
      {/* tiny lit building cluster standing on the earth — colored to its employer */}
      <MiniBuilding style={stop.buildingStyle} accent={accent} hovered={hovered} />
      {/* glow at the buildings' feet — the city light itself */}
      <mesh>
        <sphereGeometry args={[0.0085, 10, 10]} />
        <meshBasicMaterial color={accent} transparent opacity={0.85} />
      </mesh>
      {/* sonar pulse */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.02, 0.024, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      {/* generous invisible hit target */}
      <mesh
        visible={false}
        onClick={(event) => {
          event.stopPropagation();
          if (interactive) onSelect(stop.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.055, 8, 8]} />
      </mesh>
      {/* label */}
      <Html
        position={[labelX, 0.045, 0]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          ref={labelRef}
          style={{
            fontFamily: "var(--font-plex-mono), monospace",
            fontSize: "9.5px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: hovered ? accent : "#b9bfcf",
            whiteSpace: "nowrap",
            textShadow: "0 1px 8px rgba(6,9,15,0.9)",
            transition: "color 0.25s ease",
            userSelect: "none",
          }}
        >
          {String(stop.index).padStart(2, "0")} {stop.city}
        </div>
      </Html>
    </group>
  );
}

/* ———————————————————————— globe ———————————————————————— */

type GlobeProps = {
  focusId: string | null;
  /** City we just returned from — mount the globe hovering above it */
  originId: string | null;
  onSelect: (id: string) => void;
  onAlmostArrived: (id: string) => void;
  onArrived: (id: string) => void;
  reducedMotion: boolean;
  interactive: boolean;
};

export default function Globe({
  focusId,
  originId,
  onSelect,
  onAlmostArrived,
  onArrived,
  reducedMotion,
  interactive,
}: GlobeProps) {
  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const cometRef = useRef<THREE.Mesh>(null);
  const routeRefs = useRef<Array<{ dashOffset: number } | null>>([]);

  const coastlines = useMemo(() => buildCoastlineGeometry(R * 1.001), []);
  const graticule = useMemo(() => buildGraticuleGeometry(R * 1.0005), []);
  const arcs = useMemo(
    () =>
      stops.slice(0, -1).map((s, i) => greatCircleArc(s.latLon, stops[i + 1].latLon, R, 72)),
    []
  );
  const cometCurve = useMemo(() => {
    const pts = arcs.flatMap((arc, i) => (i === 0 ? arc : arc.slice(1)));
    return new THREE.CatmullRomCurve3(pts);
  }, [arcs]);

  const nightLights = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(WORLD_CITIES.length * 3);
    const v = new THREE.Vector3();
    WORLD_CITIES.forEach(([lat, lon], i) => {
      latLonToVector3(lat, lon, R * 1.002, v);
      positions.set([v.x, v.y, v.z], i * 3);
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useEffect(
    () => () => {
      coastlines.dispose();
      graticule.dispose();
      nightLights.dispose();
    },
    [coastlines, graticule, nightLights]
  );

  // ——— animation state (refs; mutated in useFrame) ———
  const dist = useRef(IDLE_DIST);
  /** Where the camera wants to be — user zoom (wheel/pinch) moves this. */
  const distTarget = useRef(IDLE_DIST);
  const pinch = useRef<{ startSpread: number; startTarget: number } | null>(null);
  const pointers = useRef(new Map<number, [number, number]>());
  const fly = useRef<{
    id: string;
    from: THREE.Quaternion;
    to: THREE.Quaternion;
    fromDist: number;
    /** extra zoom-out at mid-flight — gives close-range hops the rise-and-dive arc */
    rise: number;
    t: number;
    veiled: boolean;
  } | null>(null);
  const dragging = useRef(false);
  const pointerLast = useRef<[number, number]>([0, 0]);
  const pointerDown = useRef<[number, number] | null>(null);
  const resumeSpinAt = useRef(0);
  const pitchAccum = useRef(0);
  const cometT = useRef(0);

  // mount hovering above the city we just left (continuity after street level),
  // otherwise wake up facing the route — US East Coast with India on the limb
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    const origin = originId ? stops.find((s) => s.id === originId) : null;
    if (origin) {
      g.quaternion.copy(targetQuaternionFor(origin));
      dist.current = DIVE_DIST + 0.22;
      distTarget.current = IDLE_DIST;
    } else {
      const routeCenter: Stop = { ...stops[0], latLon: [33, -80] };
      g.quaternion.copy(targetQuaternionFor(routeCenter));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // start the dive when a focus target arrives
  useEffect(() => {
    const g = groupRef.current;
    if (!focusId || !g) return;
    const stop = stops.find((s) => s.id === focusId);
    if (!stop) return;
    const to = targetQuaternionFor(stop);
    // hops that start close to the surface climb before they dive — the GE arc
    const closeness = THREE.MathUtils.clamp(
      (IDLE_DIST - dist.current) / (IDLE_DIST - DIVE_DIST),
      0,
      1
    );
    const rise = closeness * Math.min(1.5, 0.35 + g.quaternion.angleTo(to) * 0.5);
    fly.current = {
      id: stop.id,
      from: g.quaternion.clone(),
      to,
      fromDist: dist.current,
      rise,
      t: 0,
      veiled: false,
    };
  }, [focusId]);

  // drag-to-spin + wheel/pinch zoom — listeners on the canvas so gestures
  // starting on empty space work too
  useEffect(() => {
    const el = gl.domElement;

    const spread = () => {
      const pts = [...pointers.current.values()];
      return pts.length < 2 ? 0 : Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
    };

    const down = (e: PointerEvent) => {
      if (!interactive || fly.current) return;
      pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
      if (pointers.current.size === 2) {
        // second finger — switch from rotate to pinch zoom
        pointerDown.current = null;
        dragging.current = true; // suppress the click that would otherwise fire
        pinch.current = { startSpread: spread(), startTarget: distTarget.current };
        return;
      }
      pointerDown.current = [e.clientX, e.clientY];
      pointerLast.current = [e.clientX, e.clientY];
    };

    const move = (e: PointerEvent) => {
      if (pointers.current.has(e.pointerId)) {
        pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
      }
      if (pinch.current && pointers.current.size >= 2) {
        const s = spread();
        if (s > 0 && pinch.current.startSpread > 0) {
          distTarget.current = THREE.MathUtils.clamp(
            pinch.current.startTarget * (pinch.current.startSpread / s),
            MIN_DIST,
            MAX_DIST
          );
        }
        return;
      }
      if (!pointerDown.current) return;
      const [sx, sy] = pointerDown.current;
      if (!dragging.current && Math.hypot(e.clientX - sx, e.clientY - sy) > 5) {
        dragging.current = true;
      }
      if (!dragging.current) return;
      const g = groupRef.current;
      if (!g) return;
      const dx = e.clientX - pointerLast.current[0];
      const dy = e.clientY - pointerLast.current[1];
      pointerLast.current = [e.clientX, e.clientY];

      // finer control the closer you are
      const zoomFactor = THREE.MathUtils.clamp(dist.current / IDLE_DIST, 0.3, 1.2);
      const yaw = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        dx * 0.0042 * zoomFactor
      );
      let pitchDelta = dy * 0.003 * zoomFactor;
      const next = THREE.MathUtils.clamp(pitchAccum.current + pitchDelta, -0.95, 0.95);
      pitchDelta = next - pitchAccum.current;
      pitchAccum.current = next;
      const pitch = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        pitchDelta
      );
      g.quaternion.premultiply(yaw).premultiply(pitch);
      resumeSpinAt.current = performance.now() + 2600;
    };

    const up = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      if (pointers.current.size === 0) {
        pointerDown.current = null;
        // let the click handler fire before clearing the drag flag
        requestAnimationFrame(() => {
          dragging.current = false;
        });
      }
    };

    const wheel = (e: WheelEvent) => {
      if (!interactive || fly.current) return;
      e.preventDefault();
      distTarget.current = THREE.MathUtils.clamp(
        distTarget.current + e.deltaY * 0.0017,
        MIN_DIST,
        MAX_DIST
      );
      resumeSpinAt.current = performance.now() + 1800;
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl, interactive]);

  useFrame((state, rawDelta) => {
    const g = groupRef.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 1 / 30);

    const active = fly.current;
    if (active) {
      // ——— the Google Earth move: spin + dive together ———
      active.t += reducedMotion ? 1 : delta / FLY_SECONDS;
      const t = Math.min(active.t, 1);
      g.quaternion.slerpQuaternions(active.from, active.to, easeInOutCubic(t));
      dist.current =
        THREE.MathUtils.lerp(active.fromDist, DIVE_DIST, Math.pow(t, 2.1)) +
        Math.sin(Math.PI * t) * active.rise;
      if (t >= VEIL_AT && !active.veiled) {
        active.veiled = true;
        onAlmostArrived(active.id);
      }
      if (t >= 1) {
        const id = active.id;
        fly.current = null;
        pitchAccum.current = 0;
        onArrived(id);
      }
    } else {
      // idle: glide toward the user's zoom target, resume the slow spin
      dist.current += (distTarget.current - dist.current) * (1 - Math.exp(-3.4 * delta));
      if (!dragging.current && performance.now() > resumeSpinAt.current && !reducedMotion) {
        // slow enough that the route stays framed for a good while
        g.quaternion.premultiply(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), delta * 0.02)
        );
      }
    }

    // camera rides the fixed ray
    camera.position.copy(VIEW_DIR).multiplyScalar(dist.current);
    camera.lookAt(0, 0.03, 0);

    // route energy
    if (!reducedMotion) {
      for (const mat of routeRefs.current) {
        if (mat) mat.dashOffset -= delta * 0.06;
      }
      cometT.current = (cometT.current + delta / 30) % 1;
      const comet = cometRef.current;
      if (comet) comet.position.copy(cometCurve.getPointAt(cometT.current));
    }
  });

  return (
    <group ref={groupRef}>
      {/* the dark earth */}
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial color="#0d1729" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* coastlines */}
      <lineSegments geometry={coastlines}>
        <lineBasicMaterial color="#e9e6dc" transparent opacity={0.34} />
      </lineSegments>

      {/* graticule */}
      <lineSegments geometry={graticule}>
        <lineBasicMaterial color="#8fb8de" transparent opacity={0.055} />
      </lineSegments>

      {/* the rest of the world's night lights */}
      <points geometry={nightLights}>
        <pointsMaterial
          color="#e0cfa0"
          size={0.014}
          sizeAttenuation
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </points>

      {/* atmosphere rim */}
      <mesh scale={1.17}>
        <sphereGeometry args={[R, 48, 48]} />
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          side={THREE.BackSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* the route — one glowing thread, Indore → Miami */}
      {arcs.map((arc, i) => (
        <Line
          key={i}
          points={arc}
          color={AMBER}
          transparent
          opacity={0.55}
          lineWidth={1.3}
          dashed
          dashSize={0.02}
          gapSize={0.014}
          ref={(line) => {
            routeRefs.current[i] = line
              ? (line.material as unknown as { dashOffset: number })
              : null;
          }}
        />
      ))}

      {/* comet running the whole route */}
      {!reducedMotion && (
        <mesh ref={cometRef}>
          <sphereGeometry args={[0.011, 10, 10]} />
          <meshBasicMaterial color="#ffd98a" />
        </mesh>
      )}

      {stops.map((stop) => (
        <CityMarker
          key={stop.id}
          stop={stop}
          onSelect={(id) => {
            if (!dragging.current) onSelect(id);
          }}
          interactive={interactive && !fly.current}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
