import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Material Symbols are loaded via index.html and used as spans with class "material-symbols-outlined"

import missionaryImg from './assets/missionary.jpeg';
import cannibalImg from './assets/cannibal.jpeg';

const MISSIONARY_IMG = missionaryImg;
const CANNIBAL_IMG = cannibalImg;
const RIVER_BG = "https://lh3.googleusercontent.com/aida-public/AB6AXuD3Vh84mP8YT6sutp7Zr2MJx24Bhsxm2maLUCGlGbBeO5GrrMpTj9K67av0po6faq4NzaYxZ6QnT35Ut_IoiYvcrJhWPQlQ3NAdR3p6ZM2Oa0Ds7XyW_5Uj0PiP9qxQhVWShYhNmCEk1Vv2lHMimx3n3dbZ6pFwdorxxUid8WVBpu2RIzCnTmNYDCnMsDu2HXwDsfJTmZFsiMTby1mdBGx61O30n6cmsmb4s2qxqcxpjvxFC7dwXt0MeUwc4TK2EylslAFvTpk_LWq2";

const OPTIMAL_SOLUTION = [
  { m: 0, c: 2, dir: 'right', desc: "Two cannibals sneak across the river!" },
  { m: 0, c: 1, dir: 'left', desc: "One cannibal returns to bring the boat back." },
  { m: 0, c: 2, dir: 'right', desc: "Two more cannibals cross over." },
  { m: 0, c: 1, dir: 'left', desc: "One cannibal returns again." },
  { m: 2, c: 0, dir: 'right', desc: "Two Missionaries bravely cross the water." },
  { m: 1, c: 1, dir: 'left', desc: "A Missionary and a Cannibal return together." },
  { m: 2, c: 0, dir: 'right', desc: "The remaining Missionaries cross over!" },
  { m: 0, c: 1, dir: 'left', desc: "The lonely cannibal returns for his tribe." },
  { m: 0, c: 2, dir: 'right', desc: "Two cannibals cross to the right side." },
  { m: 0, c: 1, dir: 'left', desc: "One cannibal comes back for the last one." },
  { m: 0, c: 2, dir: 'right', desc: "Finally, the last two cannibals cross safely!" }
];

