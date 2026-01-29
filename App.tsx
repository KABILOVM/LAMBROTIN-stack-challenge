import React, { useState, useEffect } from 'react';
import { RegisterScreen, PurchaseRulesScreen } from './components/UI/AuthScreens.tsx';
import { BelindaStackGame } from './components/Game/BelindaStackGame.tsx';
import { AdminPanel } from './components/UI/AdminPanel.tsx';
import { ProfileScreen } from './components/UI/ProfileScreen.tsx';
import { backend } from './services/mockBackend.ts';
import { ScreenType, User, GameResult, Language, PrizeConfig, CodeRequest } from './types.ts';
import { sounds } from './services/SoundService.ts';
import { PrizeIcon } from './components/UI/PrizeIcons.tsx';
import { MAX_TRIALS } from './constants.ts';
import { t } from './translations.ts';

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const DocumentIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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

function App() {
  const [screen, setScreen] = useState<ScreenType>('register');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('ru');
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [profileInitialTab, setProfileInitialTab] = useState<'prizes' | 'history' | 'codes' | 'settings'>('prizes');
  
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
  const [viewingPrizeId, setViewingPrizeId] = useState<string | null>(null);
  const [unusedCodesCount, setUnusedCodesCount] = useState(0);
  const [showTrialsOverAlert, setShowTrialsOverAlert] = useState(false);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  
  const [notification, setNotification] = useState<CodeRequest | null>(null);

  const T = t[lang];

  useEffect(() => {
    const initApp = async () => {
        try {
            const prizesData = await backend.getPrizes();
            setPrizes(prizesData);
            
            const user = await backend.refreshUser();
            if (user) {
                setCurrentUser(user);
                setScreen('game');
                await backend.syncTrialCount(user.id);
                setTrialsLeft(backend.getTrialCount(user.id));
                const codes = await backend.getUserUnusedCodes(user.id);
                setUnusedCodesCount(codes.length);
                
                const notifs = await backend.checkUserNotifications(user.id);
                if (notifs.length > 0) {
                    setNotification(notifs[0]);
                }
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
         setActiveTab('profile');
     }
  };

  const startTutorial = (c: string | null) => {
    setActiveCode(c);
    setShowTutorial(true);
    setViewingPrizeId(null);
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
      setCurrentUser(null);
      setScreen('register');
      setGameState('idle');
      setScore(0);
      setActiveTab('home');
      setShowTrialsOverAlert(false);
  };

  if (isLoading) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
             <div className="flex flex-col items-center gap-6 animate-pulse">
                 <BoltIcon className="w-10 h-10 text-blue-500" />
                 <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Загрузка...</p>
             </div>
          </div>
      );
  }

  if (screen === 'register') {
    return <RegisterScreen 
        onRegisterSuccess={async (isNewUser) => {
            setIsLoading(true);
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
    <div className="w-full h-full relative bg-slate-50 overflow-hidden font-sans antialiased">
      
      <div id="game-background" className="absolute inset-0 bg-gradient-to-b from-[#d6e8f5] to-[#aed9e0]"></div>
      <BelindaStackGame 
        onGameOver={handleGameOver} 
        onScoreUpdate={handleGameScoreUpdate}
        gameState={gameState}
        onGameStart={() => {}}
      />

      {gameState === 'playing' && (
         <div className="absolute inset-0 pointer-events-none z-20">
             <div className="absolute top-28 left-0 right-0 flex justify-center">
                 <div className="text-[100px] font-bold text-white/50 leading-none drop-shadow-sm select-none">
                     {score}
                 </div>
             </div>
             
             <div className="absolute top-8 left-8 pointer-events-auto bg-white/20 backdrop-blur-md p-2 px-4 rounded-full flex items-center gap-2 text-white border border-white/20 shadow-sm">
                 <CrownIcon />
                 <span className="font-bold text-sm">{bestScore}</span>
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
                  <div className="pt-8 px-6 flex justify-between items-start pointer-events-auto">
                      <div className="flex items-center gap-3 bg-white/95 p-2 pr-5 rounded-2xl shadow-sm border border-slate-100 backdrop-blur-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                              <UserIcon />
                          </div>
                          <div>
                              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Игрок</div>
                              <div className="text-sm font-bold text-slate-800 leading-none">{currentUser?.name || 'Гость'}</div>
                          </div>
                      </div>
                  </div>
              )}

              <div className="flex-1 relative pb-24"> 
                  
                  {activeTab === 'home' && gameState === 'idle' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-start pt-28 animate-fade-in pointer-events-auto">
                          
                          <div className="mb-16 text-center">
                                {/* Updated Modern Premium Logo */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <BoltIcon className="w-12 h-12 text-blue-600 fill-current drop-shadow-md" />
                                        <h1 className="text-5xl font-black italic uppercase text-blue-700 tracking-tighter leading-none">
                                            ЛАМБРОТИН
                                        </h1>
                                    </div>
                                    <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest ml-12 opacity-80">Stack Challenge</p>
                                </div>
                                <p className="text-slate-500 font-medium text-xs bg-white/50 px-4 py-1 rounded-full inline-block backdrop-blur-sm border border-white/20 italic">{T.syrup}</p>
                          </div>

                          <div className="flex flex-col items-center gap-8">
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

                              <button 
                                onClick={() => setShowInvoiceModal(true)}
                                className="bg-white/90 backdrop-blur-md border border-slate-100 text-slate-700 px-6 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-md shadow-slate-200/50 flex items-center gap-3 active:scale-[0.98] transition-all hover:bg-white"
                              >
                                  <DocumentIcon className="w-4 h-4 text-blue-500" />
                                  Отправить накладную
                              </button>
                          </div>

                          <div className="mt-10 flex gap-4">
                              <div className="bg-white/90 px-6 py-3 rounded-2xl border border-slate-100 text-center shadow-sm backdrop-blur-md">
                                  <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">{T.record}</div>
                                  <div className="text-2xl font-bold text-slate-800 leading-none">{bestScore}</div>
                              </div>
                              <div className="bg-white/90 px-6 py-3 rounded-2xl border border-slate-100 text-center shadow-sm backdrop-blur-md">
                                  <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">{T.attempts}</div>
                                  <div className={`text-2xl font-bold leading-none ${trialsLeft > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                      {activeCode ? '∞' : trialsLeft}
                                  </div>
                              </div>
                          </div>

                          {activeCode && (
                             <div className="mt-4 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-[10px] font-bold border border-blue-100 uppercase tracking-widest shadow-sm shadow-blue-100 animate-fade-in">
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
                                <h2 className="text-6xl font-bold text-slate-800 mb-2 leading-none tracking-tight">{score}</h2>
                                <p className="text-[11px] font-bold text-slate-400 tracking-wider mb-8 uppercase">Результат игры</p>
                                
                                {score > bestScore && (
                                    <div className="mb-8 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest inline-block border border-amber-100">
                                        Новый рекорд!
                                    </div>
                                )}

                                <div className="mb-8 flex justify-center gap-4">
                                    {!activeCode && (
                                        <div className={`px-4 py-2.5 rounded-xl border flex flex-col items-center min-w-[100px] ${trialsLeft > 0 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                                            <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-0.5">{T.attemptsLeft}</div>
                                            <div className="text-xl font-bold leading-none">{Math.max(0, trialsLeft)}</div>
                                        </div>
                                    )}
                                    <div className="px-4 py-2.5 rounded-xl border bg-indigo-50 border-indigo-100 text-indigo-600 flex flex-col items-center min-w-[100px]">
                                        <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-0.5">Кодов</div>
                                        <div className="text-xl font-bold leading-none">{unusedCodesCount}</div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => { setGameState('idle'); setActiveTab('home'); }} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition">
                                        {T.menu}
                                    </button>
                                    <button 
                                        onClick={() => { setGameState('idle'); handlePlayRequest(); }} 
                                        className={`flex-[2] py-4 font-bold rounded-2xl text-[10px] uppercase tracking-widest transition shadow-lg ${
                                            (trialsLeft <= 0 && !activeCode)
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' 
                                            : 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200'
                                        }`}
                                    >
                                        {(trialsLeft <= 0 && !activeCode) ? T.getCodes : T.playAgain}
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
                              <div className={`p-2 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                <HomeIcon />
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'home' ? 'text-slate-800' : 'text-slate-300'}`}>{T.menuMain}</span>
                          </button>
                          
                          <button 
                              onClick={() => { setActiveTab('profile'); setProfileInitialTab('prizes'); }}
                              className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-300 group`}
                          >
                              <div className={`p-2 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                <UserIcon />
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-300'}`}>{T.menuProfile}</span>
                          </button>
                      </div>
                  </div>
              )}
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight uppercase italic">{T.notifyTitle}</h3>
                    <p className="text-[13px] font-medium text-slate-600 mb-8 leading-relaxed">
                        {notification.status === 'approved' 
                            ? `${T.notifyApproved} ${notification.codesIssued}` 
                            : `${T.notifyRejected}`}
                        {notification.status === 'rejected' && notification.adminComment && (
                            <span className="block mt-2 text-slate-400 uppercase tracking-tighter">{T.notifyReason} {notification.adminComment}</span>
                        )}
                    </p>
                    <button 
                        onClick={() => setNotification(null)}
                        className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-lg text-[10px] uppercase tracking-widest transition active:scale-[0.98] hover:bg-slate-900"
                    >
                        {T.ok}
                    </button>
              </div>
          </div>
      )}

      {showWelcomeRules && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm antialiased">
              <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-2xl animate-fade-in relative text-center border border-slate-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                      <CrownIcon />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-6 leading-tight uppercase italic">Правила игры</h3>
                  
                  <div className="text-[13px] font-medium text-slate-600 leading-relaxed mb-10 space-y-4">
                      <p>
                          Добро пожаловать в <span className="font-black italic uppercase text-blue-600">Lambrotin Stack</span>!
                      </p>
                      <p>
                          У тебя есть <span className="font-bold text-blue-600 uppercase tracking-tight">6 бесплатных попыток</span>.
                      </p>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700">
                          Твоя главная цель — набрать <strong>максимальное</strong> количество очков.
                          Самые ценные призы достанутся тем, кто установит <strong>рекорд</strong>!
                      </div>
                  </div>

                  <button 
                    onClick={() => setShowWelcomeRules(false)}
                    className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-lg text-[10px] uppercase tracking-widest hover:bg-slate-900 transition active:scale-[0.98]"
                  >
                    Понятно / Играть
                  </button>
              </div>
          </div>
      )}

      {showTutorial && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm antialiased">
              <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-2xl animate-fade-in relative border border-slate-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                  <h3 className="text-xl font-bold text-slate-800 mb-8 text-center uppercase italic">{T.howToPlay}</h3>
                  
                  {!activeCode && !isAdminTester && (
                      <div className="mb-8 text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-1">
                               {T.yourTrials.replace('{n}', trialsLeft.toString())}
                           </p>
                           <p className="text-red-500 font-bold text-[9px] uppercase tracking-[0.2em] opacity-80">
                               {T.noPrizeWarning}
                           </p>
                      </div>
                  )}

                  <div className="space-y-6">
                      <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg shadow-sm shrink-0 transition-transform group-hover:scale-105 group-hover:bg-slate-200">1</div>
                          <p className="text-[11px] font-bold uppercase tracking-tight text-slate-500 leading-relaxed flex-1">{T.step1}</p>
                      </div>
                      <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg shadow-sm shrink-0 transition-transform group-hover:scale-105 group-hover:bg-slate-200">2</div>
                          <p className="text-[11px] font-bold uppercase tracking-tight text-slate-500 leading-relaxed flex-1">{T.step2}</p>
                      </div>
                      <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm shrink-0 transition-transform group-hover:scale-105 group-hover:bg-blue-100">3</div>
                          <p className="text-[11px] font-bold uppercase tracking-tight text-slate-500 leading-relaxed flex-1">{T.step3}</p>
                      </div>
                  </div>
                  <button 
                    onClick={startGameAfterTutorial}
                    className="w-full mt-10 py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-lg text-[10px] uppercase tracking-widest hover:bg-slate-900 transition active:scale-[0.98] flex items-center justify-center gap-2"
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
            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight uppercase italic">{T.trialsOverTitle}</h3>
            <p className="text-[13px] font-medium text-slate-400 mb-8 leading-relaxed">{T.trialsOverDesc}</p>
            <button 
                onClick={() => {
                    setShowTrialsOverAlert(false);
                    setProfileInitialTab('codes');
                    setActiveTab('profile');
                }}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 text-[10px] uppercase tracking-widest transition active:scale-[0.98] hover:bg-blue-700"
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