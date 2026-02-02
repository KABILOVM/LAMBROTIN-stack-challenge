
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { RegisterScreen, PurchaseRulesScreen, LanguageSelectionScreen } from './components/UI/AuthScreens.tsx';
import { BelindaStackGame } from './components/Game/BelindaStackGame.tsx';
import { AdminPanel } from './components/UI/AdminPanel.tsx';
import { ProfileScreen } from './components/UI/ProfileScreen.tsx';
import { backend } from './services/mockBackend.ts';
import { ScreenType, User, GameResult, Language, PrizeConfig, CodeRequest } from './types.ts';
import { sounds } from './services/SoundService.ts';
import { PrizeIcon } from './components/UI/PrizeIcons.tsx';
import { MAX_TRIALS } from './constants.ts';
import { t } from './translations.ts';
import { LungsLoader } from './components/UI/LungsLoader.tsx';

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const MessageIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

const DocumentIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const HomeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const SoundIcon = ({ muted }: { muted: boolean }) => (
    muted ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 3H21C21.5523 3 22 3.44772 22 4V8C22 10.2091 20.2091 12 18 12H17.82C17.3674 14.4921 15.3526 16.4445 12.8732 16.9213L13 20H16V22H8V20H11L11.1268 16.9213C8.64741 16.4445 6.63261 14.4921 6.18 12H6C3.79086 12 2 10.2091 2 8V4C2 3.44772 2.44772 3 3 3H7V1H17V3ZM4 5V8C4 9.10457 4.89543 10 6 10H6.17011C6.05929 9.36294 6 8.69123 6 8V5H4ZM20 5H18V8C18 8.69123 17.9407 9.36294 17.8299 10H18C19.1046 10 20 9.10457 20 8V5ZM15 3H9V14C9 15.6569 10.3431 17 12 17C13.6569 17 15 15.6569 15 14V3Z" />
    </svg>
);

