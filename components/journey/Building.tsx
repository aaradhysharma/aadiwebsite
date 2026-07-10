"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html, Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import * as THREE from "three";
import type { Stop } from "@/data/journey";

/* ————————————————————————————————————————————————
   Street-level building kits — every stop gets a
   silhouette borrowed from the real place: brick quad
   for Northeastern, Willis Tower for Chicago, three
   ChenMed buildings under palms for Miami.
   Bodies stay night-dark; windows are the city lights.
   ———————————————————————————————————————————————— */

const AMBER = "#f0b13c";

/** 0→1 with overshoot (~1.06 peak) then settle — ease-out-back */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

const KIT_POP_DELAY = 0.12;
const KIT_POP_DURATION = 0.85;

type MatBundle = {
  body: THREE.MeshStandardMaterial;
  bodyLight: THREE.MeshStandardMaterial;
  window: THREE.MeshStandardMaterial;
  brick: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  pale: THREE.MeshStandardMaterial;
  beacon: THREE.MeshStandardMaterial;
  teal: THREE.MeshStandardMaterial;
};

function useBuildingMaterials(active: boolean, reducedMotion: boolean): MatBundle {
  const bundle = useMemo<MatBundle>(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: "#1a2740",
        roughness: 0.85,
        metalness: 0.1,
        flatShading: true,
      }),
      bodyLight: new THREE.MeshStandardMaterial({
        color: "#243453",
        roughness: 0.8,
        metalness: 0.12,
        flatShading: true,
      }),
      window: new THREE.MeshStandardMaterial({
        color: "#2a2312",
        emissive: AMBER,
        emissiveIntensity: 0.9,
        roughness: 0.6,
      }),
      brick: new THREE.MeshStandardMaterial({
        color: "#4a2e28",
        roughness: 0.95,
        metalness: 0.02,
        flatShading: true,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: "#1c3550",
        roughness: 0.25,
        metalness: 0.45,
        emissive: "#0d2033",
        emissiveIntensity: 0.35,
      }),
      foliage: new THREE.MeshStandardMaterial({
        color: "#24422f",
        roughness: 1,
        flatShading: true,
      }),
      pale: new THREE.MeshStandardMaterial({
        color: "#6b7688",
        roughness: 0.7,
        metalness: 0.2,
        flatShading: true,
      }),
      beacon: new THREE.MeshStandardMaterial({
        color: "#2a0f0c",
        emissive: "#ff5040",
        emissiveIntensity: 1.2,
      }),
      teal: new THREE.MeshStandardMaterial({
        color: "#0c2a27",
        emissive: "#2fb5a8",
        emissiveIntensity: 0.9,
      }),
    }),
    []
  );

  useFrame((state, delta) => {
    // window glow eases toward its target; aircraft beacons blink
    const target = active ? 1.6 : 0.9;
    const w = bundle.window;
    w.emissiveIntensity += (target - w.emissiveIntensity) * Math.min(1, delta * 6);
    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      bundle.beacon.emissiveIntensity = Math.sin(t * 2.1) > 0.55 ? 2.4 : 0.12;
    }
  });

  return bundle;
}

function Strip({
  mats,
  position,
  size,
}: {
  mats: MatBundle;
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} material={mats.window}>
      <boxGeometry args={size} />
    </mesh>
  );
}

/** Blueprint-style edge lines so every box face reads against the night bodies. */
const EDGE_COLOR = "#9fb6d8";
const EDGE_OPACITY = 0.32;

function Box({
  mats,
  mat = "body",
  position,
  size,
  rotation,
}: {
  mats: MatBundle;
  mat?: keyof MatBundle;
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
}) {
  const [w, h, d] = size;
  const geometry = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  // skip outlines on paper-thin slabs (paths, parking stripes) — they'd read as clutter
  const showEdges = Math.min(w, h, d) > 0.04;
  const edgeGeometry = useMemo(
    () => (showEdges ? new THREE.EdgesGeometry(geometry) : null),
    [geometry, showEdges]
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      edgeGeometry?.dispose();
    };
  }, [geometry, edgeGeometry]);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} material={mats[mat]} castShadow />
      {edgeGeometry && (
        <lineSegments geometry={edgeGeometry}>
          <lineBasicMaterial
            color={EDGE_COLOR}
            transparent
            opacity={EDGE_OPACITY}
            depthWrite={false}
          />
        </lineSegments>
      )}
    </group>
  );
}

