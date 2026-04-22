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
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Parameters
    const parameters = {
      count: 80000,
      size: 0.015,
      radius: 8,
      branches: 4,
      spin: 1,
      randomness: 0.3,
      randomnessPower: 3,
      insideColor: '#d4803a',
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
      
      // EL CAMBIO: Reducimos el hueco central para que se forme un núcleo luminoso
      if (radius < 0.2) radius += 0.2;

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
    // Background stars
    // ─────────────────────────────────────────
    const starCount = 3000;
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
      color: 0x888888, size: 0.03, sizeAttenuation: true,
      transparent: true, opacity: 0.5, depthWrite: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // ─────────────────────────────────────────
    // Animation loop
    // ─────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    const tick = () => {
      const t = clock.getElapsedTime();
      
      // Rotación suave de la galaxia principal
      galaxyPoints.rotation.y = t * 0.05;
      
      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };
    tick();

    // ─────────────────────────────────────────
    // Resize
    // ─────────────────────────────────────────
    const onResize = () => {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geoGalaxy.dispose(); matGalaxy.dispose();
      starGeo.dispose();   starMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}