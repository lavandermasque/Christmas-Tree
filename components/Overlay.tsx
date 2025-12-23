import React, { useState, useRef, useEffect } from 'react';
import { TreeState } from '../types';

interface OverlayProps {
  treeState: TreeState;
  onToggle: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ treeState, onToggle }) => {
  const isAssembled = treeState === TreeState.ASSEMBLED;
  
  // State to track if the user has started the experience
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Function to handle the initial interaction
  const handleStart = () => {
    const audio = audioRef.current;
    
    if (audio) {
      audio.volume = 1.0;
      
      // We must call load() in case the browser suspended loading due to "no user interaction" policies
      if (audio.readyState === 0) {
        audio.load();
      }

      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio started successfully");
            setIsPlaying(true);
          })
          .catch((err) => {
            // Log a simple string to avoid circular JSON errors
            console.warn("Audio autoplay blocked or failed:", err.message || "Unknown error");
            setIsPlaying(false);
          });
      }
    }
    
    setHasStarted(true);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Toggle failed:", err.message));
    }
  };

  // Setup listeners to sync state with actual audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    // Simple error logger that avoids the event object
    const onError = () => {
        console.warn("Audio source failed to load.");
        setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between z-50 overflow-hidden text-amber-50">
      
      {/* 
        ROBUST AUDIO CONFIGURATION
        1. Google Actions OGG: High speed, low latency, very reliable CDN.
        2. Wikimedia MP3: Standard fallback.
        crossOrigin="anonymous" helps with some CORS restrictions on media.
      */}
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        crossOrigin="anonymous"
        playsInline
      >
        <source src="https://actions.google.com/sounds/v1/holidays/jingle_bells.ogg" type="audio/ogg" />
        <source src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Jingle_Bells_-_Kevin_MacLeod_-_no_voice.mp3" type="audio/mpeg" />
      </audio>

      {/* --- LANDING SCREEN --- */}
      <div 
        className={`
          absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center
          transition-opacity duration-1000 ease-in-out
          ${hasStarted ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}
        `}
      >
        <div className="text-center space-y-8 transform transition-transform duration-700 hover:scale-105 relative z-50">
           <h1 className="font-['Cinzel'] text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 tracking-widest drop-shadow-[0_0_25px_rgba(212,175,55,0.5)] animate-pulse">
             MERRY CHRISTMAS
           </h1>
           <p className="font-serif text-amber-100/60 tracking-[0.3em] text-sm uppercase">
             WISH FOR YOUR WISH
           </p>
           
           <button 
             onClick={handleStart} 
             className="group relative px-10 py-4 overflow-hidden rounded-full border border-amber-500/30 bg-black/50 transition-all hover:bg-amber-900/20 hover:border-amber-400 cursor-pointer pointer-events-auto active:scale-95 z-50"
           >
             <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
             <span className="font-['Cinzel'] font-bold tracking-widest text-amber-200 group-hover:text-white transition-colors relative z-10">
               ENTER EXPERIENCE
             </span>
           </button>
        </div>
      </div>

      {/* --- MAIN UI --- */}
      <div className={`flex flex-col w-full h-full transition-opacity duration-1000 delay-500 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top Right: Music Toggle */}
        <div className="absolute top-6 right-6 z-50 pointer-events-auto flex items-center gap-3">
          <span className={`text-xs font-serif tracking-widest text-amber-500/80 transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
             {isPlaying ? 'MUSIC ON' : 'MUSIC OFF'}
          </span>
          <button 
            onClick={toggleMusic}
            className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-amber-500/20 text-amber-200 hover:bg-black/40 hover:text-white transition-all duration-300 group shadow-[0_0_10px_rgba(212,175,55,0.1)] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
            title={isPlaying ? "Mute Music" : "Play Music"}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 opacity-70">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>
        </div>

        {/* Top Center: Titles */}
        <div className="w-full flex flex-col items-center pt-8 md:pt-12 z-20 transition-all duration-1000 pointer-events-none">
          <div className="relative text-center">
            <h1 
              className="font-['Cinzel'] text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out will-change-transform animate-pulse"
              style={{ 
                opacity: isAssembled ? 1 : 0, 
                transform: isAssembled ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-20px)',
                filter: isAssembled ? 'blur(0px)' : 'blur(10px)'
              }}
            >
              Merry Christmas
            </h1>
            <p 
              className="font-['Great_Vibes'] text-xl sm:text-2xl md:text-4xl text-white/90 mt-2 drop-shadow-md transition-all duration-1000 delay-300 animate-pulse"
              style={{ opacity: isAssembled ? 1 : 0, transform: isAssembled ? 'translateY(0)' : 'translateY(-10px)' }}
            >
              Wishing you a bright and merry Christmas
            </p>
          </div>
        </div>

        {/* Middle spacer */}
        <div className="flex-1 pointer-events-none"></div>

        {/* Footer: Controls */}
        <div className="pointer-events-auto w-full flex flex-col items-center pb-8 md:pb-12 gap-4 flex-none z-50">
          <button
            onClick={onToggle}
            className={`
              relative group overflow-hidden px-10 py-4 rounded-full border border-amber-500/30 
              bg-black/40 backdrop-blur-md transition-all duration-500 hover:border-amber-400/80 hover:bg-black/60
              cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]
            `}
          >
             <span className={`
               absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent 
               translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700
             `}></span>
             
             <span className="font-['Cinzel'] text-amber-100 tracking-widest uppercase text-sm font-bold">
               {isAssembled ? 'Scatter Magic' : 'Assemble Tree'}
             </span>
          </button>

          <p className="text-white/30 text-[10px] md:text-xs font-serif tracking-widest uppercase pointer-events-none">
            Drag to Rotate • Scroll to Zoom
          </p>
        </div>
      </div>
    </div>
  );
};