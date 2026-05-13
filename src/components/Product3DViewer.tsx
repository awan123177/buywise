import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, PerspectiveCamera, OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

function ProductBox() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Subtle up-and-down bobbing motion and spinning
    meshRef.current.position.y = Math.sin(time * 2) * 0.2;
    meshRef.current.rotation.y = time * 0.5;
    meshRef.current.rotation.z = time * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial 
        color="#cc0000" 
        wireframe={true} 
        transparent 
        opacity={0.3} 
        metalness={1} 
        roughness={0} 
      />
    </mesh>
  );
}

export default function Product3DViewer({ imageUrl }: { imageUrl?: string }) {
  return (
    <div className="w-full h-full min-h-[300px] pointer-events-none">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
        <ambientLight intensity={1} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} color="#cc0000" intensity={2} />
        
        <Suspense fallback={null}>
          <ProductBox />
          
          <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={15} blur={3} far={5} />
          <Environment preset="warehouse" />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false}
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.2} 
          autoRotate
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}
