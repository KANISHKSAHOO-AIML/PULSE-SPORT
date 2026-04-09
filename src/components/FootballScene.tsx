"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Football Player ────────────────────────────────────────────────
function FootballPlayer({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const rightLegRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current || !rightLegRef.current || !leftLegRef.current) return;

    if (progress < 0.3) {
      const t = progress / 0.3;
      const eased = 1 - Math.pow(1 - t, 2);
      groupRef.current.position.x = THREE.MathUtils.lerp(3, 0.3, eased);
      groupRef.current.position.z = THREE.MathUtils.lerp(2, 0.15, eased);
      const runCycle = Math.sin(t * Math.PI * 6);
      rightLegRef.current.rotation.x = runCycle * 0.6;
      leftLegRef.current.rotation.x = -runCycle * 0.6;
      if (bodyRef.current) {
        bodyRef.current.rotation.x = 0.1;
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(0, -0.3, eased);
      }
    } else if (progress < 0.5) {
      const t = (progress - 0.3) / 0.2;
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      groupRef.current.position.x = 0.3;
      groupRef.current.position.z = 0.15;
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(-0.5, Math.PI * 0.55, eased);
      leftLegRef.current.rotation.x = -0.15;
      if (bodyRef.current) {
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(0.1, -0.25, eased);
        bodyRef.current.rotation.y = -0.3;
      }
    } else {
      const t = (progress - 0.5) / 0.5;
      groupRef.current.position.x = 0.3;
      groupRef.current.position.z = 0.15;
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI * 0.55, 0.3, Math.min(1, t * 2));
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(-0.15, 0, t);
      if (bodyRef.current) {
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(-0.25, 0, t);
      }
    }
  });

  const jerseyColor = "#1a3c6e";
  const shortsColor = "#ffffff";
  const skinColor = "#d4a574";
  const sockColor = "#1a3c6e";
  const bootColor = "#111111";

  return (
    <group ref={groupRef} position={[3, 0, 2]}>
      <group ref={bodyRef}>
        <mesh position={[0, 1.2, 0]}>
          <capsuleGeometry args={[0.18, 0.45, 8, 16]} />
          <meshStandardMaterial color={jerseyColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.25, -0.19]}>
          <planeGeometry args={[0.15, 0.15]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.95, -0.02]}>
          <sphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2c1810" roughness={0.8} />
        </mesh>
        <mesh position={[-0.25, 1.25, 0]} rotation={[0, 0, Math.PI / 6]}>
          <capsuleGeometry args={[0.05, 0.35, 8, 12]} />
          <meshStandardMaterial color={jerseyColor} roughness={0.4} />
        </mesh>
        <mesh position={[0.25, 1.25, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <capsuleGeometry args={[0.05, 0.35, 8, 12]} />
          <meshStandardMaterial color={jerseyColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.82, 0]}>
          <capsuleGeometry args={[0.17, 0.12, 8, 12]} />
          <meshStandardMaterial color={shortsColor} roughness={0.5} />
        </mesh>
      </group>

      {/* Right Leg (kicking) */}
      <group ref={rightLegRef} position={[0.1, 0.7, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.07, 0.25, 8, 12]} />
          <meshStandardMaterial color={shortsColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.42, 0]}>
          <capsuleGeometry args={[0.055, 0.25, 8, 12]} />
          <meshStandardMaterial color={sockColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.62, 0.06]}>
          <boxGeometry args={[0.09, 0.06, 0.18]} />
          <meshStandardMaterial color={bootColor} roughness={0.3} metalness={0.2} />
        </mesh>
      </group>

      {/* Left Leg (plant) */}
      <group ref={leftLegRef} position={[-0.1, 0.7, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.07, 0.25, 8, 12]} />
          <meshStandardMaterial color={shortsColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.42, 0]}>
          <capsuleGeometry args={[0.055, 0.25, 8, 12]} />
          <meshStandardMaterial color={sockColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.62, 0.06]}>
          <boxGeometry args={[0.09, 0.06, 0.18]} />
          <meshStandardMaterial color={bootColor} roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Football ───────────────────────────────────────────────────────