function Tree({
  mats,
  position,
  scale = 1,
}: {
  mats: MatBundle;
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.14, 0]} material={mats.body}>
        <cylinderGeometry args={[0.03, 0.045, 0.28, 6]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} material={mats.foliage}>
        <sphereGeometry args={[0.21, 8, 7]} />
      </mesh>
    </group>
  );
}

function Pine({
  mats,
  position,
  scale = 1,
}: {
  mats: MatBundle;
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.12, 0]} material={mats.body}>
        <cylinderGeometry args={[0.025, 0.04, 0.24, 6]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} material={mats.foliage}>
        <coneGeometry args={[0.2, 0.5, 7]} />
      </mesh>
      <mesh position={[0, 0.72, 0]} material={mats.foliage}>
        <coneGeometry args={[0.13, 0.36, 7]} />
      </mesh>
    </group>
  );
}

function Palm({
  mats,
  position,
  lean = 0.12,
}: {
  mats: MatBundle;
  position: [number, number, number];
  lean?: number;
}) {
  return (
    <group position={position} rotation={[0, 0, lean]}>
      <mesh position={[0, 0.4, 0]} material={mats.pale}>
        <cylinderGeometry args={[0.028, 0.045, 0.8, 6]} />
      </mesh>
      {/* crown — squashed dome + drooping skirt */}
      <mesh position={[0, 0.84, 0]} scale={[1, 0.5, 1]} material={mats.foliage}>
        <sphereGeometry args={[0.24, 8, 6]} />
      </mesh>
      <mesh position={[0, 0.78, 0]} material={mats.foliage}>
        <coneGeometry args={[0.3, 0.22, 8, 1, true]} />
      </mesh>
    </group>
  );
}

/* ————————————————————————————————————————————————
   The six kits. All sit on y=0, footprint r ≲ 2.3.
   ———————————————————————————————————————————————— */

function CollegeKit({ mats }: { mats: MatBundle }) {
  // IIST Indore — domed main hall, brick wings, campus gate.
  return (
    <group>
      <Box mats={mats} position={[0, 0.5, 0]} size={[1.7, 1, 1.1]} />
      <Box mats={mats} mat="brick" position={[-1.35, 0.32, 0]} size={[1, 0.64, 0.9]} />
      <Box mats={mats} mat="brick" position={[1.35, 0.32, 0]} size={[1, 0.64, 0.9]} />
      {/* dome */}
      <mesh position={[0, 1.12, 0]} material={mats.pale}>
        <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 1.58, 0]} material={mats.window}>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>
      {/* campus gate — two pillars and a lintel */}
      <Box mats={mats} mat="brick" position={[-0.45, 0.3, 1.55]} size={[0.14, 0.6, 0.14]} />
      <Box mats={mats} mat="brick" position={[0.45, 0.3, 1.55]} size={[0.14, 0.6, 0.14]} />
      <Box mats={mats} mat="pale" position={[0, 0.66, 1.55]} size={[1.15, 0.12, 0.18]} />
      <Strip mats={mats} position={[0, 0.62, 0.57]} size={[1.4, 0.1, 0.03]} />
      <Strip mats={mats} position={[0, 0.34, 0.57]} size={[1.4, 0.1, 0.03]} />
      <Strip mats={mats} position={[-1.35, 0.36, 0.47]} size={[0.7, 0.09, 0.03]} />
      <Strip mats={mats} position={[1.35, 0.36, 0.47]} size={[0.7, 0.09, 0.03]} />
      <Tree mats={mats} position={[-1.9, 0, 1.2]} scale={0.9} />
      <Tree mats={mats} position={[1.9, 0, 1.15]} />
    </group>
  );
}

