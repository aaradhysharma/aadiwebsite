"use client";

import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { Stop } from "@/data/journey";
import StopIsland from "./Building";

/* ————————————————————————————————————————————————
   Street level — where the dive lands. One island,
   its buildings, a slow orbit. The tail end of the
   Google Earth move.
   ———————————————————————————————————————————————— */

const ARRIVE_FROM = new THREE.Vector3(9.5, 9.5, 13.5);
const SETTLE_AT = new THREE.Vector3(6.2, 4.6, 9.2);
const TARGET = new THREE.Vector3(0, 1.0, 0);

const GROUND_Y = -0.68;
const PLANET_RADIUS = 36;
const SPHERE_CENTER_Y = GROUND_Y - PLANET_RADIUS;

const LATITUDE_CONTOURS = [
  { angle: 0.14, color: "#131c2c", opacity: 0.09 },
  { angle: 0.26, color: "#1a2438", opacity: 0.08 },
  { angle: 0.38, color: "#131c2c", opacity: 0.07 },
  { angle: 0.5, color: "#1a2438", opacity: 0.06 },
  { angle: 0.62, color: "#e9e6dc", opacity: 0.05 },
  { angle: 0.74, color: "#1a2438", opacity: 0.05 },
] as const;

function buildLatitudeRing(angle: number, segments: number): THREE.BufferGeometry {
  const positions = new Float32Array((segments + 1) * 3);
  const sinLat = Math.sin(angle);
  const cosLat = Math.cos(angle);

  for (let i = 0; i <= segments; i++) {
    const phi = (i / segments) * Math.PI * 2;
    positions[i * 3] = PLANET_RADIUS * sinLat * Math.cos(phi);
    positions[i * 3 + 1] = SPHERE_CENTER_Y + PLANET_RADIUS * cosLat;
    positions[i * 3 + 2] = PLANET_RADIUS * sinLat * Math.sin(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function LatitudeContours() {
  const rings = useMemo(
    () =>
      LATITUDE_CONTOURS.map((contour) => ({
        ...contour,
        geometry: buildLatitudeRing(contour.angle, 96),
      })),
    [],
  );

  useEffect(() => {
    return () => {
      rings.forEach((ring) => ring.geometry.dispose());
    };
  }, [rings]);

  return (
    <>
      {rings.map((ring) => (
        <lineLoop key={ring.angle} geometry={ring.geometry}>
          <lineBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            depthWrite={false}
          />
        </lineLoop>
      ))}
    </>
  );
}

type CitySceneProps = {
  stop: Stop;
  reducedMotion: boolean;
};

export default function CityScene({ stop, reducedMotion }: CitySceneProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const settling = useRef(true);

  // land high and settle in — continuity with the dive we just cut from
  useEffect(() => {
    settling.current = true;
    camera.position.copy(reducedMotion ? SETTLE_AT : ARRIVE_FROM);
    camera.lookAt(TARGET);
  }, [stop.id, camera, reducedMotion]);

  useFrame((_, rawDelta) => {
    if (!settling.current) return;
    const delta = Math.min(rawDelta, 1 / 30);
    camera.position.lerp(SETTLE_AT, 1 - Math.exp(-2.8 * delta));
    controlsRef.current?.target.lerp(TARGET, 1 - Math.exp(-2.8 * delta));
    if (camera.position.distanceTo(SETTLE_AT) < 0.05) settling.current = false;
  });

  return (
    <group>
      {/* night lighting — cool moonlight + faint warm bounce */}
      <ambientLight intensity={0.38} color="#8fb8de" />
      <directionalLight position={[-14, 22, 10]} intensity={1.25} color="#b9cdea" />
      <directionalLight position={[18, 8, -14]} intensity={0.45} color="#f0b13c" />

      <Stars radius={80} depth={30} count={1100} factor={2.4} saturation={0} fade speed={0.4} />

      {/* curved planet ground */}
      <mesh position={[0, SPHERE_CENTER_Y, 0]}>
        <sphereGeometry args={[PLANET_RADIUS, 72, 72]} />
        <meshStandardMaterial color="#05070c" roughness={1} metalness={0} />
      </mesh>

      {/* faint horizon rim where ground meets sky */}
      <mesh position={[0, SPHERE_CENTER_Y, 0]}>
        <sphereGeometry args={[PLANET_RADIUS * 1.012, 56, 56]} />
        <meshBasicMaterial
          color="#8fb8de"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <LatitudeContours />

      <StopIsland stop={stop} reducedMotion={reducedMotion} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 1.0, 0]}
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={18}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        maxPolarAngle={Math.PI * 0.47}
        minPolarAngle={Math.PI * 0.12}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.5}
        onStart={() => {
          settling.current = false;
        }}
      />
    </group>
  );
}
