import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { TreeState } from './types';

function App() {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.ASSEMBLED);

  const toggleState = () => {
    setTreeState(prev => 
      prev === TreeState.ASSEMBLED ? TreeState.SCATTERED : TreeState.ASSEMBLED
    );
  };

  return (
    <div className="w-full h-screen relative bg-[#050505]">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene treeState={treeState} />
      </div>

      {/* UI Overlay Layer */}
      <Overlay treeState={treeState} onToggle={toggleState} />
      
      {/* Vignette Overlay (static CSS) for extra cinematic edge darkening */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)] z-1" />
    </div>
  );
}

export default App;