function CampusKit({ mats }: { mats: MatBundle }) {
  // Northeastern — brick halls around a green quad, crossing paths,
  // and a clocktower with a lit face.
  return (
    <group>
      {/* the quad */}
      <mesh position={[0, 0.006, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.05, 32]} />
        <meshStandardMaterial color="#152a1d" roughness={1} />
      </mesh>
      {/* crossing paths */}
      <Box mats={mats} mat="pale" position={[0, 0.012, 0.15]} size={[3.6, 0.008, 0.13]} rotation={[0, 0.6, 0]} />
      <Box mats={mats} mat="pale" position={[0, 0.012, 0.15]} size={[3.6, 0.008, 0.13]} rotation={[0, -0.6, 0]} />

      {/* brick halls */}
      <Box mats={mats} mat="brick" position={[-1.05, 0.7, -0.85]} size={[0.9, 1.4, 0.8]} />
      <Box mats={mats} mat="brick" position={[0.45, 0.5, -1.05]} size={[1.15, 1.0, 0.65]} />
      <Box mats={mats} mat="brick" position={[1.35, 0.42, 0.6]} size={[0.85, 0.84, 0.8]} />
      <Box mats={mats} mat="brick" position={[-1.5, 0.3, 0.85]} size={[1.0, 0.6, 0.6]} />

      {/* clocktower */}
      <Box mats={mats} mat="brick" position={[-1.05, 1.75, -0.85]} size={[0.3, 0.7, 0.3]} />
      <mesh position={[-1.05, 2.2, -0.85]} material={mats.pale}>
        <coneGeometry args={[0.24, 0.34, 4]} />
      </mesh>
      {/* lit clock face */}
      <mesh position={[-1.05, 1.82, -0.68]} rotation={[Math.PI / 2, 0, 0]} material={mats.window}>
        <cylinderGeometry args={[0.075, 0.075, 0.02, 12]} />
      </mesh>

      {/* window rows */}
      <Strip mats={mats} position={[-1.05, 1.05, -0.43]} size={[0.65, 0.09, 0.03]} />
      <Strip mats={mats} position={[-1.05, 0.75, -0.43]} size={[0.65, 0.09, 0.03]} />
      <Strip mats={mats} position={[-1.05, 0.45, -0.43]} size={[0.65, 0.09, 0.03]} />
      <Strip mats={mats} position={[0.45, 0.68, -0.71]} size={[0.9, 0.09, 0.03]} />
      <Strip mats={mats} position={[0.45, 0.38, -0.71]} size={[0.9, 0.09, 0.03]} />
      <Strip mats={mats} position={[1.35, 0.5, 1.02]} size={[0.6, 0.08, 0.03]} />
      <Strip mats={mats} position={[-1.5, 0.32, 1.17]} size={[0.75, 0.08, 0.03]} />

      {/* low wide library block on the quad's south edge — Snell energy */}
      <Box mats={mats} mat="bodyLight" position={[0.35, 0.28, 1.45]} size={[1.3, 0.56, 0.55]} />
      <Strip mats={mats} position={[0.35, 0.3, 1.73]} size={[1.1, 0.14, 0.03]} />

      {/* quad trees */}
      <Tree mats={mats} position={[1.3, 0, 1.0]} />
      <Tree mats={mats} position={[-0.55, 0, 1.5]} scale={0.85} />
      <Tree mats={mats} position={[1.7, 0, -0.45]} scale={0.8} />
    </group>
  );
}

function LabKit({ mats }: { mats: MatBundle }) {
  // Eisai Cambridge — long research slab, glass tower, rooftop plant, tanks.
  return (
    <group>
      <Box mats={mats} position={[-0.4, 0.45, 0]} size={[2, 0.9, 1.3]} />
      <Box mats={mats} mat="glass" position={[0.95, 0.85, -0.15]} size={[0.9, 1.7, 0.9]} />
      <Box mats={mats} mat="glass" position={[-1.55, 0.35, -0.75]} size={[0.6, 0.7, 0.6]} />
      {/* rooftop vents + pipe run */}
      <mesh position={[-0.85, 1.05, 0.25]} material={mats.pale}>
        <cylinderGeometry args={[0.14, 0.14, 0.3, 10]} />
      </mesh>
      <mesh position={[-0.45, 1.02, -0.3]} material={mats.pale}>
        <cylinderGeometry args={[0.1, 0.1, 0.24, 10]} />
      </mesh>
      <mesh position={[-0.2, 1.0, 0.3]} rotation={[0, 0, Math.PI / 2]} material={mats.pale}>
        <cylinderGeometry args={[0.05, 0.05, 1.1, 8]} />
      </mesh>
      {/* cryo tanks */}
      <mesh position={[0.35, 0.32, 0.95]} material={mats.pale}>
        <cylinderGeometry args={[0.16, 0.16, 0.64, 12]} />
      </mesh>
      <mesh position={[0.75, 0.26, 1.05]} material={mats.pale}>
        <cylinderGeometry args={[0.12, 0.12, 0.52, 12]} />
      </mesh>
      {/* lab-floor glazing */}
      <Strip mats={mats} position={[-0.4, 0.58, 0.67]} size={[1.7, 0.16, 0.03]} />
      <Strip mats={mats} position={[-0.4, 0.28, 0.67]} size={[1.7, 0.16, 0.03]} />
      <Strip mats={mats} position={[0.95, 1.15, 0.31]} size={[0.7, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.95, 0.85, 0.31]} size={[0.7, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.95, 0.55, 0.31]} size={[0.7, 0.1, 0.03]} />
    </group>
  );
}

