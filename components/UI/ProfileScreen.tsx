
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, GameResult, Language, PrizeConfig, PromoCode, CodeRequest, PrizeTier } from '../../types.ts';
import { backend } from '../../services/mockBackend.ts';
import { PrizeIcon } from './PrizeIcons.tsx';
import { t } from '../../translations.ts';

const CheckIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeWidth={5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const LockIcon = ({ className = "w-2.5 h-2.5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z" />
    </svg>
);

const FlagRU = () => (
    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Russia.svg" className="w-full h-full object-cover rounded-full" alt="RU" />
);

const FlagTG = () => (
    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Flag_of_Tajikistan.svg" className="w-full h-full object-cover rounded-full" alt="TG" />
);

const TierIcon = ({ tier, active }: { tier: PrizeTier, active: boolean }) => {
    const props = { className: `w-5 h-5 transition-colors ${active ? 'text-white' : 'text-slate-400'}` };
    switch(tier) {
        case 'BASIC': 
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
            );
        case 'BRONZE':
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6.1 2h11.8a2 2 0 0 1 1.7.8l1.61 2.14a2 2 0 0 1 .13 2.2L16.79 15" /><circle cx="12" cy="15" r="5" />
                </svg>
            );
        case 'SILVER':
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
            );
        case 'GOLD':
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
            );
        case 'DIAMOND':
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12l4 6-10 13L2 9Z" /><path d="M11 3 8 9l3 13h2l3-13-3-6" /><path d="M2 9h20" />
                </svg>
            );
        default: return null;
    }
}

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const Countdown = ({ lang }: { lang: Language }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
    const T = t[lang];

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const currentYear = now.getFullYear();
            const endOfFeb = new Date(currentYear, 2, 0, 23, 59, 59); 
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
        <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 shadow-sm transition-all">
            <ClockIcon />
            <span className="text-[11px] font-black uppercase tracking-tight">
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
  initialCodesSubTab?: 'my' | 'get';
  muted: boolean;
  toggleMute: () => void;
}

