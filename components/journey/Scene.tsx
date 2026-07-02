"use client";

import { Canvas } from "@react-three/fiber";
import { Stars, Grid } from "@react-three/drei";
import { stops } from "@/data/journey";
import StopIsland from "./Building";
import Route from "./Route";
import CameraRig from "./CameraRig";

type SceneProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  reducedMotion: boolean;
};

export default function Scene({ selectedId, onSelect, reducedMotion }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 14.5, 23], fov: 42, near: 0.5, far: 140 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#06090f"]} />
      <fog attach="fog" args={["#06090f", 36, 85]} />

      {/* night lighting — cool moonlight + faint warm bounce */}
      <ambientLight intensity={0.35} color="#8fb8de" />
      <directionalLight position={[-14, 22, 10]} intensity={1.3} color="#b9cdea" />
      <directionalLight position={[18, 8, -14]} intensity={0.4} color="#f0b13c" />

      <Stars radius={90} depth={35} count={1400} factor={2.6} saturation={0} fade speed={0.5} />

      {/* sea floor + cartographic grid */}
      <mesh position={[0, -0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[90, 48]} />
        <meshStandardMaterial color="#05070c" roughness={1} metalness={0} />
      </mesh>
      <Grid
        position={[0, -0.63, 0]}
        infiniteGrid
        cellSize={2.2}
        sectionSize={11}
        cellThickness={0.4}
        sectionThickness={0.8}
        cellColor="#131c2c"
        sectionColor="#1a2438"
        fadeDistance={75}
        fadeStrength={2.4}
      />

      <Route reducedMotion={reducedMotion} />

      {stops.map((stop) => (
        <StopIsland
          key={stop.id}
          stop={stop}
          selected={selectedId === stop.id}
          dimmed={selectedId !== null && selectedId !== stop.id}
          onSelect={(id) => onSelect(id)}
        />
      ))}

      <CameraRig selectedId={selectedId} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
