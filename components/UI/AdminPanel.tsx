
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { backend, compressImage } from '../../services/mockBackend';
import { PromoCode, GameResult, User, PrizeConfig, CodeRequest, PrizeTier } from '../../types';
import { t } from '../../translations';
import { PrizeIcon } from './PrizeIcons';
import Cropper from 'https://esm.sh/react-easy-crop@5.2.0?deps=react@18.2.0,react-dom@18.2.0';

interface AdminPanelProps {
  onBack: () => void;
  onTestGame: () => void;
}

type Tab = 'dashboard' | 'requests_check' | 'requests' | 'codes' | 'prizes' | 'settings';

const PRIZE_ICONS = ['card', 'headphones', 'tv', 'watch', 'coffee', 'speaker', 'air', 'phone', 'tablet', 'bike', 'ac', 'vacuum', 'oven', 'trip'];
const TIER_LIST: PrizeTier[] = ['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];

const formatKb = (kb: number) => {
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
};

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (error) => reject(error));
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return canvas.toDataURL('image/jpeg', 0.8);
}

const CropperModal = ({ src, onCancel, onApply }: { src: string, onCancel: () => void, onApply: (croppedBase64: string) => void }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const onCropComplete = useCallback((_: any, pixels: any) => setCroppedAreaPixels(pixels), []);

    return (
        <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 sm:p-10">
            <div className="w-full max-w-2xl bg-white rounded-[40px] overflow-hidden flex flex-col h-full max-h-[80vh] shadow-2xl">
                <div className="relative flex-1 bg-slate-100">
                    <Cropper image={src} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                </div>
                <div className="p-8 space-y-6 bg-white border-t border-slate-50">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Зум</span>
                        <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-blue-600 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition">Отмена</button>
                        <button onClick={async () => { if (croppedAreaPixels) { const cropped = await getCroppedImg(src, croppedAreaPixels); onApply(cropped); } }} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition">Применить</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminTierIcon = ({ tier, active }: { tier: PrizeTier, active: boolean }) => {
    const className = `w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`;
    switch(tier) {
        case 'BASIC': return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12" /></svg>;
        case 'BRONZE': return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M8 12h8" /></svg>;
        case 'SILVER': return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
        case 'GOLD': return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06-.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
        case 'DIAMOND': return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 3h12l4 6-10 13L2 9Z" /></svg>;
        default: return null;
    }
}

export const AdminPanel = ({ onBack, onTestGame }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [requestsList, setRequestsList] = useState<CodeRequest[]>([]);
  const [requestFilter, setRequestFilter] = useState<'pending' | 'all'>('pending');
  const [viewingRequest, setViewingRequest] = useState<CodeRequest | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const [processForm, setProcessForm] = useState({ qty: '1', invoice: '', amount: '', comment: '', tier: 'BASIC' as PrizeTier });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userResults, setUserResults] = useState<GameResult[]>([]);
  const [userCodes, setUserCodes] = useState<PromoCode[]>([]);
  const [editingPrize, setEditingPrize] = useState<PrizeConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderPhone, setOrderPhone] = useState('');
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const T = t.ru;

  const loadRequests = async (filter: 'pending' | 'all') => {
      try {
          const reqs = await backend.getCodeRequests(filter);
          setRequestsList(reqs);
      } catch(e) {}
  };

  const loadInitialStats = async () => {
    setLoading(true);
    try {
        const adminStats = await backend.getAdminStats();
        setStats(adminStats);
        setUsers(adminStats.users);
        setPrizes(adminStats.prizesConfig);
        setCodes(adminStats.allCodes);
        const phone = await backend.getOrderPhone();
        setOrderPhone(phone);
        if (activeTab === 'requests_check') await loadRequests(requestFilter);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { loadInitialStats(); }, []);
  useEffect(() => { if (activeTab === 'requests_check') loadRequests(requestFilter); }, [requestFilter, activeTab]);

  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    const results = await backend.getUserResults(user.id);
    setUserResults(results);
    const uCodes = await backend.getUserCodes(user.id);
    setUserCodes(uCodes);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Вы уверены, что хотите навсегда удалить этого пользователя? Все его игры и коды будут стерты.")) return;
    setLoading(true);
    try {
      await backend.deleteUser(userId);
      setSelectedUser(null);
      await loadInitialStats();
    } catch (e: any) {
      alert("Ошибка при удалении: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (action: 'approve' | 'reject') => {
      if (!viewingRequest) return;
      setLoading(true);
      try {
          await backend.processCodeRequest(viewingRequest.id, action, {
              qty: parseInt(processForm.qty),
              invoice: processForm.invoice,
              amount: parseFloat(processForm.amount),
              comment: processForm.comment,
              userId: viewingRequest.userId,
              tier: processForm.tier
          });
          setViewingRequest(null);
          await loadRequests(requestFilter);
          await loadInitialStats(); 
      } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm));
  }, [users, searchTerm]);

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col antialiased">
      <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center shadow-sm z-50">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl transition">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-xl font-black text-slate-800 uppercase italic">Панель управления</h2>
          </div>
          <button onClick={onTestGame} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 transition hover:bg-blue-700">Тест игры</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
          <div className="w-20 sm:w-64 bg-white border-r border-slate-100 flex flex-col p-4 gap-2">
              {(['dashboard', 'requests_check', 'codes', 'prizes', 'settings'] as Tab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === tab ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                      <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">{tab === 'dashboard' ? 'Пользователи' : tab === 'requests_check' ? 'Заявки' : tab === 'codes' ? 'Коды' : tab === 'prizes' ? 'Призы' : 'Настройки'}</span>
                  </button>
              ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
              {activeTab === 'dashboard' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          <input type="text" placeholder="Поиск по имени или телефону..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300" />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          {filteredUsers.map(u => (
                              <div key={u.id} onClick={() => handleUserClick(u)} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">{u.name.charAt(0)}</div>
                                      <div>
                                          <div className="text-sm font-black text-slate-800">{u.name}</div>
                                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.phone} • {u.city}</div>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{u.maxPurchaseTier}</span>
                                      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'requests_check' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="flex gap-2">
                          {(['pending', 'all'] as const).map(f => (
                              <button key={f} onClick={() => setRequestFilter(f)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${requestFilter === f ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                  {f === 'pending' ? 'Ожидают' : 'Все'}
                              </button>
                          ))}
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          {requestsList.map(req => (
                              <div key={req.id} onClick={async () => {
                                  setViewingRequest(req);
                                  const photo = await backend.getRequestPhoto(req.id);
                                  setViewingPhoto(photo);
                              }} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-200 transition">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                                      <div>
                                          <div className="text-sm font-black text-slate-800">Заявка #{req.id.slice(-6)}</div>
                                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</div>
                                      </div>
                                  </div>
                                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{req.status}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 overflow-y-auto">
              <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh]">
                  <button onClick={() => setSelectedUser(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 text-3xl font-light transition">&times;</button>
                  <div className="p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
                      <div className="flex items-center gap-6 pb-10 border-b border-slate-50 justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-slate-800 text-white rounded-[28px] flex items-center justify-center text-2xl font-black">{selectedUser.name.charAt(0)}</div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 italic uppercase">{selectedUser.name}</h3>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">{selectedUser.phone} • {selectedUser.city}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteUser(selectedUser.id)}
                            className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition"
                          >
                            Удалить пользователя
                          </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-6">
                              <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">История игр</h4>
                              {userResults.length === 0 ? <p className="text-slate-300 font-black text-xs italic uppercase">Игр пока нет</p> : (
                                  <div className="space-y-3">
                                      {userResults.map(r => (
                                          <div key={r.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                              <div>
                                                  <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{new Date(r.playedAt).toLocaleString()}</div>
                                                  <div className="text-xl font-black text-slate-800">{r.score} <span className="text-[10px] uppercase text-slate-300 ml-1">очков</span></div>
                                              </div>
                                              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${r.codeUsed === 'TRIAL' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{r.codeUsed}</span>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                          <div className="space-y-6">
                              <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Выданные коды</h4>
                              {userCodes.length === 0 ? <p className="text-slate-300 font-black text-xs italic uppercase">Кодов нет</p> : (
                                  <div className="space-y-3">
                                      {userCodes.map(c => (
                                          <div key={c.code} className={`p-5 rounded-2xl border flex justify-between items-center ${c.isUsed ? 'bg-slate-50 border-slate-100 grayscale opacity-60' : 'bg-white border-blue-100'}`}>
                                              <div>
                                                  <div className="font-mono font-black text-lg text-slate-800">{c.code}</div>
                                                  {c.invoiceNumber && <div className="text-[9px] font-black text-slate-400 uppercase mt-1">Накладная: {c.invoiceNumber}</div>}
                                              </div>
                                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${c.isUsed ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>{c.isUsed ? 'Использован' : 'Активен'}</span>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {viewingRequest && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 overflow-y-auto">
              <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl relative border border-slate-100 flex flex-col md:flex-row max-h-[90vh]">
                  <button onClick={() => setViewingRequest(null)} className="absolute top-8 right-8 z-10 text-slate-400 hover:text-slate-600 text-3xl font-light transition">&times;</button>
                  <div className="flex-1 bg-slate-100 relative min-h-[400px]">
                      {viewingPhoto ? <img src={viewingPhoto} className="w-full h-full object-contain" /> : <div className="flex items-center justify-center h-full text-slate-300">Загрузка фото...</div>}
                  </div>
                  <div className="w-full md:w-[400px] p-10 flex flex-col gap-8 bg-white overflow-y-auto custom-scrollbar">
                      <div>
                          <h3 className="text-xl font-black text-slate-800 italic uppercase">Обработка заявки</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">ID: {viewingRequest.id}</p>
                      </div>
                      <div className="space-y-4">
                          <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Номер накладной</label><input type="text" value={processForm.invoice} onChange={e => setProcessForm({...processForm, invoice: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black" /></div>
                          <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Сумма (сомони)</label><input type="number" value={processForm.amount} onChange={e => setProcessForm({...processForm, amount: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black" /></div>
                          <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Количество кодов</label><input type="number" value={processForm.qty} onChange={e => setProcessForm({...processForm, qty: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black" /></div>
                          <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Уровень закупки</label>
                              <div className="grid grid-cols-3 gap-2">
                                  {TIER_LIST.map(t => (
                                      <button key={t} onClick={() => setProcessForm({...processForm, tier: t})} className={`p-2 rounded-lg text-[8px] font-black transition-all ${processForm.tier === t ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>{t}</button>
                                  ))}
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-slate-50">
                          <button onClick={() => handleProcessRequest('reject')} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest transition hover:bg-red-50 hover:text-red-500">Отказать</button>
                          <button onClick={() => handleProcessRequest('approve')} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition">Одобрить</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
