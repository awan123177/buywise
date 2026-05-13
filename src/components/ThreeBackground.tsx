import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function CameraRig({ mouse }: { mouse: React.MutableRefObject<{ x: number, y: number }> }) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.current.x * 2, delta * 2);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.current.y * 2, delta * 2);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function ParticleNetwork() {
  const pointsRef = useRef<THREE.Points>(null!);
  
  const particleCount = 400;
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      
      // Neon Red, stark white, and dim charcoal
      const rand = Math.random();
      if (rand > 0.95) color.setHex(0xFF3B30);
      else if (rand > 0.8) color.setHex(0xF5F5F5);
      else color.setHex(0x333333);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return [positions, colors];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.03;
      pointsRef.current.position.y = Math.sin(time * 0.1) * 3;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

function HolographicCore() {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.x = time * 0.1;
      outerRef.current.rotation.y = time * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -time * 0.05;
      innerRef.current.rotation.y = -time * 0.1;
      innerRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.2;
      ringRef.current.rotation.y = time * 0.2;
      ringRef.current.rotation.z = time * 0.1;
    }
  });

  return (
    <group position={[0, 0, -10]}>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[5, 2]} />
        <meshStandardMaterial color="#FF3B30" wireframe transparent opacity={0.15} blending={THREE.AdditiveBlending} emissive="#FF3B30" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={innerRef}>
        <octahedronGeometry args={[3, 0]} />
        <meshStandardMaterial color="#111111" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[7, 0.02, 16, 100]} />
        <meshBasicMaterial color="#FF3B30" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight position={[0, 0, 0]} color="#FF3B30" intensity={10} distance={20} />
    </group>
  );
}

export default function ThreeBackground() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-[#050505] overflow-hidden pointer-events-none">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
          <CameraRig mouse={mouse} />
          <fog attach="fog" args={['#050505', 8, 25]} />
          <ambientLight intensity={0.5} color="#F5F5F5" />
          <ParticleNetwork />
          <HolographicCore />
        </Canvas>
      </div>

      {/* Animated Grid Lines */}
      <div className="absolute inset-0 z-10 grid-lines-anim opacity-[0.2]"></div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 z-20 scanline-anim opacity-[0.05]"></div>

      {/* Vignette Edge Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] opacity-90 z-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80 opacity-90 z-20" />
      
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 z-30 pointer-events-none backdrop-blur-[1px] opacity-30"></div>
    </div>
  );
}
