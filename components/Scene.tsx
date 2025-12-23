import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import { LuxuryTree } from './LuxuryTree';
import { FloatingParticles } from './FloatingParticles';
import { TreeState } from '../types';

interface SceneProps {
  treeState: TreeState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      // Adjusted camera: Zoomed out (Z=16) and centered (Y=0) to fit the full 9-unit tall tree
      camera={{ position: [0, 0, 16], fov: 40 }}
      gl={{ 
        antialias: false, 
        stencil: false, 
        depth: true,
        powerPreference: "high-performance"
      }}
    >
      {/* 1. Black Night Background */}
      <color attach="background" args={['#020202']} />
      
      {/* 2. Subtle dark fog */}
      <fog attach="fog" args={['#020202', 20, 45]} />
      
      {/* 3. Night Sky Effect */}
      <Stars 
        radius={80} 
        depth={60} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5} 
      />
      
      {/* 4. Magical Ambient Sparkles */}
      <Sparkles 
        count={200}
        scale={[20, 20, 20]}
        size={2}
        speed={0.3}
        opacity={0.3}
        color="#fff"
      />

      {/* Lighting Setup */}
      <ambientLight intensity={0.5} color="#050505" /> 
      <spotLight 
        position={[10, 15, 10]} 
        angle={0.2} 
        penumbra={0.5} 
        intensity={300} 
        castShadow 
        color="#ffddaa" 
        shadow-bias={-0.0001}
      />
      <spotLight 
        position={[-10, 10, -10]} 
        angle={0.4} 
        penumbra={1} 
        intensity={200} 
        color="#e0f7fa" 
      />
      <pointLight position={[0, -5, 5]} intensity={50} color="#ffaa00" distance={15} />

      {/* Main Content */}
      <Suspense fallback={null}>
        {/* Moved Group UP to -1.0 so the tree (height 9) is vertically centered in the view */}
        <group position={[0, -1.0, 0]}>
          <LuxuryTree treeState={treeState} />
          <FloatingParticles />
          {/* Shadow moved to local -4.5 (bottom of tree) */}
          <ContactShadows 
            rotation-x={Math.PI / 2} 
            position={[0, -4.5, 0]} 
            opacity={0.6} 
            width={40} 
            height={40} 
            blur={2.5} 
            far={10} 
            color="#000000"
          />
        </group>
        <Environment preset="lobby" background={false} /> 
      </Suspense>

      {/* Post Processing */}
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom 
          luminanceThreshold={0.9} 
          mipmapBlur 
          intensity={1.0} 
          radius={0.6}
          levels={9}
        />
        <DepthOfField 
          target={[0, -1, 0]} // Focus on the new tree center
          focalLength={0.02} 
          bokehScale={2} 
          height={480} 
        />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={6}
        maxDistance={30}
        autoRotate={treeState === TreeState.SCATTERED} 
        autoRotateSpeed={0.3}
        dampingFactor={0.05}
      />
    </Canvas>
  );
};