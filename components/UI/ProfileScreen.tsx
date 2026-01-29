import React, { useState, useEffect, useRef } from 'react';
import { User, GameResult, Language, PrizeConfig, PromoCode, CodeRequest, PrizeTier } from '../../types.ts';
import { backend } from '../../services/mockBackend.ts';
import { PrizeIcon } from './PrizeIcons.tsx';
import { t } from '../../translations.ts';

// --- PREMIUM LUCIDE-STYLE ICONS ---
const CheckIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeWidth={4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const LockIcon = ({ className = "w-2.5 h-2.5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z" />
    </svg>
);

const TierIcon = ({ tier, active }: { tier: PrizeTier, active: boolean }) => {
    const props = { className: `w-5 h-5 transition-colors ${active ? 'text-white' : 'text-slate-400'}` };
    switch(tier) {
        case 'BASIC': // Gift Icon
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
            );
        case 'BRONZE': // Medal Icon
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6.1 2h11.8a2 2 0 0 1 1.7.8l1.61 2.14a2 2 0 0 1 .13 2.2L16.79 15" /><circle cx="12" cy="15" r="5" />
                </svg>
            );
        case 'SILVER': // Award/Badge Icon
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
            );
        case 'GOLD': // Trophy Icon
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
            );
        case 'DIAMOND': // Gem/Diamond Icon
            return (
                <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12l4 6-10 13L2 9Z" /><path d="M11 3 8 9l3 13h2l3-13-3-6" /><path d="M2 9h20" />
                </svg>
            );
        default: return null;
    }
}

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);

