"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { stops } from "@/data/journey";

/** Unit direction of the overview shot; distance adapts to aspect. */
const OVERVIEW_DIR = new THREE.Vector3(0, 14.5, 23).normalize();
const OVERVIEW_TARGET = new THREE.Vector3(0, 0.5, 0);
/** Half-width of the archipelago (plus margin) the frame must fit. */
const FIT_HALF_WIDTH = 16.2;

function overviewPosition(camera: THREE.Camera, out: THREE.Vector3): THREE.Vector3 {
  const cam = camera as THREE.PerspectiveCamera;
  const halfW = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect;
  const dist = THREE.MathUtils.clamp(FIT_HALF_WIDTH / halfW, 25, 42);
  return out.copy(OVERVIEW_DIR).multiplyScalar(dist);
}
/** Camera offset from a focused stop — low three-quarter view. */
const FOCUS_OFFSET = new THREE.Vector3(5.5, 6, 9.5);
/** Nudge the frame so the building sits left of the info panel. */
const PANEL_SHIFT = new THREE.Vector3(1.6, 0, -0.9);

type Props = {
  selectedId: string | null;
  reducedMotion: boolean;
};

export default function CameraRig({ selectedId, reducedMotion }: Props) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const desiredPos = useRef(OVERVIEW_DIR.clone().multiplyScalar(28));
  const desiredTarget = useRef(OVERVIEW_TARGET.clone());
  const animating = useRef(false);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const stop = stops.find((s) => s.id === selectedId);
    if (stop) {
      const p = new THREE.Vector3(...stop.position);
      desiredPos.current = p.clone().add(FOCUS_OFFSET).add(PANEL_SHIFT);
      desiredTarget.current = p.clone().add(new THREE.Vector3(0, 0.9, 0)).add(PANEL_SHIFT);
    } else {
      desiredTarget.current = OVERVIEW_TARGET.clone();
    }
    animating.current = true;
  }, [selectedId]);

  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls || !animating.current) return;
    // overview distance depends on live aspect ratio
    if (!selectedId) overviewPosition(state.camera, desiredPos.current);
    const dt = Math.min(delta, 1 / 30);
    // Exponential damping — frame-rate independent glide toward the stop.
    const k = reducedMotion ? 1 : 1 - Math.exp(-3.2 * dt);
    state.camera.position.lerp(desiredPos.current, k);
    controls.target.lerp(desiredTarget.current, k);
    if (
      state.camera.position.distanceTo(desiredPos.current) < 0.04 &&
      controls.target.distanceTo(desiredTarget.current) < 0.04
    ) {
      animating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
      minDistance={6}
      maxDistance={44}
      maxPolarAngle={Math.PI * 0.46}
      minPolarAngle={Math.PI * 0.14}
      autoRotate={!reducedMotion && !selectedId && !interacted}
      autoRotateSpeed={0.4}
      onStart={() => {
        animating.current = false;
        if (!interacted) setInteracted(true);
      }}
    />
  );
}
