
import React, { useState, useEffect } from 'react';
import { User, GameResult, Language, PrizeConfig, PromoCode } from '../../types';
import { backend } from '../../services/mockBackend';
import { PrizeIcon } from './PrizeIcons';
import { t } from '../../translations';

// --- ICONS ---
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);

const TrophyIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h14.25a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.348v.262zm9.42 3.294c.546-.974.857-2.098.857-3.294v-.262c.702.097 1.373.214 2.006.348a5.265 5.265 0 01-2.863 3.208z" clipRule="evenodd" />
    </svg>
);

const GiftIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.997 2.397l.32.274a2.25 2.25 0 01.996 1.714V19.5a3 3 0 003 3h8.25a3 3 0 003-3v-5.857a2.25 2.25 0 01.996-1.714l.32-.274a3 3 0 00.997-2.397V5.25a3 3 0 00-3-3H5.25zm1.5 8.25V5.25a1.5 1.5 0 011.5-1.5h2.25v6.75H6.75zm10.5 0h-3.75V3.75H16.5a1.5 1.5 0 011.5 1.5v5.25z" clipRule="evenodd" />
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Countdown = ({ lang }: { lang: Language }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
    const T = t[lang];

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const currentYear = now.getFullYear();
            // End of February (Month index 2 is March, day 0 is last day of Feb)
            const endOfFeb = new Date(currentYear, 2, 0, 23, 59, 59); 
            
            // If February passed this year, look at next year
            if (now > endOfFeb) {
                endOfFeb.setFullYear(currentYear + 1);
            }

            const difference = endOfFeb.getTime() - now.getTime();
            
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100">
            <ClockIcon />
            <span className="text-[9px] font-bold uppercase tracking-wider">
                {T.timeLeft} <span className="text-red-700">{timeLeft.days} {T.days} {timeLeft.hours} {T.hours}</span>
            </span>
        </div>
    );
};

// --- TYPES & PROPS ---

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  embedded?: boolean;
  lang: Language;
  setLang: (l: Language) => void;
  prizes: PrizeConfig[];
  onPlayCode: (code: string) => void;
  initialTab?: 'prizes' | 'history' | 'codes';
}

// --- COMPONENTS ---

