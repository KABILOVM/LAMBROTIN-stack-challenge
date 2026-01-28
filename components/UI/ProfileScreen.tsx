
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
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-30">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);

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

const InfoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
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
        <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-2.5 rounded-2xl border border-red-100 shadow-sm transition-all animate-pulse">
            <ClockIcon />
            <span className="text-[10px] font-black uppercase tracking-wider">
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
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);
  
  const [codesSubTab, setCodesSubTab] = useState<'my' | 'get'>('my');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [userRequests, setUserRequests] = useState<CodeRequest[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [orderPhone, setOrderPhone] = useState('');

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

  const handleToggleSelection = (prize: PrizeConfig) => {
    if (prize.isOutOfStock) return showTempError(T.outOfStock);
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
    const isUnlocked = bestScore >= prize.threshold;
    const progressPercent = Math.min(100, Math.max(0, (bestScore / prize.threshold) * 100));
    
    let state = 'locked';
    if (prize.isOutOfStock && !isConfirmed) state = 'outOfStock';
    else if (isConfirmed) state = 'confirmed';
    else if (isSelectedLocally) state = 'selected';
    else if (isUnlocked) {
        if (prize.isValuable && (selectedValuable && selectedValuable !== prize.title)) state = 'locked_alt'; 
        else if (prize.isValuable && confirmedValuable) state = 'locked_already';
        else state = 'unlocked';
    }

    const baseClasses = "relative p-5 rounded-[32px] border transition-all duration-500 overflow-hidden cursor-pointer flex flex-col gap-4 min-h-[160px] antialiased";
    let styleClasses = "";
    
    switch(state) {
        case 'confirmed': styleClasses = "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white shadow-xl shadow-emerald-100"; break;
        case 'selected': styleClasses = "bg-white border-blue-600 shadow-2xl shadow-blue-100 ring-4 ring-blue-50 transform scale-[1.03]"; break;
        case 'unlocked': styleClasses = "bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl active:scale-[0.98] shadow-sm"; break;
        case 'outOfStock': styleClasses = "bg-slate-100 border-slate-200 opacity-40 grayscale cursor-not-allowed"; break;
        default: styleClasses = "bg-white/60 border-slate-50 opacity-60";
    }

    return (
        <div 
            onClick={() => handleToggleSelection(prize)}
            className={`${baseClasses} ${styleClasses}`}
        >
            <div className="flex justify-between items-start">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                    ${state === 'confirmed' ? 'bg-white/20 text-white' : (state === 'unlocked' || state === 'selected' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400')}`}>
                    <PrizeIcon name={prize.icon} className="w-6 h-6" />
                </div>
                {state === 'confirmed' ? <div className="bg-white/20 p-1.5 rounded-full"><CheckIcon /></div> : 
                 state === 'selected' ? <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg"><CheckIcon /></div> :
                 state === 'locked' ? <LockIcon /> : null}
            </div>
            <div className="flex-1">
                <h4 className={`text-sm font-black uppercase tracking-tight leading-tight mb-1.5 ${state === 'confirmed' ? 'text-white' : 'text-slate-800'}`}>
                    {prize.title}
                </h4>
                {!isConfirmed && (
                    <p className={`text-[10px] font-medium leading-relaxed line-clamp-2 ${state === 'confirmed' ? 'text-white/80' : 'text-slate-400'}`}>{prize.description}</p>
                )}
            </div>
            {!isConfirmed && (
                <div className="mt-auto">
                    {prize.isValuable && (
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-emerald-400' : 'bg-blue-400'}`} style={{ width: `${progressPercent}%` }} />
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                         <span className={`text-[9px] font-black uppercase tracking-widest ${state === 'confirmed' ? 'text-white/80' : 'text-slate-300'}`}>
                            {isUnlocked ? (prize.isValuable ? T.valuablePrize : T.basePrize) : `${Math.floor(progressPercent)}%`}
                         </span>
                         <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${state === 'confirmed' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                            {state === 'outOfStock' ? T.outOfStock : `${prize.threshold}`}
                         </span>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="w-full h-full bg-slate-50 antialiased selection:bg-blue-100">
      <div className={`absolute inset-0 overflow-y-auto custom-scrollbar ${embedded ? 'pb-[200px] pt-4' : 'pb-[200px]'}`}>
        <div className="max-w-2xl mx-auto flex flex-col p-6 min-h-full">
            
            {/* Header Card */}
            <div className="sticky top-0 z-40 pb-6 bg-slate-50/90 backdrop-blur-md -mx-2 px-2">
                <div className="mb-6 flex justify-between items-center bg-white p-5 rounded-[40px] shadow-xl shadow-slate-200/50 border border-white">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-[20px] flex items-center justify-center text-white text-xl font-thin shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Игрок</div>
                            <div className="text-xl font-black text-slate-800 tracking-tight leading-none">{user.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{user.city}</div>
                        </div>
                    </div>
                    <div className="bg-blue-50 px-6 py-3 rounded-[24px] border border-blue-100 text-center">
                        <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{T.record}</div>
                        <div className="text-2xl font-black text-blue-700 leading-none">{bestScore}</div>
                    </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex bg-white p-2 rounded-[28px] shadow-lg shadow-slate-200/40 border border-slate-100 overflow-x-auto gap-1">
                    {(['prizes', 'codes', 'history', 'settings'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[80px] py-3.5 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-slate-800 text-white shadow-xl shadow-slate-300 scale-[1.02]' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {tab === 'prizes' ? T.tabPrizes : (tab === 'codes' ? T.tabCodes : (tab === 'history' ? T.tabHistory : T.tabSettings))}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'prizes' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Integrated Rules Section */}
                    <div className="bg-white/80 p-6 rounded-[35px] border border-blue-50 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><InfoIcon /></div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight italic">Как получить призы?</h3>
                        </div>
                        <div className="space-y-3 text-[11px] font-medium text-slate-500 leading-relaxed">
                            <p>{T.mechanicsDesc}</p>
                            <p className="bg-blue-50/50 p-3 rounded-2xl text-blue-700 font-bold uppercase text-[9px] tracking-wider leading-relaxed border border-blue-100/50">
                                {T.importantDesc}
                            </p>
                            <div className="pt-2 border-t border-slate-100">
                                <span className="font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">{T.prizeLimitRuleTitle}</span>
                                <p className="italic opacity-80">{T.prizeLimitRuleDesc}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] pl-2">Витрина наград</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {prizes.sort((a,b) => a.threshold - b.threshold).map(p => (
                                <PrizeCard key={p.id} prize={p} />
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100">
                        <Countdown lang={lang} />
                        <p className="mt-4 text-[10px] font-medium text-slate-400 leading-relaxed text-center uppercase tracking-wide">
                            {T.prizeLimitInfo}
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'codes' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex p-2 bg-white rounded-[24px] shadow-sm border border-slate-100">
                        <button onClick={() => setCodesSubTab('my')} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${codesSubTab === 'my' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400'}`}> {T.subTabMyCodes} </button>
                        <button onClick={() => setCodesSubTab('get')} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${codesSubTab === 'get' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400'}`}> {T.subTabGetCodes} </button>
                    </div>

                    {codesSubTab === 'my' ? (
                        <div className="space-y-4">
                            {myCodes.length === 0 ? (
                                <div className="text-center py-20 px-10 bg-white rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center gap-8 shadow-inner">
                                    <p className="text-slate-400 font-black uppercase text-[12px] tracking-[0.2em]">{T.noCodes}</p>
                                    <button onClick={() => setCodesSubTab('get')} className="bg-blue-600 text-white px-10 py-5 rounded-[30px] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-blue-100 flex items-center gap-3 active:scale-95 transition-all"> <BoltIcon /> {T.getCodes} </button>
                                </div>
                            ) : (
                                myCodes.sort((a,b) => Number(a.isUsed) - Number(b.isUsed)).map(c => (
                                    <div key={c.code} className={`p-6 rounded-[32px] flex justify-between items-center border transition-all ${c.isUsed ? 'bg-slate-50 border-slate-100 grayscale opacity-60' : 'bg-white border-blue-100 shadow-xl shadow-slate-200/50'}`}>
                                        <div>
                                            <div className={`font-mono font-black text-2xl tracking-tighter ${c.isUsed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{c.code}</div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.isUsed ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}> {c.isUsed ? T.statusUsed : T.statusActive} </span>
                                            </div>
                                        </div>
                                        {!c.isUsed && !user.deliveryRequested && (
                                            <button onClick={() => onPlayCode(c.code)} className="bg-blue-600 text-white px-7 py-3.5 rounded-[20px] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-100 active:scale-95 transition-all hover:bg-blue-700">{T.playCode}</button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            {/* Compact Tiers List */}
                            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 pl-1">Тарифы за закупку</h4>
                                <div className="space-y-2">
                                    {TIERS.map((tier, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-[22px] border border-transparent hover:border-blue-100 transition-all group">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Сумма от</span>
                                                <span className="text-sm font-black text-slate-800 tracking-tight">{tier.amount.toLocaleString()} <span className="text-[9px] text-pink-500">{T.somoni}</span></span>
                                            </div>
                                            <div className="h-6 w-px bg-slate-200 opacity-50"></div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Начислим</span>
                                                <span className="text-sm font-black text-blue-600 tracking-tight">{tier.codes} <span className="text-[9px] uppercase">{tier.codes === 1 ? 'код' : 'кодов'}</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <a href={`tel:${orderPhone}`} className="w-full py-4 bg-slate-800 text-white font-black rounded-[25px] shadow-lg shadow-slate-200 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all"> <BoltIcon /> {T.orderBtn} </a>
                            
                            <div className="bg-white p-6 rounded-[35px] border border-slate-100 text-center relative overflow-hidden shadow-sm">
                                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-4">{T.uploadInvoice}</h3>
                                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                {previewUrl ? (
                                    <div className="relative inline-block">
                                        <img src={previewUrl} className="max-h-40 rounded-2xl shadow-lg" alt="Preview" />
                                        <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">&times;</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 py-3 px-5 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-10 h-10 bg-white text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-sm"><CameraIcon /></div>
                                        <p className="text-[9px] text-slate-500 font-bold text-left leading-relaxed uppercase tracking-wider">{T.uploadDesc}</p>
                                    </div>
                                )}
                                {selectedFile && <button onClick={handleUpload} disabled={loading} className="w-full mt-4 py-4 bg-blue-600 text-white font-black rounded-[22px] uppercase shadow-lg shadow-blue-100 tracking-[0.2em] text-[10px] disabled:opacity-50">{loading ? T.loading : T.sendPhoto}</button>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-4 animate-fade-in">
                    {gameHistory.length === 0 ? (
                         <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner"><p className="text-slate-400 font-black uppercase text-[12px] tracking-[0.2em]">{T.noGames}</p></div>
                    ) : (
                        gameHistory.map(g => (
                            <div key={g.id} className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-xl shadow-slate-200/40 flex justify-between items-center transition-transform active:scale-[0.98]">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl ${g.codeUsed === 'TRIAL' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-600'}`}>{g.codeUsed === 'TRIAL' ? T.trialGame : g.codeUsed}</span>
                                        <span className="text-[10px] text-slate-300 font-bold uppercase">{new Date(g.playedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wide">{g.prize ? `${T.prizesClaimed}: ${g.prize}` : (g.codeUsed === 'TRIAL' ? T.withoutPrize : T.promoCode)}</div>
                                </div>
                                <div className="text-3xl font-black text-slate-800 tracking-tighter">{g.score}</div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-white">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{T.language}</span>
                            <div className="flex bg-slate-50 p-1.5 rounded-[20px] shadow-inner">
                                <button onClick={() => setLang('ru')} className={`px-6 py-2.5 rounded-[16px] text-[11px] font-black uppercase transition-all ${lang === 'ru' ? 'bg-white shadow-xl text-slate-800 scale-105' : 'text-slate-300'}`}>RU</button>
                                <button onClick={() => setLang('tg')} className={`px-6 py-2.5 rounded-[16px] text-[11px] font-black uppercase transition-all ${lang === 'tg' ? 'bg-white shadow-xl text-slate-800 scale-105' : 'text-slate-300'}`}>TJ</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{T.sound}</span>
                            <button onClick={toggleMute} className={`w-16 h-10 rounded-[20px] p-1.5 transition-all duration-500 ${muted ? 'bg-slate-200' : 'bg-blue-600 shadow-lg shadow-blue-100'}`}>
                                <div className={`w-7 h-7 bg-white rounded-[14px] shadow-2xl transform transition-transform duration-500 flex items-center justify-center text-slate-400 ${muted ? 'translate-x-0' : 'translate-x-6'}`}><SoundIcon muted={muted} /></div>
                            </button>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full py-6 bg-red-50 text-red-500 font-black rounded-[30px] border border-red-100 uppercase tracking-[0.2em] text-[11px] hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-3">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        {T.logout}
                    </button>
                </div>
            )}

            {/* Notifications and Overlays */}
            {tempError && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-full shadow-2xl z-[100] text-[11px] font-black uppercase tracking-widest animate-fade-in text-center shadow-red-200 border border-white/20"> {tempError} </div>
            )}

            {activeTab === 'prizes' && (
                <div className="fixed bottom-[85px] left-0 right-0 p-6 z-50 pointer-events-none">
                    <div className="max-w-2xl mx-auto pointer-events-auto">
                        <div className="bg-white/90 backdrop-blur-xl p-3 rounded-[35px] shadow-2xl border border-white flex gap-3">
                            {user.deliveryRequested ? (
                                <div className="w-full bg-emerald-500 text-white py-5 rounded-[28px] text-center font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 animate-fade-in"><CheckIcon /> {T.reqAccepted}</div>
                            ) : (
                                <>
                                    {hasUnsavedChanges ? <button onClick={handleConfirmSelection} disabled={loading} className="flex-1 bg-slate-800 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest hover:bg-slate-900 shadow-2xl transition-all active:scale-95"> {loading ? '...' : T.saveChanges} </button> : 
                                     canRequestDelivery ? <button onClick={() => setShowDeliveryConfirmation(true)} disabled={loading} className="flex-1 bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-100 transition-all active:scale-95"> {loading ? '...' : T.requestDelivery} </button> : 
                                     <div className="w-full text-center py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Выберите призы выше</div>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals are kept similar but with improved SaaS styling */}
            {showDeliveryConfirmation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md">
                    <div className="bg-white w-full max-w-sm p-10 rounded-[50px] shadow-2xl animate-fade-in relative text-center border border-white">
                         <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner text-2xl font-thin">⚠️</div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-6 leading-none tracking-tighter">{T.attention}</h3>
                        <div className="space-y-5 mb-10 text-left bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                            <p className="text-[12px] font-bold text-slate-700 leading-relaxed uppercase tracking-tight">{T.deliveryWarning}</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{T.deliveryHint}</p>
                            <p className="text-[11px] font-black text-blue-600 leading-relaxed uppercase tracking-wider">{T.deliveryAdvice}</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <button onClick={confirmDelivery} disabled={loading} className="w-full py-5 bg-slate-100 text-slate-400 font-black rounded-[28px] uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all"> {loading ? '...' : T.confirmFinal} </button>
                            <button onClick={() => setShowDeliveryConfirmation(false)} className="w-full py-5 bg-blue-600 text-white font-black rounded-[28px] shadow-2xl shadow-blue-100 uppercase text-[11px] tracking-widest active:scale-95 transition-all"> {T.keepPlaying} </button>
                        </div>
                    </div>
                </div>
            )}

            {(fullScreenImage || isPhotoLoading) && (
                <div className="fixed inset-0 z-[200] bg-slate-950/95 flex items-center justify-center p-6 cursor-zoom-out animate-fade-in" onClick={() => setFullScreenImage(null)}>
                    {isPhotoLoading ? (
                        <div className="flex flex-col items-center gap-6">
                             <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                             <span className="text-white text-[11px] font-black uppercase tracking-[0.4em] opacity-40">Подготовка...</span>
                        </div>
                    ) : (
                        <img src={fullScreenImage!} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" alt="Fullscreen" />
                    )}
                    <button onClick={() => setFullScreenImage(null)} className="absolute top-10 right-10 text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-md transition-all text-2xl font-thin">&times;</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
