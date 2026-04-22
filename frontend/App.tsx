import React, { useState, useEffect } from 'react';
import { Trophy, Volume2, VolumeX, Play, RotateCcw, Pause } from 'lucide-react';
import { useGameEngine } from './useGameEngine';
import { CANVAS_SIZE, GameState } from './constants';
import { audio } from './audio';

export default function App() {
  const {
    canvasRef,
    score,
    highScore,
    gameState,
    startGame,
    pauseGame,
    resumeGame
  } = useGameEngine();

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize audio context on first user interaction if needed
  useEffect(() => {
    const initAudio = () => {
      audio.init();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const toggleSound = () => {
    setSoundEnabled(audio.toggleSound());
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full bg-[#0f0f1a] font-mono select-none">
      
      {/* Header / Scoreboard */}
      <div className="w-full max-w-[600px] flex justify-between items-center p-4 text-white z-10">
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 uppercase tracking-wider">Score</span>
          <span className="text-3xl font-bold text-[#00ffcc] drop-shadow-[0_0_8px_rgba(0,255,204,0.5)]">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy size={14} /> High
            </span>
            <span className="text-xl font-bold text-gray-200">
              {highScore.toString().padStart(4, '0')}
            </span>
          </div>
          
          <button 
            onClick={toggleSound}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,204,0.15)] border border-white/10 bg-[#1a1a2e]">
        
        {/* The Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block w-full max-w-[600px] aspect-square object-contain"
          style={{ touchAction: 'none' }}
        />

        {/* Overlays */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-5xl font-bold text-[#00ffcc] mb-2 drop-shadow-[0_0_15px_rgba(0,255,204,0.8)] tracking-widest">NEON SNAKE</h1>
            <p className="text-gray-300 mb-8 max-w-xs">Use Arrow Keys or WASD to move. Swipe on mobile.</p>
            <button 
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-4 bg-[#00ffcc] text-[#0f0f1a] font-bold text-xl rounded-full hover:bg-white hover:shadow-[0_0_20px_rgba(0,255,204,0.6)] transition-all transform hover:scale-105 active:scale-95"
            >
              <Play fill="currentColor" /> START GAME
            </button>
            <p className="mt-4 text-sm text-gray-500">Press SPACE to start</p>
          </div>
        )}

        {gameState === GameState.PAUSED && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-bold text-white mb-6 tracking-widest">PAUSED</h2>
            <button 
              onClick={resumeGame}
              className="flex items-center gap-2 px-8 py-3 border-2 border-[#00ffcc] text-[#00ffcc] font-bold text-lg rounded-full hover:bg-[#00ffcc] hover:text-[#0f0f1a] transition-all"
            >
              <Play fill="currentColor" size={20} /> RESUME
            </button>
            <p className="mt-4 text-sm text-gray-400">Press P to resume</p>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-5xl font-bold text-[#ff3366] mb-2 drop-shadow-[0_0_15px_rgba(255,51,102,0.8)] tracking-widest">GAME OVER</h2>
            
            <div className="bg-white/5 rounded-2xl p-6 my-6 w-full max-w-[250px] border border-white/10">
              <div className="text-gray-400 text-sm uppercase mb-1">Final Score</div>
              <div className="text-4xl font-bold text-white mb-4">{score}</div>
              
              <div className="h-px w-full bg-white/10 mb-4"></div>
              
              <div className="text-gray-400 text-sm uppercase mb-1 flex items-center justify-center gap-1">
                <Trophy size={14} /> Best Score
              </div>
              <div className="text-2xl font-bold text-[#00ffcc]">{highScore}</div>
            </div>

            <button 
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-4 bg-white text-[#0f0f1a] font-bold text-xl rounded-full hover:bg-[#00ffcc] hover:shadow-[0_0_20px_rgba(0,255,204,0.6)] transition-all transform hover:scale-105 active:scale-95"
            >
              <RotateCcw size={24} /> PLAY AGAIN
            </button>
            <p className="mt-4 text-sm text-gray-500">Press SPACE to restart</p>
          </div>
        )}
      </div>

      {/* Mobile Controls Hint (Only visible on small screens when playing) */}
      {gameState === GameState.PLAYING && (
        <div className="md:hidden mt-8 text-gray-500 text-sm flex items-center gap-2 animate-pulse">
           Swipe to move
        </div>
      )}
      
      {/* Pause button for mobile */}
      {gameState === GameState.PLAYING && (
         <button 
          onClick={pauseGame}
          className="md:hidden absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white backdrop-blur-sm z-20"
         >
           <Pause size={20} />
         </button>
      )}

    </div>
  );
}