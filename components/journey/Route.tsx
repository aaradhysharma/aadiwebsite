"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import * as THREE from "three";
import { stops } from "@/data/journey";

/** Flight-path arcs between consecutive stops, one continuous polyline. */
function buildRoutePoints(): { points: THREE.Vector3[]; curve: THREE.CurvePath<THREE.Vector3> } {
  const path = new THREE.CurvePath<THREE.Vector3>();
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const a = new THREE.Vector3(...stops[i].position).add(new THREE.Vector3(0, 0.15, 0));
    const b = new THREE.Vector3(...stops[i + 1].position).add(new THREE.Vector3(0, 0.15, 0));
    const mid = a
      .clone()
      .lerp(b, 0.5)
      .add(new THREE.Vector3(0, a.distanceTo(b) * 0.28, 0));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    path.add(curve);
    const segment = curve.getPoints(28);
    // avoid duplicating the shared endpoint between segments
    points.push(...(i === 0 ? segment : segment.slice(1)));
  }
  return { points, curve: path };
}

export default function Route({ reducedMotion }: { reducedMotion: boolean }) {
  const { points, curve } = useMemo(buildRoutePoints, []);
  const lineRef = useRef<Line2>(null);
  const cometRef = useRef<THREE.Group>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    // marching dashes
    const line = lineRef.current;
    if (line?.material) {
      (line.material as unknown as { dashOffset: number }).dashOffset -= delta * 0.55;
    }
    // comet gliding the full route, looping
    progress.current = (progress.current + delta / 26) % 1;
    const comet = cometRef.current;
    if (comet) {
      const p = curve.getPointAt(progress.current);
      comet.position.copy(p);
    }
  });

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color="#f0b13c"
        transparent
        opacity={0.38}
        lineWidth={1.4}
        dashed
        dashSize={0.32}
        gapSize={0.22}
      />
      {!reducedMotion && (
        <group ref={cometRef}>
          <mesh>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshBasicMaterial color="#ffd98a" />
          </mesh>
          <pointLight color="#f0b13c" intensity={2.2} distance={4.5} decay={2} />
        </group>
      )}
    </group>
  );
}
