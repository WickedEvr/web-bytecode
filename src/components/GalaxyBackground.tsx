import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    // ── Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.offsetWidth / canvas.offsetHeight,
      0.1,
      100
    );
    camera.position.set(0, 1, 6);
    camera.lookAt(0, -1, 0);

    // ── Renderer
    // OPTIMIZACIÓN 1: Desactivar antialias (innecesario para Points)
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    // OPTIMIZACIÓN 2: Forzar pixel ratio a 1 para ganancia masiva de rendimiento en pantallas Retina/4K
    renderer.setPixelRatio(1);

    // ── Parameters
    const parameters = {
      count: 15000, // OPTIMIZACIÓN 3: Reducido drásticamente de 80000 a 15000
      size: 0.025,  // Aumentado ligeramente para compensar y mantener la densidad visual
      radius: 8,
      branches: 4,
      spin: 1,
      randomness: 0.3,
      randomnessPower: 3,
      insideColor: '#ffbb44', // Color más sutil y anaranjado
      outsideColor: '#1a99ee',
    };

    // ─────────────────────────────────────────
    // Galaxy
    // ─────────────────────────────────────────
    const geoGalaxy = new THREE.BufferGeometry();
    const positions  = new Float32Array(parameters.count * 3);
    const colors     = new Float32Array(parameters.count * 3);
    const colorIn    = new THREE.Color(parameters.insideColor);
    const colorOut   = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      let radius = Math.random() * parameters.radius;
      
      // Permitimos que algunas estrellas estén más cerca del centro
      if (radius < 0.1) radius += 0.05;

      const spinAngle   = radius * parameters.spin;
      const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
      const rnd = (pow: number) =>
        Math.pow(Math.random(), pow) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

      positions[i3]     = Math.cos(branchAngle + spinAngle) * radius + rnd(parameters.randomnessPower);
      positions[i3 + 1] = rnd(parameters.randomnessPower) / 2;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + rnd(parameters.randomnessPower);

      const mixed = colorIn.clone().lerp(colorOut, radius / parameters.radius);
      colors[i3]     = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    geoGalaxy.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geoGalaxy.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    const matGalaxy = new THREE.PointsMaterial({
      size: parameters.size, sizeAttenuation: true,
      depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    });
    const galaxyPoints = new THREE.Points(geoGalaxy, matGalaxy);
    scene.add(galaxyPoints);

    // ─────────────────────────────────────────
    // Glowing Core
    // ─────────────────────────────────────────
    const coreCanvas = document.createElement('canvas');
    coreCanvas.width = 256;
    coreCanvas.height = 256;
    const ctx = coreCanvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.05, 'rgba(255, 230, 120, 0.5)');
      gradient.addColorStop(0.15, 'rgba(255, 180, 40, 0.2)');
      gradient.addColorStop(0.3, 'rgba(200, 100, 20, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
    }
    const coreTexture = new THREE.CanvasTexture(coreCanvas);
    const coreMaterial = new THREE.SpriteMaterial({
      map: coreTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.6
    });
    const coreSprite = new THREE.Sprite(coreMaterial);
    coreSprite.scale.set(4.5, 0.8, 1);
    scene.add(coreSprite);

    // ─────────────────────────────────────────
    // Background stars
    // ─────────────────────────────────────────
    const starCount = 1500; // Reducido de 3000 a 1500
    const starGeo   = new THREE.BufferGeometry();
    const starPos   = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const i3  = i * 3;
      const r   = 15 + Math.random() * 90;
      const t   = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i3]     = r * Math.sin(phi) * Math.cos(t);
      starPos[i3 + 1] = r * Math.sin(phi) * Math.sin(t);
      starPos[i3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x888888, size: 0.04, sizeAttenuation: true,
      transparent: true, opacity: 0.5, depthWrite: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // ─────────────────────────────────────────
    // Animation loop & Intersection Observer
    // ─────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;
    let isVisible = true;

    const tick = () => {
      // OPTIMIZACIÓN 4: Solo recalcular y renderizar si el Canvas está en pantalla
      if (isVisible) {
        const t = clock.getElapsedTime();
        // Rotación suave de la galaxia principal
        galaxyPoints.rotation.y = t * 0.05;
        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(tick);
    };
    tick();

    // Intersection Observer para pausar la animación al hacer scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0 });
    
    observer.observe(canvas);

    // ─────────────────────────────────────────
    // Resize
    // ─────────────────────────────────────────
    const onResize = () => {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
      // Mantener pixel ratio en 1 para evitar picos de uso en resize
      renderer.setPixelRatio(1);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      renderer.dispose();
      geoGalaxy.dispose(); matGalaxy.dispose();
      starGeo.dispose();   starMat.dispose();
      coreTexture.dispose(); coreMaterial.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}