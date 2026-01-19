
import React, { useState, useEffect } from 'react';
import { backend } from '../../services/mockBackend';
import { CITIES, Language } from '../../types';
import { MAX_TRIALS } from '../../constants';
import { t } from '../../translations';

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
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

export const CodeScreen = ({ onCodeSuccess, onClose, onLogout, lang }: { onCodeSuccess: (c: string | null) => void, onClose: () => void, onLogout: () => void, lang: Language }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const user = backend.getCurrentUser();
  const [trialCount, setTrialCount] = useState(0);
  const T = t[lang];

  useEffect(() => {
    if (user) {
      setTrialCount(backend.getTrialCount(user.id));
    }
  }, [user]);

  const handleTrial = () => {
    if (user && trialCount < MAX_TRIALS) {
      onCodeSuccess(null);
    }
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const cleanCode = code.trim().toUpperCase();
      await backend.validateAndUseCode(cleanCode, user.id);
      onCodeSuccess(cleanCode);
    } catch (err: any) { setError(err.message); }
  };

  const trialsRemaining = MAX_TRIALS - trialCount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[50px] relative shadow-2xl animate-fade-in border border-white/50">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onLogout} className="text-[9px] font-black uppercase text-slate-300 hover:text-red-400 transition tracking-[0.2em]">{T.logout}</button>
          <div className="flex items-center gap-1">
            <BoltIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-black italic uppercase text-slate-800 tracking-tight">{T.codeTitle}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 hover:bg-slate-100 transition leading-none text-xl">&times;</button>
        </div>
        <form onSubmit={handleCode} className="space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="000000" 
              className="w-full p-6 text-center text-4xl font-black bg-slate-50 rounded-[30px] outline-none border-4 border-transparent focus:border-blue-100 uppercase tracking-[0.3em] text-slate-800 transition-all placeholder:text-slate-100" 
              value={code} 
              onChange={e => setCode(e.target.value)} 
            />
            <p className="text-center text-[9px] text-indigo-400 font-bold uppercase mt-4 tracking-[0.2em]">{T.enterCode}</p>
          </div>
          {error && <p className="text-red-400 text-center font-black text-[9px] uppercase tracking-widest">{error}</p>}
          <button type="submit" className="w-full py-5 bg-slate-800 text-white font-black rounded-[25px] shadow-xl shadow-slate-200 uppercase tracking-widest text-xs transition active:scale-95 hover:bg-slate-900">{T.playByCode}</button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          {trialsRemaining > 0 ? (
            <div className="space-y-4">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                {T.trialsLeft}: <span className="text-blue-500">{trialsRemaining}</span>
              </p>
              <button onClick={handleTrial} className="w-full py-4 bg-blue-50 text-blue-600 font-black rounded-[25px] uppercase text-[9px] tracking-widest border border-blue-100 transition active:scale-95 hover:bg-blue-100/50 flex items-center justify-center gap-2">
                <BoltIcon className="w-3 h-3" /> {T.tryFree}
              </button>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-[30px] border border-dashed border-slate-200">
              <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] leading-relaxed">
                {T.noTrials}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
