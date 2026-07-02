"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Stop } from "@/data/journey";

/* ————————————————————————————————————————————————
   Shared palette. Bodies are near-black blue slabs;
   windows are emissive amber strips that brighten on
   hover/selection — city lights at night.
   ———————————————————————————————————————————————— */

const BODY = "#1a2740";
const BODY_LIGHT = "#243453";
const AMBER = "#f0b13c";

type MatBundle = {
  body: THREE.MeshStandardMaterial;
  bodyLight: THREE.MeshStandardMaterial;
  window: THREE.MeshStandardMaterial;
};

function useBuildingMaterials(active: boolean): MatBundle {
  const bundle = useMemo<MatBundle>(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: BODY,
        roughness: 0.85,
        metalness: 0.1,
        flatShading: true,
      }),
      bodyLight: new THREE.MeshStandardMaterial({
        color: BODY_LIGHT,
        roughness: 0.8,
        metalness: 0.12,
        flatShading: true,
      }),
      window: new THREE.MeshStandardMaterial({
        color: "#2a2312",
        emissive: AMBER,
        emissiveIntensity: 0.55,
        roughness: 0.6,
      }),
    }),
    []
  );

  // Smoothly ease window glow toward its target each frame.
  useFrame((_, delta) => {
    const target = active ? 1.6 : 0.55;
    const m = bundle.window;
    m.emissiveIntensity += (target - m.emissiveIntensity) * Math.min(1, delta * 6);
  });

  return bundle;
}

/* Thin emissive strip — a lit row of windows on a facade. */
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

function Box({
  mats,
  light = false,
  position,
  size,
}: {
  mats: MatBundle;
  light?: boolean;
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} material={light ? mats.bodyLight : mats.body} castShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

/* ————————————————————————————————————————————————
   The six building kits.
   All sit on y=0 (island top) and stay within r≈2.
   ———————————————————————————————————————————————— */

function CollegeKit({ mats }: { mats: MatBundle }) {
  // IIST Indore — main hall with a dome and two wings.
  return (
    <group>
      <Box mats={mats} position={[0, 0.5, 0]} size={[1.7, 1, 1.1]} />
      <Box mats={mats} light position={[-1.35, 0.32, 0]} size={[1, 0.64, 0.9]} />
      <Box mats={mats} light position={[1.35, 0.32, 0]} size={[1, 0.64, 0.9]} />
      {/* dome */}
      <mesh position={[0, 1.12, 0]} material={mats.bodyLight}>
        <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 1.58, 0]} material={mats.window}>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>
      <Strip mats={mats} position={[0, 0.62, 0.57]} size={[1.4, 0.1, 0.03]} />
      <Strip mats={mats} position={[0, 0.34, 0.57]} size={[1.4, 0.1, 0.03]} />
      <Strip mats={mats} position={[-1.35, 0.36, 0.47]} size={[0.7, 0.09, 0.03]} />
      <Strip mats={mats} position={[1.35, 0.36, 0.47]} size={[0.7, 0.09, 0.03]} />
    </group>
  );
}

function CampusKit({ mats }: { mats: MatBundle }) {
  // Northeastern — brick quad: three mid-rises around a courtyard, one hall taller.
  return (
    <group>
      <Box mats={mats} position={[-0.85, 0.8, -0.5]} size={[0.85, 1.6, 0.85]} />
      <Box mats={mats} light position={[0.35, 0.55, -0.75]} size={[1.1, 1.1, 0.7]} />
      <Box mats={mats} position={[0.9, 0.42, 0.55]} size={[0.9, 0.84, 0.8]} />
      <Box mats={mats} light position={[-0.55, 0.3, 0.75]} size={[1.2, 0.6, 0.6]} />
      {/* clock-tower sliver on the tall hall */}
      <Box mats={mats} light position={[-0.85, 1.78, -0.5]} size={[0.3, 0.36, 0.3]} />
      <Strip mats={mats} position={[-0.85, 1.2, -0.06]} size={[0.6, 0.09, 0.03]} />
      <Strip mats={mats} position={[-0.85, 0.9, -0.06]} size={[0.6, 0.09, 0.03]} />
      <Strip mats={mats} position={[-0.85, 0.6, -0.06]} size={[0.6, 0.09, 0.03]} />
      <Strip mats={mats} position={[0.35, 0.75, -0.38]} size={[0.85, 0.09, 0.03]} />
      <Strip mats={mats} position={[0.35, 0.45, -0.38]} size={[0.85, 0.09, 0.03]} />
      <Strip mats={mats} position={[0.9, 0.5, 0.97]} size={[0.65, 0.08, 0.03]} />
      {/* courtyard beacon */}
      <mesh position={[0, 0.14, 0.05]} material={mats.window}>
        <cylinderGeometry args={[0.035, 0.035, 0.28, 6]} />
      </mesh>
    </group>
  );
}

