import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={2} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
        <MeshDistortMaterial
          color="#38bdf8"
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#8b5cf6" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <AnimatedShape />
        
        <gridHelper args={[20, 20, 0x1e293b, 0x0f172a]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -5]} />
      </Canvas>
    </div>
  );
};

export default Hero3D;