const SoundIcon = ({ muted }: { muted: boolean }) => (
    muted ? (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>
    ) : (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    )
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
        <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl border border-red-100 shadow-sm transition-all">
            <ClockIcon />
            <span className="text-[11px] font-semibold">
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

export const ProfileScreen = ({ user: initialUser, onLogout, embedded = false, lang, setLang, prizes, onPlayCode, initialTab = 'prizes', muted, toggleMute }: ProfileScreenProps) => {
  const [user, setUser] = useState<User>(initialUser);
  const [bestScore, setBestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tempError, setTempError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [myCodes, setMyCodes] = useState<PromoCode[]>([]);
  const [activeTab, setActiveTab] = useState<'prizes' | 'history' | 'codes' | 'settings'>(initialTab);
  const [activePrizeTier, setActivePrizeTier] = useState<PrizeTier>('BRONZE');
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);
  
  const [codesSubTab, setCodesSubTab] = useState<'my' | 'get'>('get');
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

  const handleToggleSelection = (prize: PrizeConfig) => {
    if (prize.isOutOfStock) return showTempError(T.outOfStock);
    if (!isTierUnlocked(prize.tier)) return showTempError(T.tierRequirement + ": " + T[`tier${prize.tier.charAt(0) + prize.tier.slice(1).toLowerCase() as keyof typeof T}` as keyof typeof T]);
    if (bestScore < prize.threshold) return showTempError(`${T.needPoints} ${prize.threshold}!`);
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
    } finally {
        setLoading(false);
    }
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
          // Keeping it true for user to see info window
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

  const PrizeCard: React.FC<{ prize: PrizeConfig }> = ({ prize }) => {
    const isConfirmed = user.claimedPrizes?.includes(prize.title);
    const isSelectedLocally = localSelection.includes(prize.title);
    const isUnlockedByScore = bestScore >= prize.threshold;
    const isUnlockedByTier = isTierUnlocked(prize.tier);
    const isUnlocked = isUnlockedByScore && isUnlockedByTier;
    const progressPercent = Math.min(100, Math.max(0, (bestScore / prize.threshold) * 100));
    
    let state = 'locked';
    if (prize.isOutOfStock && !isConfirmed) state = 'outOfStock';
    else if (isConfirmed) state = 'confirmed';
    else if (isSelectedLocally) state = 'selected';
    else if (isUnlocked) {
        if (prize.isValuable && (selectedValuable && selectedValuable !== prize.title)) state = 'locked_alt'; 
        else if (prize.isValuable && confirmedValuable) state = 'locked_already';
        else state = 'unlocked';
    } else if (!isUnlockedByTier) {
        state = 'locked_tier';
    }

    const baseClasses = "relative p-5 rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col gap-3 min-h-[160px] antialiased group";
    let styleClasses = "";
    
    switch(state) {
        case 'confirmed': styleClasses = "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white shadow-lg"; break;
        case 'selected': styleClasses = "bg-white border-blue-600 shadow-xl ring-4 ring-blue-50 transform scale-[1.02]"; break;
        case 'unlocked': styleClasses = "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md active:scale-[0.98] shadow-sm"; break;
        case 'outOfStock': styleClasses = "bg-slate-50 border-slate-200 opacity-50 grayscale cursor-not-allowed"; break;
        case 'locked_tier': styleClasses = "bg-slate-50 border-slate-100 opacity-70 grayscale"; break;
        default: styleClasses = "bg-white border-slate-50 opacity-60";
    }

    return (
        <div 
            onClick={() => handleToggleSelection(prize)}
            className={`${baseClasses} ${styleClasses}`}
        >
            <div className="flex justify-between items-start">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                    ${state === 'confirmed' ? 'bg-white/20 text-white' : (state === 'unlocked' || state === 'selected' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400')}`}>
                    <PrizeIcon name={prize.icon} className="w-5 h-5" />
                </div>
                {state === 'confirmed' ? <div className="bg-white/20 p-1 rounded-full"><CheckIcon className="w-4 h-4 text-white" /></div> : 
                 state === 'selected' ? <div className="bg-blue-600 text-white p-1 rounded-full shadow-md"><CheckIcon className="w-4 h-4 text-white" /></div> :
                 (state === 'locked' || state === 'locked_tier') ? <div className="p-1"><LockIcon className="text-slate-300" /></div> : null}
            </div>
            <div className="flex-1">
                <h4 className={`text-sm font-bold tracking-tight leading-tight mb-1 ${state === 'confirmed' ? 'text-white' : 'text-slate-800'}`}>
                    {prize.title}
                </h4>
                {state === 'locked_tier' ? (
                   <p className="text-[10px] font-semibold text-blue-500 bg-blue-50/50 p-2 rounded-lg mt-1 border border-blue-100">
                       {T.tierLockedMsg.replace('{amount}', getTierMinAmount(prize.tier).toLocaleString())}
                   </p>
                ) : !isConfirmed && (
                    <p className={`text-[10px] font-medium leading-normal line-clamp-2 ${state === 'confirmed' ? 'text-white/80' : 'text-slate-400'}`}>{prize.description}</p>
                )}
            </div>
            {!isConfirmed && (
                <div className="mt-auto">
                    {prize.isValuable && (
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <div className={`h-full transition-all duration-700 ${isUnlocked ? 'bg-emerald-400' : 'bg-blue-400'}`} style={{ width: `${progressPercent}%` }} />
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                         <span className={`text-[9px] font-semibold ${state === 'confirmed' ? 'text-white/80' : 'text-slate-400'}`}>
                            {isUnlockedByScore ? (prize.isValuable ? T.valuablePrize : T.basePrize) : `${Math.floor(progressPercent)}%`}
                         </span>
                         <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${state === 'confirmed' ? 'bg-white/20' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                            {state === 'outOfStock' ? T.outOfStock : `${prize.threshold}`}
                         </span>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const filteredPrizes = prizes
    .filter(p => p.tier === activePrizeTier || p.tier === 'BASIC')
    .sort((a, b) => {
        // Sort BASIC prizes to always stay at the top, then sort by threshold
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
            <div className="mb-1">
                <TierIcon tier={tier} active={active} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-tighter leading-none ${active ? 'text-white' : 'text-slate-400'}`}>
                {label}
            </span>
            
            {!isUnlocked && (
                <div className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full border border-white scale-[0.65] shadow-sm">
                    <LockIcon />
                </div>
            )}
            {isUnlocked && tier !== 'BASIC' && (
                <div className="absolute top-1 right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white scale-[0.65] shadow-sm">
                    <CheckIcon />
                </div>
            )}
        </button>
    );
  };

  return (
    <div className="w-full h-full bg-slate-50 antialiased selection:bg-blue-100">
      <div className={`absolute inset-0 overflow-y-auto custom-scrollbar ${embedded ? 'pb-[200px] pt-4' : 'pb-[200px]'}`}>
        <div className="max-w-2xl mx-auto flex flex-col p-6 min-h-full">
            
            <div className="sticky top-0 z-40 pb-6 bg-slate-50/90 backdrop-blur-md -mx-2 px-2">
                <div className="mb-6 flex justify-between items-center bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white text-lg font-light shadow-sm relative">
                            {user.name.charAt(0).toUpperCase()}
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${
                                user.maxPurchaseTier === 'DIAMOND' ? 'bg-blue-500' :
                                user.maxPurchaseTier === 'GOLD' ? 'bg-yellow-500' :
                                user.maxPurchaseTier === 'SILVER' ? 'bg-slate-400' :
                                user.maxPurchaseTier === 'BRONZE' ? 'bg-amber-700' :
                                user.maxPurchaseTier === 'BASIC' ? 'bg-slate-300' : 'bg-slate-300'
                            }`}>
                                {user.maxPurchaseTier === 'BASIC' ? 'B' : user.maxPurchaseTier.charAt(0)}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Игрок</div>
                            <div className="text-lg font-bold text-slate-800 tracking-tight leading-none">{user.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    user.maxPurchaseTier === 'DIAMOND' ? 'bg-blue-50 text-blue-600' :
                                    user.maxPurchaseTier === 'GOLD' ? 'bg-yellow-50 text-yellow-700' :
                                    user.maxPurchaseTier === 'SILVER' ? 'bg-slate-100 text-slate-600' :
                                    user.maxPurchaseTier === 'BRONZE' ? 'bg-amber-50 text-amber-800' :
                                    user.maxPurchaseTier === 'BASIC' ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {T[`tier${user.maxPurchaseTier.charAt(0) + user.maxPurchaseTier.slice(1).toLowerCase() as keyof typeof T}` as keyof typeof T]}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">{user.city}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 px-5 py-2.5 rounded-2xl border border-blue-100 text-center">
                        <div className="text-[10px] font-bold text-blue-400 mb-0.5 uppercase tracking-wide">{T.record}</div>
                        <div className="text-xl font-bold text-blue-700 leading-none">{bestScore}</div>
                    </div>
                </div>
                
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 gap-1 mb-4">
                    {(['prizes', 'codes', 'history', 'settings'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab === 'prizes' ? T.tabPrizes : (tab === 'codes' ? T.tabCodes : (tab === 'history' ? T.tabHistory : T.tabSettings))}
                        </button>
                    ))}
                </div>

                {/* STICKY SUB-TABS FOR CODES SECTION */}
                {activeTab === 'codes' && (
                    <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
                        <button onClick={() => setCodesSubTab('get')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${codesSubTab === 'get' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}> {T.subTabGetCodes} </button>
                        <button onClick={() => setCodesSubTab('my')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${codesSubTab === 'my' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}> {T.subTabMyCodes} </button>
                    </div>
                )}
            </div>

            {activeTab === 'prizes' && (
                <div className="space-y-6 animate-fade-in pb-12">
                    <div className="grid grid-cols-4 gap-1.5 px-0.5">
                        <TierTabButton tier="BRONZE" label={T.tierBronze} />
                        <TierTabButton tier="SILVER" label={T.tierSilver} />
                        <TierTabButton tier="GOLD" label={T.tierGold} />
                        <TierTabButton tier="DIAMOND" label={T.tierDiamond} />
                    </div>

                    <div className={`p-6 rounded-[28px] border transition-all ${
                        isTierUnlocked(activePrizeTier) 
                        ? 'bg-white border-white shadow-sm' 
                        : 'bg-red-50 border-red-100 shadow-inner'
                    }`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                                isTierUnlocked(activePrizeTier) ? 'bg-blue-50 text-blue-500' : 'bg-red-100 text-red-500'
                            }`}>
                                <TierIcon tier={activePrizeTier} active={isTierUnlocked(activePrizeTier)} />
                            </div>
                            <h3 className={`font-bold text-xs uppercase tracking-widest ${isTierUnlocked(activePrizeTier) ? 'text-slate-800' : 'text-red-700'}`}>
                                {T[`tier${activePrizeTier.charAt(0) + activePrizeTier.slice(1).toLowerCase() as keyof typeof T}` as keyof typeof T]}
                            </h3>
                        </div>
                        <p className={`text-[12px] font-medium leading-relaxed ${isTierUnlocked(activePrizeTier) ? 'text-slate-400' : 'text-red-500'}`}>
                            {T[`tier${activePrizeTier.charAt(0) + activePrizeTier.slice(1).toLowerCase()}Desc` as keyof typeof T]}
                        </p>
                        {!isTierUnlocked(activePrizeTier) && (
                            <button 
                                onClick={() => setActiveTab('codes')}
                                className="mt-4 w-full py-3 bg-red-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-red-100 active:scale-[0.98] transition-all"
                            >
                                {T.getCodes}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {filteredPrizes.length > 0 ? (
                            filteredPrizes.map(p => <PrizeCard key={p.id} prize={p} />)
                        ) : (
                            <div className="col-span-2 py-10 text-center text-xs font-medium text-slate-300">
                                Призы в этой категории скоро появятся
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                        <Countdown lang={lang} />
                        <p className="mt-4 text-[11px] font-medium text-slate-400 leading-normal text-center">
                            {T.prizeLimitInfo}
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'codes' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Sub-tabs removed from here and moved to sticky container above */}

                    {codesSubTab === 'my' ? (
                        <div className="space-y-3">
                            {myCodes.length === 0 ? (
                                <div className="text-center py-20 px-10 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center gap-6 shadow-inner">
                                    <p className="text-slate-400 font-bold text-sm">{T.noCodes}</p>
                                    <button onClick={() => setCodesSubTab('get')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95 transition-all"> <BoltIcon /> {T.getCodes} </button>
                                </div>
                            ) : (
                                myCodes.sort((a,b) => Number(a.isUsed) - Number(b.isUsed)).map(c => (
                                    <div key={c.code} className={`p-5 rounded-2xl flex justify-between items-center border transition-all ${c.isUsed ? 'bg-slate-50 border-slate-100 grayscale opacity-60' : 'bg-white border-blue-100 shadow-sm'}`}>
                                        <div>
                                            <div className={`font-mono font-bold text-xl ${c.isUsed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{c.code}</div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${c.isUsed ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}> {c.isUsed ? T.statusUsed : T.statusActive} </span>
                                            </div>
                                        </div>
                                        {!c.isUsed && !user.deliveryRequested && (
                                            <button onClick={() => onPlayCode(c.code)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-blue-700">{T.playCode}</button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            {uploadSuccess ? (
                                <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center animate-fade-in relative border border-slate-100 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center shadow-inner">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} className="w-10 h-10"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 uppercase italic">Заявка отправлена</h3>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                            {T.waitMsg}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setUploadSuccess(false)}
                                        className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-lg text-[10px] uppercase tracking-widest transition active:scale-[0.98] hover:bg-slate-900"
                                    >
                                        Понятно
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                                        <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-4 pl-1">Тарифы за закупку</h4>
                                        <div className="space-y-3">
                                            {TIERS.map((tier, idx) => (
                                                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${user.maxPurchaseTier === tier.tier ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-100'}`}>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Сумма от</span>
                                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${
                                                                tier.tier === 'DIAMOND' ? 'bg-blue-500 text-white' :
                                                                tier.tier === 'GOLD' ? 'bg-yellow-500 text-white' :
                                                                tier.tier === 'SILVER' ? 'bg-slate-400 text-white' :
                                                                tier.tier === 'BRONZE' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                                                            }`}>
                                                                {T[`tier${tier.tier.charAt(0) + tier.tier.slice(1).toLowerCase() as keyof typeof T}` as keyof typeof T]}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-800">{tier.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">{T.somoni}</span></span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">Начислим</span>
                                                        <span className="text-sm font-bold text-blue-600">{tier.codes} <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{tier.codes === 1 ? 'код' : 'кодов'}</span></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* INCENTIVE INFO BOX */}
                                        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-inner">
                                            <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg shrink-0">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                                </svg>
                                            </div>
                                            <p className="text-[11px] font-bold text-amber-800 leading-normal">
                                                {T.tiersIncentive}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-4">
                                        <a href={`tel:${orderPhone}`} className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-lg uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"> 
                                            <BoltIcon /> {T.orderBtn} 
                                        </a>
                                        
                                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm mx-1">
                                            <div className="bg-blue-600 text-white p-2 rounded-lg shrink-0">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                                </svg>
                                            </div>
                                            <p className="text-[12px] font-bold text-blue-700 leading-tight">
                                                {T.alreadyBoughtHint}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-6 rounded-[28px] border border-slate-100 text-center relative overflow-hidden shadow-sm">
                                        <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest mb-4">{T.uploadInvoice}</h3>
                                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                        {previewUrl ? (
                                            <div className="relative inline-block mb-4">
                                                <img src={previewUrl} className="max-h-40 rounded-xl shadow-lg border border-slate-50" alt="Preview" />
                                                <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white">&times;</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 py-4 px-5 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 cursor-pointer group mb-4 transition-all hover:bg-blue-50" onClick={() => fileInputRef.current?.click()}>
                                                <div className="w-10 h-10 bg-white text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-sm"><CameraIcon /></div>
                                                <div className="text-left">
                                                    <p className="text-[11px] text-slate-500 font-semibold leading-normal">{T.uploadDesc}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedFile && (
                                            <button 
                                                onClick={handleUpload} 
                                                disabled={loading} 
                                                className={`w-full py-4 font-bold rounded-2xl shadow-lg text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all ${uploadSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white shadow-blue-100'}`}
                                            >
                                                {loading ? T.loading : (uploadSuccess ? T.reqAccepted : T.sendPhoto)}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* History Section */}
                            {userRequests.length > 0 && (
                                <div className="space-y-4 pt-2">
                                    <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-4 pl-1">{T.requestHistoryTitle}</h4>
                                    <div className="space-y-3 pb-20">
                                        {userRequests.map((req) => (
                                            <div key={req.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 cursor-pointer transition-transform hover:scale-105"
                                                        onClick={async () => {
                                                            const photo = await backend.getRequestPhoto(req.id);
                                                            if (photo) setFullScreenImage(photo);
                                                        }}
                                                    >
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <CameraIcon />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] font-bold text-slate-700">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-[9px] font-medium text-slate-400">{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {req.codesIssued && req.status === 'approved' && (
                                                        <span className="text-[10px] font-black text-blue-600">+{req.codesIssued} код</span>
                                                    )}
                                                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                        req.status === 'pending' ? 'bg-orange-50 text-orange-500' :
                                                        req.status === 'approved' ? 'bg-green-50 text-green-600' : 
                                                        'bg-red-50 text-red-600'
                                                    }`}>
                                                        {req.status === 'pending' ? T.statusPending : 
                                                         req.status === 'approved' ? T.statusApproved : T.statusRejected}
                                                    </span>
                                                </div>
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
                    {gameHistory.length === 0 ? (
                         <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner"><p className="text-slate-400 font-bold text-sm">{T.noGames}</p></div>
                    ) : (
                        gameHistory.map(g => (
                            <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-50 shadow-sm flex justify-between items-center transition-transform active:scale-[0.98]">
                                <div>
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${g.codeUsed === 'TRIAL' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{g.codeUsed === 'TRIAL' ? T.trialGame : g.codeUsed}</span>
                                        <span className="text-[10px] text-slate-300 font-medium">{new Date(g.playedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">{g.prize ? `${T.prizesClaimed}: ${g.prize}` : (g.codeUsed === 'TRIAL' ? T.withoutPrize : T.promoCode)}</div>
                                </div>
                                <div className="text-3xl font-bold text-slate-800 tracking-tight">{g.score}</div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-6 animate-fade-in pb-12">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{T.language}</span>
                            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                <button onClick={() => setLang('ru')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${lang === 'ru' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-300'}`}>RU</button>
                                <button onClick={() => setLang('tg')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${lang === 'tg' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-300'}`}>TJ</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{T.sound}</span>
                            <button onClick={toggleMute} className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${muted ? 'bg-slate-200' : 'bg-blue-500 shadow-sm shadow-blue-100'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 flex items-center justify-center text-slate-400 ${muted ? 'translate-x-0' : 'translate-x-6'}`}><SoundIcon muted={muted} /></div>
                            </button>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full py-5 bg-red-50 text-red-500 font-bold rounded-2xl border border-red-100 text-[10px] uppercase tracking-widest hover:bg-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        {T.logout}
                    </button>
                </div>
            )}

            {tempError && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-3 rounded-full shadow-2xl z-[100] text-xs font-bold animate-fade-in text-center border border-white/20"> {tempError} </div>
            )}

            {activeTab === 'prizes' && (
                <div className="fixed bottom-[85px] left-0 right-0 p-6 z-50 pointer-events-none">
                    <div className="max-w-2xl mx-auto pointer-events-auto">
                        <div className="bg-white/95 backdrop-blur-xl p-3 rounded-[28px] shadow-2xl border border-slate-100 flex gap-3">
                            {user.deliveryRequested ? (
                                <div className="w-full bg-emerald-500 text-white py-4 rounded-2xl text-center font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 animate-fade-in"><CheckIcon className="w-5 h-5 text-white" /> {T.reqAccepted}</div>
                            ) : (
                                <>
                                    {hasUnsavedChanges ? <button onClick={handleConfirmSelection} disabled={loading} className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-[0.98]"> {loading ? '...' : T.saveChanges} </button> : 
                                     canRequestDelivery ? <button onClick={() => setShowDeliveryConfirmation(true)} disabled={loading} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"> {loading ? '...' : T.requestDelivery} </button> : 
                                     <div className="w-full text-center py-4 text-xs font-semibold text-slate-300 italic">Выберите призы выше</div>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showDeliveryConfirmation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm p-10 rounded-[40px] shadow-2xl animate-fade-in relative text-center border border-slate-100">
                         <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-thin shadow-inner">⚠️</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight uppercase italic">{T.attention}</h3>
                        <div className="space-y-4 mb-8 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <p className="text-sm font-semibold text-slate-700 leading-normal">{T.deliveryWarning}</p>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">{T.deliveryHint}</p>
                            <p className="text-xs font-bold text-blue-600 leading-normal uppercase tracking-wide">{T.deliveryAdvice}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmDelivery} disabled={loading} className="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"> {loading ? '...' : T.confirmFinal} </button>
                            <button onClick={() => setShowDeliveryConfirmation(false)} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all"> {T.keepPlaying} </button>
                        </div>
                    </div>
                </div>
            )}

            {fullScreenImage && (
                <div 
                    className="fixed inset-0 z-[200] bg-slate-950/95 flex items-center justify-center p-6 cursor-zoom-out animate-fade-in"
                    onClick={() => setFullScreenImage(null)}
                >
                    <img src={fullScreenImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" alt="Fullscreen" />
                    <button 
                        onClick={() => setFullScreenImage(null)}
                        className="absolute top-10 right-10 text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-md transition text-2xl font-light"
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