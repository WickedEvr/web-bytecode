import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Timer } from "three";

// --- 1. NIEBLA VOLUMÉTRICA MEJORADA (Efecto "Río" o Aurora extendida) ---
const NebulaMist = ({
  count = 300,
  color,
  speed = 0.2,
  yOffset = 0,
}: {
  count?: number;
  color: string;
  speed?: number;
  yOffset?: number;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const timer = useMemo(() => new Timer(), []);

  React.useEffect(() => {
    timer.connect(document);
    return () => timer.disconnect();
  }, [timer]);

  const smokeTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // MATEMÁTICA NUEVA: En lugar de un anillo circular, creamos una banda ancha
  const createParticles = (c: number, y: number) => {
    const pos = new Float32Array(c * 3);
    const offsets = new Float32Array(c);
    for (let i = 0; i < c; i++) {
      // X: Esparcimos la niebla de lado a lado de la pantalla (-50 a +50)
      pos[i * 3] = (Math.random() - 0.5) * 100;

      // Y: Añadimos una ligera onda senoidal para que parezca una cinta y no un bloque
      const wave = Math.sin(pos[i * 3] * 0.05) * 5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15 + y + wave;

      // Z: Empujamos la niebla MUY al fondo (-15 a -45) para que sea un fondo real
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 30;

      offsets[i] = Math.random() * Math.PI * 2;
    }
    return { pos, offsets };
  };

  const [particles, setParticles] = React.useState(() => createParticles(count, yOffset));

  React.useEffect(() => {
    setParticles(createParticles(count, yOffset));
  }, [count, yOffset]);

  useFrame(() => {
    if (!pointsRef.current) return;
    timer.update();
    const time = timer.getElapsed() * speed;
    const posArray = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Movimiento vertical suave (respiración)
      posArray[i * 3 + 1] += Math.sin(time + particles.offsets[i]) * 0.01;

      // Movimiento horizontal continuo (flujo de izquierda a derecha)
      posArray[i * 3] += 0.03 * speed;
      // Si la partícula sale por la derecha, la reiniciamos a la izquierda para un bucle infinito
      if (posArray[i * 3] > 50) {
        posArray[i * 3] = -50;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.pos, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={smokeTexture}
        size={25} // Partículas más grandes para hacer bulto...
        color={color}
        transparent
        opacity={0.03} // ...pero MUCHÍSIMO más transparentes (0.03) para evitar quemar el color
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// --- 3. FONDO ROTATORIO BASE ---
const RotatingBackground = () => {
  const bgRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (bgRef.current) {
      bgRef.current.rotation.y += 0.0003; // Rotación aún más lenta y majestuosa
    }
  });

  return (
    <group ref={bgRef}>
      <Stars
        radius={100}
        depth={50}
        count={4000}
        factor={3}
        saturation={0}
        fade
        speed={1}
      />

      {/* Nieblas expandidas y menos densas */}
      <NebulaMist count={300} color="#026B9B" speed={0.8} yOffset={2} />
      <NebulaMist count={250} color="#0CA3C6" speed={0.6} yOffset={-4} />
    </group>
  );
};

// --- COMPONENTE PRINCIPAL ---
const AuroraBackground: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-[#020611] overflow-hidden font-sansation text-white">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
          <ambientLight intensity={0.5} />

          <RotatingBackground />
        </Canvas>
      </div>
    </div>
  );
};

export default AuroraBackground;
