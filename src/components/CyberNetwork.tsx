import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Definimos la interfaz de las props (opcional pero recomendado si usas TypeScript)
interface CyberNetworkProps {
    count?: number;
    maxDistance?: number;
    color?: string;
}

const CyberNetwork: React.FC<CyberNetworkProps> = ({
    count = 80,
    maxDistance = 14,
    color = "#06CFD6",
}) => {
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
    const linePositions = useMemo(
        () => new Float32Array(maxLines * 6),
        [maxLines],
    );
  const lineColors = useMemo(() => new Float32Array(maxLines * 8), [maxLines]);

    useFrame((state) => {
        if (!pointsRef.current || !linesRef.current) return;

        if (groupRef.current) {
            const targetX = state.pointer.y * 0.15;
            const targetY = state.pointer.x * 0.15;
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

                    const alpha = Math.max(0, 1.0 - dist / maxDistance);
                    const smoothAlpha = alpha * alpha * globalOpacity;

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
                <bufferAttribute
                    attach="attributes-position"
                    args={[particles.pos, 3]}
                />
                </bufferGeometry>
                <pointsMaterial
                size={0.12}
                color={color}
                transparent
                opacity={globalOpacity}
                />
            </points>

            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[linePositions, 3]}
                    />
                    <bufferAttribute attach="attributes-color" args={[lineColors, 4]} />
                </bufferGeometry>
                <lineBasicMaterial
                    vertexColors
                    transparent
                    blending={THREE.NormalBlending}
                    depthWrite={false}
                />
            </lineSegments>
        </group>
    );
};  

export default CyberNetwork;