function LabKit({ mats }: { mats: MatBundle }) {
  // Eisai Cambridge — low research slab + glass tower + rooftop plant.
  return (
    <group>
      <Box mats={mats} position={[-0.4, 0.45, 0]} size={[2, 0.9, 1.3]} />
      <Box mats={mats} light position={[0.95, 0.85, -0.15]} size={[0.9, 1.7, 0.9]} />
      {/* rooftop vents + pipe run — unmistakably a plant, not an office */}
      <mesh position={[-0.85, 1.05, 0.25]} material={mats.bodyLight}>
        <cylinderGeometry args={[0.14, 0.14, 0.3, 10]} />
      </mesh>
      <mesh position={[-0.45, 1.02, -0.3]} material={mats.bodyLight}>
        <cylinderGeometry args={[0.1, 0.1, 0.24, 10]} />
      </mesh>
      <mesh
        position={[-0.2, 1.0, 0.3]}
        rotation={[0, 0, Math.PI / 2]}
        material={mats.bodyLight}
      >
        <cylinderGeometry args={[0.05, 0.05, 1.1, 8]} />
      </mesh>
      {/* long horizontal lab-floor glazing */}
      <Strip mats={mats} position={[-0.4, 0.58, 0.67]} size={[1.7, 0.16, 0.03]} />
      <Strip mats={mats} position={[-0.4, 0.28, 0.67]} size={[1.7, 0.16, 0.03]} />
      <Strip mats={mats} position={[0.95, 1.15, 0.31]} size={[0.7, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.95, 0.85, 0.31]} size={[0.7, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.95, 0.55, 0.31]} size={[0.7, 0.1, 0.03]} />
    </group>
  );
}

function OfficeKit({ mats }: { mats: MatBundle }) {
  // Zifo Cary — suburban office-park block with vertical glazing + annex.
  return (
    <group>
      <Box mats={mats} position={[0.15, 0.85, 0]} size={[1.5, 1.7, 1.2]} />
      <Box mats={mats} light position={[-1.15, 0.35, 0.2]} size={[1, 0.7, 0.9]} />
      {/* vertical window columns */}
      <Strip mats={mats} position={[-0.25, 0.85, 0.62]} size={[0.12, 1.4, 0.03]} />
      <Strip mats={mats} position={[0.15, 0.85, 0.62]} size={[0.12, 1.4, 0.03]} />
      <Strip mats={mats} position={[0.55, 0.85, 0.62]} size={[0.12, 1.4, 0.03]} />
      <Strip mats={mats} position={[-1.15, 0.4, 0.66]} size={[0.7, 0.1, 0.03]} />
      {/* entrance canopy */}
      <Box mats={mats} light position={[0.15, 0.12, 0.75]} size={[0.7, 0.08, 0.35]} />
    </group>
  );
}

function SkylineKit({ mats }: { mats: MatBundle }) {
  // Chicago — a sliver of the skyline; the tall one wears antennas.
  return (
    <group>
      <Box mats={mats} position={[-1.1, 0.7, 0.3]} size={[0.6, 1.4, 0.6]} />
      <Box mats={mats} light position={[-0.35, 1.05, -0.25]} size={[0.65, 2.1, 0.65]} />
      <Box mats={mats} position={[0.45, 1.5, 0.15]} size={[0.7, 3, 0.7]} />
      <Box mats={mats} light position={[1.25, 0.9, -0.2]} size={[0.55, 1.8, 0.55]} />
      {/* antennas on the tallest */}
      <mesh position={[0.32, 3.3, 0.15]} material={mats.bodyLight}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
      </mesh>
      <mesh position={[0.58, 3.2, 0.15]} material={mats.bodyLight}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
      </mesh>
      <mesh position={[0.32, 3.62, 0.15]} material={mats.window}>
        <sphereGeometry args={[0.045, 8, 8]} />
      </mesh>
      {/* stacked window rows */}
      <Strip mats={mats} position={[0.45, 2.5, 0.51]} size={[0.5, 0.08, 0.03]} />
      <Strip mats={mats} position={[0.45, 2.1, 0.51]} size={[0.5, 0.08, 0.03]} />
      <Strip mats={mats} position={[0.45, 1.7, 0.51]} size={[0.5, 0.08, 0.03]} />
      <Strip mats={mats} position={[0.45, 1.3, 0.51]} size={[0.5, 0.08, 0.03]} />
      <Strip mats={mats} position={[-0.35, 1.75, 0.09]} size={[0.45, 0.08, 0.03]} />
      <Strip mats={mats} position={[-0.35, 1.35, 0.09]} size={[0.45, 0.08, 0.03]} />
      <Strip mats={mats} position={[-0.35, 0.95, 0.09]} size={[0.45, 0.08, 0.03]} />
      <Strip mats={mats} position={[1.25, 1.4, 0.09]} size={[0.4, 0.08, 0.03]} />
      <Strip mats={mats} position={[1.25, 1.0, 0.09]} size={[0.4, 0.08, 0.03]} />
      <Strip mats={mats} position={[-1.1, 0.85, 0.62]} size={[0.45, 0.08, 0.03]} />
    </group>
  );
}

