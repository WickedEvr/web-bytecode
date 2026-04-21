import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SEO from '../components/SEO';

// --- RED CIBERNÉTICA EXTRAÍDA ---
const CyberNetwork = ({ count = 80, maxDistance = 14, color = "#06CFD6" }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Variable para controlar la opacidad general fácilmente
  const globalOpacity = 0.25; 

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
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);
  const lineColors = useMemo(() => new Float32Array(maxLines * 8), [maxLines]);

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current) return;

    if (groupRef.current) {
      const targetX = state.pointer.y * 0.15;
      const targetY = state.pointer.x * 0.15;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.02);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.02);
    }

    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      posArray[i * 3] += particles.vel[i].x;
      posArray[i * 3 + 1] += particles.vel[i].y;
      posArray[i * 3 + 2] += particles.vel[i].z;

      if (Math.abs(posArray[i * 3]) > 20) particles.vel[i].x *= -1;
      if (Math.abs(posArray[i * 3 + 1]) > 20) particles.vel[i].y *= -1;
      if (Math.abs(posArray[i * 3 + 2]) > 20) particles.vel[i].z *= -1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

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
          linePositions[vertexPos++] = posArray[i * 3];
          linePositions[vertexPos++] = posArray[i * 3 + 1];
          linePositions[vertexPos++] = posArray[i * 3 + 2];
          linePositions[vertexPos++] = posArray[j * 3];
          linePositions[vertexPos++] = posArray[j * 3 + 1];
          linePositions[vertexPos++] = posArray[j * 3 + 2];

          // EL CAMBIO ESTÁ AQUÍ: Multiplicamos la curva suave por nuestra opacidad global
          const alpha = Math.max(0, 1.0 - dist / maxDistance);
          const smoothAlpha = (alpha * alpha) * globalOpacity;

          lineColors[colorPos++] = baseColor.r;
          lineColors[colorPos++] = baseColor.g;
          lineColors[colorPos++] = baseColor.b;
          lineColors[colorPos++] = smoothAlpha;

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
          <bufferAttribute attach="attributes-position" args={[particles.pos, 3]} />
        </bufferGeometry>
        {/* EL CAMBIO ESTÁ AQUÍ: opacity={globalOpacity} */}
        <pointsMaterial size={0.12} color={color} transparent opacity={globalOpacity} />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 4]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent blending={THREE.NormalBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
};
// --- FIN RED CIBERNÉTICA ---

const ghostInput =
  'w-full bg-white/5 border border-white/25 rounded-full px-5 py-3 text-white placeholder-white/35 focus:outline-none focus:border-primary-cyan transition-colors text-sm';

const ghostSelect =
  'w-full bg-white/5 border border-white/25 rounded-full px-5 py-3 text-white/60 focus:outline-none focus:border-primary-cyan transition-colors text-sm appearance-none cursor-pointer';

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <label className="block text-white/80 text-xs font-semibold mb-1.5 pl-1">
    {text}
    {required && <span className="text-primary-cyan ml-1">*</span>}
  </label>
);

const Contacto: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    email: '',
    celular: '',
    empresa: '',
    ruc: '',
    servicio: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/confirmacion');
    }, 500);
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sansation">
      <SEO 
        title="Contacto" 
        description="Ponte en contacto con Bytecode para iniciar tu proyecto de transformación digital hoy mismo."
      />
      
      {/* Fondo espacio + Image + Red Cibernética */}
      <div className="absolute inset-0" style={{ backgroundColor: '#040e1f' }}>
        {/* 1. GIF de fondo */}
        <img src="/galaxia.gif" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        
        {/* 2. Capa oscura para asegurar legibilidad del formulario */}
        <div className="absolute inset-0 bg-[#040e1f]/75" />

        {/* 3. Canvas con la Red 3D (Se coloca encima del video y la capa oscura, pero debajo del formulario) */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <CyberNetwork count={100} maxDistance={12} color="#06CFD6" />
          </Canvas>
        </div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-24 pointer-events-auto">
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black mb-10"
        >
          <span className="text-primary-cyan">Conecta</span>
          <span className="text-white"> con tu marca</span>
        </motion.h1>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Nombre */}
          <div>
            <Label text="Nombre Completo" required />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre Completo"
              className={ghostInput}
              required
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Cargo */}
          <div>
            <Label text="Cargo" required />
            <input
              type="text"
              name="cargo"
              placeholder="Cargo"
              className={ghostInput}
              required
              value={formData.cargo}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <Label text="Email" required />
            <input
              type="email"
              name="email"
              placeholder="Correo"
              className={ghostInput}
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Celular */}
          <div>
            <Label text="Número de celular" required />
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/25 rounded-full px-4 py-3 text-white text-sm shrink-0">
                <span>🇵🇪</span>
                <span className="text-white/70">+51</span>
              </div>
              <input
                type="tel"
                name="celular"
                placeholder="Número de celular"
                className={`${ghostInput} flex-1`}
                required
                value={formData.celular}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Empresa */}
          <div>
            <Label text="Empresa" required />
            <input
              type="text"
              name="empresa"
              placeholder="Empresa"
              className={ghostInput}
              required
              value={formData.empresa}
              onChange={handleChange}
            />
          </div>

          {/* RUC */}
          <div>
            <Label text="RUC" required />
            <input
              type="text"
              name="ruc"
              placeholder="RUC"
              className={ghostInput}
              required
              value={formData.ruc}
              onChange={handleChange}
            />
          </div>

          {/* Servicio */}
          <div>
            <Label text="Servicio que requiere" required />
            <div className="relative">
              <select
                name="servicio"
                defaultValue=""
                className={ghostSelect}
                required
                onChange={handleChange}
              >
                <option value="" disabled>Servicio</option>
                <option value="web">Página Web</option>
                <option value="app">App Móvil</option>
                <option value="ai">Inteligencia Artificial</option>
                <option value="marketing">Marketing Digital</option>
              </select>
              {/* Chevron */}
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-cyan text-white font-black py-4 rounded-full text-lg tracking-widest uppercase hover:bg-cyan-500 transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Enviando...' : 'Conectar'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Contacto;