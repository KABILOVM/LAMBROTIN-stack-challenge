
import React, { useState, useEffect } from 'react';
import { RegisterScreen, CodeScreen } from './components/UI/AuthScreens';
import { BelindaStackGame } from './components/Game/BelindaStackGame';
import { AdminPanel } from './components/UI/AdminPanel';
import { ProfileScreen } from './components/UI/ProfileScreen';
import { backend } from './services/mockBackend';
import { ScreenType, User, GameResult, Language, PrizeConfig } from './types';
import { sounds } from './services/SoundService';
import { PrizeIcon } from './components/UI/PrizeIcons';
import { MAX_TRIALS } from './constants';
import { t } from './translations';

// --- ICONS ---
const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const HomeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const BookOpenIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const QrCodeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
    </svg>
);

const SoundIcon = ({ muted }: { muted: boolean }) => (
    muted ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    )
);

const CrownIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

// --- MAIN APP ---

function App() {
  const [screen, setScreen] = useState<ScreenType>('register');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('ru'); // GLOBAL LANGUAGE STATE
  const [isLoading, setIsLoading] = useState(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'rules'>('home');
  
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [userHistory, setUserHistory] = useState<GameResult[]>([]);
  const [isAdminTester, setIsAdminTester] = useState(false);
  const [muted, setMuted] = useState(false);
  const [trialsLeft, setTrialsLeft] = useState(0);
  const [viewingPrizeId, setViewingPrizeId] = useState<string | null>(null);
  
  // Dynamic Prizes
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);

  const T = t[lang]; // Shortcut for translations

  // Initial Load
  useEffect(() => {
    const initApp = async () => {
        try {
            // 1. Load Prizes
            const prizesData = await backend.getPrizes();
            setPrizes(prizesData);
            
            // 2. Load User
            const user = await backend.refreshUser();
            if (user) {
                setCurrentUser(user);
                setScreen('game');
                // Sync trials
                await backend.syncTrialCount(user.id);
                setTrialsLeft(MAX_TRIALS - backend.getTrialCount(user.id));
            }
        } catch (error) {
            console.error("Initialization error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    initApp();
    setMuted(sounds.isMuted());
  }, []);

  const refreshPrizes = () => {
      backend.getPrizes().then(data => setPrizes(data));
  };

  useEffect(() => {
    if (currentUser) {
      backend.getUserResults(currentUser.id).then(history => setUserHistory(history));
      // Ensure trial count is fresh
      backend.syncTrialCount(currentUser.id).then(() => {
          setTrialsLeft(MAX_TRIALS - backend.getTrialCount(currentUser.id));
      });
    }
  }, [currentUser, gameState]);

  const toggleMute = () => {
    const newVal = !muted;
    sounds.setMuted(newVal);
    setMuted(newVal);
  };

  const handleGameScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  const handleGameOver = async (finalScore: number) => {
    if (currentUser) {
      await backend.saveGameResult(currentUser.id, finalScore, isAdminTester ? 'ADMIN_TEST' : (activeCode || 'TRIAL'), !activeCode && !isAdminTester);
      // Sync trial count after game saves
      await backend.syncTrialCount(currentUser.id);
      setTrialsLeft(MAX_TRIALS - backend.getTrialCount(currentUser.id));
      
      const updated = await backend.refreshUser();
      if (updated) setCurrentUser(updated);
    }
    setGameState('ended');
  };

  const handleAdminTest = () => {
    setIsAdminTester(true);
    setScreen('game');
    setShowCodeEntry(false);
    setShowTutorial(false);
    setGameState('idle');
    setScore(0);
  };

  // Triggered by "Play" button in Dashboard
  const handlePlayRequest = () => {
     if (isAdminTester) {
         startTutorial(null);
         return;
     }

     if (activeCode) {
         startTutorial(activeCode);
     } else if (trialsLeft > 0) {
         startTutorial(null);
     } else {
         // No trials, no code
         setShowCodeEntry(true);
     }
  };

  const startTutorial = (c: string | null) => {
    setActiveCode(c);
    setShowCodeEntry(false);
    setShowTutorial(true);
    setViewingPrizeId(null);
  };

  const startGameAfterTutorial = () => {
    if (!activeCode && !isAdminTester && currentUser) {
      backend.useTrial(currentUser.id);
    }
    setShowTutorial(false);
    setGameState('playing');
  };

  const bestScore = Math.max(score, ...userHistory.map(r => r.score), 0);
  
  const handleLogout = () => {
      backend.logout();
      setCurrentUser(null);
      setScreen('register');
      setGameState('idle');
      setScore(0);
      setShowCodeEntry(false);
      setActiveTab('home');
  };

  // --- RENDERING ---

  if (isLoading) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
             <div className="flex flex-col items-center gap-6 animate-fade-in">
                 <BoltIcon className="w-12 h-12 text-blue-500 animate-pulse" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Загрузка...</p>
             </div>
          </div>
      );
  }

  if (screen === 'register') {
    return <RegisterScreen 
        onRegisterSuccess={async () => {
            setIsLoading(true);
            const u = await backend.refreshUser();
            if (u) {
                setCurrentUser(u);
                setScreen('game');
                await backend.syncTrialCount(u.id);
                setTrialsLeft(MAX_TRIALS - backend.getTrialCount(u.id));
            }
            setIsLoading(false);
        }} 
        onAdminLogin={() => setScreen('admin')} 
        lang={lang}
        setLang={setLang}
    />;
  }

  if (screen === 'admin') {
    return <AdminPanel onBack={() => { setScreen('register'); refreshPrizes(); }} onTestGame={handleAdminTest} />;
  }

  return (
    <div className="w-full h-full relative bg-slate-100 overflow-hidden font-sans">
      
      {/* 1. LAYER: 3D GAME (Always rendered, acts as background in idle) */}
      <div id="game-background" className="absolute inset-0 bg-gradient-to-b from-[#d6e8f5] to-[#aed9e0] transition-colors duration-1000"></div>
      <BelindaStackGame 
        onGameOver={handleGameOver} 
        onScoreUpdate={handleGameScoreUpdate}
        gameState={gameState}
        onGameStart={() => {}}
      />

      {/* 2. LAYER: IN-GAME HUD (Only visible when playing) */}
      {gameState === 'playing' && (
         <div className="absolute inset-0 pointer-events-none z-20">
             <div className="absolute top-12 left-0 right-0 flex justify-center">
                 <div className="text-[120px] font-black text-white/40 leading-none drop-shadow-sm select-none">
                     {score}
                 </div>
             </div>
             <button 
                onClick={toggleMute}
                className="absolute top-8 right-8 pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition active:scale-95"
             >
                <SoundIcon muted={muted} />
             </button>
         </div>
      )}

      {/* 3. LAYER: UI OVERLAY (Dashboard/Menu) - Only when idle/ended */}
      {gameState !== 'playing' && (
          <div className="absolute inset-0 z-30 flex flex-col pointer-events-none">
              
              {/* --- HEADER --- */}
              <div className="pt-8 px-6 flex justify-between items-start pointer-events-auto">
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 pr-4 rounded-full shadow-sm border border-white/50">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <UserIcon />
                      </div>
                      <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Игрок</div>
                          <div className="text-sm font-black text-slate-800 leading-none">{currentUser?.name || 'Гость'}</div>
                      </div>
                  </div>
                  
                  <div className="flex gap-2">
                     <button onClick={toggleMute} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 shadow-sm border border-white/50 active:scale-95 transition">
                         <SoundIcon muted={muted} />
                     </button>
                  </div>
              </div>

              {/* --- CONTENT AREA (Switchable) --- */}
              <div className="flex-1 relative">
                  
                  {/* HOME DASHBOARD */}
                  {activeTab === 'home' && gameState === 'idle' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in pointer-events-auto">
                          
                          <div className="mb-10 text-center">
                                <div className="inline-flex items-center justify-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-1.5 rounded-full mb-4 border border-blue-500/20 backdrop-blur-sm">
                                    <BoltIcon />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{T.appSubtitle}</span>
                                </div>
                                <h1 className="text-6xl font-black text-blue-700 uppercase italic tracking-tighter drop-shadow-xl">
                                    {T.appTitle}
                                </h1>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">{T.syrup}</p>
                          </div>

                          <div className="relative group">
                              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                              <button 
                                onClick={handlePlayRequest}
                                className="relative w-24 h-24 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-full flex items-center justify-center shadow-2xl shadow-slate-900/30 border-4 border-white/20 hover:scale-110 transition-transform duration-300 group-active:scale-95"
                              >
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white ml-1">
                                      <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                  </svg>
                              </button>
                          </div>

                          <div className="mt-8 flex gap-4">
                              <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 text-center shadow-sm">
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{T.record}</div>
                                  <div className="text-2xl font-black text-slate-800 leading-none">{bestScore}</div>
                              </div>
                              <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 text-center shadow-sm">
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{T.attempts}</div>
                                  <div className={`text-2xl font-black leading-none ${trialsLeft > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                      {activeCode ? '∞' : trialsLeft}
                                  </div>
                              </div>
                          </div>

                          {activeCode && (
                             <div className="mt-4 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                                 {T.activeCode}: {activeCode}
                             </div>
                          )}
                      </div>
                  )}

                  {/* PROFILE VIEW */}
                  {activeTab === 'profile' && (
                      <div className="absolute inset-0 pointer-events-auto animate-fade-in bg-slate-50/50 backdrop-blur-sm">
                          {currentUser && (
                              <ProfileScreen 
                                user={currentUser} 
                                onLogout={handleLogout}
                                onBack={() => setActiveTab('home')}
                                embedded={true}
                                lang={lang}
                                setLang={setLang}
                                prizes={prizes}
                              />
                          )}
                      </div>
                  )}

                  {/* RULES VIEW */}
                  {activeTab === 'rules' && (
                      <div className="absolute inset-0 pointer-events-auto animate-fade-in flex flex-col items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm">
                          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
                              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                                  <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">{T.rulesTitle}</h2>
                                  <button onClick={() => setActiveTab('home')} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100">&times;</button>
                              </div>
                              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 bg-white">
                                  <div>
                                      <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {T.mechanicsTitle}
                                      </h4>
                                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                          {T.mechanicsDesc}
                                      </p>
                                  </div>
                                  <div>
                                      <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> {T.prizesTitle}
                                      </h4>
                                      <div className="grid gap-2">
                                          {prizes.sort((a,b) => a.threshold - b.threshold).map((p) => (
                                              <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                  <span className="text-[10px] font-bold text-slate-600 uppercase">{p.title}</span>
                                                  <span className="text-[10px] font-black text-slate-400">{p.threshold}</span>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                      <h5 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">{T.importantTitle}</h5>
                                      <p className="text-[10px] font-bold text-orange-400/80 uppercase leading-relaxed text-center">
                                          {T.importantDesc}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* GAME OVER (Replaces Home when ended) */}
                  {gameState === 'ended' && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-slate-900/10 backdrop-blur-sm p-6">
                            <div className="bg-white p-10 rounded-[50px] shadow-2xl text-center max-w-sm w-full animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                                <div className="inline-block p-3 rounded-full bg-slate-50 mb-4 shadow-inner text-slate-400">
                                    <CrownIcon />
                                </div>
                                <h2 className="text-5xl font-black text-slate-800 mb-2 leading-none">{score}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">{T.yourScore}</p>
                                
                                {score > bestScore && (
                                    <div className="mb-6 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border border-amber-100 animate-pulse">
                                        {T.newRecord}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button onClick={() => { setGameState('idle'); setActiveTab('home'); }} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition">
                                        {T.menu}
                                    </button>
                                    <button onClick={() => { setGameState('idle'); handlePlayRequest(); }} className="flex-[2] py-4 bg-slate-800 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-900 transition shadow-lg shadow-slate-300">
                                        {T.playAgain}
                                    </button>
                                </div>
                            </div>
                       </div>
                  )}
              </div>

              {/* --- BOTTOM DOCK (NAVIGATION) --- */}
              {gameState !== 'ended' && (
                  <div className="pb-8 px-6 pt-4 pointer-events-auto">
                      <div className="bg-white/90 backdrop-blur-xl rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white p-2 flex justify-between items-center max-w-sm mx-auto">
                          <button 
                              onClick={() => setActiveTab('home')}
                              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all duration-300 ${activeTab === 'home' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                          >
                              <HomeIcon />
                              {activeTab === 'home' && <span className="text-[9px] font-black uppercase tracking-widest animate-fade-in">{T.menuMain}</span>}
                          </button>

                          <button 
                              onClick={() => setShowCodeEntry(true)}
                              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all duration-300 text-slate-400 hover:bg-slate-50`}
                          >
                              <QrCodeIcon />
                          </button>
                          
                          <button 
                              onClick={() => setActiveTab('profile')}
                              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all duration-300 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}
                          >
                              <UserIcon />
                              {activeTab === 'profile' && <span className="text-[9px] font-black uppercase tracking-widest animate-fade-in">{T.menuProfile}</span>}
                          </button>
                          
                          <button 
                              onClick={() => setActiveTab('rules')}
                              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all duration-300 ${activeTab === 'rules' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}
                          >
                              <BookOpenIcon />
                              {activeTab === 'rules' && <span className="text-[9px] font-black uppercase tracking-widest animate-fade-in">{T.menuInfo}</span>}
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* MODALS */}
      {showCodeEntry && (
        <CodeScreen 
            onCodeSuccess={(code) => startTutorial(code)} 
            onClose={() => setShowCodeEntry(false)} 
            onLogout={handleLogout}
            lang={lang}
        />
      )}

      {showTutorial && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
              <div className="bg-white w-full max-w-sm p-8 rounded-[50px] shadow-2xl animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-blue-400"></div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-6 text-center">{T.howToPlay}</h3>
                  
                  <div className="space-y-6">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-black text-xl shadow-sm">1</div>
                          <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed">{T.step1}</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-black text-xl shadow-sm">2</div>
                          <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed">{T.step2}</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 font-black text-xl shadow-sm">3</div>
                          <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed">{T.step3}</p>
                      </div>
                  </div>

                  <button 
                    onClick={startGameAfterTutorial}
                    className="w-full mt-8 py-5 bg-slate-800 text-white font-black rounded-[25px] shadow-xl uppercase tracking-widest text-xs hover:bg-slate-900 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    {T.letsGo} <ArrowRightIcon />
                  </button>
              </div>
          </div>
      )}
      
      {viewingPrizeId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-fade-in" onClick={() => setViewingPrizeId(null)}>
              {/* Dynamic Prize Modal logic can go here using prizes state */}
          </div>
      )}

    </div>
  );
}

export default App;