function Football({ progress }: { progress: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Points>(null!);

  const trailGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(40 * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const ball = ref.current;

    if (progress < 0.35) {
      ball.position.set(0, 0.12, 0);
      ball.rotation.x = 0;
    } else if (progress < 0.5) {
      const t = (progress - 0.35) / 0.15;
      const eased = t * t;
      ball.position.set(
        THREE.MathUtils.lerp(0, -0.3, eased),
        THREE.MathUtils.lerp(0.12, 1.5, eased),
        THREE.MathUtils.lerp(0, -2, eased)
      );
      ball.rotation.x -= 0.3;
      ball.rotation.z += 0.1;
    } else if (progress < 0.85) {
      const t = (progress - 0.5) / 0.35;
      const eased = 1 - Math.pow(1 - t, 2);
      const height = 1.5 + Math.sin(t * Math.PI) * 2.5;
      ball.position.set(
        THREE.MathUtils.lerp(-0.3, 0.2, eased),
        height,
        THREE.MathUtils.lerp(-2, -14, eased)
      );
      ball.rotation.x -= 0.25;
      ball.rotation.z += 0.15;
    } else {
      const t = (progress - 0.85) / 0.15;
      const bounce = Math.sin(t * Math.PI * 2) * 0.1 * (1 - t);
      ball.position.set(
        0.2 + bounce,
        THREE.MathUtils.lerp(1.2, 0.8, t) + bounce * 0.5,
        THREE.MathUtils.lerp(-14, -14.5, t)
      );
      ball.rotation.x -= 0.05 * (1 - t);
    }

    // Update trail
    if (progress > 0.4) {
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
    }
  });

  return (
    <>
      <mesh ref={ref} position={[0, 0.12, 0]} castShadow>
        <icosahedronGeometry args={[0.12, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.3}
          metalness={0.1}
          emissive={progress > 0.5 ? "#39FF14" : "#000000"}
          emissiveIntensity={progress > 0.5 ? 0.3 : 0}
        />
      </mesh>
      <points ref={trailRef} geometry={trailGeo}>
        <pointsMaterial
          color="#39FF14"
          size={0.06}
          transparent
          opacity={progress > 0.45 ? 0.6 : 0}
          sizeAttenuation
        />
      </points>
    </>
  );
}

// ─── Goalpost ───────────────────────────────────────────────────────
function Goalpost() {
  const postColor = "#cccccc";
  const postMetal = 0.6;
  const width = 3.66;
  const height = 2.44;

  return (
    <group position={[0, 0, -15]}>
      <mesh position={[-width / 2, height / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, height, 12]} />
        <meshStandardMaterial color={postColor} roughness={0.2} metalness={postMetal} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, height, 12]} />
        <meshStandardMaterial color={postColor} roughness={0.2} metalness={postMetal} />
      </mesh>
      <mesh position={[0, height, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, width, 12]} />
        <meshStandardMaterial color={postColor} roughness={0.2} metalness={postMetal} />
      </mesh>
      {/* Net panels */}
      <mesh position={[0, height / 2, -1.2]}>
        <planeGeometry args={[width + 0.2, height + 0.1, 16, 10]} />
        <meshStandardMaterial color="#cccccc" wireframe transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, height + 0.05, -0.6]} rotation={[Math.PI / 3, 0, 0]}>
        <planeGeometry args={[width + 0.2, 1.4, 16, 6]} />
        <meshStandardMaterial color="#cccccc" wireframe transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-width / 2 - 0.05, height / 2, -0.6]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, height + 0.1, 6, 10]} />
        <meshStandardMaterial color="#cccccc" wireframe transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[width / 2 + 0.05, height / 2, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, height + 0.1, 6, 10]} />
        <meshStandardMaterial color="#cccccc" wireframe transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Football Pitch ─────────────────────────────────────────────────
function FootballPitch() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1a6e1a" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -9]}>
        <planeGeometry args={[8, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.001, -12]}>
        <planeGeometry args={[0.05, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.001, -12]}>
        <planeGeometry args={[0.05, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -15]}>
        <planeGeometry args={[20, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, i * 4 - 8]} receiveShadow>
          <planeGeometry args={[60, 2]} />
          <meshStandardMaterial color="#166616" roughness={0.9} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Celebration Particles ──────────────────────────────────────────
