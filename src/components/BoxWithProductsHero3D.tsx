import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, RoundedBox } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { MathUtils } from "three";

/**
 * Brand-In-A-Box — Hero 3D : une box marine s'ouvre, des produits dorés
 * (catalogue) en sortent en orbite. Mobile-friendly, pas de scroll requis.
 * Strict palette : marine, gold, ivory.
 */

const MARINE = "#102036";
const MARINE_DEEP = "#0a1729";
const GOLD = "#c89a3e";
const GOLD_SOFT = "#e3c277";
const IVORY = "#f7f1e5";

function Lid() {
  // Rotating top lid that opens on a hinge along the back edge
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime % 6) / 6;
    // open between 0.05 → 0.55, hold open, close 0.85 → 1
    let open = 0;
    if (t < 0.55) open = MathUtils.smoothstep(t, 0.05, 0.55);
    else if (t < 0.85) open = 1;
    else open = 1 - MathUtils.smoothstep(t, 0.85, 1);
    ref.current.rotation.x = -open * 2.2; // ~125°
  });
  return (
    <group position={[0, 0.7, -0.85]}>
      <mesh ref={ref} position={[0, 0, 0.85]}>
        <boxGeometry args={[2.45, 0.08, 1.7]} />
        <meshStandardMaterial color={MARINE} roughness={0.45} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Box() {
  // Open marine box, slightly rounded corners
  return (
    <group position={[0, -0.35, 0]}>
      {/* Floor */}
      <RoundedBox args={[2.5, 0.12, 1.8]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={MARINE_DEEP} roughness={0.55} />
      </RoundedBox>
      {/* Walls */}
      {[
        { pos: [0, 0.55, -0.86], size: [2.5, 1.1, 0.08] }, // back
        { pos: [0, 0.5, 0.86], size: [2.5, 1.0, 0.08] }, // front (slightly shorter)
        { pos: [-1.21, 0.55, 0], size: [0.08, 1.1, 1.8] }, // left
        { pos: [1.21, 0.55, 0], size: [0.08, 1.1, 1.8] }, // right
      ].map((w, i) => (
        <mesh key={i} position={w.pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={w.size as [number, number, number]} />
          <meshStandardMaterial color={MARINE} roughness={0.5} metalness={0.08} />
        </mesh>
      ))}
      {/* Inner ivory liner at top edge — premium wink */}
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[2.46, 0.02, 1.76]} />
        <meshStandardMaterial color={IVORY} roughness={0.9} />
      </mesh>
      {/* Gold ribbon front */}
      <mesh position={[0, 0.55, 0.901]}>
        <boxGeometry args={[0.18, 1.0, 0.005]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

interface ProductProps {
  delay: number;
  radius: number;
  height: number;
  shape: "box" | "sphere" | "cyl";
  tone: "gold" | "ivory" | "marine";
}

function Product({ delay, radius, height, shape, tone }: ProductProps) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const cycle = 6;
    const local = ((clock.elapsedTime + delay) % cycle) / cycle;
    // 0..0.2 inside the box (hidden)  0.2..0.45 rise  0.45..0.85 orbit  0.85..1 fall back
    let y = -0.3;
    let visibility = 0;
    let angle = local * Math.PI * 2;
    if (local < 0.2) {
      y = -0.3;
      visibility = 0;
    } else if (local < 0.45) {
      const k = MathUtils.smoothstep(local, 0.2, 0.45);
      y = -0.3 + k * (height + 0.3);
      visibility = k;
    } else if (local < 0.85) {
      y = height + Math.sin((local - 0.45) * 14) * 0.08;
      visibility = 1;
    } else {
      const k = 1 - MathUtils.smoothstep(local, 0.85, 1);
      y = -0.3 + k * (height + 0.3);
      visibility = k;
    }
    ref.current.position.x = Math.cos(angle) * radius;
    ref.current.position.z = Math.sin(angle) * radius * 0.6;
    ref.current.position.y = y;
    ref.current.rotation.y += 0.02;
    ref.current.rotation.x += 0.012;
    ref.current.scale.setScalar(visibility);
  });

  const color = tone === "gold" ? GOLD : tone === "ivory" ? IVORY : MARINE;
  const accent = tone === "gold" ? GOLD_SOFT : tone === "ivory" ? "#ded5c1" : "#1c3050";

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.3}>
        {shape === "box" && (
          <RoundedBox args={[0.42, 0.42, 0.42]} radius={0.06} smoothness={4} castShadow>
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} emissive={accent} emissiveIntensity={0.05} />
          </RoundedBox>
        )}
        {shape === "sphere" && (
          <mesh castShadow>
            <sphereGeometry args={[0.24, 32, 32]} />
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.7} />
          </mesh>
        )}
        {shape === "cyl" && (
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.5, 28]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.65} />
          </mesh>
        )}
      </Float>
    </group>
  );
}

function Sparkle({ delay, x, z }: { delay: number; x: number; z: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.elapsedTime + delay) % 3) / 3;
    const k = Math.sin(t * Math.PI);
    ref.current.scale.setScalar(k * 0.5 + 0.05);
    ref.current.position.y = 1.1 + t * 0.6;
  });
  return (
    <mesh ref={ref} position={[x, 1.1, z]}>
      <octahedronGeometry args={[0.08, 0]} />
      <meshStandardMaterial color={GOLD_SOFT} emissive={GOLD} emissiveIntensity={0.6} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} color={IVORY} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.6}
        color="#fff4dc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.45} color="#cfd8e6" />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        <Box />
        <Lid />
        {/* Products in orbit */}
        <Product delay={0.0} radius={1.4} height={1.0} shape="box" tone="gold" />
        <Product delay={1.2} radius={1.55} height={1.3} shape="sphere" tone="ivory" />
        <Product delay={2.4} radius={1.3} height={1.15} shape="cyl" tone="gold" />
        <Product delay={3.6} radius={1.6} height={1.35} shape="box" tone="marine" />
        <Product delay={4.8} radius={1.45} height={1.05} shape="sphere" tone="gold" />
        {/* Sparkles rising above the lid */}
        <Sparkle delay={0} x={-0.4} z={0.2} />
        <Sparkle delay={0.8} x={0.5} z={-0.1} />
        <Sparkle delay={1.6} x={0.1} z={0.4} />
      </Suspense>

      <ContactShadows position={[0, -0.42, 0]} opacity={0.4} scale={7} blur={2.6} far={4} color={MARINE} />
    </>
  );
}

interface Props {
  className?: string;
  aspect?: string;
}

/** Hero 3D : box marine qui s'ouvre + produits dorés du catalogue qui en sortent. */
export function BoxWithProductsHero3D({ className = "", aspect = "1/1" }: Props) {
  const camera = useMemo(() => ({ position: [0, 2.1, 5.4] as [number, number, number], fov: 36 }), []);
  return (
    <div
      className={className}
      style={{ aspectRatio: aspect, width: "100%" }}
      role="img"
      aria-label="Brand-In-A-Box — Box premium qui s'ouvre et révèle des produits du catalogue"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={camera}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default BoxWithProductsHero3D;