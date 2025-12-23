import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const FloatingParticles: React.FC = () => {
  const count = 500;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Random particles data
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const t = state.clock.getElapsedTime();
    
    particles.forEach((particle, i) => {
      let { factor, speed, xFactor, yFactor, zFactor } = particle;
      
      // Floating movement
      const x = (particle.mx / 10) * xFactor + Math.cos(t * speed * 0.5) * xFactor + Math.sin(t * 0.3) * 5;
      const y = (particle.my / 10) * yFactor + Math.sin(t * speed * 0.5) * yFactor + Math.cos(t * 0.5) * 5;
      const z = (particle.mx / 10) * zFactor + Math.cos(t * speed * 0.5) * zFactor + Math.sin(t * 0.3) * 5;
      
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.5 + Math.sin(t * 2 + i) * 0.3); // Twinkle size
      dummy.rotation.set(x, y, z);
      dummy.updateMatrix();
      
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
};