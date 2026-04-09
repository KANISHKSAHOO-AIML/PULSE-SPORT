"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Batsman ────────────────────────────────────────────────────────
function Batsman({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const batRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current || !batRef.current) return;

    const swingProgress = Math.max(0, Math.min(1, (progress - 0.25) / 0.35));
    const eased = swingProgress < 0.5
      ? 4 * swingProgress * swingProgress * swingProgress
      : 1 - Math.pow(-2 * swingProgress + 2, 3) / 2;

    batRef.current.rotation.z = THREE.MathUtils.lerp(-0.3, Math.PI * 0.8, eased);
    batRef.current.rotation.y = THREE.MathUtils.lerp(0, -0.5, eased);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(0, -0.6, eased);

    const crouchProgress = Math.max(0, Math.min(1, (progress - 0.15) / 0.15));
    const extendProgress = Math.max(0, Math.min(1, (progress - 0.35) / 0.25));
    groupRef.current.position.y = -0.15 * crouchProgress + 0.1 * extendProgress;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Torso */}
      <mesh position={[0, 1.2, 0]}>
        <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
        <meshStandardMaterial color="#1a5276" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#f5cba7" roughness={0.6} />
      </mesh>
      {/* Helmet */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.1, 0.35, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 12]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      <mesh position={[0.1, 0.35, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 12]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      {/* Pads */}
      <mesh position={[-0.1, 0.35, 0.06]}>
        <boxGeometry args={[0.12, 0.55, 0.06]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
      </mesh>
      <mesh position={[0.1, 0.35, 0.06]}>
        <boxGeometry args={[0.12, 0.55, 0.06]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
      </mesh>

      {/* Bat Arm Group */}
      <group ref={batRef} position={[0.25, 1.35, 0.15]}>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <capsuleGeometry args={[0.06, 0.3, 8, 12]} />
          <meshStandardMaterial color="#1a5276" roughness={0.4} />
        </mesh>
        <mesh position={[0.35, -0.1, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.4, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        <mesh position={[0.35, -0.55, 0]}>
          <boxGeometry args={[0.12, 0.5, 0.04]} />
          <meshStandardMaterial color="#DEB887" roughness={0.5} metalness={0} />
        </mesh>
        <mesh position={[0.35, 0.1, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
        </mesh>
      </group>

      {/* Non-bat Arm */}
      <group ref={leftArmRef} position={[-0.25, 1.35, 0.1]}>
        <mesh rotation={[0.3, 0, Math.PI / 6]}>
          <capsuleGeometry args={[0.06, 0.35, 8, 12]} />
          <meshStandardMaterial color="#1a5276" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Cricket Ball ───────────────────────────────────────────────────
function CricketBall({ progress }: { progress: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Points>(null!);

  // Build trail geometry imperatively
  const trailGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(30 * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const ball = ref.current;

    if (progress < 0.3) {
      const t = progress / 0.3;
      const eased = t * t;
      ball.position.set(0, 1.1 + Math.sin(t * Math.PI) * 0.3, THREE.MathUtils.lerp(8, 0.6, eased));
      ball.rotation.x += 0.15;
    } else if (progress < 0.6) {
      const t = (progress - 0.3) / 0.3;
      ball.position.set(THREE.MathUtils.lerp(0, -0.5, t), THREE.MathUtils.lerp(1.1, 1.3, t), THREE.MathUtils.lerp(0.6, 0.3, t));
      ball.rotation.x += 0.2;
      ball.rotation.y += 0.1;
    } else {
      const t = (progress - 0.6) / 0.4;
      const eased = 1 - Math.pow(1 - t, 3);
      ball.position.set(
        THREE.MathUtils.lerp(-0.5, -8, eased),
        THREE.MathUtils.lerp(1.3, 5 + t * 3, eased),
        THREE.MathUtils.lerp(0.3, -12, eased)
      );
      ball.rotation.x += 0.3;
      ball.rotation.z += 0.2;
    }

    // Update trail
    const posAttr = trailGeo.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = arr.length - 3; i >= 3; i -= 3) {
      arr[i] = arr[i - 3];
      arr[i + 1] = arr[i - 2];
      arr[i + 2] = arr[i - 1];
    }
    arr[0] = ball.position.x;
    arr[1] = ball.position.y;
    arr[2] = ball.position.z;
    posAttr.needsUpdate = true;
  });

  return (
    <>
      <mesh ref={ref} position={[0, 1.1, 8]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color="#cc0000"
          roughness={0.2}
          metalness={0.3}
          emissive="#ff0000"
          emissiveIntensity={progress > 0.6 ? 0.5 : 0.1}
        />
      </mesh>
      <points ref={trailRef} geometry={trailGeo}>
        <pointsMaterial
          color="#ff3333"
          size={0.05}
          transparent
          opacity={progress > 0.55 ? 0.7 : 0.2}
          sizeAttenuation
        />
      </points>
    </>
  );
}

// ─── Stumps ─────────────────────────────────────────────────────────
function Stumps() {
  return (
    <group position={[0, 0.4, -0.5]}>
      {[-0.08, 0, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshStandardMaterial color="#d4a574" roughness={0.6} />
        </mesh>
      ))}
      {[-0.04, 0.04].map((x, i) => (
        <mesh key={`bail-${i}`} position={[x, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.07, 6]} />
          <meshStandardMaterial color="#c4944a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Pitch ──────────────────────────────────────────────────────────
function Pitch() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[4, 20]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0.5]}>
        <planeGeometry args={[1.5, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -0.8]}>
        <planeGeometry args={[1.5, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Stadium Particles ──────────────────────────────────────────────
function StadiumParticles({ progress }: { progress: number }) {
  const ref = useRef<THREE.Points>(null!);

  const particleGeo = useMemo(() => {
    const count = 200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 15 + 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      col[i * 3] = 0;
      col[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      col[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = progress > 0.6 ? 0.6 : 0.15;
  });

  return (
    <points ref={ref} geometry={particleGeo}>
      <pointsMaterial
        size={0.08}
        transparent
        opacity={0.15}
        vertexColors
        sizeAttenuation
      />
    </points>
  );
}

// ─── Camera Controller ──────────────────────────────────────────────
function CameraController({ progress }: { progress: number }) {
  useFrame(({ camera }) => {
    if (progress < 0.3) {
      const t = progress / 0.3;
      camera.position.set(
        THREE.MathUtils.lerp(1.5, 2.5, t),
        THREE.MathUtils.lerp(2.5, 2, t),
        THREE.MathUtils.lerp(5, 3, t)
      );
    } else if (progress < 0.6) {
      const t = (progress - 0.3) / 0.3;
      camera.position.set(
        THREE.MathUtils.lerp(2.5, 3, t),
        THREE.MathUtils.lerp(2, 1.8, t),
        THREE.MathUtils.lerp(3, 2, t)
      );
    } else {
      const t = (progress - 0.6) / 0.4;
      camera.position.set(
        THREE.MathUtils.lerp(3, 1, t),
        THREE.MathUtils.lerp(1.8, 3.5, t),
        THREE.MathUtils.lerp(2, 5, t)
      );
    }
    camera.lookAt(0, 1, 0);
  });
  return null;
}

// ─── Main Scene ─────────────────────────────────────────────────────
export default function CricketScene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow color="#ffe8cc" />
      <spotLight position={[-5, 8, -3]} intensity={0.8} angle={0.4} penumbra={0.5} color="#00ffff" />
      <spotLight position={[5, 8, 3]} intensity={0.6} angle={0.4} penumbra={0.5} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#00ffff" />
      <fog attach="fog" args={["#0a0a0a", 8, 25]} />

      <CameraController progress={scrollProgress} />
      <Batsman progress={scrollProgress} />
      <CricketBall progress={scrollProgress} />
      <Stumps />
      <Pitch />
      <StadiumParticles progress={scrollProgress} />
    </Canvas>
  );
}