function OfficeKit({ mats }: { mats: MatBundle }) {
  // Zifo Cary — office park in the North Carolina pines.
  return (
    <group>
      <Box mats={mats} position={[0.15, 0.85, 0]} size={[1.5, 1.7, 1.2]} />
      <Box mats={mats} mat="glass" position={[-1.15, 0.35, 0.2]} size={[1, 0.7, 0.9]} />
      {/* vertical glazing */}
      <Strip mats={mats} position={[-0.25, 0.85, 0.62]} size={[0.12, 1.4, 0.03]} />
      <Strip mats={mats} position={[0.15, 0.85, 0.62]} size={[0.12, 1.4, 0.03]} />
      <Strip mats={mats} position={[0.55, 0.85, 0.62]} size={[0.12, 1.4, 0.03]} />
      <Strip mats={mats} position={[-1.15, 0.4, 0.66]} size={[0.7, 0.1, 0.03]} />
      {/* entrance canopy + lot lamps */}
      <Box mats={mats} mat="pale" position={[0.15, 0.12, 0.75]} size={[0.7, 0.08, 0.35]} />
      <mesh position={[1.15, 0.3, 1.1]} material={mats.pale}>
        <cylinderGeometry args={[0.012, 0.012, 0.6, 5]} />
      </mesh>
      <mesh position={[1.15, 0.62, 1.1]} material={mats.window}>
        <sphereGeometry args={[0.035, 6, 6]} />
      </mesh>
      {/* Carolina pines */}
      <Pine mats={mats} position={[-1.95, 0, -0.7]} />
      <Pine mats={mats} position={[-1.6, 0, 1.3]} scale={0.85} />
      <Pine mats={mats} position={[1.75, 0, -0.9]} scale={1.1} />
      <Pine mats={mats} position={[1.95, 0, 0.35]} scale={0.8} />
      <Pine mats={mats} position={[0.9, 0, -1.5]} scale={0.9} />
    </group>
  );
}