export const ProfileScreen = ({ user: initialUser, onLogout, lang, setLang, prizes, onPlayCode, initialTab = 'prizes', initialCodesSubTab = 'get' }: ProfileScreenProps) => {
  const [user, setUser] = useState<User>(initialUser);
  const [bestScore, setBestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tempError, setTempError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [myCodes, setMyCodes] = useState<PromoCode[]>([]);
  const [activeTab, setActiveTab] = useState<'prizes' | 'history' | 'codes' | 'settings'>(initialTab);
  
  const [activePrizeTier, setActivePrizeTier] = useState<PrizeTier>(
    (initialUser.maxPurchaseTier as string) === 'BASIC' ? 'BRONZE' : initialUser.maxPurchaseTier
  );
  
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);
  
  const [codesSubTab, setCodesSubTab] = useState<'my' | 'get'>(initialCodesSubTab);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [userRequests, setUserRequests] = useState<CodeRequest[]>([]);
  const [orderPhone, setOrderPhone] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const T = t[lang];
  const [localSelection, setLocalSelection] = useState<string[]>(initialUser.claimedPrizes || []);

  const TIERS = [
      { amount: 5000, codes: 1, tier: 'BRONZE' as PrizeTier },
      { amount: 10000, codes: 3, tier: 'BRONZE' as PrizeTier },
      { amount: 20000, codes: 7, tier: 'SILVER' as PrizeTier },
      { amount: 40000, codes: 16, tier: 'GOLD' as PrizeTier },
      { amount: 100000, codes: 40, tier: 'DIAMOND' as PrizeTier },
  ];

  useEffect(() => {
    backend.getUserResults(user.id).then(userHistory => {
      setGameHistory(userHistory);
      const eligibleGames = userHistory.filter(r => r.codeUsed !== 'TRIAL');
      const max = Math.max(0, ...eligibleGames.map((r: GameResult) => r.score));
      setBestScore(max);
    });
    backend.getUserCodes(user.id).then(allCodes => setMyCodes(allCodes));
    backend.getOrderPhone().then(setOrderPhone);
  }, [user.id, activeTab]);

  useEffect(() => {
    if (activeTab === 'codes') {
        backend.getUserRequestHistory(user.id).then(reqs => setUserRequests(reqs));
    }
  }, [activeTab, user.id, uploadSuccess]);

  useEffect(() => {
      setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
      setCodesSubTab(initialCodesSubTab);
  }, [initialCodesSubTab]);

  const showTempError = (msg: string) => {
      setTempError(msg);
      setTimeout(() => setTempError(null), 3000);
  };

  const isTierUnlocked = (tier: PrizeTier) => {
      const tiers: PrizeTier[] = ['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];
      return tiers.indexOf(user.maxPurchaseTier) >= tiers.indexOf(tier);
  };

  const getTierMinAmount = (tier: PrizeTier) => {
      if (tier === 'BRONZE') return 5000;
      if (tier === 'SILVER') return 20000;
      if (tier === 'GOLD') return 40000;
      if (tier === 'DIAMOND') return 100000;
      return 0;
  };

  // Sync Mandatory Prize: Any Yovar Card (isValuable === false)
  useEffect(() => {
    const unlockedYovar = prizes.find(p => !p.isValuable && bestScore >= p.threshold && isTierUnlocked(p.tier));
    if (unlockedYovar && !localSelection.includes(unlockedYovar.title)) {
        // Remove other cards if tier upgraded
        setLocalSelection(prev => {
            const othersRemoved = prev.filter(title => {
                const prize = prizes.find(pr => pr.title === title);
                return prize?.isValuable !== false;
            });
            return [...othersRemoved, unlockedYovar.title];
        });
    }
  }, [prizes, bestScore, user.maxPurchaseTier]);

  const handleToggleSelection = (prize: PrizeConfig) => {
    if (user.deliveryRequested) return;
    if (prize.isOutOfStock) return showTempError(T.outOfStock);
    if (!isTierUnlocked(prize.tier)) return showTempError(T.tierRequirement + ": " + T[`tier${prize.tier.charAt(0) + prize.tier.slice(1).toLowerCase() as keyof typeof T}` as keyof typeof T]);
    if (bestScore < prize.threshold) return showTempError(`${T.needPoints} ${prize.threshold}!`);
    
    // Yovar Card (isValuable === false) is mandatory and cannot be deselected manually
    if (!prize.isValuable) return;

    if (user.claimedPrizes?.includes(prize.title)) return; 

    setLocalSelection(prev => {
        const isSelected = prev.includes(prize.title);
        
        // Find if any other valuable prize (isValuable === true) is already selected/confirmed
        const alreadyConfirmedValuable = user.claimedPrizes.find(title => {
            const p = prizes.find(x => x.title === title);
            return p?.isValuable === true;
        });
        const alreadySelectedValuable = prev.find(title => {
            const p = prizes.find(x => x.title === title);
            return title !== prize.title && p?.isValuable === true;
        });

        if ((alreadyConfirmedValuable || alreadySelectedValuable) && !isSelected) {
            showTempError("Вы уже получили или выбрали свой ценный приз!");
            return prev;
        }

        if (isSelected) {
            return prev.filter(p => p !== prize.title);
        } else {
            // Filter out any other valuable prize from local selection before adding the new one
            const withoutValuables = prev.filter(title => {
                const p = prizes.find(x => x.title === title);
                return p?.isValuable !== true;
            });
            return [...withoutValuables, prize.title];
        }
    });
  };

  const handleRequestDeliveryClick = () => {
    // Check if user has selected a valuable prize if they have any unlocked
    const unlockedValuables = prizes.filter(p => 
        p.isValuable && 
        !p.isOutOfStock && 
        bestScore >= p.threshold && 
        isTierUnlocked(p.tier)
    );

    const hasSelectedValuable = localSelection.some(title => prizes.find(p => p.title === title)?.isValuable);
    const valuableAlreadyConfirmed = user.claimedPrizes.some(title => prizes.find(p => p.title === title)?.isValuable);

    if (unlockedValuables.length > 0 && !hasSelectedValuable && !valuableAlreadyConfirmed) {
        showTempError(T.selectSecondPrizeAlert);
        return;
    }

    setShowDeliveryConfirmation(true);
  };

  const confirmDelivery = async () => {
     setLoading(true);
     try {
         const newPrizes = localSelection.filter(p => !user.claimedPrizes?.includes(p));
         let updatedUser = user;
         for (const prizeTitle of newPrizes) {
             updatedUser = await backend.claimPrize(user.id, prizeTitle);
         }
         await backend.requestDelivery(user.id);
         const refreshed = await backend.refreshUser();
         if(refreshed) setUser(refreshed);
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
          reader.onload = (event) => setPreviewUrl(event.target?.result as string);
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

  const hasUnsavedChanges = localSelection.filter(p => !user.claimedPrizes?.includes(p)).length > 0;
  const canDirectOrder = (hasUnsavedChanges || (user.claimedPrizes?.length > 0 && !user.deliveryRequested));

  const PrizeCard: React.FC<{ prize: PrizeConfig }> = ({ prize }) => {
    const isConfirmed = user.claimedPrizes?.includes(prize.title);
    const isSelectedLocally = localSelection.includes(prize.title);
    const isUnlockedByScore = bestScore >= prize.threshold;
    const isUnlockedByTier = isTierUnlocked(prize.tier);
    const isUnlocked = isUnlockedByScore && isUnlockedByTier;
    const progressPercent = Math.min(100, Math.max(0, (bestScore / prize.threshold) * 100));
    const isMandatory = !prize.isValuable && isUnlocked;
    
    let state = 'locked';
    if (prize.isOutOfStock && !isConfirmed) state = 'outOfStock';
    else if (isConfirmed) state = 'confirmed';
    else if (isSelectedLocally || isMandatory) state = 'selected';
    else if (isUnlocked) {
        const otherSelectedValuable = localSelection.some(title => {
            const p = prizes.find(x => x.title === title);
            return title !== prize.title && p?.isValuable === true;
        });
        const otherConfirmedValuable = user.claimedPrizes.some(title => {
            const p = prizes.find(x => x.title === title);
            return p?.isValuable === true;
        });
        
        if (prize.isValuable && (otherSelectedValuable || otherConfirmedValuable)) state = 'locked_limit';
        else state = 'unlocked';
    } else if (!isUnlockedByTier) {
        state = 'locked_tier';
    }

    const baseClasses = "relative p-5 rounded-[32px] border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col gap-4 min-h-[200px] antialiased group";
    let styleClasses = "";
    
    switch(state) {
        case 'confirmed': styleClasses = "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white shadow-lg"; break;
        case 'selected': styleClasses = "bg-white border-blue-600 shadow-xl ring-4 ring-blue-50 transform scale-[1.02]"; break;
        case 'unlocked': styleClasses = "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md active:scale-[0.98] shadow-sm"; break;
        case 'outOfStock': styleClasses = "bg-slate-50 border-slate-200 opacity-50 grayscale cursor-not-allowed"; break;
        case 'locked_tier': styleClasses = "bg-slate-50 border-slate-100 opacity-70 grayscale"; break;
        case 'locked_limit': styleClasses = "bg-slate-50 border-slate-100 opacity-60"; break;
        default: styleClasses = "bg-white border-slate-50 opacity-60";
    }

    return (
        <div 
            onClick={() => handleToggleSelection(prize)}
            className={`${baseClasses} ${styleClasses}`}
        >
            <div className="flex justify-between items-start">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all overflow-hidden shadow-sm group-hover:scale-105
                    ${state === 'confirmed' ? 'bg-white/20 text-white' : (state === 'unlocked' || state === 'selected' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400')}`}>
                    {prize.imageUrl ? (
                        <img src={prize.imageUrl} className="w-full h-full object-cover" alt={prize.title} />
                    ) : (
                        <PrizeIcon name={prize.icon} className="w-8 h-8" />
                    )}
                </div>
                {state === 'confirmed' ? <div className="bg-white/30 p-1.5 rounded-full backdrop-blur-sm"><CheckIcon className="w-4 h-4 text-white" /></div> : 
                 state === 'selected' ? <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg ring-2 ring-white animate-bounce-subtle"><CheckIcon className="w-4 h-4 text-white" /></div> :
                 (state === 'locked' || state === 'locked_tier' || state === 'locked_limit') ? <div className="p-1.5 bg-slate-100/50 rounded-full"><LockIcon className="text-slate-400" /></div> : null}
            </div>
            <div className="flex-1 space-y-1">
                <h4 className={`text-sm font-black tracking-tight leading-tight ${state === 'confirmed' ? 'text-white' : 'text-slate-800'}`}>
                    {prize.title}
                </h4>
                {isMandatory && !isConfirmed && (
                    <span className="text-[8px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-md inline-block shadow-sm">
                        {T.mandatoryPrize}
                    </span>
                )}
                {state === 'locked_tier' ? (
                   <p className="text-[9px] font-black text-blue-600 bg-blue-50 p-2 rounded-xl mt-1 border border-blue-100">
                       {T.tierLockedMsg.replace('{amount}', getTierMinAmount(prize.tier).toLocaleString())}
                   </p>
                ) : state === 'locked_limit' ? (
                   <p className="text-[9px] font-black text-slate-400 mt-1 italic">
                       Лимит: 1 ценный приз
                   </p>
                ) : !isConfirmed && (
                    <p className={`text-[10px] font-bold leading-snug line-clamp-2 ${state === 'confirmed' ? 'text-white/80' : 'text-slate-400'}`}>{prize.description}</p>
                )}
            </div>
            {!isConfirmed && (
                <div className="mt-auto pt-2">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className={`h-full transition-all duration-1000 ease-out ${isUnlocked ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-blue-400'}`} style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                         <span className={`text-[9px] font-black uppercase tracking-widest ${state === 'confirmed' ? 'text-white/80' : 'text-slate-400'}`}>
                            {!prize.isValuable ? 'Асосӣ' : (isUnlockedByScore ? 'Дастрас' : `${Math.floor(progressPercent)}%`)}
                         </span>
                         <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${state === 'confirmed' ? 'bg-white/20' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                            {state === 'outOfStock' ? 'Нет' : `${prize.threshold}`}
                         </span>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const filteredPrizes = prizes
    .filter(p => {
        if (p.tier === activePrizeTier) return true;
        
        if (p.tier === 'BASIC') {
            const hasBetterEquivalent = prizes.some(other => 
                other.tier === activePrizeTier && 
                other.icon === p.icon
            );
            return !hasBetterEquivalent;
        }
        
        return false;
    })
    .sort((a, b) => {
        if (a.tier === 'BASIC' && b.tier !== 'BASIC') return -1;
        if (a.tier !== 'BASIC' && b.tier === 'BASIC') return 1;
        return a.threshold - b.threshold;
    });

  const TierTabButton = ({ tier, label }: { tier: PrizeTier, label: string }) => {
    const isUnlocked = isTierUnlocked(tier);
    const active = activePrizeTier === tier;
    return (
        <button 
            onClick={() => setActivePrizeTier(tier)}
            className={`flex flex-col items-center justify-center w-full py-3 rounded-2xl transition-all relative border overflow-hidden ${
                active 
                ? 'bg-slate-800 text-white shadow-xl border-slate-700 ring-2 ring-slate-100' 
                : 'bg-white text-slate-400 hover:bg-slate-50 border-slate-100'
            }`}
        >
            <div className="mb-1"><TierIcon tier={tier} active={active} /></div>
            <span className={`text-[8px] font-black uppercase tracking-tighter leading-none ${active ? 'text-white' : 'text-slate-400'}`}>{label}</span>
            {!isUnlocked && <div className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full border border-white scale-[0.65] shadow-sm"><LockIcon /></div>}
            {isUnlocked && tier !== 'BASIC' && <div className="absolute top-1 right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white scale-[0.65] shadow-sm"><CheckIcon /></div>}
        </button>
    );
  };

  return (
    <div className="w-full h-full bg-slate-50 antialiased selection:bg-blue-100 relative">
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
      {tempError && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl animate-fade-in border border-white/10">
              {tempError}
          </div>
      )}

      <div className={`absolute inset-0 overflow-y-auto custom-scrollbar pb-[120px]`}>
        <div className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-xl border-b border-slate-100 shadow-sm px-6 pt-6 pb-4">
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-[28px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white text-sm font-light shadow-sm relative">
                            {user.name.charAt(0).toUpperCase()}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-black text-white shadow-sm ${
                                user.maxPurchaseTier === 'DIAMOND' ? 'bg-blue-500' :
                                user.maxPurchaseTier === 'GOLD' ? 'bg-yellow-500' :
                                user.maxPurchaseTier === 'SILVER' ? 'bg-slate-400' :
                                user.maxPurchaseTier === 'BRONZE' ? 'bg-amber-700' :
                                'bg-slate-300'
                            }`}>{user.maxPurchaseTier === 'BASIC' ? 'B' : user.maxPurchaseTier.charAt(0)}</div>
                        </div>
                        <div>
                            <div className="text-sm font-black text-slate-800 tracking-tight leading-none">{user.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    user.maxPurchaseTier === 'DIAMOND' ? 'bg-blue-50 text-blue-600' :
                                    user.maxPurchaseTier === 'GOLD' ? 'bg-yellow-50 text-yellow-700' :
                                    user.maxPurchaseTier === 'SILVER' ? 'bg-slate-100 text-slate-600' :
                                    user.maxPurchaseTier === 'BRONZE' ? 'bg-amber-50 text-amber-800' :
                                    'bg-slate-100 text-slate-400'
                                }`}>{T[`tier${user.maxPurchaseTier.charAt(0) + user.maxPurchaseTier.slice(1).toLowerCase() as keyof typeof T}` as keyof typeof T]}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-center">
                        <div className="text-[8px] font-black text-blue-400 mb-0.5 uppercase tracking-wide">{T.record}</div>
                        <div className="text-lg font-black text-blue-700 leading-none">{bestScore}</div>
                    </div>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 gap-1">
                    {(['prizes', 'codes', 'history', 'settings'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab === 'prizes' ? T.tabPrizes : (tab === 'codes' ? T.tabCodes : (tab === 'history' ? T.tabHistory : T.tabSettings))}
                        </button>
                    ))}
                </div>
                {activeTab === 'prizes' && (
                    <div className="grid grid-cols-4 gap-2 animate-fade-in">
                        <TierTabButton tier="BRONZE" label={T.tierBronze} />
                        <TierTabButton tier="SILVER" label={T.tierSilver} />
                        <TierTabButton tier="GOLD" label={T.tierGold} />
                        <TierTabButton tier="DIAMOND" label={T.tierDiamond} />
                    </div>
                )}
                {activeTab === 'codes' && (
                    <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-100 animate-fade-in">
                        <button onClick={() => setCodesSubTab('get')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${codesSubTab === 'get' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}> {T.subTabGetCodes} </button>
                        <button onClick={() => setCodesSubTab('my')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${codesSubTab === 'my' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}> {T.subTabMyCodes} </button>
                    </div>
                )}
            </div>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col p-6 min-h-full">
            {activeTab === 'prizes' && (
                <div className="space-y-6 animate-fade-in pb-12">
                    <div className={`p-6 rounded-[28px] border transition-all ${isTierUnlocked(activePrizeTier) ? 'bg-white border-white shadow-sm' : 'bg-red-50 border-red-100 shadow-inner'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isTierUnlocked(activePrizeTier) ? 'bg-blue-50 text-blue-500' : 'bg-red-100 text-red-500'}`}>
                                <TierIcon tier={activePrizeTier} active={isTierUnlocked(activePrizeTier)} />
                            </div>
                            <h3 className={`font-black text-xs uppercase tracking-widest ${isTierUnlocked(activePrizeTier) ? 'text-slate-800' : 'text-red-700'}`}>
                                {T[`tier${activePrizeTier.charAt(0) + activePrizeTier.slice(1).toLowerCase() as keyof typeof T}` as keyof typeof T]}
                            </h3>
                        </div>
                        <p className={`text-[12px] font-black leading-relaxed ${isTierUnlocked(activePrizeTier) ? 'text-slate-400' : 'text-red-500'}`}>
                            {T[`tier${activePrizeTier.charAt(0) + activePrizeTier.slice(1).toLowerCase()}Desc` as keyof typeof T]}
                        </p>
                        {!isTierUnlocked(activePrizeTier) && (
                            <button onClick={() => setActiveTab('codes')} className="mt-4 w-full py-4 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-100 active:scale-[0.98] transition-all">
                                {T.getCodes}
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {filteredPrizes.length > 0 ? filteredPrizes.map(p => <PrizeCard key={p.id} prize={p} />) : <div className="col-span-2 py-10 text-center text-xs font-black text-slate-300 uppercase tracking-widest italic"> Призы в этой категории скоро появятся </div>}
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-20">
                        <Countdown lang={lang} />
                        <p className="mt-4 text-[11px] font-black text-slate-400 leading-normal text-center uppercase tracking-tight"> {T.prizeLimitInfo} </p>
                    </div>
                </div>
            )}

            {activeTab === 'codes' && (
                <div className="space-y-6 animate-fade-in">
                    {codesSubTab === 'my' ? (
                        <div className="space-y-4">
                            {myCodes.length === 0 ? (
                                <div className="text-center py-20 px-10 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center gap-6 shadow-inner">
                                    <p className="text-slate-400 font-black text-sm uppercase italic">{T.noCodes}</p>
                                    <button onClick={() => setCodesSubTab('get')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95 transition-all"> <BoltIcon /> {T.getCodes} </button>
                                </div>
                            ) : (
                                myCodes.sort((a,b) => Number(a.isUsed) - Number(b.isUsed)).map(c => (
                                    <div key={c.code} className={`p-6 rounded-[35px] flex flex-col md:flex-row gap-4 md:items-center justify-between border transition-all duration-300 ${c.isUsed ? 'bg-slate-50 border-slate-100 grayscale opacity-60' : 'bg-white border-blue-100 shadow-sm hover:shadow-md'}`}>
                                        <div className="flex flex-col gap-1">
                                            <div className={`font-mono font-black text-2xl tracking-tighter ${c.isUsed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{c.code}</div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${c.isUsed ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}> 
                                                    {c.isUsed ? T.statusUsed : T.statusActive} 
                                                </span>
                                                {c.purchaseAmount && (
                                                    <span className="text-[10px] font-black text-slate-400">{c.purchaseAmount.toLocaleString()} смн</span>
                                                )}
                                            </div>
                                        </div>
                                        {!c.isUsed && !user.deliveryRequested && (
                                            <button 
                                                onClick={() => onPlayCode(c.code)} 
                                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all hover:bg-blue-700 flex items-center justify-center gap-3 w-full md:w-auto"
                                            >
                                                <BoltIcon className="w-4 h-4" />
                                                {T.useCode}
                                            </button>
                                        )}
                                        {c.isUsed && (
                                            <div className="flex items-center justify-center p-3 rounded-2xl bg-slate-100 text-slate-300">
                                                <CheckIcon className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            {uploadSuccess ? (
                                <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center animate-fade-in relative border border-slate-100 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center shadow-inner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={5} className="w-10 h-10"><path d="M4.5 12.75l6 6 9-13.5" /></svg></div>
                                    <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-wider">Заявка отправлена</h3>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100"><p className="text-sm font-black text-slate-600 leading-relaxed uppercase tracking-tight">{T.waitMsg}</p></div>
                                    <button onClick={() => setUploadSuccess(false)} className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl shadow-lg text-[10px] uppercase tracking-widest transition active:scale-[0.98] hover:bg-slate-900">Понятно</button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                                        <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-4 pl-1">{T.purchaseTiersTitle}</h4>
                                        <div className="space-y-3">
                                            {TIERS.map((tier, idx) => (
                                                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${user.maxPurchaseTier === tier.tier ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-100'}`}>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{T.amountFrom}</span>
                                                            {/* Unified Prize Tier color mapping logic to avoid duplicate conditions and fix type comparison errors */}
                                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${
                                                                tier.tier === 'DIAMOND' ? 'bg-blue-500 text-white' :
                                                                tier.tier === 'GOLD' ? 'bg-yellow-50 text-white' :
                                                                tier.tier === 'SILVER' ? 'bg-slate-400 text-white' :
                                                                tier.tier === 'BRONZE' ? 'bg-amber-700 text-white' :
                                                                'bg-slate-200 text-slate-600'
                                                            }`}>{T[`tier${tier.tier.charAt(0) + tier.tier.slice(1).toLowerCase() as keyof typeof T}` as keyof typeof T]}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-slate-800 tracking-tighter">{tier.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-black">{T.somoni}</span></span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-slate-400 block mb-0.5 uppercase tracking-wide">{T.willIssue}</span>
                                                        <span className="text-sm font-black text-blue-600 uppercase tracking-tight">{tier.codes} {tier.codes === 1 ? 'код' : 'кодов'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-inner"><div className="bg-amber-100 text-amber-600 p-2 rounded-lg shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" /></svg></div><p className="text-[11px] font-black text-amber-800 leading-normal uppercase tracking-tight">{T.tiersIncentive}</p></div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <a href={`tel:${orderPhone}`} className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl shadow-xl uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all"> <BoltIcon /> {T.orderBtn} </a>
                                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm mx-1"><div className="bg-blue-600 text-white p-2.5 rounded-lg shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg></div><p className="text-[12px] font-black text-blue-700 leading-tight uppercase tracking-tight">{T.alreadyBoughtHint}</p></div>
                                    </div>
                                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 text-center relative overflow-hidden shadow-sm">
                                        <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.15em] mb-4 italic">{T.uploadInvoice}</h3>
                                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                        {previewUrl ? (
                                            <div className="relative inline-block mb-4"><img src={previewUrl} className="max-h-40 rounded-xl shadow-lg border border-slate-50" alt="Preview" /><button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white font-black">&times;</button></div>
                                        ) : (
                                            <div className="flex items-center gap-4 py-4 px-5 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 cursor-pointer group mb-4 transition-all hover:bg-blue-50" onClick={() => fileInputRef.current?.click()}><div className="w-10 h-10 bg-white text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg></div><div className="text-left"><p className="text-[11px] text-slate-500 font-black leading-normal uppercase tracking-tight">{T.uploadDesc}</p></div></div>
                                        )}
                                        {selectedFile && <button onClick={handleUpload} disabled={loading} className={`w-full py-5 font-black rounded-2xl shadow-xl text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all ${uploadSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white shadow-blue-100'}`}> {loading ? T.loading : (uploadSuccess ? T.reqAccepted : T.sendPhoto)} </button>}
                                    </div>
                                </>
                            )}
                            {userRequests.length > 0 && (
                                <div className="space-y-4 pt-2">
                                    <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.15em] mb-4 pl-1">{T.requestHistoryTitle}</h4>
                                    <div className="space-y-3 pb-20">
                                        {userRequests.map((req) => (
                                            <div key={req.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 cursor-pointer transition-transform hover:scale-105" onClick={async () => { const photo = await backend.getRequestPhoto(req.id); if (photo) setFullScreenImage(photo); }}><div className="w-full h-full flex items-center justify-center text-slate-300"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg></div></div><div><div className="text-[11px] font-black text-slate-700">{new Date(req.createdAt).toLocaleDateString()}</div><div className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div></div>
                                                <div className="flex items-center gap-2">{req.codesIssued && req.status === 'approved' && <span className="text-[10px] font-black text-blue-600">+{req.codesIssued} код</span>}<span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${req.status === 'pending' ? 'bg-orange-50 text-orange-500' : req.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{req.status === 'pending' ? T.statusPending : req.status === 'approved' ? T.statusApproved : T.statusRejected}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-4 animate-fade-in pb-12">
                    {gameHistory.length === 0 ? <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner"><p className="text-slate-400 font-black text-sm uppercase italic">{T.noGames}</p></div> : (
                        gameHistory.map(g => (
                            <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-50 shadow-sm flex justify-between items-center transition-transform active:scale-[0.98]">
                                <div>
                                    <div className="flex items-center gap-3 mb-1.5"><span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded ${g.codeUsed === 'TRIAL' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{g.codeUsed === 'TRIAL' ? T.trialGame : g.codeUsed}</span><span className="text-[10px] text-slate-300 font-mono font-bold">{new Date(g.playedAt).toLocaleDateString()}</span></div>
                                    <div className="text-2xl font-black text-slate-800 tracking-tighter">{g.score} <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">{T.points}</span></div>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl ${g.score >= 10 ? 'bg-emerald-500 shadow-emerald-400/20' : 'bg-slate-200 shadow-inner'}`}>
                                    {g.score >= 10 ? <CheckIcon className="w-6 h-6" /> : <span className="font-black text-xs">!</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-6 animate-fade-in pb-12">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col gap-8">
                        <div className="flex justify-between items-center pb-8 border-b border-slate-100">
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{T.language}</h4>
                                <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-[0.1em] font-bold">Забони барнома / Язык</p>
                            </div>
                            <div className="flex bg-slate-50 p-1 rounded-full border border-slate-200 shadow-inner gap-1">
                                <button 
                                    onClick={() => setLang('ru')} 
                                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black transition-all ${lang === 'ru' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-500'}`}
                                >
                                    <div className="w-4 h-4 rounded-full overflow-hidden shadow-sm"><FlagRU /></div>
                                    RU
                                </button>
                                <button 
                                    onClick={() => setLang('tg')} 
                                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black transition-all ${lang === 'tg' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-500'}`}
                                >
                                    <div className="w-4 h-4 rounded-full overflow-hidden shadow-sm"><FlagTG /></div>
                                    TJ
                                </button>
                            </div>
                        </div>
                        <button onClick={onLogout} className="w-full py-5 bg-red-50 text-red-500 font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-red-100 transition shadow-sm shadow-red-50"> {T.logout} </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {activeTab === 'prizes' && canDirectOrder && !user.deliveryRequested && (
          <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-6 animate-fade-in">
              <button 
                onClick={handleRequestDeliveryClick}
                disabled={loading}
                className="w-full max-w-sm py-5 bg-blue-600 text-white font-black rounded-[24px] uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-blue-400/50 transition-all active:scale-95 hover:bg-blue-700 flex items-center justify-center gap-3 border-4 border-white/20"
              >
                  <CheckIcon className="w-5 h-5" />
                  {T.requestDelivery}
              </button>
          </div>
      )}

      {activeTab === 'prizes' && user.deliveryRequested && (
          <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-6 animate-fade-in">
              <div className="w-full max-w-sm py-5 bg-emerald-500 text-white font-black rounded-[24px] uppercase text-[12px] tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 border-4 border-white/20">
                  <CheckIcon className="w-5 h-5" />
                  {T.reqAccepted}
              </div>
          </div>
      )}

      {showDeliveryConfirmation && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm antialiased" onClick={() => setShowDeliveryConfirmation(false)}>
              <div className="bg-white w-full max-sm p-10 rounded-[48px] shadow-2xl animate-fade-in relative text-center border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-blue-100"><BoltIcon className="w-8 h-8" /></div>
                  <h3 className="text-xl font-black text-slate-800 mb-6 leading-tight uppercase italic tracking-wider">{T.attention}</h3>
                  <div className="text-[13px] font-black text-slate-600 leading-relaxed mb-10 space-y-4 uppercase tracking-tight">
                      <p className="text-slate-800">{T.deliveryWarning}</p>
                      <p className="opacity-60">{T.deliveryHint}</p>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-[11px] font-black text-blue-700 italic">{T.deliveryAdvice}</div>
                  </div>
                  <div className="flex flex-col gap-3">
                      <button onClick={confirmDelivery} disabled={loading} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-400/20 text-[11px] uppercase tracking-[0.1em] hover:bg-blue-700 transition active:scale-[0.98]">{loading ? '...' : T.confirmFinal}</button>
                      <button onClick={() => setShowDeliveryConfirmation(false)} className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition"> {T.keepPlaying} </button>
                  </div>
              </div>
          </div>
      )}

      {fullScreenImage && (
          <div className="fixed inset-0 z-[250] bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setFullScreenImage(null)}>
              <img src={fullScreenImage} className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" alt="Full view" />
              <button className="absolute top-6 right-6 text-white text-4xl font-light">&times;</button>
          </div>
      )}
    </div>
  );
};
