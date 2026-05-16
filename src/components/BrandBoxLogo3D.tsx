import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Center, ContactShadows, Environment } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { MathUtils } from "three";

/**
 * Brand-In-A-Box — true 3D version of the signature animation.
 * A gold extruded "B" rises out of a deep marine box and drops back in,
 * looping forever. Strict tri-color brand palette:
 *  - ivory background (transparent canvas, parent provides the bg)
 *  - marine box        (hsl(215 55% 14%) ≈ #102036)
 *  - gold letter B     (hsl(41 55% 52%)  ≈ #c89a3e)
 *
 * Lightweight: a single CanvasGL, low-poly geometries, no post-processing.
 */

const MARINE = "#102036";
const GOLD = "#c89a3e";
const IVORY = "#f7f1e5";

function BoxOpen() {
  // Hand-built open box: 4 vertical walls + a floor. We avoid drei's RoundedBox
  // here so the open top reads instantly without a lid.
  const W = 2.4;
  const D = 1.6;
  const H = 1.2;
  const T = 0.08; // wall thickness
  const mat = { color: MARINE, roughness: 0.55, metalness: 0.05 } as const;
  return (
    <group position={[0, -0.4, 0]}>
      {/* floor */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[W, T, D]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, H / 2, -D / 2 + T / 2]} castShadow receiveShadow>
        <boxGeometry args={[W, H, T]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* front wall (slightly shorter so we see "into" the box) */}
      <mesh position={[0, H / 2 - 0.12, D / 2 - T / 2]} castShadow receiveShadow>
        <boxGeometry args={[W, H - 0.24, T]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* left wall */}
      <mesh position={[-W / 2 + T / 2, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, H, D]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* right wall */}
      <mesh position={[W / 2 - T / 2, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, H, D]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* subtle inner gold rim — a quiet brand wink at the top edge */}
      <mesh position={[0, H + 0.005, 0]}>
        <ringGeometry args={[Math.min(W, D) * 0.4, Math.min(W, D) * 0.42, 48]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.0} />
      </mesh>
    </group>
  );
}

function FlyingB() {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // 6s cycle: 0..0.45 rising out, 0.45..0.55 floating, 0.55..1 falling back in
    const t = (clock.elapsedTime % 6) / 6;
    // Smooth in/out curve with a small overshoot
    const eased =
      t < 0.5
        ? // 0..0.5  → 0..1 (out)
          MathUtils.smoothstep(t * 2, 0, 1)
        : // 0.5..1 → 1..0 (back in)
          1 - MathUtils.smoothstep((t - 0.5) * 2, 0, 1);

    const insideY = -0.1; // resting inside the box
    const outsideY = 1.9; // peak height above the box
    groupRef.current.position.y =
      insideY + (outsideY - insideY) * eased + Math.sin(clock.elapsedTime * 1.6) * 0.04;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.25;
    groupRef.current.rotation.x = (1 - eased) * 0.12;
  });

  // Memoize font path
  const fontUrl = useMemo(() => "/fonts/helvetiker_bold.typeface.json", []);

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      <Center>
        <Text3D
          ref={meshRef}
          font={fontUrl}
          size={1.4}
          height={0.42}
          bevelEnabled
          bevelThickness={0.04}
          bevelSize={0.025}
          bevelOffset={0}
          bevelSegments={4}
          curveSegments={10}
          castShadow
        >
          B
          <meshStandardMaterial color={GOLD} roughness={0.28} metalness={0.65} />
        </Text3D>
      </Center>
    </group>
  );
}

function Scene() {
  return (
    <>
      {/* Lights — warm key + cool fill for a premium look */}
      <ambientLight intensity={0.6} color={IVORY} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.5}
        color="#fff4dc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#cfd8e6" />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        <BoxOpen />
        <FlyingB />
      </Suspense>

      <ContactShadows
        position={[0, -0.41, 0]}
        opacity={0.45}
        scale={6}
        blur={2.4}
        far={4}
        color={MARINE}
      />
    </>
  );
}

interface Props {
  className?: string;
  /** Aspect ratio of the canvas. Default 1:1. */
  aspect?: string;
}

export function BrandBoxLogo3D({ className = "", aspect = "1/1" }: Props) {
  return (
    <div
      className={className}
      style={{ aspectRatio: aspect, width: "100%" }}
      role="img"
      aria-label="Brand-In-A-Box — animation 3D"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.6, 5.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default BrandBoxLogo3D;
