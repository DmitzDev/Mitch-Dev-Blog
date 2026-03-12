import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";

function AnimatedSphere() {
    const meshRef = useRef<THREE.Mesh>(null);

    return (
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
            <Sphere args={[1, 100, 100]} scale={1.8}>
                <MeshDistortMaterial
                    color="#3b82f6"
                    speed={3}
                    distort={0.4}
                    radius={1}
                />
            </Sphere>
        </Float>
    );
}

function StarBackground() {
    const points = useMemo(() => {
        const p = new Float32Array(2000 * 3);
        for (let i = 0; i < 2000; i++) {
            p[i * 3] = (Math.random() - 0.5) * 10;
            p[i * 3 + 1] = (Math.random() - 0.5) * 10;
            p[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return p;
    }, []);

    const ref = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.getElapsedTime() * 0.05;
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.03;
        }
    });

    return (
        <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#3b82f6"
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </Points>
    );
}

export default function ThreeHero() {
    return (
        <div className="absolute inset-0 z-0 opacity-60">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <AnimatedSphere />
                <StarBackground />
            </Canvas>
        </div>
    );
}
