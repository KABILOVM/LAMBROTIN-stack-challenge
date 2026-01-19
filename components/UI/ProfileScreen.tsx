import React, { useState, useEffect } from 'react';
import { User, GameResult, Language, PrizeConfig } from '../../types';
import { backend } from '../../services/mockBackend';
import { PrizeIcon } from './PrizeIcons';
import { t } from '../../translations';

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

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  embedded?: boolean;
  lang: Language;
  setLang: (l: Language) => void;
  prizes: PrizeConfig[];
}

export const ProfileScreen = ({ user: initialUser, onBack, onLogout, embedded = false, lang, setLang, prizes }: ProfileScreenProps) => {
  const [user, setUser] = useState<User>(initialUser);
  const [bestScore, setBestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tempError, setTempError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [activeTab, setActiveTab] = useState<'prizes' | 'history'>('prizes');

  const T = t[lang];

  // Local selection state
  const [localSelection, setLocalSelection] = useState<string[]>(initialUser.claimedPrizes || []);

  useEffect(() => {
    backend.getUserResults(user.id).then(userHistory => {
      setGameHistory(userHistory);
      const eligibleGames = userHistory.filter(r => r.codeUsed !== 'TRIAL');
      const max = Math.max(0, ...eligibleGames.map((r: GameResult) => r.score));
      setBestScore(max);
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

  const handleDeliveryRequest = async () => {
     setLoading(true);
     try {
         await backend.requestDelivery(user.id);
         const updated = await backend.refreshUser();
         if(updated) setUser(updated);
     } catch (e: any) {
         showTempError(e.message);
     } finally {
         setLoading(false);
     }
  };

  const confirmedValuable = user.claimedPrizes?.some(pTitle => {
      const p = prizes.find(cfg => cfg.title === pTitle);
      return p?.isValuable;
  });

  const confirmedBasic = user.claimedPrizes?.some(pTitle => {
      const p = prizes.find(cfg => cfg.title === pTitle);
      return p && !p.isValuable;
  });
  
  const selectedValuable = localSelection.find(pTitle => {
      const p = prizes.find(cfg => cfg.title === pTitle);
      return p?.isValuable;
  });

  const hasUnsavedChanges = localSelection.length > (user.claimedPrizes?.length || 0);
  const canConfirm = hasUnsavedChanges;
  // Delivery allowed if user has selected at least one prize and not yet requested
  const canRequestDelivery = (user.claimedPrizes && user.claimedPrizes.length > 0) && !user.deliveryRequested;

  const PrizeCard: React.FC<{ prize: PrizeConfig }> = ({ prize }) => {
    const isConfirmed = user.claimedPrizes?.includes(prize.title);
    const isSelectedLocally = localSelection.includes(prize.title);
    const isUnlocked = bestScore >= prize.threshold;
    const progressPercent = Math.min(100, Math.max(0, (bestScore / prize.threshold) * 100));
    
    let cardStyle = "bg-white border-slate-200 shadow-sm";
    let buttonText = T.choose;
    let buttonStyle = "bg-slate-100 text-slate-400";
    let isDisabled = false;

    if (prize.isOutOfStock && !isConfirmed) {
        cardStyle = "bg-slate-50 border-slate-100 opacity-50 grayscale";
        buttonText = T.outOfStock;
        buttonStyle = "bg-red-50 text-red-300";
        isDisabled = true;
    } else if (isConfirmed) {
        cardStyle = "bg-blue-600 text-white border-blue-600 shadow-md";
        buttonText = T.inList;
        buttonStyle = "bg-white/20 text-white";
        isDisabled = true;
    } else if (isSelectedLocally) {
        cardStyle = "bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-500";
        buttonText = T.selected;
        buttonStyle = "bg-indigo-600 text-white shadow-lg scale-105";
    } else if (!isUnlocked) {
        cardStyle = "bg-slate-50 border-slate-100 opacity-80";
        buttonText = `${T.needPoints} ${prize.threshold}`;
        isDisabled = false; 
    } else {
        if (prize.isValuable && selectedValuable && selectedValuable !== prize.title) {
            cardStyle = "bg-slate-50 border-slate-100 opacity-60 grayscale-[0.5]";
            buttonText = T.unavailable;
        } else if (confirmedValuable && prize.isValuable) {
            cardStyle = "bg-slate-50 border-slate-100 opacity-50";
            buttonText = T.unavailable;
            isDisabled = true;
        } else {
            buttonStyle = "bg-slate-800 text-white hover:bg-slate-900 shadow-md active:scale-95";
        }
    }

    return (
        <div 
            onClick={() => !isDisabled && handleToggleSelection(prize)}
            className={`relative p-4 rounded-[30px] border transition-all duration-300 overflow-hidden group cursor-pointer ${cardStyle}`}
        >
            <div className="flex gap-4 items-center relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white ${isConfirmed ? 'ring-2 ring-white/30 text-blue-500' : 'text-indigo-500'}`}>
                    <PrizeIcon name={prize.icon} className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-[10px] font-black uppercase tracking-wider mb-1 leading-tight ${isConfirmed ? 'text-white' : 'text-slate-800'}`}>
                        {prize.title}
                    </h4>
                    {!isConfirmed && (
                       <p className="text-[9px] font-medium text-slate-400 leading-tight line-clamp-2">{prize.description}</p>
                    )}
                    
                    {prize.isValuable && !isConfirmed && (
                        <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-blue-400' : 'bg-orange-400'}`} 
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
                 <div className={`text-[9px] font-black uppercase tracking-widest ${isConfirmed ? 'text-white/80' : 'text-slate-300'}`}>
                    {isUnlocked ? `${prize.threshold} Pts` : `${Math.floor(progressPercent)}%`}
                 </div>
                 
                 <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${buttonStyle}`}>
                    {isConfirmed && <CheckIcon />}
                    {!isUnlocked && !isConfirmed ? <LockIcon /> : null}
                    <span>{buttonText}</span>
                 </div>
            </div>
        </div>
    );
  };

  const containerClass = embedded 
    ? "relative w-full h-full" 
    : "fixed inset-0 w-full h-full bg-slate-50 z-50";
    
  // Sort prizes
  const basePrizes = prizes.filter(p => !p.isValuable).sort((a,b) => a.threshold - b.threshold);
  const valuablePrizes = prizes.filter(p => p.isValuable).sort((a,b) => a.threshold - b.threshold);

  return (
    <div className={containerClass}>
      
      {/* Scrollable Content */}
      <div className={`absolute inset-0 overflow-y-auto custom-scrollbar ${embedded ? 'pb-[160px] pt-4' : 'pb-[140px]'}`}>
        <div className={`max-w-xl mx-auto flex flex-col p-6 min-h-full`}>
            
             {/* Lang Switcher in Profile */}
            <div className="flex justify-between items-center mb-6">
                {!embedded ? (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{T.profileTitle}</span>
                ) : <div></div>}
                
                <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-full border border-white">
                    <button onClick={() => setLang('ru')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${lang === 'ru' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>RU</button>
                    <button onClick={() => setLang('tg')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${lang === 'tg' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>TJ</button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight mb-1">{user.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{user.city} • {user.phone}</p>
                    
                    <div className="flex gap-4">
                        <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                            <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-1">{T.record}</div>
                            <div className="text-2xl font-thin text-slate-800 leading-none">{bestScore}</div>
                        </div>
                        <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                            <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-1">{T.prizesClaimed}</div>
                            <div className="text-2xl font-thin text-blue-500 leading-none">{user.claimedPrizes?.length || 0}<span className="text-slate-200">/2</span></div>
                        </div>
                    </div>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12">
                     <div className="w-32 h-32 bg-slate-800 rounded-full"></div>
                </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-[20px] mb-8">
                <button 
                    onClick={() => setActiveTab('prizes')}
                    className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'prizes' ? 'bg-white shadow-md text-slate-800' : 'text-slate-400'}`}
                >
                    {T.tabPrizes}
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white shadow-md text-slate-800' : 'text-slate-400'}`}
                >
                    {T.tabHistory}
                </button>
            </div>

            {/* TAB CONTENT: PRIZES */}
            {activeTab === 'prizes' && (
                <div className="space-y-8 flex-1 animate-fade-in">
                    
                    {basePrizes.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="text-sm font-black text-slate-800 uppercase italic">{T.basePrize}</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {basePrizes.map(p => <PrizeCard key={p.id} prize={p} />)}
                            </div>
                        </div>
                    )}

                    {valuablePrizes.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="text-sm font-black text-slate-800 uppercase italic">{T.valuablePrize}</h3>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{T.chooseOne}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {valuablePrizes.map(p => <PrizeCard key={p.id} prize={p} />)}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-12 text-center pb-4">
                        <button onClick={onLogout} className="group flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-full hover:bg-red-50 transition-colors">
                            <span className="text-[10px] font-bold uppercase text-slate-300 group-hover:text-red-400 transition-colors tracking-widest">{T.logout}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: HISTORY */}
            {activeTab === 'history' && (
                <div className="space-y-4 animate-fade-in pb-20">
                    {gameHistory.length > 0 ? gameHistory.map((res) => (
                      <div key={res.id} className="p-6 bg-white rounded-[25px] flex justify-between items-center border border-slate-100 shadow-sm">
                        <div>
                          <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-1">{new Date(res.playedAt).toLocaleDateString()}</div>
                          <div className={`font-bold text-xs ${res.prize ? 'text-blue-500' : 'text-slate-400'}`}>
                            {res.prize || T.withoutPrize}
                          </div>
                          <div className="text-[8px] text-slate-200 font-mono mt-2">{res.codeUsed}</div>
                        </div>
                        <div className="text-3xl font-thin text-slate-800">{res.score}</div>
                      </div>
                    )) : (
                      <div className="text-center py-20 bg-white rounded-[30px] border border-dashed border-slate-200">
                        <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">{T.noGames}</p>
                      </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Floating Error Message */}
      {tempError && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] animate-bounce w-max max-w-[90%]">
            <div className="bg-red-500 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/></svg>
                <span className="truncate">{tempError}</span>
            </div>
        </div>
      )}

      {/* 2. Action Footer Bar (Save / Request) - Only shown on Prizes tab */}
      {activeTab === 'prizes' && (canConfirm || !user.deliveryRequested) && (
          <div className={`absolute bottom-0 left-0 right-0 p-4 z-50 pointer-events-none ${embedded ? 'pb-[100px]' : 'bg-white border-t border-slate-100 pb-8'}`}>
             <div className="max-w-xl mx-auto w-full pointer-events-auto">
                 
                 {!embedded && (
                     <div className="h-6 mb-2 flex items-center justify-center">
                        {canConfirm ? (
                            <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest animate-pulse">
                                {T.saveChanges}
                            </p>
                        ) : (
                            !confirmedBasic && !user.deliveryRequested ? (
                                <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                     <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"/>
                                     {T.selectCard}
                                </p>
                            ) : null
                        )}
                     </div>
                 )}

                 <div className="flex gap-3 h-14">
                    {!embedded && (
                         <button 
                            onClick={onBack}
                            className="aspect-square h-full bg-slate-50 text-slate-400 rounded-2xl border border-slate-200 flex items-center justify-center transition active:scale-95 hover:bg-slate-100 hover:text-slate-600"
                         >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                         </button>
                    )}

                    <div className="flex-1 h-full shadow-2xl">
                        {canConfirm ? (
                            <button 
                                onClick={handleConfirmSelection}
                                disabled={loading}
                                className="w-full h-full bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 uppercase tracking-widest text-xs transition active:scale-95 hover:bg-indigo-700 flex items-center justify-center gap-2"
                            >
                                {loading ? '...' : T.confirmChoice}
                            </button>
                        ) : (
                            user.deliveryRequested ? (
                                !embedded && (
                                    <div className="w-full h-full bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center gap-2 px-4 shadow-sm">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                                            <CheckIcon />
                                        </div>
                                        <span className="text-blue-700 font-black uppercase text-[10px] tracking-widest truncate">{T.reqAccepted}</span>
                                    </div>
                                )
                            ) : (
                                <button 
                                    onClick={handleDeliveryRequest}
                                    disabled={!canRequestDelivery || loading}
                                    className={`w-full h-full font-black rounded-2xl shadow-lg uppercase tracking-widest text-xs transition active:scale-95 flex items-center justify-center gap-2 ${
                                        canRequestDelivery
                                        ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200' 
                                        : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    {loading ? '...' : T.requestDelivery}
                                </button>
                            )
                        )}
                    </div>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};
