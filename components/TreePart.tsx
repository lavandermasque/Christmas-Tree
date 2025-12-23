import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeState } from '../types';
import { ANIMATION_SPEED } from '../constants';

interface TreePartProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  count: number;
  data: {
    treePos: THREE.Vector3[];
    scatterPos: THREE.Vector3[];
    scales: number[];
    colors: THREE.Color[];
  };
  treeState: TreeState;
}

export const TreePart: React.FC<TreePartProps> = ({ geometry, material, count, data, treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  // Initialize positions
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    // We set initial positions once. The useFrame handles all subsequent movement.
    for (let i = 0; i < count; i++) {
      const pos = data.treePos[i]; 
      tempObject.position.copy(pos);
      tempObject.scale.setScalar(data.scales[i]);
      tempObject.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, data.colors[i]);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [count, data, tempObject]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const isAssembled = treeState === TreeState.ASSEMBLED;
    let needsUpdate = false;

    for (let i = 0; i < count; i++) {
      // Get current matrix
      meshRef.current.getMatrixAt(i, tempObject.matrix);
      tempObject.matrix.decompose(tempObject.position, tempObject.quaternion, tempObject.scale);

      const targetPos = isAssembled ? data.treePos[i] : data.scatterPos[i];
      
      // Calculate distance
      const dist = tempObject.position.distanceTo(targetPos);
      
      // Animation Loop
      // Lower threshold (0.01) ensures particles settle gently without abrupt stops
      if (dist > 0.01) {
        needsUpdate = true;
        
        // Vary speed per particle for organic feel
        const randomSpeedFactor = 0.5 + (i % 10) * 0.1;
        const speed = ANIMATION_SPEED * randomSpeedFactor;
        
        // --- VORTEX EFFECT ---
        // Instead of moving in a straight line, we add a slight rotation around the Y-axis (center).
        // Combined with the lerp attraction to the target, this creates a spiral/curved trajectory.
        // We only apply this when distance is significant to avoid spinning in place at the destination.
        if (dist > 0.5) {
          // Swirl intensity: Stronger when assembling for a "magical gathering" feel
          const swirlIntensity = isAssembled ? 3.0 : 0.5;
          const angle = delta * speed * 0.1 * swirlIntensity;

          const x = tempObject.position.x;
          const z = tempObject.position.z;

          // Rotate position around Y-axis
          tempObject.position.x = x * Math.cos(angle) - z * Math.sin(angle);
          tempObject.position.z = x * Math.sin(angle) + z * Math.cos(angle);
        }

        // Standard Lerp for position attraction
        tempObject.position.lerp(targetPos, speed * delta);
        
        // --- DYNAMIC ROTATION ---
        // Particles tumble faster when moving fast, and slow down as they settle.
        // This mimics physical momentum.
        const movementIntensity = Math.min(dist, 1.0); 
        const tumbleSpeed = speed * movementIntensity;
        
        tempObject.rotation.x += delta * tumbleSpeed;
        tempObject.rotation.y += delta * tumbleSpeed;

        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
      } else {
        // Snap to exact position when very close to prevent infinite micro-adjustments
        // The snap threshold is now closer to the movement threshold for seamless finish
        if (dist > 0.001) {
             needsUpdate = true;
             tempObject.position.lerp(targetPos, 0.2); // Faster snap at the very end
             tempObject.updateMatrix();
             meshRef.current.setMatrixAt(i, tempObject.matrix);
        }
      }
    }

    if (needsUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
};