function ChenMedKit({ mats }: { mats: MatBundle }) {
  // ChenMed Miami — Building 3 (where it started) → Building 1 (where it ends up),
  // joined by a lit walkway.
  return (
    <group>
      {/* Building 3 — modest */}
      <Box mats={mats} position={[-1.05, 0.45, 0.45]} size={[0.95, 0.9, 0.85]} />
      <Strip mats={mats} position={[-1.05, 0.55, 0.89]} size={[0.7, 0.1, 0.03]} />
      <Strip mats={mats} position={[-1.05, 0.28, 0.89]} size={[0.7, 0.1, 0.03]} />
      {/* Building 1 — the destination */}
      <Box mats={mats} light position={[0.85, 1.0, -0.3]} size={[1.25, 2, 1.05]} />
      <Strip mats={mats} position={[0.85, 1.62, 0.24]} size={[0.95, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.85, 1.28, 0.24]} size={[0.95, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.85, 0.94, 0.24]} size={[0.95, 0.1, 0.03]} />
      <Strip mats={mats} position={[0.85, 0.6, 0.24]} size={[0.95, 0.1, 0.03]} />
      {/* rooftop sign bar */}
      <Strip mats={mats} position={[0.85, 2.06, -0.3]} size={[0.8, 0.07, 0.07]} />
      {/* lit walkway between the two */}
      <Box mats={mats} light position={[-0.15, 0.28, 0.1]} size={[1, 0.12, 0.3]} />
      <Strip mats={mats} position={[-0.15, 0.36, 0.1]} size={[0.9, 0.03, 0.2]} />
      {/* palm hint — trunk + canopy cone */}
      <mesh position={[-0.2, 0.35, 1.1]} material={mats.bodyLight}>
        <cylinderGeometry args={[0.03, 0.05, 0.7, 6]} />
      </mesh>
      <mesh position={[-0.2, 0.78, 1.1]} material={mats.bodyLight}>
        <coneGeometry args={[0.28, 0.3, 7]} />
      </mesh>
    </group>
  );
}

const KITS: Record<Stop["buildingStyle"], (p: { mats: MatBundle }) => React.ReactElement> = {
  college: CollegeKit,
  campus: CampusKit,
  lab: LabKit,
  office: OfficeKit,
  skyline: SkylineKit,
  chenmed: ChenMedKit,
};

/* ————————————————————————————————————————————————
   Island + building + label. Clickable as one unit.
   ———————————————————————————————————————————————— */

type StopIslandProps = {
  stop: Stop;
  selected: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
};

export default function StopIsland({ stop, selected, dimmed, onSelect }: StopIslandProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const mats = useBuildingMaterials(hovered || selected);
  const Kit = KITS[stop.buildingStyle];
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (g) {
      const target = hovered && !selected ? 1.04 : 1;
      const s = g.scale.x + (target - g.scale.x) * Math.min(1, delta * 8);
      g.scale.setScalar(s);
    }
    const ring = ringRef.current;
    if (ring) {
      const m = ring.material as THREE.MeshBasicMaterial;
      const target = selected ? 0.85 : hovered ? 0.35 : 0;
      m.opacity += (target - m.opacity) * Math.min(1, delta * 6);
      if (selected) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.02;
        ring.scale.setScalar(pulse);
      }
    }
  });

  return (
    <group position={stop.position}>
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(stop.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {/* island plinth */}
        <mesh position={[0, -0.3, 0]} material={mats.body}>
          <cylinderGeometry args={[2.7, 3.1, 0.6, 24]} />
        </mesh>
        {/* shore ring — faint cartographic contour */}
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.72, 2.78, 48]} />
          <meshBasicMaterial color="#e9e6dc" transparent opacity={0.07} side={THREE.DoubleSide} />
        </mesh>
        {/* selection ring */}
        <mesh ref={ringRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.0, 3.06, 48]} />
          <meshBasicMaterial color={AMBER} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>

        <group visible>
          <Kit mats={mats} />
        </group>

        {/* generous invisible hit target so small buildings are easy to click */}
        <mesh position={[0, 1.1, 0]} visible={false}>
          <cylinderGeometry args={[2.6, 2.6, 3.4, 12]} />
        </mesh>
      </group>

      {/* city label */}
      <Html
        position={[0, -1.15, 1.6]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            textAlign: "center",
            whiteSpace: "nowrap",
            opacity: dimmed ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-plex-mono), monospace",
              fontSize: "10px",
              letterSpacing: "0.22em",
              color: selected ? "#f0b13c" : "#b9bfcf",
              textTransform: "uppercase",
              transition: "color 0.3s ease",
            }}
          >
            {String(stop.index).padStart(2, "0")} · {stop.city}
          </div>
          <div
            style={{
              fontFamily: "var(--font-plex-mono), monospace",
              fontSize: "8.5px",
              letterSpacing: "0.14em",
              color: "#8b94ab",
              marginTop: "2px",
            }}
          >
            {stop.org}
          </div>
        </div>
      </Html>
    </group>
  );
}