function CelebrationParticles({ progress }: { progress: number }) {
  const ref = useRef<THREE.Points>(null!);

  const { geo, velocities } = useMemo(() => {
    const count = 150;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = Math.random() * 4;
      pos[i * 3 + 2] = -14 + (Math.random() - 0.5) * 2;
      vel[i * 3] = (Math.random() - 0.5) * 0.05;
      vel[i * 3 + 1] = Math.random() * 0.03 + 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
      col[i * 3] = 0.2 + Math.random() * 0.3;
      col[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      col[i * 3 + 2] = 0.1 + Math.random() * 0.2;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geo: g, velocities: vel };
  }, []);

  useFrame(() => {
    if (!ref.current || progress < 0.8) return;

    const posAttr = ref.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;
    for (let i = 0; i < posArray.length; i += 3) {
      posArray[i] += velocities[i];
      posArray[i + 1] += velocities[i + 1];
      posArray[i + 2] += velocities[i + 2];
    }
    posAttr.needsUpdate = true;

    const mat = ref.current.material as THREE.PointsMaterial;
    const celebT = (progress - 0.8) / 0.2;
    mat.opacity = celebT * 0.8;
  });

  return (
    <points ref={ref} geometry={geo} visible={progress > 0.8}>
      <pointsMaterial
        size={0.12}
        transparent
        opacity={0}
        vertexColors
        sizeAttenuation
      />
    </points>
  );
}

// ─── Net Ripple ─────────────────────────────────────────────────────
function NetRipple({ progress }: { progress: number }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!ref.current || progress < 0.82) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    const t = (progress - 0.82) / 0.18;
    const geo = ref.current.geometry as THREE.PlaneGeometry;
    const posAttr = geo.attributes.position;
    const arr = posAttr.array as Float32Array;
    const time = clock.getElapsedTime();

    for (let i = 0; i < posAttr.count; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];
      const dist = Math.sqrt(x * x + (y - 0.8) * (y - 0.8));
      const wave = Math.sin(dist * 5 - time * 8) * 0.15 * (1 - t);
      arr[i * 3 + 2] = wave;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <mesh ref={ref} position={[0, 1.2, -14.8]} visible={false}>
      <planeGeometry args={[3.5, 2.4, 20, 14]} />
      <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Camera Controller ──────────────────────────────────────────────
function CameraController({ progress }: { progress: number }) {
  useFrame(({ camera }) => {
    if (progress < 0.3) {
      const t = progress / 0.3;
      camera.position.set(
        THREE.MathUtils.lerp(4, 2.5, t),
        THREE.MathUtils.lerp(2, 1.5, t),
        THREE.MathUtils.lerp(6, 3, t)
      );
      camera.lookAt(0, 0.5, -2);
    } else if (progress < 0.5) {
      const t = (progress - 0.3) / 0.2;
      camera.position.set(
        THREE.MathUtils.lerp(2.5, 2, t),
        THREE.MathUtils.lerp(1.5, 1.2, t),
        THREE.MathUtils.lerp(3, 2, t)
      );
      camera.lookAt(0, THREE.MathUtils.lerp(0.5, 0.8, t), THREE.MathUtils.lerp(-2, -4, t));
    } else if (progress < 0.85) {
      const t = (progress - 0.5) / 0.35;
      camera.position.set(
        THREE.MathUtils.lerp(2, 3, t),
        THREE.MathUtils.lerp(1.2, 2.5, t),
        THREE.MathUtils.lerp(2, -8, t)
      );
      camera.lookAt(0, THREE.MathUtils.lerp(0.8, 1.5, t), THREE.MathUtils.lerp(-4, -14, t));
    } else {
      const t = (progress - 0.85) / 0.15;
      camera.position.set(
        THREE.MathUtils.lerp(3, 0.5, t),
        THREE.MathUtils.lerp(2.5, 2, t),
        THREE.MathUtils.lerp(-8, -12, t)
      );
      camera.lookAt(0, 1, -14);
    }
  });
  return null;
}

// ─── Main Scene ─────────────────────────────────────────────────────
export default function FootballScene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 5]} intensity={1.8} castShadow color="#ffffff" />
      <spotLight position={[-8, 12, -10]} intensity={1} angle={0.35} penumbra={0.5} color="#39FF14" distance={30} />
      <spotLight position={[8, 12, -10]} intensity={0.8} angle={0.35} penumbra={0.5} color="#ffffff" distance={30} />
      <hemisphereLight args={["#87CEEB", "#1a6e1a", 0.3]} />
      <fog attach="fog" args={["#0a0f0a", 12, 35]} />

      <CameraController progress={scrollProgress} />
      <FootballPlayer progress={scrollProgress} />
      <Football progress={scrollProgress} />
      <Goalpost />
      <FootballPitch />
      <CelebrationParticles progress={scrollProgress} />
      <NetRipple progress={scrollProgress} />
    </Canvas>
  );
}
