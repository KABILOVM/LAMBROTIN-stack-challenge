
import React, { useState, useEffect, useRef } from 'react';
import { backend } from '../../services/mockBackend.ts';
import { CITIES, Language, CodeRequest, PrizeTier } from '../../types.ts';
import { t } from '../../translations.ts';
import { LungsLoader } from './LungsLoader.tsx';

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const MessageIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);

const ChevronIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const LockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z" />
    </svg>
);

const DocumentIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const FlagRU = () => (
    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Russia.svg" className="w-full h-full object-cover rounded-full" alt="RU" />
);

const FlagTG = () => (
    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Flag_of_Tajikistan.svg" className="w-full h-full object-cover rounded-full" alt="TG" />
);

export const LanguageSelectionScreen = ({ onSelect }: { onSelect: (l: Language) => void }) => {
    return (
        <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-6 antialiased">
            <div className="flex flex-col items-center mb-12 animate-fade-in text-center">
                <div className="flex items-center gap-2 mb-4">
                    <BoltIcon className="w-12 h-12 text-blue-600 fill-current drop-shadow-md" />
                    <h1 className="text-4xl font-black italic uppercase text-slate-800 tracking-tighter">ЛАМБРОТИН</h1>
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Выберите язык</p>
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.25em]">Забонро интихоб кунед</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                <button 
                    onClick={() => onSelect('ru')}
                    className="group bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 transition-all duration-500 flex flex-col items-center hover:border-blue-200 hover:shadow-xl hover:bg-white active:scale-95"
                >
                    <div className="w-16 h-16 mb-4 transform group-hover:scale-110 transition-transform duration-500 shadow-md rounded-full overflow-hidden ring-4 ring-slate-50">
                        <FlagRU />
                    </div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Русский</p>
                </button>

                <button 
                    onClick={() => onSelect('tg')}
                    className="group bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 transition-all duration-500 flex flex-col items-center hover:border-blue-200 hover:shadow-xl hover:bg-white active:scale-95"
                >
                    <div className="w-16 h-16 mb-4 transform group-hover:scale-110 transition-transform duration-500 shadow-md rounded-full overflow-hidden ring-4 ring-slate-50">
                        <FlagTG />
                    </div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Тоҷикӣ</p>
                </button>
            </div>
        </div>
    );
};

