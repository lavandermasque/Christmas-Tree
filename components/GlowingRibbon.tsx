import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeState } from '../types';
import { TREE_CONFIG, ANIMATION_SPEED } from '../constants';

interface GlowingRibbonProps {
  treeState: TreeState;
}

export const GlowingRibbon: React.FC<GlowingRibbonProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  // Configuration
  // Reduced count from 500 to 400 for a less cluttered, more elegant look
  const LIGHT_COUNT = 400; 
  
  // Generate the Static Curve Path
  const { curvePoints } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Reduced turns from 6 to 5 for a looser drape
    const turns = 5; 
    
    // Create the control points for the curve
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const height = (t - 0.5) * TREE_CONFIG.height;
      
      // Base spiral shape
      // Increased noise slightly for more natural draping
      const drapeNoise = Math.sin(t * Math.PI * turns * 2) * 0.25;
      
      // Radius Logic:
      // Increased base offset from 0.6 to 1.2. 
      // This pushes the lights further out from the dense foliage, creating "breathing room".
      const radius = ((1 - t) * TREE_CONFIG.radius) + 1.2 + drapeNoise; 
      
      const angle = t * Math.PI * 2 * turns;
      
      points.push(new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Sample evenly spaced points for the bulbs
    const spacedPoints = curve.getSpacedPoints(LIGHT_COUNT);

    return { curvePoints: spacedPoints };
  }, []);

  // Animation State Refs
  const animState = useRef({
    progress: 0, 
    expansion: 1, 
  });

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const isAssembled = treeState === TreeState.ASSEMBLED;
    const time = state.clock.elapsedTime;

    // --- TARGET VALUES ---
    const targetProgress = isAssembled ? 1.0 : 0.0;
    // Increased expansion target slightly for scatter to make it fly out wider
    const targetExpansion = isAssembled ? 1.0 : 3.0;

    // --- LERP SPEEDS ---
    const progressSpeed = isAssembled ? ANIMATION_SPEED * 0.4 : ANIMATION_SPEED * 0.8;
    const expansionSpeed = ANIMATION_SPEED * 0.5;

    // --- UPDATE STATE ---
    animState.current.progress = THREE.MathUtils.lerp(animState.current.progress, targetProgress, delta * progressSpeed);
    animState.current.expansion = THREE.MathUtils.lerp(animState.current.expansion, targetExpansion, delta * expansionSpeed);

    const { progress, expansion } = animState.current;

    // --- UPDATE INSTANCES ---
    for (let i = 0; i < LIGHT_COUNT; i++) {
      const normalizedIndex = i / LIGHT_COUNT;
      const basePos = curvePoints[i];

      // 1. Position Logic
      tempObject.position.set(
        basePos.x * expansion,
        basePos.y,
        basePos.z * expansion
      );

      // 2. Visibility/Scale Logic
      let scale = 0;
      
      if (normalizedIndex < progress) {
        const tipThreshold = 0.05; 
        const distFromTip = progress - normalizedIndex;
        
        let baseScale = 1.0;
        if (distFromTip < tipThreshold) {
           baseScale = distFromTip / tipThreshold;
        }

        // 3. Twinkle Effect
        const twinkleSpeed = 2.5;
        const twinkleOffset = i * 0.15; 
        const twinkle = 0.6 + Math.sin(time * twinkleSpeed + twinkleOffset) * 0.4;
        
        // Slightly larger bulb size (0.8 -> 1.0 relative base) because we have fewer of them
        scale = baseScale * twinkle * 1.2;
      }

      tempObject.scale.setScalar(scale);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;

    // 4. Group Rotation
    if (isAssembled) {
        meshRef.current.rotation.y += delta * 0.08; // Slower rotation for elegance
    } else {
        meshRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, LIGHT_COUNT]}>
      {/* Slightly larger bulb geometry for better visibility at distance */}
      <sphereGeometry args={[0.07, 8, 8]} />
      {/* 
         UPDATED MATERIAL:
         - Color: Warm pale gold/cream (#FFEDD5) instead of deep red.
         - Emissive: Golden Orange (#FFB700) for a warm, cozy Christmas glow.
         - Intensity: High enough to bloom.
      */}
      <meshStandardMaterial 
        color="#FFEDD5"
        emissive="#FFB700"
        emissiveIntensity={3.5}
        toneMapped={false}
        roughness={0.1}
        metalness={0.8}
      />
    </instancedMesh>
  );
};
