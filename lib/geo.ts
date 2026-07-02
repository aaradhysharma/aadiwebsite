import * as THREE from "three";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { MultiPolygon, Polygon, FeatureCollection, Feature } from "geojson";
import land110m from "world-atlas/land-110m.json";

/* ————————————————————————————————————————————————
   Geographic helpers for the night-atlas globe.
   Convention: lat/lon in degrees; +lat north, +lon east.
   x = cos(lat)cos(lon), y = sin(lat), z = -cos(lat)sin(lon)
   → Greenwich faces +X, continents read un-mirrored.
   ———————————————————————————————————————————————— */

export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number,
  out = new THREE.Vector3()
): THREE.Vector3 {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return out.set(
    radius * Math.cos(la) * Math.cos(lo),
    radius * Math.sin(la),
    -radius * Math.cos(la) * Math.sin(lo)
  );
}

/** Flat Float32Array of segment pairs for THREE.LineSegments. */
function ringsToSegments(rings: number[][][], radius: number): number[] {
  const pos: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      latLonToVector3(ring[i][1], ring[i][0], radius, a);
      latLonToVector3(ring[i + 1][1], ring[i + 1][0], radius, b);
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  return pos;
}

/** World coastlines from world-atlas land-110m, as line-segment positions. */
export function buildCoastlineGeometry(radius: number): THREE.BufferGeometry {
  const topology = land110m as unknown as Topology<{
    land: GeometryCollection;
  }>;
  const landFeature = feature(topology, topology.objects.land) as unknown as
    | FeatureCollection
    | Feature;

  const features =
    landFeature.type === "FeatureCollection" ? landFeature.features : [landFeature];

  const positions: number[] = [];
  for (const f of features) {
    const geom = f.geometry;
    if (!geom) continue;
    if (geom.type === "Polygon") {
      positions.push(...ringsToSegments((geom as Polygon).coordinates, radius));
    } else if (geom.type === "MultiPolygon") {
      for (const poly of (geom as MultiPolygon).coordinates) {
        positions.push(...ringsToSegments(poly, radius));
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

/** Latitude/longitude grid lines, as line-segment positions. */
export function buildGraticuleGeometry(radius: number, stepDeg = 15): THREE.BufferGeometry {
  const positions: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const fine = 3; // degrees per segment along each line

  // parallels (skip the poles)
  for (let lat = -75; lat <= 75; lat += stepDeg) {
    for (let lon = -180; lon < 180; lon += fine) {
      latLonToVector3(lat, lon, radius, a);
      latLonToVector3(lat, lon + fine, radius, b);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  // meridians
  for (let lon = -180; lon < 180; lon += stepDeg) {
    for (let lat = -85; lat < 85; lat += fine) {
      latLonToVector3(lat, lon, radius, a);
      latLonToVector3(lat + fine, lon, radius, b);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

/**
 * Great-circle arc between two lat/lon points, lifted above the surface.
 * Lift scales with angular distance so short hops stay low and the
 * India → US leg soars.
 */
export function greatCircleArc(
  from: [number, number],
  to: [number, number],
  radius: number,
  segments = 64
): THREE.Vector3[] {
  const va = latLonToVector3(from[0], from[1], 1).normalize();
  const vb = latLonToVector3(to[0], to[1], 1).normalize();
  const omega = Math.acos(THREE.MathUtils.clamp(va.dot(vb), -1, 1));
  const sinOmega = Math.sin(omega);
  const maxLift = 0.025 + 0.16 * (omega / Math.PI);

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let p: THREE.Vector3;
    if (sinOmega < 1e-6) {
      p = va.clone();
    } else {
      const c1 = Math.sin((1 - t) * omega) / sinOmega;
      const c2 = Math.sin(t * omega) / sinOmega;
      p = va.clone().multiplyScalar(c1).add(vb.clone().multiplyScalar(c2));
    }
    const r = radius * (1 + Math.sin(Math.PI * t) * maxLift);
    points.push(p.normalize().multiplyScalar(r));
  }
  return points;
}