export const RegisterScreen = ({ onRegisterSuccess, onAdminLogin, lang, setLang }: { onRegisterSuccess: (isNewUser: boolean) => Promise<void>, onAdminLogin: () => void, lang: Language, setLang: (l: Language) => void }) => {
    const [mode, setMode] = useState<'register' | 'login'>('register');
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCityOpen, setIsCityOpen] = useState(false);
    
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminPass, setAdminPass] = useState('');
    const [adminError, setAdminError] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);
    const T = t[lang];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCityOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (phone.length < 9) {
            setError(lang === 'ru' ? 'Номер телефона должен быть не менее 9 цифр' : 'Рақами телефон бояд на камтар аз 9 рақам бошад');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'register') {
                if (!name || !city || !phone || !password) throw new Error(T.fillAll);
                await backend.registerUser(name, city, phone, password);
                await onRegisterSuccess(true);
            } else {
                if (!phone || !password) throw new Error(T.enterCreds);
                await backend.loginUser(phone, password);
                await onRegisterSuccess(false);
            }
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    };

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError('');
        if (adminPass === 'Belinda2025') {
            localStorage.setItem('lambrotin_admin_active', 'true');
            onAdminLogin();
        } else {
            setAdminError('Неверный пароль администратора');
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <LungsLoader size={160} progress={50} lang={lang} />
            </div>
        );
    }

    return (
        <div className="w-full min-h-full bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6 antialiased overflow-y-auto">
            <div className="w-full max-w-md bg-white rounded-[40px] md:rounded-[56px] p-8 md:p-10 shadow-2xl shadow-slate-200 border border-slate-100 animate-fade-in flex flex-col items-center relative overflow-y-auto max-h-[95vh] custom-scrollbar mb-4">
                
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

                <div className="flex flex-col items-center mb-6 z-10 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                        <BoltIcon className="w-10 h-10 text-blue-500 fill-current drop-shadow-sm" />
                        <h1 className="text-4xl font-black italic uppercase text-slate-800 tracking-tighter leading-none">
                            ЛАМБРОТИН
                        </h1>
                    </div>
                    <p className="text-[13px] font-black text-slate-400 tracking-wider ml-10">Stack Challenge</p>
                </div>

                <div className="mb-6 flex bg-slate-100/50 p-1.5 rounded-full border border-slate-100 shadow-sm z-10 shrink-0 gap-1">
                    <button 
                        onClick={() => setLang('ru')} 
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black transition-all ${lang === 'ru' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        <div className="w-4 h-4 rounded-full overflow-hidden shadow-sm"><FlagRU /></div>
                        RU
                    </button>
                    <button 
                        onClick={() => setLang('tg')} 
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black transition-all ${lang === 'tg' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        <div className="w-4 h-4 rounded-full overflow-hidden shadow-sm"><FlagTG /></div>
                        TJ
                    </button>
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 w-full border border-slate-100 shadow-inner z-10 shrink-0">
                    <button 
                        onClick={() => { setMode('register'); setError(''); }}
                        className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${mode === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        {T.newPlayer}
                    </button>
                    <button 
                        onClick={() => { setMode('login'); setError(''); }}
                        className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        {T.existingPlayer}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 w-full z-10">
                    {mode === 'register' && (
                        <>
                            <input 
                                type="text" 
                                placeholder={T.namePlaceholder}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm"
                            />
                            
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsCityOpen(!isCityOpen)}
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold text-left flex justify-between items-center transition-all focus:border-blue-400 shadow-sm"
                                >
                                    <span className={city ? 'text-slate-700' : 'text-slate-300'}>
                                        {city || T.cityPlaceholder}
                                    </span>
                                    <ChevronIcon className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isCityOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isCityOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-fade-in max-h-60 overflow-y-auto custom-scrollbar">
                                        {CITIES.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => {
                                                    setCity(c);
                                                    setIsCityOpen(false);
                                                }}
                                                className={`w-full px-5 py-3 text-left text-sm font-black transition-colors ${city === c ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <input 
                        type="tel" 
                        placeholder={T.phonePlaceholder}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm"
                    />
                    <input 
                        type="password" 
                        placeholder={T.passPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm"
                    />

                    {error && (
                        <div className="text-center text-[12px] font-black text-red-500 py-3 px-4 bg-red-50 rounded-xl animate-fade-in border border-red-100">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all mt-4 uppercase tracking-wider"
                    >
                        {mode === 'register' ? T.registerBtn : T.loginBtn}
                    </button>
                </form>

                <a 
                    href="https://t.me/+992555501105" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-4 mt-6 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-100 hover:bg-slate-100 transition-all active:scale-98 z-10"
                >
                    <MessageIcon className="w-4 h-4 text-blue-500" />
                    {T.supportService}
                </a>
            </div>

            <button 
                onClick={() => setShowAdminModal(true)}
                className="text-[10px] font-black text-slate-300 hover:text-slate-500 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group pb-6"
            >
                <LockIcon className="w-3 h-3 group-hover:text-blue-400 transition-colors" />
                Вход для персонала
            </button>

            {showAdminModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 animate-fade-in">
                    <div className="bg-white w-full max-sm p-10 rounded-[48px] shadow-2xl relative border border-slate-100">
                        <button onClick={() => setShowAdminModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 text-3xl font-light">&times;</button>
                        
                        <div className="w-16 h-16 bg-slate-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <LockIcon className="w-7 h-7" />
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-800 uppercase italic text-center mb-8 tracking-tight">Панель управления</h3>
                        
                        <form onSubmit={handleAdminSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Введите пароль доступа</label>
                                <input 
                                    autoFocus
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center text-sm font-black tracking-widest text-slate-800 outline-none focus:border-blue-400 transition-all shadow-inner"
                                    placeholder="••••••••"
                                    value={adminPass}
                                    onChange={(e) => setAdminPass(e.target.value)}
                                />
                                {adminError && (
                                    <p className="text-[10px] font-black text-red-500 mt-3 text-center animate-bounce">{adminError}</p>
                                )}
                            </div>
                            
                            <button 
                                type="submit"
                                className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-900 transition active:scale-95"
                            >
                                Войти в систему
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export const PurchaseRulesScreen = ({ lang, userId, onClose, onPlayCode, forceShowUpload }: { lang: Language, userId: string, onClose: () => void, onPlayCode: (code: string) => void, forceShowUpload?: boolean }) => {
    const T = t[lang];
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [orderPhone, setOrderPhone] = useState('');

    useEffect(() => {
        backend.getOrderPhone().then(setOrderPhone);
    }, []);

    const TIERS = [
        { amount: 5000, codes: 1, tier: 'BRONZE' as PrizeTier },
        { amount: 10000, codes: 3, tier: 'BRONZE' as PrizeTier },
        { amount: 20000, codes: 7, tier: 'SILVER' as PrizeTier },
        { amount: 40000, codes: 16, tier: 'GOLD' as PrizeTier },
        { amount: 100000, codes: 40, tier: 'DIAMOND' as PrizeTier },
    ];

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
        setUploadProgress(0);

        const progInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 92) {
                    return 92;
                }
                const rem = 95 - prev;
                return prev + (rem * 0.15 * Math.random());
            });
        }, 120);

        try {
            await backend.uploadCodeRequest(userId, selectedFile);
            clearInterval(progInterval);
            setUploadProgress(100);
            setTimeout(() => {
                setUploadSuccess(true);
                setSelectedFile(null);
                setPreviewUrl(null);
                setLoading(false);
            }, 600);
        } catch (e: any) {
            clearInterval(progInterval);
            alert(e.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 md:p-6" onClick={onClose}>
            <div className="bg-white w-full max-w-lg p-8 md:p-10 rounded-[48px] shadow-2xl relative border border-slate-100 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 text-3xl font-light transition">&times;</button>
                
                {loading ? (
                    <div className="py-20 flex items-center justify-center">
                        <LungsLoader size={120} progress={uploadProgress} lang={lang} />
                    </div>
                ) : uploadSuccess ? (
                    <div className="text-center py-8 space-y-6">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={5} className="w-8 h-8"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 uppercase italic">Заявка отправлена</h4>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tight">{T.waitMsg}</p>
                        <button onClick={onClose} className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg">Понятно</button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                <DocumentIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic text-center tracking-tight leading-none">{T.purchaseRulesTitle}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{T.purchaseRulesSubtitle}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                {TIERS.map((tier, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{T.amountFrom}</div>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${
                                                    tier.tier === 'DIAMOND' ? 'bg-blue-500 text-white' :
                                                    tier.tier === 'GOLD' ? 'bg-yellow-50 text-white' :
                                                    tier.tier === 'SILVER' ? 'bg-slate-400 text-white' :
                                                    tier.tier === 'BRONZE' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                    {T[`tier${tier.tier.charAt(0) + tier.tier.slice(1).toLowerCase() as keyof typeof T}` as keyof typeof T]}
                                                </span>
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

                            <div className="flex flex-col gap-3">
                                <a href={`tel:${orderPhone}`} className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl shadow-xl uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all">
                                    <BoltIcon /> {T.orderBtn}
                                </a>
                            </div>

                            <div className="pt-6 border-t border-slate-50 text-center">
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4 italic">{T.uploadInvoice}</h4>
                                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                
                                {previewUrl ? (
                                    <div className="relative inline-block mb-4">
                                        <img src={previewUrl} className="max-h-40 rounded-xl shadow-lg border border-slate-50" alt="Preview" />
                                        <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white font-black">&times;</button>
                                    </div>
                                ) : (
                                    <div 
                                        className="flex items-center gap-4 py-4 px-5 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 cursor-pointer group mb-4 transition-all hover:bg-blue-50"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="w-10 h-10 bg-white text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-sm"><CameraIcon /></div>
                                        <div className="text-left"><p className="text-[11px] text-slate-500 font-black leading-normal uppercase tracking-tight">{T.uploadDesc}</p></div>
                                    </div>
                                )}

                                {selectedFile && (
                                    <button 
                                        onClick={handleUpload} 
                                        className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all"
                                    >
                                        {T.sendPhoto}
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
