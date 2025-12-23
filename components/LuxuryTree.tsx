import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreePart } from './TreePart';
import { GlowingRibbon } from './GlowingRibbon';
import { TreeState, TreeConfig } from '../types';
import { TREE_CONFIG, PALETTE, COLORS, ANIMATION_SPEED } from '../constants';

interface LuxuryTreeProps {
  treeState: TreeState;
}

interface TopStarProps {
  treeState: TreeState;
}

const TopStar: React.FC<TopStarProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Define positions
  const assembledPos = useMemo(() => new THREE.Vector3(0, TREE_CONFIG.height / 2 + 0.5, 0), []);
  // Random scatter position high up and slightly offset
  const scatterPos = useMemo(() => new THREE.Vector3(
      (Math.random() - 0.5) * 8, 
      12 + Math.random() * 4, 
      (Math.random() - 0.5) * 8
  ), []);

  const starGeometry = useMemo(() => {
    const starShape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.6;
    const innerRadius = 0.3;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2; // Rotate to point up
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };

    return new THREE.ExtrudeGeometry(starShape, extrudeSettings);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const isAssembled = treeState === TreeState.ASSEMBLED;
      const target = isAssembled ? assembledPos : scatterPos;
      
      // Lerp Position
      // Using a slightly different speed factor for the star to make it feel special
      meshRef.current.position.lerp(target, delta * ANIMATION_SPEED * 0.9);
      
      if (isAssembled) {
        // Majestic rotation when assembled
        meshRef.current.rotation.y += delta * 0.5;
        // Correct orientation dampening
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 2);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 2);
      } else {
        // Floating tumble when scattered
        meshRef.current.rotation.x += delta * 0.3;
        meshRef.current.rotation.y += delta * 0.2;
        meshRef.current.rotation.z += delta * 0.1;
      }
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={starGeometry} 
      position={assembledPos}
      castShadow
    >
      <meshStandardMaterial 
        color={COLORS.GOLD} 
        emissive={COLORS.GOLD}
        emissiveIntensity={2}
        toneMapped={false}
        roughness={0.1}
        metalness={1}
      />
      <pointLight intensity={3} color="#ffd700" distance={8} decay={2} />
    </mesh>
  );
};

export const LuxuryTree: React.FC<LuxuryTreeProps> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate data for particles
  const { ornaments, gifts, stars, candyCanes } = useMemo(() => {
    const generateData = (count: number, radialJitter = 0.2, heightJitter = 0) => {
      const treePos: THREE.Vector3[] = [];
      const scatterPos: THREE.Vector3[] = [];
      const scales: number[] = [];
      const colors: THREE.Color[] = [];

      for (let i = 0; i < count; i++) {
        // 1. Tree Position (Cone/Spiral)
        const t = i / count;
        // Non-linear height distribution for better density at bottom
        const h = TREE_CONFIG.height * t + (Math.random() - 0.5) * heightJitter; 
        const r = TREE_CONFIG.radius * (1 - t) + Math.random() * radialJitter; // Tapering radius
        const angle = t * TREE_CONFIG.spin * Math.PI * 2 + (Math.random() * Math.PI * 2); // Random offset angle
        
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const y = h - (TREE_CONFIG.height / 2); // Center vertically

        treePos.push(new THREE.Vector3(x, y, z));

        // 2. Scatter Position (Sphere cloud)
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const scatterR = 7 + Math.random() * 9; // Wide scatter
        const sx = scatterR * Math.sin(phi) * Math.cos(theta);
        const sy = scatterR * Math.sin(phi) * Math.sin(theta);
        const sz = scatterR * Math.cos(phi);
        scatterPos.push(new THREE.Vector3(sx, sy, sz));

        // 3. Scale & Color
        scales.push(Math.random() * 0.6 + 0.4);
        colors.push(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      }
      return { treePos, scatterPos, scales, colors };
    };

    // Distribute particles among types
    return {
      ornaments: generateData(Math.floor(TREE_CONFIG.count * 0.45), 0.3),
      gifts: generateData(Math.floor(TREE_CONFIG.count * 0.2), 0.4),
      stars: generateData(Math.floor(TREE_CONFIG.count * 0.15), 0.5),
      candyCanes: generateData(Math.floor(TREE_CONFIG.count * 0.2), 0.4),
    };
  }, []);

  // Geometries
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.15, 16, 16), []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(0.22, 0.22, 0.22), []);
  const smallStarGeo = useMemo(() => new THREE.OctahedronGeometry(0.2, 0), []);
  
  // Candy Cane Geometry
  const candyCaneGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0.1, 0.45, 0),
      new THREE.Vector3(0.25, 0.35, 0),
    ]);
    const geo = new THREE.TubeGeometry(curve, 8, 0.04, 8, false);
    geo.center();
    return geo;
  }, []);

  // Materials (Luxury PBR)
  const ornamentMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xffffff, // Tinted by instance color
    roughness: 0.1,
    metalness: 0.8,
    envMapIntensity: 1.5,
  }), []);

  const giftMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.4,
  }), []);
  
  const starMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLORS.GOLD,
    roughness: 0.1,
    metalness: 1.0,
    emissive: COLORS.GOLD,
    emissiveIntensity: 0.4
  }), []);

  const candyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.6, // Glossy candy finish
  }), []);

  // Slowly rotate the whole tree group
  useFrame((state, delta) => {
    if (groupRef.current && treeState === TreeState.ASSEMBLED) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* The new Glowing Ribbon */}
      <GlowingRibbon treeState={treeState} />

      <TreePart 
        geometry={sphereGeo} 
        material={ornamentMaterial} 
        count={ornaments.treePos.length} 
        data={ornaments} 
        treeState={treeState} 
      />
      <TreePart 
        geometry={boxGeo} 
        material={giftMaterial} 
        count={gifts.treePos.length} 
        data={gifts} 
        treeState={treeState} 
      />
      <TreePart 
        geometry={smallStarGeo} 
        material={starMaterial} 
        count={stars.treePos.length} 
        data={stars} 
        treeState={treeState} 
      />
      <TreePart 
        geometry={candyCaneGeo} 
        material={candyMaterial} 
        count={candyCanes.treePos.length} 
        data={candyCanes} 
        treeState={treeState} 
      />
      
      <TopStar treeState={treeState} />
    </group>
  );
};