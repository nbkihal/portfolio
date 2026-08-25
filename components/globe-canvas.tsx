"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Brand violet + cyan accent, matched to the CSS design tokens. */
const BRAND = "#8b5cf6";
const CYAN = "#22d3ee";

/** Evenly distribute N points on a sphere (Fibonacci lattice). */
function fibonacciSpherePositions(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return positions;
}

function Globe({ reduceMotion }: { reduceMotion: boolean }) {
  const parallax = React.useRef<THREE.Group>(null);
  const spin = React.useRef<THREE.Group>(null);

  const markerPositions = React.useMemo(
    () => fibonacciSpherePositions(320, 2.02),
    [],
  );

  useFrame((state, delta) => {
    // Continuous auto-rotation (paused if the user prefers reduced motion).
    if (spin.current && !reduceMotion) {
      spin.current.rotation.y += delta * 0.16;
    }
    // Mouse parallax: gently tilt the whole globe toward the pointer.
    if (parallax.current) {
      const targetX = -state.pointer.y * 0.28;
      const targetY = state.pointer.x * 0.28;
      parallax.current.rotation.x +=
        (targetX - parallax.current.rotation.x) * 0.05;
      parallax.current.rotation.y +=
        (targetY - parallax.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={parallax}>
      <group ref={spin} rotation={[0.35, 0, 0.15]}>
        {/* Wireframe sphere — the globe itself */}
        <mesh>
          <icosahedronGeometry args={[2, 5]} />
          <meshBasicMaterial
            color={BRAND}
            wireframe
            transparent
            opacity={0.28}
          />
        </mesh>

        {/* Faint solid core to add depth behind the wireframe */}
        <mesh>
          <sphereGeometry args={[1.96, 32, 32]} />
          <meshBasicMaterial color={BRAND} transparent opacity={0.05} />
        </mesh>

        {/* Surface markers ("cities") */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[markerPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color={CYAN}
            size={0.045}
            sizeAttenuation
            transparent
            opacity={0.9}
          />
        </points>

        {/* Tilted orbit ring for a bit of flair */}
        <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
          <torusGeometry args={[2.6, 0.006, 16, 120]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
}

export default function GlobeCanvas({ active }: { active: boolean }) {
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <Canvas
      // Render only while visible on screen to save CPU/GPU/battery.
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Globe reduceMotion={reduceMotion} />
    </Canvas>
  );
}