export default function App() {
  const [leftBank, setLeftBank] = useState({ m: 3, c: 3 });
  const [rightBank, setRightBank] = useState({ m: 0, c: 0 });
  const [boat, setBoat] = useState({ m: 0, c: 0, pos: 'left' });
  const [steps, setSteps] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [history, setHistory] = useState([]);
  const [narrator, setNarrator] = useState("Welcome, Explorer! Help the tribe cross safely.");
  const [isSolving, setIsSolving] = useState(false);
  const [gameMode, setGameMode] = useState('practice'); // 'practice' or 'study'
  const [studyStep, setStudyStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isGameOver) setTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  const formatTime = (s) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const moveCharacterToBoat = (type, from) => {
    if (isGameOver || isSolving) return;
    if (gameMode === 'study') {
        setNarrator("You are in Study Mode! Use the 'Next Step' button to follow the guide.");
        return;
    }
    if (boat.pos !== from) return;
    if (boat.m + boat.c >= 2) return;

    if (from === 'left' && leftBank[type] > 0) {
      setLeftBank(prev => ({ ...prev, [type]: prev[type] - 1 }));
      setBoat(prev => ({ ...prev, [type]: prev[type] + 1 }));
    } else if (from === 'right' && rightBank[type] > 0) {
      setRightBank(prev => ({ ...prev, [type]: prev[type] - 1 }));
      setBoat(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }
  };

  const moveCharacterFromBoat = (type) => {
    if (isGameOver || isSolving) return;
    if (gameMode === 'study') return;
    if (boat[type] > 0) {
      setBoat(prev => ({ ...prev, [type]: prev[type] - 1 }));
      if (boat.pos === 'left') {
        setLeftBank(prev => ({ ...prev, [type]: prev[type] + 1 }));
      } else {
        setRightBank(prev => ({ ...prev, [type]: prev[type] + 1 }));
      }
    }
  };

  const handleBoatMove = () => {
    if (isGameOver || isSolving) return;
    if (gameMode === 'study') return;
    if (boat.m + boat.c === 0) {
      setNarrator("The boat needs at least one person to move!");
      return;
    }

    const nextPos = boat.pos === 'left' ? 'right' : 'left';
    setBoat(prev => ({ ...prev, pos: nextPos }));
    setSteps(prev => prev + 1);
    setHistory(prev => [`Step ${steps + 1}: ${boat.m}M ${boat.c}C ${boat.pos === 'left' ? '→' : '←'}`, ...prev]);

    // Safety Check after delay
    setTimeout(() => {
      checkSafety(nextPos);
    }, 1000);
  };

  const checkSafety = (pos) => {
    // We check safety on both banks.
    // People in boat are considered to have arrived at 'pos'.
    const leftM = leftBank.m + (pos === 'left' ? boat.m : 0);
    const leftC = leftBank.c + (pos === 'left' ? boat.c : 0);
    const rightM = rightBank.m + (pos === 'right' ? boat.m : 0);
    const rightC = rightBank.c + (pos === 'right' ? boat.c : 0);

    const isSafe = (m, c) => (m === 0 || m >= c);

    if (!isSafe(leftM, leftC) || !isSafe(rightM, rightC)) {
      setIsGameOver(true);
      setWin(false);
      setNarrator("Game Over! The Missionaries were outnumbered.");
      return;
    }

    if (pos === 'right' && rightM === 3 && rightC === 3) {
      setIsGameOver(true);
      setWin(true);
      setNarrator("Victory! Everyone crossed safely.");
    } else {
      setNarrator("Safe crossing! What's your next move?");
    }
  };

  const resetGame = (mode = gameMode) => {
    setLeftBank({ m: 3, c: 3 });
    setRightBank({ m: 0, c: 0 });
    setBoat({ m: 0, c: 0, pos: 'left' });
    setSteps(0);
    setTime(0);
    setIsGameOver(false);
    setWin(false);
    setHistory([]);
    setNarrator(mode === 'study' ? "Study Mode: Follow the optimal steps." : "Practice Mode: Good luck!");
    setIsSolving(false);
    setStudyStep(0);
  };

  const nextStudyStep = async () => {
    if (studyStep >= OPTIMAL_SOLUTION.length) return;
    const step = OPTIMAL_SOLUTION[studyStep];
    setNarrator(step.desc);
    
    // Execute move
    setIsSolving(true);
    const from = boat.pos;
    const to = boat.pos === 'left' ? 'right' : 'left';
    
    // Load
    setBoat(prev => ({ ...prev, m: step.m, c: step.c }));
    if (from === 'left') setLeftBank(prev => ({ m: prev.m - step.m, c: prev.c - step.c }));
    else setRightBank(prev => ({ m: prev.m - step.m, c: prev.c - step.c }));
    
    await new Promise(r => setTimeout(r, 800));
    
    // Move
    setBoat(prev => ({ ...prev, pos: to }));
    setSteps(prev => prev + 1);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Unload
    if (to === 'right') setRightBank(prev => ({ m: prev.m + step.m, c: prev.c + step.c }));
    else setLeftBank(prev => ({ m: prev.m + step.m, c: prev.c + step.c }));
    setBoat(prev => ({ ...prev, m: 0, c: 0 }));
    
    setStudyStep(prev => prev + 1);
    setIsSolving(false);

    if (studyStep === OPTIMAL_SOLUTION.length - 1) {
        setIsGameOver(true);
        setWin(true);
        setNarrator("Study complete! You've mastered the optimal sequence.");
    }
  };

  const autoSolve = async () => {
    resetGame();
    setIsSolving(true);
    for (const step of OPTIMAL_SOLUTION) {
      setNarrator(step.desc);
      await new Promise(r => setTimeout(r, 1000));
      
      // Load boat
      setBoat(prev => ({ ...prev, m: step.m, c: step.c }));
      if (step.dir === 'right') {
        setLeftBank(prev => ({ m: prev.m - step.m, c: prev.c - step.c }));
      } else {
        setRightBank(prev => ({ m: prev.m - step.m, c: prev.c - step.c }));
      }
      
      await new Promise(r => setTimeout(r, 1000));
      
      // Move boat
      const nextPos = step.dir;
      setBoat(prev => ({ ...prev, pos: nextPos }));
      setSteps(prev => prev + 1);
      
      await new Promise(r => setTimeout(r, 1500));
      
      // Unload boat
      if (nextPos === 'right') {
        setRightBank(prev => ({ m: prev.m + step.m, c: prev.c + step.c }));
      } else {
        setLeftBank(prev => ({ m: prev.m + step.m, c: prev.c + step.c }));
      }
      setBoat(prev => ({ ...prev, m: 0, c: 0 }));
    }
    setIsSolving(false);
    setIsGameOver(true);
    setWin(true);
  };

  return (
    <div className="bg-background text-on-background font-body-md overflow-hidden min-h-screen">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 river-gradient opacity-40" />
        <div className={`absolute inset-0 bg-secondary-container/20 transition-opacity duration-[5000ms] ${time > 60 ? 'opacity-60' : 'opacity-0'}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(178,204,199,0.1)_0%,transparent_70%)]" />
      </div>

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center px-gutter py-base shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-sm">
          <span className="font-display-lg text-headline-sm text-primary-fixed-dim drop-shadow-[0_0_10px_rgba(178,204,199,0.5)]">
            Missionaries & Cannibals Adventure
          </span>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant/30">
            <button 
              onClick={() => { setGameMode('study'); resetGame('study'); }}
              className={`px-4 py-1 rounded-full text-xs font-label-bold transition-all ${gameMode === 'study' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
            >
              Study Mode
            </button>
            <button 
              onClick={() => { setGameMode('practice'); resetGame('practice'); }}
              className={`px-4 py-1 rounded-full text-xs font-label-bold transition-all ${gameMode === 'practice' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant'}`}
            >
              Practice Mode
            </button>
          </div>
          <div className="flex items-center gap-xs glass-panel px-sm py-xs rounded-full">
            <span className="material-symbols-outlined text-primary">timer</span>
            <span className="font-label-bold text-label-bold text-primary">{formatTime(time)}</span>
          </div>
          <div className="flex items-center gap-xs glass-panel px-sm py-xs rounded-full">
            <span className="material-symbols-outlined text-secondary">rebase_edit</span>
            <span className="font-label-bold text-label-bold text-secondary">Moves: {steps.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      {/* Main Stage */}
      <main className="relative w-full h-screen pt-[64px] pb-[80px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            alt="Mystical River" 
            className="w-full h-full object-cover opacity-40 blur-sm" 
            src={RIVER_BG}
          />
          <div className="absolute inset-0 river-gradient opacity-60"></div>
          {/* Sunset effect */}
          <div 
            className="absolute inset-0 bg-red-900/20 mix-blend-multiply transition-opacity duration-1000"
            style={{ opacity: Math.min(0.6, time / 300) }}
          ></div>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-lg">
          <div className="w-full max-w-5xl h-full grid grid-cols-[1fr_2fr_1fr] items-center gap-md">
            {/* Left Bank */}
            <div className="h-[450px] bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-md flex flex-col items-center gap-md relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-surface px-sm py-1 rounded-full border border-outline-variant/30 font-label-bold text-label-bold text-on-surface-variant">Starting Bank</div>
              <div className="flex flex-wrap justify-center gap-sm content-start h-full pt-4">
                {Array.from({ length: leftBank.m }).map((_, i) => (
                  <Character key={`lm-${i}`} type="missionary" onClick={() => moveCharacterToBoat('m', 'left')} />
                ))}
                {Array.from({ length: leftBank.c }).map((_, i) => (
                  <Character key={`lc-${i}`} type="cannibal" onClick={() => moveCharacterToBoat('c', 'left')} />
                ))}
              </div>
            </div>

            {/* River & Boat */}
            <div className="h-full flex flex-col items-center justify-center relative px-md">
              <div className="flex-1 w-full flex items-center justify-center relative">
                <motion.div 
                  animate={{ 
                    x: boat.pos === 'left' ? -100 : 100,
                    y: [0, -5, 0] 
                  }}
                  transition={{ 
                    x: { type: 'spring', stiffness: 50, damping: 15 },
                    y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                  }}
                  className="relative z-20 group cursor-pointer"
                  onClick={handleBoatMove}
                >
                    <div className="relative w-64 h-24 bg-[#5c403c] rounded-b-[40px] rounded-t-lg border-b-8 border-black/30 shadow-2xl flex items-center justify-around p-base group-hover:scale-105 transition-transform">
                      {/* Boat Slots */}
                      {[0, 1].map((slot) => {
                        const occupants = [
                          ...Array(boat.m).fill('missionary'),
                          ...Array(boat.c).fill('cannibal')
                        ];
                        const type = occupants[slot];
                        return (
                          <div key={slot} className="w-20 h-20 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center overflow-visible">
                            {type ? (
                              <Character 
                                type={type} 
                                size="sm" 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  moveCharacterFromBoat(type === 'missionary' ? 'm' : 'c'); 
                                }} 
                              />
                            ) : (
                              <span className="material-symbols-outlined text-2xl text-primary/20">add</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-8 bg-secondary/20 backdrop-blur-md rounded-full border border-secondary/30 flex items-center justify-center">
                    <span className="font-label-bold text-[10px] text-secondary">CLICK TO CROSS</span>
                  </div>
                </motion.div>
              </div>

              {/* Narrator / Controls */}
              <div className="glass-panel p-6 rounded-2xl border border-primary/40 shadow-2xl w-full min-w-[300px] max-w-sm mb-10 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl flex-shrink-0 mt-1">auto_fix_high</span>
                  <div className="flex-1">
                    <h4 className="font-label-bold text-headline-sm text-primary mb-1">
                        {gameMode === 'study' ? `Study Step ${studyStep + 1}/11` : "Explorer's Log"}
                    </h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{narrator}</p>
                  </div>
                </div>
                
                {gameMode === 'study' && !isGameOver && (
                    <button 
                        onClick={nextStudyStep}
                        disabled={isSolving}
                        className="w-full py-2 bg-primary text-on-primary rounded-xl font-label-bold text-xs hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {isSolving ? "Moving..." : studyStep === 0 ? "Start Study" : "Next Step →"}
                    </button>
                )}
              </div>
            </div>

            {/* Right Bank */}
            <div className="h-[450px] bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-md flex flex-col items-center gap-md relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-surface px-sm py-1 rounded-full border border-outline-variant/30 font-label-bold text-label-bold text-on-surface-variant">Target Bank</div>
              <div className="flex flex-wrap justify-center gap-sm content-start h-full pt-4">
                {Array.from({ length: rightBank.m }).map((_, i) => (
                  <Character key={`rm-${i}`} type="missionary" onClick={() => moveCharacterToBoat('m', 'right')} />
                ))}
                {Array.from({ length: rightBank.c }).map((_, i) => (
                  <Character key={`rc-${i}`} type="cannibal" onClick={() => moveCharacterToBoat('c', 'right')} />
                ))}
                {rightBank.m === 0 && rightBank.c === 0 && (
                   <div className="text-center opacity-30 mt-20">
                    <span className="material-symbols-outlined text-6xl text-secondary">landscape</span>
                    <p className="font-label-bold text-label-bold mt-sm">Safe Zone</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Hint */}
          <div className="w-full max-w-2xl glass-panel p-md rounded-2xl border-l-4 border-secondary flex gap-md items-center shadow-xl mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">tips_and_updates</span>
            </div>
            <div className="flex-1">
              <h3 className="font-label-bold text-label-bold text-secondary">Quick Revision: The Balance Rule</h3>
              <p className="font-body-md text-xs text-on-surface-variant">Never leave more cannibals than missionaries on any side. If M=3 and C=3, and you move 1 Missionary, the ratio becomes 2:3—Game Over!</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-highest/40 backdrop-blur-lg border-t border-outline-variant/30 flex justify-around items-center px-gutter pb-sm pt-base shadow-[0_-10px_30px_rgba(0,0,0,0.6)] rounded-t-xl">
        <NavButton icon="directions_boat" label="Move Boat" onClick={handleBoatMove} />
        <NavButton icon="tips_and_updates" label="Hint" onClick={() => setNarrator("Try sending two cannibals first!")} />
        <NavButton icon="restart_alt" label="Reset" highlight onClick={resetGame} />
        <NavButton icon="auto_fix_high" label="Guide Me" onClick={autoSolve} />
        <NavButton icon="share" label="Share" onClick={() => alert("Copied to clipboard!")} />
      </nav>

      {/* Victory/Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-panel max-w-md w-full min-w-[320px] p-8 md:p-12 rounded-3xl text-center border-2 border-primary shadow-[0_0_50px_rgba(178,204,199,0.3)]"
            >
              <div className={`w-24 h-24 ${win ? 'bg-primary-container' : 'bg-error-container'} rounded-full flex items-center justify-center mx-auto mb-md border-4 ${win ? 'border-primary' : 'border-error'}`}>
                <span className="material-symbols-outlined text-6xl">{win ? 'celebration' : 'dangerous'}</span>
              </div>
              <h2 className={`font-display-lg text-headline-md mb-sm ${win ? 'text-primary' : 'text-error'}`}>{win ? 'Victory!' : 'Failed!'}</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">{narrator}</p>
              
              {win && (
                <div className="grid grid-cols-2 gap-md mb-xl">
                  <div className="p-md bg-surface-container rounded-2xl">
                    <span className="block text-secondary font-label-bold text-label-bold">Moves</span>
                    <span className="text-headline-sm font-headline-sm">{steps}</span>
                  </div>
                  <div className="p-md bg-surface-container rounded-2xl">
                    <span className="block text-secondary font-label-bold text-label-bold">Time</span>
                    <span className="text-headline-sm font-headline-sm">{formatTime(time)}</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={resetGame}
                className="w-full py-md bg-primary text-on-primary font-label-bold text-label-bold rounded-xl shadow-lg neon-glow-cyan hover:scale-95 transition-transform"
              >
                {win ? "Play Again" : "Try Again"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Character({ type, onClick, size = "md" }) {
  const isMissionary = type === 'missionary';
  const color = isMissionary ? '#FFD700' : '#9333ea';
  const label = isMissionary ? 'Missionary' : 'Cannibal';
  const img = isMissionary ? MISSIONARY_IMG : CANNIBAL_IMG;
  const dimension = size === "md" ? "w-16 h-16" : "w-12 h-12";

  return (
    <motion.div 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group cursor-pointer flex flex-col items-center gap-1"
    >
      <div className={`${dimension} rounded-full border-4 p-1 transition-transform bg-primary-container overflow-hidden`}
           style={{ borderColor: color, boxShadow: `0 0 15px ${color}66` }}>
        <img alt={label} className="w-full h-full object-cover rounded-full" src={img} />
      </div>
      {size === "md" && <span className="text-[8px] uppercase font-bold" style={{ color }}>{label}</span>}
    </motion.div>
  );
}

function NavButton({ icon, label, highlight, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 ${
        highlight 
          ? 'bg-primary-container text-primary rounded-full p-2 px-4 shadow-[0_0_15px_rgba(178,204,199,0.4)]' 
          : 'text-on-surface-variant hover:text-primary-fixed-dim'
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-label-bold text-[10px] mt-1">{label}</span>
    </button>
  );
}