function SkylineKit({ mats }: { mats: MatBundle }) {
  // Chicago — Willis Tower setbacks with twin blinking antennas,
  // a tapered Hancock, and filler towers.
  return (
    <group>
      {/* Willis — three setback tiers */}
      <Box mats={mats} position={[0.45, 0.7, 0.15]} size={[0.95, 1.4, 0.95]} />
      <Box mats={mats} position={[0.45, 1.85, 0.15]} size={[0.68, 0.9, 0.68]} />
      <Box mats={mats} position={[0.45, 2.7, 0.15]} size={[0.44, 0.8, 0.44]} />
      {/* twin antenna masts + aircraft beacons */}
      <mesh position={[0.33, 3.45, 0.05]} material={mats.pale}>
        <cylinderGeometry args={[0.016, 0.016, 0.7, 6]} />
      </mesh>
      <mesh position={[0.57, 3.38, 0.25]} material={mats.pale}>
        <cylinderGeometry args={[0.016, 0.016, 0.55, 6]} />
      </mesh>
      <mesh position={[0.33, 3.82, 0.05]} material={mats.beacon}>
        <sphereGeometry args={[0.035, 8, 8]} />
      </mesh>
      <mesh position={[0.57, 3.68, 0.25]} material={mats.beacon}>
        <sphereGeometry args={[0.03, 8, 8]} />
      </mesh>

      {/* Hancock — tapered black obelisk with X-brace hint */}
      <mesh position={[-0.85, 1.15, -0.35]} rotation={[0, Math.PI / 4, 0]} material={mats.bodyLight}>
        <cylinderGeometry args={[0.17, 0.45, 2.3, 4]} />
      </mesh>
      <mesh position={[-0.85, 2.42, -0.35]} material={mats.pale}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 5]} />
      </mesh>
      <mesh position={[-0.85, 2.62, -0.35]} material={mats.beacon}>
        <sphereGeometry args={[0.028, 8, 8]} />
      </mesh>

      {/* filler towers */}
      <Box mats={mats} mat="glass" position={[1.35, 0.9, -0.45]} size={[0.55, 1.8, 0.55]} />
      <Box mats={mats} position={[-1.6, 0.6, 0.7]} size={[0.6, 1.2, 0.6]} />
      <Box mats={mats} mat="bodyLight" position={[0.05, 0.55, 1.15]} size={[0.5, 1.1, 0.5]} />

      {/* stacked window rows */}
      <Strip mats={mats} position={[0.45, 1.05, 0.64]} size={[0.7, 0.08, 0.03]} />
      <Strip mats={mats} position={[0.45, 0.65, 0.64]} size={[0.7, 0.08, 0.03]} />
      <Strip mats={mats} position={[0.45, 2.0, 0.5]} size={[0.5, 0.08, 0.03]} />
      <Strip mats={mats} position={[0.45, 2.85, 0.38]} size={[0.32, 0.07, 0.03]} />
      <Strip mats={mats} position={[1.35, 1.45, -0.16]} size={[0.4, 0.08, 0.03]} />
      <Strip mats={mats} position={[1.35, 1.05, -0.16]} size={[0.4, 0.08, 0.03]} />
      <Strip mats={mats} position={[-1.6, 0.85, 1.02]} size={[0.45, 0.08, 0.03]} />
      <Strip mats={mats} position={[0.05, 0.75, 1.42]} size={[0.36, 0.07, 0.03]} />
    </group>
  );
}

