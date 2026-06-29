import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

const Atmosphere = () => {
    const meshRef = useRef();

    useFrame((state) => {
        const { clock } = state;
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
            meshRef.current.rotation.y = Math.cos(clock.getElapsedTime() * 0.3) * 0.1;
        }
    });

    return (
        <group ref={meshRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <Sphere args={[1, 100, 100]} position={[-2, 1, -5]}>
                    <MeshDistortMaterial
                        color="#f0f4f8"
                        envMapIntensity={0.5}
                        clearcoat={1}
                        clearcoatRoughness={0}
                        metalness={0.1}
                        distort={0.4}
                        speed={2}
                    />
                </Sphere>
            </Float>

            <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.2}>
                <Sphere args={[1.5, 100, 100]} position={[3, -1, -7]}>
                    <MeshDistortMaterial
                        color="#e2e8f0"
                        distort={0.3}
                        speed={1.5}
                    />
                </Sphere>
            </Float>

            <mesh position={[0, 0, -10]}>
                <planeGeometry args={[50, 50]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
        </group>
    );
};

const TheaterEffect = () => {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <Atmosphere />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default TheaterEffect;
