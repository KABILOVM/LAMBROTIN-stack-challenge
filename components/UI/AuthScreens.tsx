import React, { useState, useEffect, useRef } from 'react';
import { backend } from '../../services/mockBackend.ts';
import { CITIES, Language, CodeRequest } from '../../types.ts';
import { t } from '../../translations.ts';

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const MessageIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);

const ChevronIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const LockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z" />
    </svg>
);

export const RegisterScreen = ({ onRegisterSuccess, onAdminLogin, lang, setLang }: { onRegisterSuccess: (isNewUser: boolean) => Promise<void>, onAdminLogin: () => void, lang: Language, setLang: (l: Language) => void }) => {
    const [mode, setMode] = useState<'register' | 'login'>('register');
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCityOpen, setIsCityOpen] = useState(false);
    
    // Admin Login States
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
        } finally {
            setLoading(false);
        }
    };

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError('');
        if (adminPass === 'Belinda2025') {
            onAdminLogin();
        } else {
            setAdminError('Неверный пароль администратора');
        }
    };

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
                    <p className="text-[13px] font-medium text-slate-400 tracking-wider ml-10">Stack Challenge</p>
                </div>

                <div className="mb-6 flex bg-slate-100/50 p-1 rounded-full border border-slate-100 shadow-sm z-10 shrink-0">
                    <button onClick={() => setLang('ru')} className={`px-6 py-2 rounded-full text-[11px] font-bold transition-all ${lang === 'ru' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>RU</button>
                    <button onClick={() => setLang('tg')} className={`px-6 py-2 rounded-full text-[11px] font-bold transition-all ${lang === 'tg' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>TJ</button>
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 w-full border border-slate-100 shadow-inner z-10 shrink-0">
                    <button 
                        onClick={() => { setMode('register'); setError(''); }}
                        className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${mode === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        {T.newPlayer}
                    </button>
                    <button 
                        onClick={() => { setMode('login'); setError(''); }}
                        className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
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
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm"
                            />
                            
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsCityOpen(!isCityOpen)}
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-medium text-left flex justify-between items-center transition-all focus:border-blue-400 shadow-sm"
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
                                                className={`w-full px-5 py-3 text-left text-sm font-medium transition-colors ${city === c ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
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
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm"
                    />
                    <input 
                        type="password" 
                        placeholder={T.passPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm"
                    />

                    {error && (
                        <div className="text-center text-[12px] font-semibold text-red-500 py-3 px-4 bg-red-50 rounded-xl animate-fade-in border border-red-100">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? T.loading : (mode === 'register' ? T.registerBtn : T.loginBtn)}
                    </button>
                </form>

                <a 
                    href="https://t.me/+992555501105" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-4 mt-6 bg-slate-50 text-slate-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-100 hover:bg-slate-100 transition-all active:scale-[0.98] z-10"
                >
                    <MessageIcon className="w-4 h-4 text-blue-500" />
                    {T.supportService}
                </a>
            </div>

            <button 
                onClick={() => setShowAdminModal(true)}
                className="text-[10px] font-bold text-slate-300 hover:text-slate-500 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group pb-6"
            >
                <LockIcon className="w-3 h-3 group-hover:text-blue-400 transition-colors" />
                Вход для персонала
            </button>

            {showAdminModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-sm p-10 rounded-[48px] shadow-2xl relative border border-slate-100">
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
                                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center text-sm font-bold tracking-widest text-slate-800 outline-none focus:border-blue-400 transition-all shadow-inner"
                                    placeholder="••••••••"
                                    value={adminPass}
                                    onChange={(e) => setAdminPass(e.target.value)}
                                />
                                {adminError && (
                                    <p className="text-[10px] font-bold text-red-500 mt-3 text-center animate-bounce">{adminError}</p>
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

export const PurchaseRulesScreen = ({ onClose, lang, userId, forceShowUpload = false }: { onClose: () => void, lang: Language, userId: string, onPlayCode: (code: string) => void, forceShowUpload?: boolean }) => {
  const [userRequests, setUserRequests] = useState<CodeRequest[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const T = t[lang];

  useEffect(() => {
    backend.getUserRequestHistory(userId).then(setUserRequests);
  }, [userId, uploadSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const newFiles = Array.from(e.target.files) as File[];
          setSelectedFiles(prev => [...prev, ...newFiles]);
          
          newFiles.forEach(file => {
              const reader = new FileReader();
              reader.onload = (event) => setPreviewUrls(prev => [...prev, event.target?.result as string]);
              reader.readAsDataURL(file);
          });
      }
  };

  const removeFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
      if (selectedFiles.length === 0) return;
      setUploadLoading(true);
      try {
          for (const file of selectedFiles) {
              await backend.uploadCodeRequest(userId, file);
          }
          setUploadSuccess(true);
          setSelectedFiles([]);
          setPreviewUrls([]);
      } catch (e: any) {
          alert("Ошибка: " + e.message);
      } finally {
          setUploadLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 antialiased">
      <div className="bg-white w-full max-w-lg p-8 rounded-[40px] shadow-2xl animate-fade-in relative flex flex-col max-h-[90vh] border border-slate-100">
        
        <div className="flex justify-between items-center mb-8 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                    <BoltIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                    {T.purchaseRulesTitle}
                </h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition text-2xl font-light">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-8">
            {!uploadSuccess && (
                <div className="space-y-6">
                    <div className="text-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 relative group transition-all hover:border-blue-300">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple 
                        />
                        
                        {previewUrls.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group/item">
                                        <img src={url} className="w-full aspect-square object-cover rounded-2xl shadow-sm border border-white" alt={`Preview ${index}`} />
                                        <button 
                                            onClick={() => removeFile(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 hover:border-blue-400 hover:text-blue-500 transition-colors bg-white"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-6 h-6"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                    <span className="text-[11px] font-bold mt-2">Еще фото</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-5 py-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-16 h-16 bg-white text-blue-500 rounded-3xl flex items-center justify-center shadow-sm">
                                    <CameraIcon />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-slate-700">Загрузить накладную</h3>
                                    <p className="text-[12px] text-slate-400 font-medium max-w-[240px] mx-auto leading-relaxed">
                                        {T.uploadDesc}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={handleUpload}
                            disabled={selectedFiles.length === 0 || uploadLoading}
                            className={`w-full py-4.5 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 ${selectedFiles.length > 0 ? 'bg-slate-800 text-white shadow-slate-200' : 'bg-slate-200 text-slate-400 shadow-none'}`}
                        >
                            {uploadLoading ? T.loading : T.sendPhoto}
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="text-slate-400 font-bold text-xs hover:text-slate-600 transition py-2"
                        >
                            {T.cancel}
                        </button>
                    </div>
                </div>
            )}

            {uploadSuccess && (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} className="w-10 h-10"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{T.reqAccepted}</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">{T.waitMsg}</p>
                    <button 
                        onClick={() => { setUploadSuccess(false); onClose(); }}
                        className="w-full py-4.5 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl text-sm hover:bg-slate-200 transition"
                    >
                        {T.ok}
                    </button>
                </div>
            )}

            {userRequests.length > 0 && (
                <div className="pt-8 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-5 pl-1">{T.requestHistoryTitle}</h4>
                    <div className="space-y-3">
                        {userRequests.map((req) => (
                            <div key={req.id} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100 hover:bg-white transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer transition-transform group-hover:scale-105"
                                        onClick={() => setFullScreenImage(req.photoData)}
                                    >
                                        <img src={req.photoData} alt="Invoice" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-700">{new Date(req.createdAt).toLocaleDateString()}</div>
                                        <div className="text-[11px] font-medium text-slate-400">{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {req.status === 'approved' && req.codesIssued && (
                                        <span className="text-[11px] font-bold text-green-600">+{req.codesIssued} код</span>
                                    )}
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                                        req.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                        req.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                        'bg-red-100 text-red-600'
                                    }`}>
                                        {req.status === 'pending' ? T.pending : 
                                         req.status === 'approved' ? T.statusApproved : T.statusRejected}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

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
  );
};
