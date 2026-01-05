import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Torus } from '@react-three/drei';

function FloatingShape({ position, color, speed }) {
    const mesh = useRef();

    useFrame((state) => {
        mesh.current.rotation.x += 0.01 * speed;
        mesh.current.rotation.y += 0.01 * speed;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={mesh} position={position}>
                <torusGeometry args={[1, 0.4, 16, 100]} />
                <meshStandardMaterial color={color} wireframe opacity={0.3} transparent />
            </mesh>
        </Float>
    );
}

export default function Background3D() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}>
            <Canvas camera={{ position: [0, 0, 10] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <FloatingShape position={[-3, 2, 0]} color="#4F46E5" speed={1} />
                <FloatingShape position={[4, -2, -2]} color="#6366f1" speed={0.8} />
                <FloatingShape position={[0, 0, -5]} color="#4338ca" speed={0.5} />
            </Canvas>
        </div>
    );
}
