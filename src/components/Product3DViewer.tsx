import React, { useRef, Suspense, useState, useMemo, Component, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, ContactShadows, Environment, PerformanceMonitor, Preload, useTexture, Detailed } from '@react-three/drei';
import * as THREE from 'three';

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function TexturedBox({ imageUrl }: { imageUrl: string }) {
  const lodRef = useRef<THREE.LOD>(null!);
  
  // Use proxy for external images to avoid CORS issues
  const proxiedUrl = useMemo(() => {
    if (!imageUrl || imageUrl.startsWith('data:') || imageUrl.startsWith('/') || imageUrl.includes(window.location.host)) {
      return imageUrl;
    }
    return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  }, [imageUrl]);

  const texture = useTexture(proxiedUrl);
  const { gl } = useThree();

  useMemo(() => {
    // Optimize textures for lower-end devices
    if (texture) {
      if (gl.capabilities.getMaxAnisotropy() > 0) {
        texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy()); // Balance performance and quality
      } else {
        texture.anisotropy = 1;
      }
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture, gl]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (lodRef.current) {
        lodRef.current.position.y = Math.sin(time * 2) * 0.2;
        lodRef.current.rotation.y = time * 0.5;
        lodRef.current.rotation.z = time * 0.2;
    }
  });

  return (
    <Detailed distances={[0, 10, 20]} ref={lodRef}>
      <mesh>
        <boxGeometry args={[3, 3, 3, 8, 8, 8]} />
        <meshStandardMaterial 
          map={texture}
          metalness={0.2} 
          roughness={0.8}
          color="#ffffff"
        />
      </mesh>
      <mesh>
        <boxGeometry args={[3, 3, 3, 2, 2, 2]} />
        <meshStandardMaterial 
          map={texture}
          metalness={0.2} 
          roughness={0.8}
          color="#ffffff"
        />
      </mesh>
      <mesh>
        <boxGeometry args={[3, 3, 3, 1, 1, 1]} />
        <meshBasicMaterial 
          map={texture}
          color="#ffffff"
        />
      </mesh>
    </Detailed>
  );
}

function WireframeBox() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.position.y = Math.sin(time * 2) * 0.2;
        meshRef.current.rotation.y = time * 0.5;
        meshRef.current.rotation.z = time * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[3, 3, 3, 1, 1, 1]} />
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
  const [dpr, setDpr] = useState(1);

  return (
    <div className="w-full h-full min-h-[300px] pointer-events-none">
      <Canvas shadows dpr={dpr}>
        {/* Optimize DPR dynamically for lower-end devices */}
        <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
        <ambientLight intensity={1} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} color="#cc0000" intensity={2} />
        
        {/* Lazy loading the model and textures via Suspense */}
        <Suspense fallback={<WireframeBox />}>
          {imageUrl ? (
            <ErrorBoundary fallback={<WireframeBox />}>
              <TexturedBox imageUrl={imageUrl} />
            </ErrorBoundary>
          ) : (
            <WireframeBox />
          )}
          
          <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={15} blur={3} far={5} />
          {/* Low res HDRI for optimization */}
          <Environment preset="warehouse" resolution={256} />
          <Preload all />
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
