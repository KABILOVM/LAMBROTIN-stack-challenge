
import React, { useState, useEffect, useRef } from 'react';
import { backend } from '../../services/mockBackend';
import { CITIES, Language, PromoCode, GameResult, CodeRequest } from '../../types';
import { MAX_TRIALS } from '../../constants';
import { t } from '../../translations';

const BoltIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
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
    const T = t[lang];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Скрытый вход для админа
        if (name.toLowerCase() === 'admin' && phone === '0000') {
            onAdminLogin();
            return;
        }

        setLoading(true);
        setError('');
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

    return (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center p-6 antialiased">
            <div className="w-full max-w-md bg-white rounded-[60px] p-10 shadow-2xl animate-fade-in flex flex-col items-center">
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter leading-none mb-2">{T.appTitle}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">{T.appSubtitle}</p>
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-[22px] mb-8 w-full border border-slate-100">
                    <button 
                        onClick={() => { setMode('register'); setError(''); }}
                        className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-white text-slate-800 shadow-md scale-[1.02]' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                        {T.newPlayer}
                    </button>
                    <button 
                        onClick={() => { setMode('login'); setError(''); }}
                        className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-slate-800 shadow-md scale-[1.02]' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                        {T.existingPlayer}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                    {mode === 'register' && (
                        <>
                            <input 
                                type="text" 
                                placeholder={T.namePlaceholder}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-200 transition-all"
                            />
                            <div className="relative">
                                <select 
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-400 outline-none focus:border-blue-200 transition-all appearance-none"
                                >
                                    <option value="">{T.cityPlaceholder}</option>
                                    {CITIES.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                </div>
                            </div>
                        </>
                    )}
                    <input 
                        type="tel" 
                        placeholder={T.phonePlaceholder}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-200 transition-all"
                    />
                    <input 
                        type="password" 
                        placeholder={T.passPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-200 transition-all"
                    />

                    {error && <div className="text-center text-[10px] font-black uppercase text-red-500 tracking-wider py-2">{error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-blue-600 text-white rounded-[30px] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mt-4"
                    >
                        {loading ? T.loading : (mode === 'register' ? T.registerBtn : T.loginBtn)}
                    </button>
                </form>

                <div className="mt-12 flex bg-slate-50 p-1 rounded-full border border-slate-100 shadow-inner">
                    <button onClick={() => setLang('ru')} className={`px-5 py-2 rounded-full text-[9px] font-black transition-all ${lang === 'ru' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-300'}`}>RU</button>
                    <button onClick={() => setLang('tg')} className={`px-5 py-2 rounded-full text-[9px] font-black transition-all ${lang === 'tg' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-300'}`}>TJ</button>
                </div>
            </div>
        </div>
    );
};

export const PurchaseRulesScreen = ({ onClose, lang, userId, onPlayCode, forceShowUpload = false }: { onClose: () => void, lang: Language, userId: string, onPlayCode: (code: string) => void, forceShowUpload?: boolean }) => {
  const [showUpload, setShowUpload] = useState(forceShowUpload);
  const [userRequests, setUserRequests] = useState<CodeRequest[]>([]);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const T = t[lang];

  useEffect(() => {
    backend.getUserRequestHistory(userId).then(setUserRequests);
  }, [userId, uploadSuccess]);

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
      setUploadLoading(true);
      try {
          await backend.uploadCodeRequest(userId, selectedFile);
          setUploadSuccess(true);
          setSelectedFile(null);
          setPreviewUrl(null);
      } catch (e: any) {
          alert("Ошибка: " + e.message);
      } finally {
          setUploadLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-lg p-8 md:p-12 rounded-[60px] shadow-2xl animate-fade-in relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 shrink-0">
            <div className="flex items-center gap-3">
                <BoltIcon className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-black italic uppercase text-slate-800 tracking-tight leading-none">
                    {T.purchaseRulesTitle}
                </h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 hover:bg-slate-100 transition text-2xl">&times;</button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-8">
            
            {/* Upload Box (As in Screenshot) */}
            {!uploadSuccess && (
                <div className="space-y-6">
                    <div className="text-center p-8 bg-white rounded-[40px] border-2 border-dashed border-slate-100 relative group transition-all hover:border-blue-200">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        {previewUrl ? (
                            <div className="relative">
                                <img src={previewUrl} className="max-h-56 mx-auto rounded-3xl shadow-lg" alt="Preview" />
                                <button 
                                    onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-xl border-4 border-white"
                                >
                                    &times;
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shadow-inner">
                                    <CameraIcon />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-slate-700 uppercase tracking-wider text-xs">ЗАГРУЗИТЬ НАКЛАДНУЮ</h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                                        Сфотографируйте накладную с подписью. Фото будет сжато автоматически.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-5">
                        <button 
                            onClick={handleUpload}
                            disabled={!selectedFile || uploadLoading}
                            className={`w-full py-5 rounded-[30px] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl active:scale-95 disabled:opacity-50 ${selectedFile ? 'bg-slate-800 text-white' : 'bg-slate-300 text-white shadow-none'}`}
                        >
                            {uploadLoading ? T.loading : 'ОТПРАВИТЬ НА ПРОВЕРКУ'}
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-slate-600 transition"
                        >
                            ОТМЕНА
                        </button>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
                <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} className="w-10 h-10"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase italic mb-2">{T.reqAccepted}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-8">{T.waitMsg}</p>
                    <button 
                        onClick={() => { setUploadSuccess(false); onClose(); }}
                        className="w-full py-5 bg-slate-100 text-slate-500 font-black rounded-[30px] uppercase tracking-widest text-[10px] hover:bg-slate-200"
                    >
                        {T.ok}
                    </button>
                </div>
            )}

            {/* Compact Request History */}
            {userRequests.length > 0 && (
                <div className="pt-6 border-t border-slate-50">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 pl-1">ИСТОРИЯ ЗАЯВОК</h4>
                    <div className="space-y-2">
                        {userRequests.map((req) => (
                            <div key={req.id} className="bg-slate-50 p-3 rounded-[20px] flex items-center justify-between border border-transparent hover:border-slate-100 transition">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer"
                                        onClick={() => setFullScreenImage(req.photoData)}
                                    >
                                        <img src={req.photoData} alt="Invoice" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{new Date(req.createdAt).toLocaleDateString()}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {req.status === 'approved' && req.codesIssued && (
                                        <span className="text-[9px] font-black text-green-600 tracking-tighter">+{req.codesIssued} КОД</span>
                                    )}
                                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                        req.status === 'pending' ? 'bg-orange-100 text-orange-500' :
                                        req.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                        'bg-red-100 text-red-500'
                                    }`}>
                                        {req.status === 'pending' ? 'ЖДЁТ' : 
                                         req.status === 'approved' ? 'ДА' : 'НЕТ'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Image Fullscreen Overlay */}
        {fullScreenImage && (
            <div 
                className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6 cursor-zoom-out animate-fade-in"
                onClick={() => setFullScreenImage(null)}
            >
                <img src={fullScreenImage} className="max-w-full max-h-full object-contain rounded-3xl" alt="Fullscreen" />
                <button 
                    onClick={() => setFullScreenImage(null)}
                    className="absolute top-8 right-8 text-white bg-white/20 hover:bg-white/40 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-md transition text-2xl"
                >
                    &times;
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