function ChenMedKit({ mats, reducedMotion }: { mats: MatBundle; reducedMotion: boolean }) {
  // ChenMed Miami — the real campus has three buildings.
  // The dashed hop is his move: Building 3 (sales ops) → Building 1 (AI engineer).
  const hopRef = useRef<Line2>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const hopPoints = useMemo(() => {
    const from = new THREE.Vector3(-1.15, 0.95, 0.5);
    const to = new THREE.Vector3(0.85, 2.15, -0.3);
    const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.9, 0.25));
    return new THREE.QuadraticBezierCurve3(from, mid, to);
  }, []);
  const hopLine = useMemo(() => hopPoints.getPoints(36), [hopPoints]);
  const hopT = useRef(0);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const line = hopRef.current;
    if (line?.material) {
      (line.material as unknown as { dashOffset: number }).dashOffset -= delta * 0.35;
    }
    hopT.current = (hopT.current + delta / 4.5) % 1;
    dotRef.current?.position.copy(hopPoints.getPointAt(hopT.current));
  });

  return (
    <group>
      {/* plaza */}
      <mesh position={[0, 0.005, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.15, 32]} />
        <meshStandardMaterial color="#101c2b" roughness={1} />
      </mesh>

      {/* surface parking — the great Florida office-park tradition */}
      <mesh position={[-0.15, 0.008, 1.15]} rotation={[-Math.PI / 2, 0, 0.12]}>
        <planeGeometry args={[1.7, 0.62]} />
        <meshStandardMaterial color="#0b1520" roughness={1} />
      </mesh>
      {[-0.75, -0.5, -0.25, 0, 0.25, 0.5].map((x) => (
        <Box
          key={x}
          mats={mats}
          mat="pale"
          position={[x - 0.1, 0.015, 1.15 + x * -0.12]}
          size={[0.015, 0.006, 0.24]}
          rotation={[0, 0.12, 0]}
        />
      ))}

      {/* Building 3 — where it started */}
      <Box mats={mats} position={[-1.15, 0.45, 0.5]} size={[0.95, 0.9, 0.85]} />
      <Strip mats={mats} position={[-1.15, 0.55, 0.94]} size={[0.7, 0.1, 0.03]} />
      <Strip mats={mats} position={[-1.15, 0.28, 0.94]} size={[0.7, 0.1, 0.03]} />

      {/* Building 2 — the middle sibling */}
      <Box mats={mats} mat="bodyLight" position={[-0.1, 0.6, -1.0]} size={[0.85, 1.2, 0.75]} />
      <Strip mats={mats} position={[-0.1, 0.8, -0.61]} size={[0.6, 0.09, 0.03]} />
      <Strip mats={mats} position={[-0.1, 0.5, -0.61]} size={[0.6, 0.09, 0.03]} />

      {/* Building 1 — the destination */}
      <Box mats={mats} mat="glass" position={[0.85, 1.0, -0.3]} size={[1.25, 2, 1.05]} />
      <Strip mats={mats} position={[0.85, 1.62, 0.24]} size={[0.95, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.85, 1.28, 0.24]} size={[0.95, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.85, 0.94, 0.24]} size={[0.95, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.85, 0.6, 0.24]} size={[0.95, 0.1, 0.03]} />
      {/* teal rooftop sign — ChenMed green */}
      <mesh position={[0.85, 2.06, -0.3]} material={mats.teal}>
        <boxGeometry args={[0.8, 0.07, 0.07]} />
      </mesh>

      {/* the hop: B3 → B1 */}
      <Line
        ref={hopRef}
        points={hopLine}
        color={AMBER}
        transparent
        opacity={0.75}
        lineWidth={1.3}
        dashed
        dashSize={0.09}
        gapSize={0.06}
      />
      {!reducedMotion && (
        <mesh ref={dotRef}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#ffd98a" />
        </mesh>
      )}

      {/* labels for the two buildings that matter */}
      <Html position={[-1.15, 1.25, 0.5]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span className="coord" style={{ fontSize: "8.5px", whiteSpace: "nowrap" }}>
          B3 — SALES OPS
        </span>
      </Html>
      <Html position={[0.85, 2.5, -0.3]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span
          className="coord"
          style={{ fontSize: "8.5px", whiteSpace: "nowrap", color: "#f0b13c" }}
        >
          B1 — AI ENGINEER
        </span>
      </Html>

      {/* palms */}
      <Palm mats={mats} position={[-0.25, 0, 1.35]} />
      <Palm mats={mats} position={[1.7, 0, 0.7]} lean={-0.1} />
      <Palm mats={mats} position={[-1.95, 0, -0.5]} lean={0.16} />
    </group>
  );
}

const KITS: Record<
  Stop["buildingStyle"],
  (p: { mats: MatBundle; reducedMotion: boolean }) => React.ReactElement
> = {
  college: CollegeKit,
  campus: CampusKit,
  lab: LabKit,
  office: OfficeKit,
  skyline: SkylineKit,
  chenmed: ChenMedKit,
};

/* ————————————————————————————————————————————————
   Island plinth + kit, centered at the origin —
   the stage the globe dive lands on.
   ———————————————————————————————————————————————— */

type StopIslandProps = {
  stop: Stop;
  reducedMotion: boolean;
};

function KitPopGroup({
  reducedMotion,
  children,
}: {
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (reducedMotion) {
      g.scale.set(1, 1, 1);
      return;
    }

    elapsed.current += delta;
    const t = elapsed.current;

    if (t < KIT_POP_DELAY) {
      g.scale.setScalar(0.001);
      return;
    }

    const progress = Math.min(1, (t - KIT_POP_DELAY) / KIT_POP_DURATION);
    g.scale.setScalar(Math.max(0.001, easeOutBack(progress)));
  });

  return <group ref={groupRef}>{children}</group>;
}

export default function StopIsland({ stop, reducedMotion }: StopIslandProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const mats = useBuildingMaterials(hovered, reducedMotion);
  const Kit = KITS[stop.buildingStyle];

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* island plinth — darker than the building bodies so kits stand off the ground */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[2.7, 3.1, 0.6, 24]} />
        <meshStandardMaterial color="#0e1726" roughness={0.95} metalness={0.05} flatShading />
      </mesh>
      {/* shore ring — faint cartographic contour */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.72, 2.78, 48]} />
        <meshBasicMaterial color="#e9e6dc" transparent opacity={0.07} side={THREE.DoubleSide} />
      </mesh>

      <KitPopGroup key={stop.id} reducedMotion={reducedMotion}>
        <Kit mats={mats} reducedMotion={reducedMotion} />
      </KitPopGroup>
    </group>
  );
}