function App() {
  const [screen, setScreen] = useState<ScreenType>('register');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>((localStorage.getItem('lambrotin_lang') as Language) || 'ru');
  const [showLangSelector, setShowLangSelector] = useState(!localStorage.getItem('lambrotin_lang'));
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [profileInitialTab, setProfileInitialTab] = useState<'prizes' | 'history' | 'codes' | 'settings'>('prizes');
  const [profileInitialCodesSubTab, setProfileInitialCodesSubTab] = useState<'my' | 'get'>('get');
  
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showWelcomeRules, setShowWelcomeRules] = useState(false); 
  const [userHistory, setUserHistory] = useState<GameResult[]>([]);
  const [isAdminTester, setIsAdminTester] = useState(false);
  const [muted, setMuted] = useState(false);
  const [trialsLeft, setTrialsLeft] = useState(0);
  const [unusedCodesCount, setUnusedCodesCount] = useState(0);
  const [showTrialsOverAlert, setShowTrialsOverAlert] = useState(false);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  
  const [notification, setNotification] = useState<CodeRequest | null>(null);
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number, city: string}[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const T = t[lang];

  const refreshPrizes = async () => {
    try {
        const data = await backend.getPrizes();
        setPrizes(data);
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
        setLoadProgress(prev => {
            if (prev >= 92) {
                clearInterval(interval);
                setTimeout(() => {
                    setLoadProgress(100);
                    setTimeout(() => setIsLoading(false), 600);
                }, 800);
                return 92;
            }
            const remaining = 95 - prev;
            const increment = Math.max(0.5, remaining * 0.1 * Math.random());
            return prev + increment;
        });
    }, 150);

    const initApp = async () => {
        try {
            await refreshPrizes();
            
            // ПРОВЕРКА АДМИН-СЕССИИ (Приоритет)
            const isAdminActive = localStorage.getItem('lambrotin_admin_active') === 'true';
            
            const user = await backend.refreshUser();
            if (user) {
                setCurrentUser(user);
                // Если админ был активен, идем в админку, иначе в игру
                if (isAdminActive) {
                    setScreen('admin');
                } else {
                    setScreen('game');
                }
                
                await backend.syncTrialCount(user.id);
                setTrialsLeft(backend.getTrialCount(user.id));
                const codes = await backend.getUserUnusedCodes(user.id);
                setUnusedCodesCount(codes.length);
                
                const notifs = await backend.checkUserNotifications(user.id);
                if (notifs.length > 0) {
                    setNotification(notifs[0]);
                }
            } else if (isAdminActive) {
                // Если сессия админа есть, но пользователь разлогинился - это странный случай,
                // но на всякий случай выводим регистрацию
                setScreen('register');
                localStorage.removeItem('lambrotin_admin_active');
            }
        } catch (error) {
            console.error("Initialization error:", error);
        }
    };

    initApp();
    setMuted(sounds.isMuted());

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => clearInterval(interval);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const loadLeaderboard = async () => {
      try {
          const lb = await backend.getLeaderboard(5);
          setLeaderboard(lb);
          setShowLeaderboard(true);
      } catch (e) {}
  };

  useEffect(() => {
    if (currentUser) {
      backend.getUserResults(currentUser.id).then(history => setUserHistory(history));
      backend.syncTrialCount(currentUser.id).then(() => {
          setTrialsLeft(backend.getTrialCount(currentUser.id));
      });
      backend.getUserUnusedCodes(currentUser.id).then(codes => {
          setUnusedCodesCount(codes.length);
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
    setGameState('ended');
    setActiveCode(null);

    if (currentUser) {
      try {
        await backend.saveGameResult(
            currentUser.id, 
            finalScore, 
            isAdminTester ? 'ADMIN_TEST' : (activeCode || 'TRIAL'), 
            false 
        );
        await backend.syncTrialCount(currentUser.id);
        const freshTrialsLeft = backend.getTrialCount(currentUser.id);
        setTrialsLeft(freshTrialsLeft);
        
        const codes = await backend.getUserUnusedCodes(currentUser.id);
        setUnusedCodesCount(codes.length);
        
        const updated = await backend.refreshUser();
        if (updated) setCurrentUser(updated);
      } catch (e) {
        console.error("Error saving score:", e);
      }
    }
  };

  const handleAdminTest = () => {
    setIsAdminTester(true);
    setScreen('game');
    setShowTutorial(false);
    setGameState('idle');
    setScore(0);
  };

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
         setProfileInitialTab('codes');
         setProfileInitialCodesSubTab(unusedCodesCount > 0 ? 'my' : 'get');
         setActiveTab('profile');
     }
  };

  const startTutorial = (c: string | null) => {
    setActiveCode(c);
    setShowTutorial(true);
  };

  const startGameAfterTutorial = () => {
    if (!activeCode && !isAdminTester && trialsLeft <= 0) {
        setShowTutorial(false);
        setShowTrialsOverAlert(true);
        return;
    }

    if (!activeCode && !isAdminTester && currentUser) {
      backend.useTrial(currentUser.id);
    }
    setShowTutorial(false);
    setGameState('playing');
  };

  const handlePlayWithCode = async (code: string) => {
      if(!currentUser) return;
      try {
          await backend.validateAndUseCode(code, currentUser.id);
          setActiveTab('home'); 
          startTutorial(code);
      } catch (e: any) {
          alert(e.message);
      }
  };

  const bestScore = Math.max(score, ...userHistory.map(r => r.score), 0);
  
  const handleLogout = () => {
      backend.logout();
      localStorage.removeItem('lambrotin_admin_active');
      setCurrentUser(null);
      setScreen('register');
      setGameState('idle');
      setScore(0);
      setActiveTab('home');
      setShowTrialsOverAlert(false);
  };

  const handleLanguageSelect = (l: Language) => {
    setLang(l);
    localStorage.setItem('lambrotin_lang', l);
    setShowLangSelector(false);
  };

  // ПРИОРИТЕТ 1: Выбор языка при первом входе
  if (showLangSelector) {
      return <LanguageSelectionScreen onSelect={handleLanguageSelect} />;
  }

  // ПРИОРИТЕТ 2: Загрузка приложения
  if (isLoading) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
             <LungsLoader progress={loadProgress} size={180} lang={lang} />
          </div>
      );
  }

  if (screen === 'register') {
    return <RegisterScreen 
        onRegisterSuccess={async (isNewUser) => {
            setIsLoading(true);
            setLoadProgress(0);
            
            const interval = setInterval(() => {
                setLoadProgress(prev => {
                    if (prev >= 92) {
                        clearInterval(interval);
                        setTimeout(() => {
                            setLoadProgress(100);
                            setTimeout(() => setIsLoading(false), 500);
                        }, 800);
                        return 92;
                    }
                    const remaining = 95 - prev;
                    const increment = Math.max(1, remaining * 0.2 * Math.random());
                    return prev + increment;
                });
            }, 100);
            
            const u = await backend.refreshUser();
            if (u) {
                setCurrentUser(u);
                setScreen('game');
                await backend.syncTrialCount(u.id);
                setTrialsLeft(backend.getTrialCount(u.id));
                const codes = await backend.getUserUnusedCodes(u.id);
                setUnusedCodesCount(codes.length);
                if (isNewUser) {
                    setShowWelcomeRules(true);
                }
            }
        }} 
        onAdminLogin={() => setScreen('admin')} 
        lang={lang}
        setLang={setLang}
    />;
  }

  if (screen === 'admin') {
    return <AdminPanel 
        onBack={() => { 
            setScreen('game'); 
            localStorage.removeItem('lambrotin_admin_active');
            refreshPrizes(); 
        }} 
        onTestGame={handleAdminTest} 
        onPrizesUpdated={refreshPrizes}
    />;
  }

  return (
    <div className="w-full h-full relative bg-slate-50 overflow-hidden font-sans antialiased">
      
      <div id="game-background" className="absolute inset-0 bg-gradient-to-b from-[#d6e8f5] to-[#aed9e0]"></div>
      <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <LungsLoader progress={50} size={120} lang={lang} />
          </div>
      }>
        <BelindaStackGame 
          onGameOver={handleGameOver} 
          onScoreUpdate={handleGameScoreUpdate}
          gameState={gameState}
          onGameStart={() => {}}
        />
      </Suspense>

      {gameState === 'playing' && (
         <div className="absolute inset-0 pointer-events-none z-20">
             <div className="absolute top-28 left-0 right-0 flex justify-center">
                 <div className="text-[100px] font-black text-white/50 leading-none drop-shadow-sm select-none">
                     {score}
                 </div>
             </div>
             
             <div className="absolute top-8 left-8 pointer-events-auto bg-white/20 backdrop-blur-md p-2 px-4 rounded-full flex items-center gap-2 text-white border border-white/20 shadow-sm">
                 <CrownIcon />
                 <span className="font-black text-sm">{bestScore}</span>
             </div>

             <button 
                onClick={toggleMute}
                className="absolute top-8 right-8 pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition active:scale-95 border border-white/20"
             >
                <SoundIcon muted={muted} />
             </button>
         </div>
      )}

      {gameState !== 'playing' && (
          <div className="absolute inset-0 z-30 flex flex-col pointer-events-none">
              
              {activeTab === 'home' && (
                  <div className="pt-8 px-6 flex justify-between items-center pointer-events-auto">
                      <div className="flex items-center gap-3 bg-white/95 p-2 pr-5 rounded-2xl shadow-sm border border-slate-100 backdrop-blur-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                              <UserIcon />
                          </div>
                          <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Игрок</div>
                              <div className="text-sm font-black text-slate-800 leading-none">{currentUser?.name || 'Гость'}</div>
                          </div>
                      </div>

                      <button 
                        onClick={loadLeaderboard}
                        className="flex items-center gap-3 bg-white/95 p-2 pr-5 rounded-2xl shadow-sm border border-slate-100 backdrop-blur-sm hover:border-amber-200 transition-all group active:scale-95"
                      >
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors">
                            <TrophyIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-wider mb-0.5">Топ-5</div>
                            <div className="text-sm font-black text-slate-800 leading-none uppercase">Рейтинг</div>
                        </div>
                      </button>
                  </div>
              )}

              <div className="flex-1 relative pb-24"> 
                  
                  {activeTab === 'home' && gameState === 'idle' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-start pt-28 animate-fade-in pointer-events-auto overflow-y-auto custom-scrollbar">
                          
                          <div className="mb-12 text-center">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <BoltIcon className="w-12 h-12 text-blue-600 fill-current drop-shadow-md" />
                                        <h1 className="text-5xl font-black italic uppercase text-blue-700 tracking-tighter leading-none">
                                            ЛАМБРОТИН
                                        </h1>
                                    </div>
                                    <p className="text-[14px] font-black text-slate-500 uppercase tracking-widest ml-12 opacity-80">Stack Challenge</p>
                                </div>
                                <p className="text-slate-500 font-black text-xs bg-white/50 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm border border-white/20 italic uppercase tracking-wider">{T.syrup}</p>
                          </div>

                          <div className="flex flex-col items-center gap-6">
                              <div className="relative group">
                                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                  <button 
                                    onClick={handlePlayRequest}
                                    className="relative w-24 h-24 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 hover:scale-105 transition-transform duration-300 active:scale-95"
                                  >
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 ml-1">
                                          <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                      </svg>
                                  </button>
                              </div>

                              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                                {deferredPrompt && (
                                   <button 
                                      onClick={handleInstallApp}
                                      className="w-full bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-blue-700 animate-bounce-subtle"
                                  >
                                      <DownloadIcon />
                                      Установить игру
                                  </button>
                                )}
                                
                                <button 
                                    onClick={() => setShowInvoiceModal(true)}
                                    className="w-full bg-white/90 backdrop-blur-md border border-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-slate-200/50 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-white"
                                >
                                    <DocumentIcon className="w-4 h-4 text-blue-500" />
                                    Отправить накладную
                                </button>
                                
                                <a 
                                    href="https://t.me/+992555501105" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full bg-white/90 backdrop-blur-md border border-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-slate-200/50 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-white"
                                >
                                    <MessageIcon className="w-4 h-4 text-blue-500" />
                                    {T.supportService}
                                </a>
                              </div>
                          </div>

                          <div className="mt-10 flex gap-4">
                              <div className="bg-white/90 px-6 py-3 rounded-2xl border border-slate-100 text-center shadow-sm backdrop-blur-md min-w-[110px]">
                                  <div className="text-[10px] font-black text-slate-400 mb-0.5 uppercase tracking-wide">{T.record}</div>
                                  <div className="text-2xl font-black text-slate-800 leading-none">{bestScore}</div>
                              </div>
                              <div className="bg-white/90 px-6 py-3 rounded-2xl border border-slate-100 text-center shadow-sm backdrop-blur-md min-w-[110px]">
                                  <div className="text-[10px] font-black text-slate-400 mb-0.5 uppercase tracking-wide">{T.attempts}</div>
                                  <div className={`text-2xl font-black leading-none ${trialsLeft > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                      {activeCode ? '∞' : trialsLeft}
                                  </div>
                              </div>
                          </div>

                          {activeCode && (
                             <div className="mt-4 mb-4 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-[10px] font-black border border-blue-100 uppercase tracking-widest shadow-sm shadow-blue-100 animate-fade-in">
                                 {T.activeCode}: {activeCode}
                             </div>
                          )}
                      </div>
                  )}

                  {activeTab === 'profile' && (
                      <div className="absolute inset-0 pointer-events-auto animate-fade-in bg-slate-50 z-40">
                          {currentUser && (
                              <ProfileScreen 
                                user={currentUser} 
                                onLogout={handleLogout}
                                onBack={() => setActiveTab('home')}
                                embedded={true}
                                lang={lang}
                                setLang={setLang}
                                prizes={prizes}
                                onPlayCode={handlePlayWithCode}
                                initialTab={profileInitialTab}
                                initialCodesSubTab={profileInitialCodesSubTab}
                                muted={muted}
                                toggleMute={toggleMute}
                              />
                          )}
                      </div>
                  )}

                  {gameState === 'ended' && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-slate-900/10 backdrop-blur-sm p-6 z-50">
                            <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-sm w-full animate-fade-in relative border border-slate-100">
                                <div className="inline-block p-3 rounded-2xl bg-slate-50 mb-4 shadow-inner text-slate-300">
                                    <CrownIcon />
                                </div>
                                <h2 className="text-6xl font-black text-slate-800 mb-2 leading-none tracking-tight">{score}</h2>
                                <p className="text-[11px] font-black text-slate-400 tracking-wider mb-8 uppercase">Результат игры</p>
                                
                                {score > bestScore && (
                                    <div className="mb-8 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border border-amber-100">
                                        Новый рекорд!
                                    </div>
                                )}

                                <div className="mb-8 flex justify-center gap-4">
                                    {!activeCode && (
                                        <div className={`px-4 py-3 rounded-xl border flex flex-col items-center min-w-[110px] ${trialsLeft > 0 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                                            <div className="text-[9px] font-black uppercase tracking-wider opacity-60 mb-0.5">{T.attemptsLeft}</div>
                                            <div className="text-2xl font-black leading-none">{Math.max(0, trialsLeft)}</div>
                                        </div>
                                    )}
                                    <div className="px-4 py-3 rounded-xl border bg-indigo-50 border-indigo-100 text-indigo-600 flex flex-col items-center min-w-[110px]">
                                        <div className="text-[9px] font-black uppercase tracking-wider opacity-60 mb-0.5">Кодов</div>
                                        <div className="text-2xl font-black leading-none">{unusedCodesCount}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => { setGameState('idle'); handlePlayRequest(); }} 
                                        className={`w-full py-5 font-black rounded-2xl text-[11px] uppercase tracking-[0.1em] transition shadow-xl ${
                                            (trialsLeft <= 0 && !activeCode)
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-400/30' 
                                            : 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-400/30'
                                        }`}
                                    >
                                        {(trialsLeft <= 0 && !activeCode) ? T.getCodes : T.playAgain}
                                    </button>
                                    <button onClick={() => { setGameState('idle'); setActiveTab('home'); }} className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition">
                                        {T.menu}
                                    </button>
                                </div>
                            </div>
                       </div>
                  )}
              </div>

              {gameState !== 'ended' && (
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe pt-2 z-50 shadow-sm pointer-events-auto">
                      <div className="flex justify-around items-center h-[70px] max-w-md mx-auto">
                          <button 
                              onClick={() => { setActiveTab('home'); setProfileInitialTab('prizes'); }}
                              className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-300 group`}
                          >
                              <div className={`p-2 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                <HomeIcon />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeTab === 'home' ? 'text-slate-800' : 'text-slate-300'}`}>{T.menuMain}</span>
                          </button>
                          
                          <button 
                              onClick={() => { setActiveTab('profile'); setProfileInitialTab('prizes'); }}
                              className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-300 group`}
                          >
                              <div className={`p-2 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                <UserIcon />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-300'}`}>{T.menuProfile}</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}

      {showLeaderboard && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 animate-fade-in pointer-events-auto">
              <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-[48px] shadow-2xl relative border border-slate-100 flex flex-col">
                  <button onClick={() => setShowLeaderboard(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 text-3xl font-light transition">&times;</button>
                  <div className="flex flex-col items-center mb-8">
                      <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                          <CrownIcon />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Таблица лидеров</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Лучшие результаты за февраль</p>
                  </div>
                  <div className="space-y-3">
                      {leaderboard.map((item, idx) => (
                          <div key={idx} className={`p-5 rounded-[28px] border flex items-center justify-between transition-all ${idx === 0 ? 'bg-amber-50 border-amber-100 shadow-sm' : 'bg-slate-50 border-slate-50'}`}>
                              <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${
                                      idx === 0 ? 'bg-amber-400 text-white' : 
                                      idx === 1 ? 'bg-slate-300 text-white' : 
                                      idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'
                                  }`}>{idx + 1}</div>
                                  <div>
                                      <div className="text-sm font-black text-slate-800">{item.name}</div>
                                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.city}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className={`text-xl font-black ${idx === 0 ? 'text-amber-600' : 'text-slate-800'}`}>{item.score}</div>
                                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">очков</div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button 
                      onClick={() => setShowLeaderboard(false)}
                      className="w-full mt-10 py-5 bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200/50 text-[11px] uppercase tracking-[0.1em] hover:bg-slate-900 transition active:scale-[0.98]"
                  >
                      Понятно
                  </button>
              </div>
          </div>
      )}

      {showInvoiceModal && currentUser && (
        <PurchaseRulesScreen
          lang={lang}
          userId={currentUser.id}
          onClose={() => setShowInvoiceModal(false)}
          onPlayCode={handlePlayWithCode}
          forceShowUpload={true}
        />
      )}

      {notification && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm antialiased">
              <div className="bg-white w-full max-sm p-8 rounded-[32px] shadow-2xl animate-fade-in text-center relative border border-slate-100">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ${notification.status === 'approved' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                        {notification.status === 'approved' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight uppercase italic">{T.notifyTitle}</h3>
                    <p className="text-[13px] font-bold text-slate-600 mb-8 leading-relaxed">
                        {notification.status === 'approved' 
                            ? `${T.notifyApproved} ${notification.codesIssued}` 
                            : `${T.notifyRejected}`}
                        {notification.status === 'rejected' && notification.adminComment && (
                            <span className="block mt-2 text-slate-400 uppercase tracking-tighter font-black">{T.notifyReason} {notification.adminComment}</span>
                        )}
                    </p>
                    <button 
                        onClick={() => setNotification(null)}
                        className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl shadow-lg text-[10px] uppercase tracking-widest transition active:scale-[0.98] hover:bg-slate-900"
                    >
                        {T.ok}
                    </button>
              </div>
          </div>
      )}

      {showWelcomeRules && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm antialiased">
              <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-2xl animate-fade-in relative text-center border border-slate-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                      <CrownIcon />
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 mb-6 leading-tight uppercase italic">Правила игры</h3>
                  
                  <div className="text-[13px] font-bold text-slate-600 leading-relaxed mb-10 space-y-4 text-center">
                      <p>
                          Добро пожаловать в <span className="font-black italic uppercase text-blue-600">Lambrotin Stack</span>!
                      </p>
                      <p>
                          У тебя есть <span className="font-black text-blue-600 uppercase tracking-tight">6 бесплатных попыток</span>.
                      </p>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 font-bold">
                          Твоя главная цель — набрать <strong>максимальное</strong> количество очков.
                          Самые ценные призы достанутся тем, кто установит <strong>рекорд</strong>!
                      </div>
                  </div>

                  <button 
                    onClick={() => setShowWelcomeRules(false)}
                    className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl shadow-lg text-[10px] uppercase tracking-widest hover:bg-slate-900 transition active:scale-[0.98]"
                  >
                    Понятно / Играть
                  </button>
              </div>
          </div>
      )}

      {showTutorial && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm antialiased">
              <div className="bg-white w-full max-sm p-8 rounded-[40px] shadow-2xl animate-fade-in relative border border-slate-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                  <h3 className="text-xl font-black text-slate-800 mb-8 text-center uppercase italic">{T.howToPlay}</h3>
                  
                  {!activeCode && !isAdminTester && (
                      <div className="mb-8 text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-1">
                               {T.yourTrials.replace('{n}', trialsLeft.toString())}
                           </p>
                           <p className="text-red-500 font-black text-[9px] uppercase tracking-[0.2em] opacity-80">
                               {T.noPrizeWarning}
                           </p>
                      </div>
                  )}

                  <div className="space-y-6">
                      <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-lg shadow-sm shrink-0 transition-transform group-hover:scale-105 group-hover:bg-slate-200">1</div>
                          <p className="text-[11px] font-black uppercase tracking-tight text-slate-500 leading-relaxed flex-1">{T.step1}</p>
                      </div>
                      <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-lg shadow-sm shrink-0 transition-transform group-hover:scale-105 group-hover:bg-slate-200">2</div>
                          <p className="text-[11px] font-black uppercase tracking-tight text-slate-500 leading-relaxed flex-1">{T.step2}</p>
                      </div>
                      <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg shadow-sm shrink-0 transition-transform group-hover:scale-105 group-hover:bg-blue-100">3</div>
                          <p className="text-[11px] font-black uppercase tracking-tight text-slate-500 leading-relaxed flex-1">{T.step3}</p>
                      </div>
                  </div>
                  <button 
                    onClick={startGameAfterTutorial}
                    className="w-full mt-10 py-5 bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200/50 text-[11px] uppercase tracking-[0.1em] hover:bg-slate-900 transition active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {T.letsGo} <ArrowRightIcon />
                  </button>
              </div>
          </div>
      )}

      {showTrialsOverAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm antialiased">
          <div className="bg-white w-full max-w-sm p-8 rounded-[32px] shadow-2xl animate-fade-in text-center relative border border-slate-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <button onClick={() => setShowTrialsOverAlert(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 text-2xl leading-none font-light">&times;</button>
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <BoltIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight uppercase italic">{T.trialsOverTitle}</h3>
            <p className="text-[13px] font-bold text-slate-400 mb-8 leading-relaxed">{T.trialsOverDesc}</p>
            <button 
                onClick={() => {
                    setShowTrialsOverAlert(false);
                    setProfileInitialTab('codes');
                    setProfileInitialCodesSubTab('my');
                    setActiveTab('profile');
                }}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 text-[11px] uppercase tracking-widest transition active:scale-[0.98] hover:bg-blue-700"
            >
                {T.getCodes}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
