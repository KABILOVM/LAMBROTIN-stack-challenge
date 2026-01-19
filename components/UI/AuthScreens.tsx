
import React, { useState, useEffect } from 'react';
import { backend } from '../../services/mockBackend';
import { CITIES, Language, PromoCode, GameResult } from '../../types';
import { MAX_TRIALS } from '../../constants';
import { t } from '../../translations';

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const PhoneIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

const ArrowRight = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const LangSwitch = ({ lang, setLang, className = "" }: { lang: Language, setLang: (l: Language) => void, className?: string }) => (
    <div className={`flex bg-slate-100 p-1 rounded-full ${className}`}>
        <button 
            onClick={() => setLang('ru')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${lang === 'ru' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
        >
            RU
        </button>
        <button 
            onClick={() => setLang('tg')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${lang === 'tg' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
        >
            TJ
        </button>
    </div>
);

export const RegisterScreen = ({ onRegisterSuccess, onAdminLogin, lang, setLang }: { onRegisterSuccess: () => void, onAdminLogin: () => void, lang: Language, setLang: (l: Language) => void }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', city: '', phone: '', password: '' });
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const T = t[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Admin Backdoor
    if (formData.name.toLowerCase() === 'admin' && formData.phone === '0000') { 
      onAdminLogin(); 
      return; 
    }

    if (!isLogin && (!formData.name || !formData.city || !formData.phone || !formData.password)) {
      setError(T.fillAll);
      return;
    }
    if (isLogin && (!formData.phone || !formData.password)) {
      setError(T.enterCreds);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await backend.loginUser(formData.phone, formData.password);
      } else {
        await backend.registerUser(formData.name, formData.city, formData.phone, formData.password);
      }
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-400/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 relative z-10 flex flex-col border border-white/50">
        
        {/* Header: Lang Switcher aligned to the right, flow layout to avoid overlap */}
        <div className="flex justify-end w-full mb-4">
            <LangSwitch lang={lang} setLang={setLang} />
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BoltIcon className="w-8 h-8 text-blue-600 animate-pulse" />
            <h1 className="text-3xl font-black text-blue-700 italic tracking-tight leading-none uppercase">{T.appTitle}</h1>
          </div>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">{T.appSubtitle}</p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex bg-slate-50 p-1.5 rounded-[20px] mb-6">
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white shadow-md text-slate-800 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {T.newPlayer}
          </button>
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white shadow-md text-slate-800 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {T.existingPlayer}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <input 
                type="text" 
                placeholder={T.namePlaceholder} 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-100 focus:bg-white font-bold uppercase tracking-widest text-[10px] text-slate-700 transition-all placeholder:text-slate-300" 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                value={formData.name}
              />
              
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className={`w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 ${isCityDropdownOpen ? 'border-blue-100 bg-white' : 'border-transparent'} focus:border-blue-100 focus:bg-white font-bold uppercase tracking-widest text-[10px] transition-all flex justify-between items-center ${formData.city ? 'text-slate-700' : 'text-slate-300'}`}
                >
                  <span className="truncate">{formData.city || T.cityPlaceholder}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isCityDropdownOpen ? 'rotate-180 text-blue-500' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCityDropdownOpen && (
                  <>
                     <div className="fixed inset-0 z-30" onClick={() => setIsCityDropdownOpen(false)}></div>
                     <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-40 animate-fade-in py-2">
                        {CITIES.map(city => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, city});
                              setIsCityDropdownOpen(false);
                            }}
                            className={`w-full text-left px-6 py-3 font-bold uppercase tracking-widest text-[10px] transition-colors hover:bg-slate-50 ${formData.city === city ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                          >
                            {city}
                          </button>
                        ))}
                     </div>
                  </>
                )}
              </div>
            </>
          )}

          <input 
            type="tel" 
            placeholder={T.phonePlaceholder} 
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-100 focus:bg-white font-bold uppercase tracking-widest text-[10px] text-slate-700 transition-all placeholder:text-slate-300" 
            onChange={e => setFormData({...formData, phone: e.target.value})} 
            value={formData.phone}
          />
          
          <input 
            type="password" 
            placeholder={T.passPlaceholder} 
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-100 focus:bg-white font-bold uppercase tracking-widest text-[10px] text-slate-700 transition-all placeholder:text-slate-300" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            value={formData.password}
          />

          {error && <p className="text-red-400 text-center font-bold text-[10px] uppercase tracking-widest animate-pulse pt-2">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl uppercase shadow-xl shadow-slate-200 transition active:scale-95 hover:bg-slate-900 mt-4 tracking-widest text-xs disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? T.loading : (isLogin ? T.loginBtn : T.registerBtn)}
          </button>
        </form>
        
        <p className="text-center text-[9px] text-slate-300 mt-8 font-bold uppercase tracking-[0.2em] leading-relaxed flex items-center justify-center gap-1 opacity-60">
          <BoltIcon className="w-3 h-3" /> Lambrotin • {T.syrup}
        </p>
      </div>
    </div>
  );
};

// Merged Purchase Rules & Code List Screen (replaces CodeScreen)
export const PurchaseRulesScreen = ({ onClose, lang, userId, onPlayCode }: { onClose: () => void, lang: Language, userId: string, onPlayCode: (code: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'codes'>('buy');
  const [myCodes, setMyCodes] = useState<PromoCode[]>([]);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const T = t[lang];

  useEffect(() => {
    if (activeTab === 'codes') {
        backend.getUserCodes(userId).then(setMyCodes);
        backend.getUserResults(userId).then(setGameResults);
    }
  }, [activeTab, userId]);

  const TIERS = [
      { amount: 5000, codes: 1 },
      { amount: 10000, codes: 3 },
      { amount: 20000, codes: 7 },
      { amount: 40000, codes: 16 },
      { amount: 100000, codes: 40 },
  ];

  const getCodeResult = (code: string) => {
      return gameResults.find(r => r.codeUsed === code);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 md:p-6">
      <div className="bg-white w-full max-w-lg p-6 md:p-10 rounded-[40px] shadow-2xl animate-fade-in relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <BoltIcon className="w-6 h-6 text-pink-500" />
                    <h2 className="text-xl md:text-2xl font-black italic uppercase text-slate-800 tracking-tight">{T.purchaseRulesTitle}</h2>
                </div>
                {/* Description depends on Tab */}
                {activeTab === 'buy' && (
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider max-w-xs">{T.purchaseRulesSubtitle}</p>
                )}
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 hover:bg-slate-100 transition leading-none text-2xl">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 p-1.5 rounded-[20px] mb-6 shrink-0">
          <button 
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'buy' ? 'bg-white shadow-md text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {T.tabBuy}
          </button>
          <button 
            onClick={() => setActiveTab('codes')}
            className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'codes' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {T.tabMyCodes}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
            
            {/* BUY TAB */}
            {activeTab === 'buy' && (
                <div className="space-y-4">
                    {TIERS.map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                            <div className="flex-1 bg-pink-500 text-white py-3 md:py-4 px-4 rounded-xl text-center shadow-lg shadow-pink-200">
                                <div className="text-lg md:text-xl font-black leading-none">{tier.amount.toLocaleString()}</div>
                                <div className="text-[8px] font-bold uppercase tracking-widest opacity-80">{T.somoni}</div>
                            </div>
                            <div className="text-pink-300"><ArrowRight /></div>
                            <div className="flex-1 border-2 border-blue-500 text-blue-600 py-3 md:py-4 px-4 rounded-xl text-center">
                                <div className="text-lg md:text-xl font-black leading-none">{tier.codes}</div>
                                <div className="text-[8px] font-bold uppercase tracking-widest">{tier.codes === 1 ? T.codeForPlay : T.codesForPlay}</div>
                            </div>
                        </div>
                    ))}
                    <div className="pt-4">
                        <a 
                            href="tel:+992000000000" 
                            className="w-full py-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded-[25px] shadow-xl shadow-pink-200 uppercase tracking-widest text-xs transition active:scale-95 hover:shadow-2xl flex items-center justify-center gap-3"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5z" clipRule="evenodd" />
                            </svg>
                            {T.buyProduct}
                        </a>
                    </div>
                </div>
            )}

            {/* MY CODES TAB */}
            {activeTab === 'codes' && (
                <div className="space-y-3">
                    {myCodes.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-[20px] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{T.noCodes}</p>
                        </div>
                    ) : (
                        myCodes.map((c) => {
                            const result = c.isUsed ? getCodeResult(c.code) : null;
                            return (
                                <div key={c.code} className="p-4 bg-slate-50 rounded-[20px] border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <div className="font-mono font-black text-lg text-slate-800">{c.code}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${c.isUsed ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {c.isUsed ? T.statusUsed : T.statusActive}
                                            </span>
                                            {result && (
                                                <span className="text-[9px] text-slate-400 font-bold">
                                                    {T.score}: <span className="text-slate-800">{result.score}</span>
                                                </span>
                                            )}
                                        </div>
                                        {result && (
                                            <div className="text-[8px] text-slate-300 font-mono mt-1">
                                                {new Date(result.playedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {!c.isUsed && (
                                        <button 
                                            onClick={() => onPlayCode(c.code)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition"
                                        >
                                            {T.playCode}
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
