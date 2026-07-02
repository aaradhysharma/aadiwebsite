"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { stops } from "@/data/journey";
import Globe from "./Globe";
import CityScene from "./CityScene";

export type JourneyView = "globe" | "city";

type SceneProps = {
  view: JourneyView;
  /** Stop currently open at street level (city view) */
  selectedId: string | null;
  /** Stop the globe is diving toward (globe view) */
  focusId: string | null;
  /** Stop we just left at street level — globe mounts hovering above it */
  originId: string | null;
  onSelect: (id: string) => void;
  onAlmostArrived: (id: string) => void;
  onArrived: (id: string) => void;
  reducedMotion: boolean;
  interactive: boolean;
};

export default function Scene({
  view,
  selectedId,
  focusId,
  originId,
  onSelect,
  onAlmostArrived,
  onArrived,
  reducedMotion,
  interactive,
}: SceneProps) {
  const selected = stops.find((s) => s.id === selectedId) ?? null;

  return (
    <Canvas
      camera={{ position: [0, 0.5, 3.05], fov: 42, near: 0.05, far: 160 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={["#06090f"]} />

      {view === "globe" ? (
        <>
          {/* soft space light for the sphere */}
          <ambientLight intensity={0.72} color="#8fb8de" />
          <directionalLight position={[4, 2, 6]} intensity={1.25} color="#b9cdea" />
          <Stars radius={55} depth={25} count={1600} factor={2.2} saturation={0} fade speed={0.35} />
          <Globe
            focusId={focusId}
            originId={originId}
            onSelect={onSelect}
            onAlmostArrived={onAlmostArrived}
            onArrived={onArrived}
            reducedMotion={reducedMotion}
            interactive={interactive}
          />
        </>
      ) : (
        selected && (
          <>
            <fog attach="fog" args={["#06090f", 30, 70]} />
            <CityScene stop={selected} reducedMotion={reducedMotion} />
          </>
        )
      )}
    </Canvas>
  );
}
