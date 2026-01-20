
import React, { useState, useEffect, useRef } from 'react';
import { User, GameResult, Language, PrizeConfig, PromoCode, CodeRequest } from '../../types';
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

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);

const SoundIcon = ({ muted }: { muted: boolean }) => (
    muted ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    )
);

const ArrowRight = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const PhoneButtonIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5z" clipRule="evenodd" />
    </svg>
);

// Helper for pluralization
const getPlural = (n: number, lang: Language) => {
    if (lang === 'tg') return 'код';
    const absN = Math.abs(n);
    const lastDigit = absN % 10;
    const lastTwoDigits = absN % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11) return 'код';
    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) return 'кода';
    return 'кодов';
};

const Countdown = ({ lang }: { lang: Language }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
    const T = t[lang];

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const currentYear = now.getFullYear();
            const endOfFeb = new Date(currentYear, 2, 0, 23, 59, 59); 
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

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  embedded?: boolean;
  lang: Language;
  setLang: (l: Language) => void;
  prizes: PrizeConfig[];
  onPlayCode: (code: string) => void;
  initialTab?: 'prizes' | 'history' | 'codes' | 'settings';
  muted: boolean;
  toggleMute: () => void;
}

export const ProfileScreen = ({ user: initialUser, onBack, onLogout, embedded = false, lang, setLang, prizes, onPlayCode, initialTab = 'prizes', muted, toggleMute }: ProfileScreenProps) => {
  const [user, setUser] = useState<User>(initialUser);
  const [bestScore, setBestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tempError, setTempError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [myCodes, setMyCodes] = useState<PromoCode[]>([]);
  const [activeTab, setActiveTab] = useState<'prizes' | 'history' | 'codes' | 'settings'>(initialTab);
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  const [codesSubTab, setCodesSubTab] = useState<'my' | 'get'>('my');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [userRequests, setUserRequests] = useState<CodeRequest[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const T = t[lang];
  const [localSelection, setLocalSelection] = useState<string[]>(initialUser.claimedPrizes || []);

  const TIERS = [
      { amount: 5000, codes: 1 },
      { amount: 10000, codes: 3 },
      { amount: 20000, codes: 7 },
      { amount: 40000, codes: 16 },
      { amount: 100000, codes: 40 },
  ];

  useEffect(() => {
    backend.getUserResults(user.id).then(userHistory => {
      setGameHistory(userHistory);
      const eligibleGames = userHistory.filter(r => r.codeUsed !== 'TRIAL');
      const max = Math.max(0, ...eligibleGames.map((r: GameResult) => r.score));
      setBestScore(max);
    });
    backend.getUserUnusedCodes(user.id).then(codes => {
        backend.getUserCodes(user.id).then(allCodes => {
             setMyCodes(allCodes);
        });
    });
  }, [user.id]);

  useEffect(() => {
    if (activeTab === 'codes') {
        backend.getUserRequestHistory(user.id).then(reqs => setUserRequests(reqs));
    }
  }, [activeTab, user.id, uploadSuccess]);

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
    
    // Check if prize is locked logic is now handled in PrizeCard's onClick too, 
    // but we keep this check for safety.
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedFile(file);
          const reader = new FileReader();
          reader.onload = (e) => setPreviewUrl(e.target?.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleUpload = async () => {
      if (!selectedFile) return;
      setLoading(true);
      try {
          await backend.uploadCodeRequest(user.id, selectedFile);
          setUploadSuccess(true);
          setSelectedFile(null);
          setPreviewUrl(null);
      } catch (e: any) {
          showTempError(e.message);
      } finally {
          setLoading(false);
      }
  };

  const confirmedValuable = user.claimedPrizes?.some(pTitle => prizes.find(cfg => cfg.title === pTitle)?.isValuable);
  const selectedValuable = localSelection.find(pTitle => prizes.find(cfg => cfg.title === pTitle)?.isValuable);
  const hasUnsavedChanges = localSelection.length > (user.claimedPrizes?.length || 0);
  const canRequestDelivery = (localSelection.length > 0 && !user.deliveryRequested);

  const sortedCodes = [...myCodes].sort((a, b) => {
      if (a.isUsed === b.isUsed) {
          return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
      }
      return a.isUsed ? 1 : -1;
  });

  const getCodeResult = (code: string) => {
      return gameHistory.find(r => r.codeUsed === code);
  };

  const PrizeCard: React.FC<{ prize: PrizeConfig }> = ({ prize }) => {
    const isConfirmed = user.claimedPrizes?.includes(prize.title);
    const isSelectedLocally = localSelection.includes(prize.title);
    const isUnlocked = bestScore >= prize.threshold;
    const progressPercent = Math.min(100, Math.max(0, (bestScore / prize.threshold) * 100));
    
    let state = 'locked';
    if (prize.isOutOfStock && !isConfirmed) state = 'outOfStock';
    else if (isConfirmed) state = 'confirmed';
    else if (isSelectedLocally) state = 'selected';
    else if (isUnlocked) {
        if (prize.isValuable && (selectedValuable && selectedValuable !== prize.title)) state = 'locked_alt_selected'; 
        else if (prize.isValuable && confirmedValuable) state = 'locked_already_claimed';
        else state = 'unlocked';
    }

    const baseClasses = "relative p-4 md:p-5 rounded-[24px] border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col gap-3 min-h-[140px]";
    let styleClasses = "";
    
    switch(state) {
        case 'confirmed': styleClasses = "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-200"; break;
        case 'selected': styleClasses = "bg-white border-2 border-blue-600 shadow-xl shadow-blue-100 ring-2 ring-blue-50 transform scale-[1.02]"; break;
        case 'unlocked': styleClasses = "bg-white border-slate-100 hover:border-blue-300 hover:shadow-md active:scale-[0.98]"; break;
        case 'outOfStock': styleClasses = "bg-slate-50 border-slate-100 opacity-60 grayscale"; break;
        default: styleClasses = "bg-slate-50 border-slate-100 opacity-80";
    }

    const handleClick = () => {
        if (state === 'locked' || state === 'locked_alt_selected') {
            const deficit = prize.threshold - bestScore;
            showTempError(T.lockedAlert.replace('{points}', deficit.toString()));
        } else if (state === 'unlocked' || state === 'selected') {
            handleToggleSelection(prize);
        }
    };

    return (
        <div 
            onClick={handleClick}
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
                    <p className={`text-[9px] font-medium leading-snug line-clamp-2 ${state === 'confirmed' ? 'text-white/80' : 'text-slate-400'}`}>{prize.description}</p>
                )}
            </div>
            {!isConfirmed && (
                <div className="mt-auto pt-2 border-t border-black/5">
                    {prize.isValuable && (
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <div className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-green-400' : 'bg-orange-400'}`} style={{ width: `${progressPercent}%` }} />
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

  const containerClass = embedded 
    ? "relative w-full h-full" 
    : "fixed inset-0 w-full h-full bg-slate-50 z-50";

  return (
    <div className={containerClass}>
      {/* 
         LAYOUT FIX: 
         1. pb-[180px] ensures content scrolls WAY above the fixed action bar and nav.
         2. pt-4 adds breathing room at top.
      */}
      <div className={`absolute inset-0 overflow-y-auto custom-scrollbar ${embedded ? 'pb-[180px] pt-4' : 'pb-[180px]'}`}>
        <div className={`max-w-xl mx-auto flex flex-col p-6 min-h-full`}>
            
            {/* STICKY HEADER + TABS WRAPPER */}
            {/* Combining them ensures no overlap issues and better z-index management */}
            <div className="sticky top-0 z-40 pb-4 bg-slate-50/95 backdrop-blur-sm pt-2 -mx-2 px-2 transition-all">
                {/* Header */}
                <div className="mb-4 flex justify-between items-center bg-white p-3 rounded-full shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <div className="text-xs font-black text-slate-800 uppercase leading-none">{user.name}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{user.city}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pr-2">
                        <div className="text-right">
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{T.record}</div>
                            <div className="text-sm font-black text-blue-600 leading-none">{bestScore}</div>
                        </div>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-slate-100 overflow-x-auto">
                    {(['prizes', 'codes', 'history', 'settings'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[70px] py-3 rounded-[16px] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {tab === 'prizes' ? T.tabPrizes : (tab === 'codes' ? T.tabCodes : (tab === 'history' ? T.tabHistory : T.tabSettings))}
                        </button>
                    ))}
                </div>
            </div>

            {/* PRIZES & RULES TAB */}
            {activeTab === 'prizes' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Rules Button (More compact) */}
                    <div className="flex justify-between items-center bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Как играть?</span>
                        <button 
                            onClick={() => setShowRules(true)}
                            className="bg-white text-blue-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm"
                        >
                            Правила
                        </button>
                    </div>

                    <div className="flex justify-center flex-col gap-3">
                        <Countdown lang={lang} />
                        <div className="bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wide p-3 rounded-xl border border-amber-100 text-center">
                            {T.prizeLimitInfo}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {prizes.sort((a,b) => a.threshold - b.threshold).map(p => (
                            <PrizeCard key={p.id} prize={p} />
                        ))}
                    </div>
                </div>
            )}

            {/* CODES TAB */}
            {activeTab === 'codes' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex p-1 bg-slate-100 rounded-[16px]">
                        <button 
                            onClick={() => setCodesSubTab('my')}
                            className={`flex-1 py-2 rounded-[12px] text-[9px] font-bold uppercase tracking-widest transition-all ${codesSubTab === 'my' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
                        >
                            {T.subTabMyCodes}
                        </button>
                        <button 
                            onClick={() => setCodesSubTab('get')}
                            className={`flex-1 py-2 rounded-[12px] text-[9px] font-bold uppercase tracking-widest transition-all ${codesSubTab === 'get' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
                        >
                            {T.subTabGetCodes}
                        </button>
                    </div>

                    {codesSubTab === 'my' ? (
                        <div className="space-y-3">
                            {sortedCodes.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-[30px] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{T.noCodes}</p>
                                </div>
                            ) : (
                                sortedCodes.map(c => {
                                    const result = c.isUsed ? getCodeResult(c.code) : null;
                                    return (
                                        <div key={c.code} className={`p-4 rounded-[20px] flex justify-between items-center border ${c.isUsed ? 'bg-slate-50 border-slate-100' : 'bg-white border-blue-100 shadow-sm'}`}>
                                            <div>
                                                <div className={`font-mono font-black text-lg ${c.isUsed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{c.code}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${c.isUsed ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {c.isUsed ? T.statusUsed : T.statusActive}
                                                    </span>
                                                    {result && <span className="text-[9px] text-slate-400 font-bold">{T.score}: {result.score}</span>}
                                                </div>
                                            </div>
                                            {!c.isUsed && !user.deliveryRequested && (
                                                <button onClick={() => onPlayCode(c.code)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition">{T.playCode}</button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!uploadSuccess && (
                                <>
                                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-2">
                                        <p className="text-[10px] text-blue-800 font-medium leading-relaxed text-center">
                                            {T.buyPromoText}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {TIERS.map((tier, idx) => (
                                            <div key={idx} className="flex items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="flex-1 text-center">
                                                    <div className="text-sm font-black text-pink-500">{tier.amount.toLocaleString()}</div>
                                                    <div className="text-[8px] font-bold uppercase text-slate-400">{T.somoni}</div>
                                                </div>
                                                <div className="text-slate-300"><ArrowRight /></div>
                                                <div className="flex-1 text-center">
                                                    <div className="text-sm font-black text-blue-600">{tier.codes}</div>
                                                    <div className="text-[8px] font-bold uppercase text-slate-400">{tier.codes === 1 ? T.codeForPlay : T.codesForPlay}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <a 
                                        href="tel:+992000000000" 
                                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded-[20px] shadow-lg shadow-pink-200 uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:shadow-xl transition active:scale-95"
                                    >
                                        <PhoneButtonIcon />
                                        {T.orderBtn}
                                    </a>

                                    <div className="my-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                        <p className="text-[10px] font-bold text-indigo-800 text-center leading-relaxed uppercase">
                                            {T.alreadyBoughtHint}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-[30px] border-2 border-dashed border-slate-200 text-center relative overflow-hidden">
                                         {/* Important Warning */}
                                        <div className="mb-4 bg-amber-50 text-amber-600 p-3 rounded-xl border border-amber-100 text-[10px] font-medium leading-relaxed">
                                            {T.uploadImportant}
                                        </div>

                                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                        {previewUrl ? (
                                            <div className="relative">
                                                <img src={previewUrl} className="max-h-48 mx-auto rounded-xl shadow-md" alt="Preview" />
                                                <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg font-bold">&times;</button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 py-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center"><CameraIcon /></div>
                                                <div><h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs mb-1">{T.uploadInvoice}</h3><p className="text-[9px] text-slate-400 font-medium max-w-[200px] mx-auto leading-relaxed">{T.uploadDesc}</p></div>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={handleUpload} disabled={!selectedFile || loading} className="w-full py-4 bg-slate-800 text-white font-black rounded-[20px] uppercase shadow-lg shadow-slate-200 transition active:scale-95 hover:bg-slate-900 tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed">{loading ? T.loading : T.sendPhoto}</button>
                                    
                                    {/* REQUEST HISTORY */}
                                    <div className="mt-6">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">{T.requestHistoryTitle}</h4>
                                        <div className="space-y-2">
                                            {userRequests.map(req => (
                                                <div key={req.id} className="bg-white p-3 rounded-[16px] border border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden cursor-pointer"
                                                            onClick={() => setFullScreenImage(req.photoData)}
                                                        >
                                                            <img src={req.photoData} alt="thumb" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-600">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                            <div className="text-[9px] text-slate-400">{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider ${
                                                            req.status === 'pending' ? 'bg-orange-50 text-orange-500' :
                                                            req.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                                        }`}>
                                                            {req.status === 'pending' ? T.statusPending : 
                                                            req.status === 'approved' ? T.statusApproved : T.statusRejected}
                                                        </span>
                                                        {req.status === 'approved' && req.codesIssued && req.codesIssued > 0 && (
                                                            <div className="text-[9px] font-bold text-green-600 mt-1">
                                                                +{req.codesIssued} {getPlural(req.codesIssued, lang)}
                                                            </div>
                                                        )}
                                                        {req.status === 'rejected' && req.adminComment && (
                                                             <div className="text-[9px] font-medium text-red-400 mt-1 max-w-[150px] leading-tight break-words">
                                                                {req.adminComment}
                                                             </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {userRequests.length === 0 && <div className="text-center text-[10px] text-slate-300">История пуста</div>}
                                        </div>
                                    </div>

                                </>
                            )}
                            {uploadSuccess && (
                                <div className="flex flex-col items-center justify-center py-10 animate-fade-in text-center bg-green-50 rounded-[30px] border border-green-100">
                                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-200"><CheckIcon /></div>
                                    <h3 className="text-lg font-black text-slate-800 uppercase italic mb-2">{T.reqAccepted}</h3>
                                    <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed mb-2 px-6">{T.waitMsg}</p>
                                    <p className="text-xs text-green-600 font-bold max-w-xs leading-relaxed mb-6 px-6">{T.checkMyCodes}</p>
                                    <button onClick={() => { setUploadSuccess(false); setCodesSubTab('my'); }} className="py-3 px-8 bg-white text-slate-500 font-black rounded-[16px] uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50">{T.ok}</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* HISTORY & SETTINGS */}
            {activeTab === 'history' && (
                <div className="space-y-3 animate-fade-in">
                    {gameHistory.length === 0 ? (
                         <div className="text-center py-12 bg-white rounded-[30px] border border-dashed border-slate-200"><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{T.noGames}</p></div>
                    ) : (
                        gameHistory.map(g => (
                            <div key={g.id} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${g.codeUsed === 'TRIAL' ? 'bg-orange-50 text-orange-400' : 'bg-blue-50 text-blue-600'}`}>{g.codeUsed === 'TRIAL' ? T.trialGame : g.codeUsed}</span>
                                        <span className="text-[9px] text-slate-300 font-bold">{new Date(g.playedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-1 text-xs text-slate-400 font-medium">{g.prize ? `${T.prizesClaimed}: ${g.prize}` : (g.codeUsed === 'TRIAL' ? T.withoutPrize : T.promoCode)}</div>
                                </div>
                                <div className="text-xl font-black text-slate-800">{g.score}</div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{T.language}</span>
                            <div className="flex bg-slate-50 p-1 rounded-full">
                                <button onClick={() => setLang('ru')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${lang === 'ru' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400'}`}>RU</button>
                                <button onClick={() => setLang('tg')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${lang === 'tg' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400'}`}>TJ</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{T.sound}</span>
                            <button onClick={toggleMute} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${muted ? 'bg-slate-200' : 'bg-blue-500'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 flex items-center justify-center text-slate-400 ${muted ? 'translate-x-0' : 'translate-x-6'}`}><SoundIcon muted={muted} /></div>
                            </button>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full py-5 bg-red-50 text-red-500 font-bold rounded-[25px] border border-red-100 uppercase tracking-widest text-xs hover:bg-red-100 transition active:scale-95 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {T.logout}
                    </button>
                </div>
            )}

            {/* ERROR TOAST - MOVED TO BOTTOM */}
            {tempError && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-xl z-[100] text-[10px] font-bold uppercase tracking-widest animate-fade-in text-center shadow-red-200">{tempError}</div>
            )}

            {/* ACTION BAR: FIXED ABOVE NAVIGATION */}
            {/* Using a fixed container at the bottom with heavy backdrop blur to prevent overlap issues */}
            {activeTab === 'prizes' && (
                <div className="fixed bottom-[70px] left-0 right-0 p-4 z-50 pointer-events-none">
                    <div className="max-w-xl mx-auto pointer-events-auto">
                        <div className="bg-white/80 backdrop-blur-md p-2 rounded-[24px] shadow-lg border border-white/50">
                            {user.deliveryRequested ? (
                                <div className="bg-green-500 text-white p-4 rounded-[20px] text-center font-bold uppercase text-xs flex items-center justify-center gap-2">
                                    <CheckIcon /> {T.reqAccepted}
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    {hasUnsavedChanges && (
                                        <button 
                                            onClick={handleConfirmSelection}
                                            disabled={loading}
                                            className="flex-1 bg-slate-800 text-white py-3.5 rounded-[20px] font-bold uppercase text-[10px] tracking-widest hover:bg-slate-900 transition active:scale-95 disabled:opacity-70 shadow-md"
                                        >
                                            {loading ? '...' : T.saveChanges}
                                        </button>
                                    )}
                                    {canRequestDelivery && !hasUnsavedChanges && (
                                         <button 
                                            onClick={handleDeliveryRequestClick}
                                            disabled={loading}
                                            className="flex-1 bg-blue-600 text-white py-3.5 rounded-[20px] font-bold uppercase text-[10px] tracking-widest hover:bg-blue-700 transition active:scale-95 disabled:opacity-70 shadow-md shadow-blue-200"
                                        >
                                            {loading ? '...' : T.requestDelivery}
                                        </button>
                                    )}
                                    {!hasUnsavedChanges && !canRequestDelivery && (
                                        <div className="w-full text-center py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Выберите призы для сохранения
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* DELIVERY CONFIRMATION MODAL */}
            {showDeliveryConfirmation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-2xl animate-fade-in relative text-center">
                         <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-3xl">⚠️</span></div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-4 leading-none">{T.attention}</h3>
                        <div className="space-y-4 mb-8 text-left bg-slate-50 p-5 rounded-[24px]">
                            <p className="text-xs font-bold text-slate-700 leading-relaxed">{T.deliveryWarning}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{T.deliveryHint}</p>
                            <p className="text-xs font-bold text-blue-600 leading-relaxed">{T.deliveryAdvice}</p>
                            <Countdown lang={lang} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmDelivery} disabled={loading} className="w-full py-4 bg-slate-200 text-slate-500 font-bold rounded-[20px] uppercase text-[10px] tracking-widest hover:bg-slate-300 transition">{loading ? '...' : T.confirmFinal}</button>
                            <button onClick={() => setShowDeliveryConfirmation(false)} className="w-full py-4 bg-blue-600 text-white font-bold rounded-[20px] shadow-lg shadow-blue-200 uppercase text-[10px] tracking-widest hover:bg-blue-700 transition active:scale-95">{T.keepPlaying}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* RULES MODAL */}
            {showRules && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm" onClick={() => setShowRules(false)}>
                    <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-6">Как играть</h3>
                        <div className="space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
                            <p>{T.mechanicsDesc}</p>
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <p className="text-blue-800">{T.importantDesc}</p>
                            </div>
                            
                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{T.prizeLimitRuleTitle}</h4>
                                <p>{T.prizeLimitRuleDesc}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowRules(false)} className="mt-8 w-full py-4 bg-slate-800 text-white font-bold rounded-[20px] uppercase text-[10px] tracking-widest">Понятно</button>
                    </div>
                </div>
            )}

             {/* Full Screen Image Overlay for Request History */}
             {fullScreenImage && (
                <div 
                    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
                    onClick={() => setFullScreenImage(null)}
                >
                    <img src={fullScreenImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Fullscreen Invoice" />
                    <button 
                        onClick={() => setFullScreenImage(null)}
                        className="absolute top-6 right-6 text-white bg-white/20 hover:bg-white/40 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm transition"
                    >
                        &times;
                    </button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
