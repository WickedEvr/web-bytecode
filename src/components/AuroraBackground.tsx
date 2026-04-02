import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

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
  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // X: Esparcimos la niebla de lado a lado de la pantalla (-50 a +50)
      pos[i * 3] = (Math.random() - 0.5) * 100;

      // Y: Añadimos una ligera onda senoidal para que parezca una cinta y no un bloque
      const wave = Math.sin(pos[i * 3] * 0.05) * 5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15 + yOffset + wave;

      // Z: Empujamos la niebla MUY al fondo (-15 a -45) para que sea un fondo real
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 30;

      offsets[i] = Math.random() * Math.PI * 2;
    }
    return { pos, offsets };
  }, [count, yOffset]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime * speed;
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

// --- 2. RED CIBERNÉTICA SEGURA (Parallax + RGB Lerping) ---
const CyberNetwork = ({ count = 80, maxDistance = 14, color = "#06CFD6" }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const groupRef = useRef<THREE.Group>(null);

  // Generar puntos iniciales flotando en 3D
  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      vel.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.012,
        ),
      );
    }
    return { pos, vel };
  }, [count]);

  const maxLines = (count * (count - 1)) / 2;
  const linePositions = useMemo(
    () => new Float32Array(maxLines * 6),
    [maxLines],
  );

  // CAMBIO CLAVE 1: Ahora el array de colores tiene 8 posiciones por línea (RGBA en lugar de RGB)
  // 4 valores por vértice: R, G, B, Alpha (Opacidad)
  const lineColors = useMemo(() => new Float32Array(maxLines * 8), [maxLines]);

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current) return;

    // 3. EFECTO PARALLAX (Interacción con el ratón)
    if (groupRef.current) {
      // state.pointer nos da la posición del ratón de -1 a 1.
      // Multiplicamos por 0.15 para definir qué tanto se inclina la red.
      const targetX = state.pointer.y * 0.15;
      const targetY = state.pointer.x * 0.15;

      // Usamos lerp (interpolación lineal) para que el movimiento no sea brusco,
      // sino que se sienta como si estuviera flotando en un fluido denso.
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetX,
        0.02,
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetY,
        0.02,
      );
    }

    const posArray = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    // Mover los Nodos (se mantiene igual)
    for (let i = 0; i < count; i++) {
      posArray[i * 3] += particles.vel[i].x;
      posArray[i * 3 + 1] += particles.vel[i].y;
      posArray[i * 3 + 2] += particles.vel[i].z;

      if (Math.abs(posArray[i * 3]) > 20) particles.vel[i].x *= -1;
      if (Math.abs(posArray[i * 3 + 1]) > 20) particles.vel[i].y *= -1;
      if (Math.abs(posArray[i * 3 + 2]) > 20) particles.vel[i].z *= -1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Calcular líneas y Fade-in Suave (Alpha)
    let vertexPos = 0;
    let colorPos = 0;
    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = posArray[i * 3] - posArray[j * 3];
        const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
        const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          // Conectar Vértices
          linePositions[vertexPos++] = posArray[i * 3];
          linePositions[vertexPos++] = posArray[i * 3 + 1];
          linePositions[vertexPos++] = posArray[i * 3 + 2];
          linePositions[vertexPos++] = posArray[j * 3];
          linePositions[vertexPos++] = posArray[j * 3 + 1];
          linePositions[vertexPos++] = posArray[j * 3 + 2];

          // CAMBIO CLAVE 2: Calculamos la opacidad (alpha) basada en la distancia
          const alpha = Math.max(0, 1.0 - dist / maxDistance);
          const smoothAlpha = alpha * alpha; // Curva suave

          // CAMBIO CLAVE 3: Mantenemos el color intacto (baseColor) y solo variamos el canal Alpha
          // Vértice 1 (R, G, B, A)
          lineColors[colorPos++] = baseColor.r;
          lineColors[colorPos++] = baseColor.g;
          lineColors[colorPos++] = baseColor.b;
          lineColors[colorPos++] = smoothAlpha;

          // Vértice 2 (R, G, B, A)
          lineColors[colorPos++] = baseColor.r;
          lineColors[colorPos++] = baseColor.g;
          lineColors[colorPos++] = baseColor.b;
          lineColors[colorPos++] = smoothAlpha;
        }
      }
    }

    const lineGeom = linesRef.current.geometry;
    lineGeom.setDrawRange(0, vertexPos / 3);
    lineGeom.attributes.position.needsUpdate = true;
    lineGeom.attributes.color.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.pos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.12} color={color} transparent opacity={0.9} />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
          {/* CAMBIO CLAVE 4: Indicamos que el atributo color ahora tiene 4 valores por vértice (itemSize: 4) */}
          <bufferAttribute attach="attributes-color" args={[lineColors, 4]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          // Quitamos el AdditiveBlending para que las líneas superpuestas no se "quemen" a blanco
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
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
          <CyberNetwork count={100} maxDistance={12} color="#06CFD6" />
        </Canvas>
      </div>
    </div>
  );
};

export default AuroraBackground;