export const ProfileScreen = ({ user: initialUser, onBack, onLogout, embedded = false, lang, setLang, prizes, onPlayCode, initialTab = 'prizes' }: ProfileScreenProps) => {
  const [user, setUser] = useState<User>(initialUser);
  const [bestScore, setBestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tempError, setTempError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [myCodes, setMyCodes] = useState<PromoCode[]>([]);
  const [activeTab, setActiveTab] = useState<'prizes' | 'history' | 'codes'>(initialTab);
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);

  const T = t[lang];

  // Local selection state for prizes
  const [localSelection, setLocalSelection] = useState<string[]>(initialUser.claimedPrizes || []);

  useEffect(() => {
    backend.getUserResults(user.id).then(userHistory => {
      setGameHistory(userHistory);
      const eligibleGames = userHistory.filter(r => r.codeUsed !== 'TRIAL');
      const max = Math.max(0, ...eligibleGames.map((r: GameResult) => r.score));
      setBestScore(max);
    });
    backend.getUserUnusedCodes(user.id).then(codes => {
        // We get unused, but let's fetch ALL for the history view in "My Codes"
        backend.getUserCodes(user.id).then(allCodes => {
             setMyCodes(allCodes);
        });
    });
  }, [user.id]);

  useEffect(() => {
    if (user.claimedPrizes) {
        setLocalSelection(prev => {
            const unique = new Set([...prev, ...user.claimedPrizes]);
            return Array.from(unique);
        });
    }
  }, [user.claimedPrizes]);

  const showTempError = (msg: string) => {
      setTempError(msg);
      setTimeout(() => setTempError(null), 3000);
  };

  const handleToggleSelection = (prize: PrizeConfig) => {
    if (prize.isOutOfStock) {
        showTempError(T.outOfStock);
        return;
    }
    if (bestScore < prize.threshold) {
        showTempError(`${T.needPoints} ${prize.threshold}!`);
        return;
    }
    if (user.claimedPrizes?.includes(prize.title)) return; 

    setLocalSelection(prev => {
        const isSelected = prev.includes(prize.title);
        if (isSelected) {
            return prev.filter(p => p !== prize.title);
        } else {
            if (prize.isValuable) {
                // If selecting a valuable prize, remove other valuable prizes from selection (since only 1 allowed)
                const otherValuables = prizes.filter(p => p.isValuable && p.title !== prize.title).map(p => p.title);
                const filtered = prev.filter(p => !otherValuables.includes(p));
                return [...filtered, prize.title];
            } else {
                return [...prev, prize.title];
            }
        }
    });
  };

  const handleConfirmSelection = async () => {
    const newPrizes = localSelection.filter(p => !user.claimedPrizes?.includes(p));
    if (newPrizes.length === 0) return;

    setLoading(true);
    try {
        let updatedUser = user;
        for (const prizeTitle of newPrizes) {
            updatedUser = await backend.claimPrize(user.id, prizeTitle);
        }
        setUser(updatedUser);
    } catch (e: any) {
        showTempError(e.message);
        setLocalSelection(user.claimedPrizes || []);
    } finally {
        setLoading(false);
    }
  };

  const handleDeliveryRequestClick = () => {
      // Check if any prizes are selected
      if (!localSelection || localSelection.length === 0) {
          showTempError(T.chooseOne);
          return;
      }
      setShowDeliveryConfirmation(true);
  };

  const confirmDelivery = async () => {
     setLoading(true);
     try {
         await backend.requestDelivery(user.id);
         const updated = await backend.refreshUser();
         if(updated) setUser(updated);
         setShowDeliveryConfirmation(false);
     } catch (e: any) {
         showTempError(e.message);
     } finally {
         setLoading(false);
     }
  };

  // --- Sub-components (Helpers) ---

  const confirmedValuable = user.claimedPrizes?.some(pTitle => prizes.find(cfg => cfg.title === pTitle)?.isValuable);
  const selectedValuable = localSelection.find(pTitle => prizes.find(cfg => cfg.title === pTitle)?.isValuable);
  const hasUnsavedChanges = localSelection.length > (user.claimedPrizes?.length || 0);
  const canRequestDelivery = (localSelection.length > 0 && !user.deliveryRequested);

  // Sorting Codes: Active First
  const sortedCodes = [...myCodes].sort((a, b) => {
      if (a.isUsed === b.isUsed) {
          // If both active or both used, sort by date desc
          return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
      }
      // Active (false) comes before Used (true)
      return a.isUsed ? 1 : -1;
  });

  const PrizeCard: React.FC<{ prize: PrizeConfig }> = ({ prize }) => {
    const isConfirmed = user.claimedPrizes?.includes(prize.title);
    const isSelectedLocally = localSelection.includes(prize.title);
    const isUnlocked = bestScore >= prize.threshold;
    const progressPercent = Math.min(100, Math.max(0, (bestScore / prize.threshold) * 100));
    
    // Logic for visual states
    let state = 'locked'; // locked, unlocked, selected, confirmed, outOfStock
    if (prize.isOutOfStock && !isConfirmed) state = 'outOfStock';
    else if (isConfirmed) state = 'confirmed';
    else if (isSelectedLocally) state = 'selected';
    else if (isUnlocked) {
        // Check if another valuable prize blocks this
        if (prize.isValuable && (selectedValuable && selectedValuable !== prize.title)) state = 'locked_alt_selected'; 
        else if (prize.isValuable && confirmedValuable) state = 'locked_already_claimed';
        else state = 'unlocked';
    }

    const baseClasses = "relative p-4 md:p-5 rounded-[24px] border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col gap-3 min-h-[140px]";
    let styleClasses = "";
    
    switch(state) {
        case 'confirmed':
            styleClasses = "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-200";
            break;
        case 'selected':
            styleClasses = "bg-white border-2 border-blue-600 shadow-xl shadow-blue-100 ring-2 ring-blue-50 transform scale-[1.02]";
            break;
        case 'unlocked':
            styleClasses = "bg-white border-slate-100 hover:border-blue-300 hover:shadow-md active:scale-[0.98]";
            break;
        case 'outOfStock':
            styleClasses = "bg-slate-50 border-slate-100 opacity-60 grayscale";
            break;
        default: // locked
            styleClasses = "bg-slate-50 border-slate-100 opacity-80";
    }

    return (
        <div 
            onClick={() => (state === 'unlocked' || state === 'selected') && handleToggleSelection(prize)}
            className={`${baseClasses} ${styleClasses}`}
        >
            <div className="flex justify-between items-start">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
                    ${state === 'confirmed' ? 'bg-white/20 text-white' : (state === 'unlocked' || state === 'selected' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-400')}`}>
                    <PrizeIcon name={prize.icon} className="w-5 h-5" />
                </div>
                {state === 'confirmed' && <div className="bg-white/20 p-1 rounded-full"><CheckIcon /></div>}
                {state === 'selected' && <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg"><CheckIcon /></div>}
                {(state === 'locked' || state === 'locked_alt_selected') && <LockIcon />}
            </div>

            <div className="flex-1">
                <h4 className={`text-xs font-black uppercase tracking-wider leading-tight mb-1 ${state === 'confirmed' ? 'text-white' : 'text-slate-800'}`}>
                    {prize.title}
                </h4>
                {!isConfirmed && (
                    <p className={`text-[9px] font-medium leading-snug line-clamp-2 ${state === 'confirmed' ? 'text-white/80' : 'text-slate-400'}`}>
                        {prize.description}
                    </p>
                )}
            </div>

            {/* Progress / Status Footer */}
            {!isConfirmed && (
                <div className="mt-auto pt-2 border-t border-black/5">
                    {prize.isValuable && (
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <div 
                                className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-green-400' : 'bg-orange-400'}`} 
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                         <span className={`text-[8px] font-bold uppercase tracking-widest ${state === 'confirmed' ? 'text-white/80' : 'text-slate-400'}`}>
                            {isUnlocked ? (prize.isValuable ? T.valuablePrize : T.basePrize) : `${Math.floor(progressPercent)}%`}
                         </span>
                         <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${state === 'confirmed' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                            {state === 'outOfStock' ? T.outOfStock : `${prize.threshold}`}
                         </span>
                    </div>
                </div>
            )}
        </div>
    );
  };

  // --- RENDER ---
  const containerClass = embedded 
    ? "relative w-full h-full" 
    : "fixed inset-0 w-full h-full bg-slate-50 z-50";

  return (
    <div className={containerClass}>
      
      {/* Scrollable Content */}
      <div className={`absolute inset-0 overflow-y-auto custom-scrollbar ${embedded ? 'pb-[120px] pt-4' : 'pb-[100px]'}`}>
        <div className={`max-w-xl mx-auto flex flex-col p-6 min-h-full`}>
            
             {/* Header */}
            <div className="flex justify-between items-center mb-6">
                {!embedded ? (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{T.profileTitle}</span>
                ) : <div></div>}
                
                {/* Optimization: Removed backdrop-blur */}
                <div className="flex bg-white/60 p-1 rounded-full border border-white shadow-sm">
                    <button onClick={() => setLang('ru')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${lang === 'ru' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>RU</button>
                    <button onClick={() => setLang('tg')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${lang === 'tg' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>TJ</button>
                </div>
            </div>

            {/* User Card */}
            <div className="relative mb-6">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-[30px] text-white shadow-xl shadow-slate-200 overflow-hidden relative">
                    {/* Optimization: Removed blurred blobs */}
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black uppercase italic tracking-wide">{user.name}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">{user.city} • {user.phone}</p>
                            </div>
                            <button onClick={onLogout} className="text-white/40 hover:text-white transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex gap-3">
                            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/5 flex-1">
                                <div className="flex items-center gap-2 mb-1 text-yellow-400">
                                    <TrophyIcon />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{T.record}</span>
                                </div>
                                <div className="text-2xl font-medium">{bestScore}</div>
                            </div>
                            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/5 flex-1">
                                <div className="flex items-center gap-2 mb-1 text-emerald-400">
                                    <GiftIcon />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{T.prizesClaimed}</span>
                                </div>
                                <div className="text-2xl font-medium">{user.claimedPrizes?.length || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Countdown */}
            <div className="flex justify-center mb-6">
                <Countdown lang={lang} />
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1.5 rounded-[20px] mb-6 shadow-sm border border-slate-100">
                {(['prizes', 'codes', 'history'] as const).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 rounded-[16px] text-[9px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab 
                            ? 'bg-slate-800 text-white shadow-md' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {tab === 'prizes' ? T.tabPrizes : (tab === 'codes' ? T.tabCodes : T.tabHistory)}
                    </button>
                ))}
            </div>

            {/* PRIZES TAB */}
            {activeTab === 'prizes' && (
                <div className="space-y-4 animate-fade-in pb-20">
                    <div className="grid grid-cols-2 gap-3">
                        {prizes.sort((a,b) => a.threshold - b.threshold).map(p => (
                            <PrizeCard key={p.id} prize={p} />
                        ))}
                    </div>

                    {/* Action Bar */}
                    <div className="fixed bottom-24 left-0 right-0 px-6 pointer-events-none">
                        <div className="max-w-xl mx-auto pointer-events-auto">
                            {user.deliveryRequested ? (
                                <div className="bg-green-500 text-white p-4 rounded-[20px] shadow-lg shadow-green-200 text-center font-bold uppercase text-xs animate-fade-in flex items-center justify-center gap-2">
                                    <CheckIcon /> {T.reqAccepted}
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    {hasUnsavedChanges && (
                                        <button 
                                            onClick={handleConfirmSelection}
                                            disabled={loading}
                                            className="flex-1 bg-slate-800 text-white py-4 rounded-[20px] shadow-lg shadow-slate-300 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-900 transition active:scale-95 disabled:opacity-70"
                                        >
                                            {loading ? '...' : T.saveChanges}
                                        </button>
                                    )}
                                    {canRequestDelivery && !hasUnsavedChanges && (
                                         <button 
                                            onClick={handleDeliveryRequestClick}
                                            disabled={loading}
                                            className="flex-1 bg-blue-600 text-white py-4 rounded-[20px] shadow-lg shadow-blue-300 font-bold uppercase text-[10px] tracking-widest hover:bg-blue-700 transition active:scale-95 disabled:opacity-70"
                                        >
                                            {loading ? '...' : T.requestDelivery}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CODES TAB */}
            {activeTab === 'codes' && (
                <div className="space-y-3 animate-fade-in">
                    {sortedCodes.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-[30px] border border-dashed border-slate-200">
                             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{T.noCodes}</p>
                        </div>
                    ) : (
                        sortedCodes.map(c => (
                            <div key={c.code} className={`p-4 rounded-[20px] flex justify-between items-center border ${c.isUsed ? 'bg-slate-50 border-slate-100' : 'bg-white border-blue-100 shadow-sm'}`}>
                                <div>
                                    <div className={`font-mono font-black text-lg ${c.isUsed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{c.code}</div>
                                    <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                        {c.isUsed ? T.statusUsed : T.statusActive}
                                    </div>
                                </div>
                                {!c.isUsed && !user.deliveryRequested && (
                                    <button 
                                        onClick={() => onPlayCode(c.code)}
                                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition"
                                    >
                                        {T.playCode}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
                <div className="space-y-3 animate-fade-in">
                    {gameHistory.length === 0 ? (
                         <div className="text-center py-12 bg-white rounded-[30px] border border-dashed border-slate-200">
                             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{T.noGames}</p>
                        </div>
                    ) : (
                        gameHistory.map(g => (
                            <div key={g.id} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${g.codeUsed === 'TRIAL' ? 'bg-orange-50 text-orange-400' : 'bg-blue-50 text-blue-600'}`}>
                                            {g.codeUsed === 'TRIAL' ? T.trialGame : g.codeUsed}
                                        </span>
                                        <span className="text-[9px] text-slate-300 font-bold">{new Date(g.playedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-1 text-xs text-slate-400 font-medium">
                                        {g.prize ? `${T.prizesClaimed}: ${g.prize}` : (g.codeUsed === 'TRIAL' ? T.withoutPrize : T.promoCode)}
                                    </div>
                                </div>
                                <div className="text-xl font-black text-slate-800">{g.score}</div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tempError && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-xl z-[100] text-[10px] font-bold uppercase tracking-widest animate-fade-in">
                    {tempError}
                </div>
            )}

            {/* DELIVERY CONFIRMATION MODAL */}
            {showDeliveryConfirmation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-6">
                    <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-2xl animate-fade-in relative text-center">
                         <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-4 leading-none">{T.attention}</h3>
                        
                        <div className="space-y-4 mb-8 text-left bg-slate-50 p-5 rounded-[24px]">
                            <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                {T.deliveryWarning}
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {T.deliveryHint}
                            </p>
                            <p className="text-xs font-bold text-blue-600 leading-relaxed">
                                {T.deliveryAdvice}
                            </p>
                            
                            <Countdown lang={lang} />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmDelivery}
                                disabled={loading}
                                className="w-full py-4 bg-slate-200 text-slate-500 font-bold rounded-[20px] uppercase text-[10px] tracking-widest hover:bg-slate-300 transition"
                            >
                                {loading ? '...' : T.confirmFinal}
                            </button>
                            <button 
                                onClick={() => setShowDeliveryConfirmation(false)}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-[20px] shadow-lg shadow-blue-200 uppercase text-[10px] tracking-widest hover:bg-blue-700 transition active:scale-95"
                            >
                                {T.keepPlaying}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
