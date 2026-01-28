
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { backend } from '../../services/mockBackend';
import { PromoCode, GameResult, User, PrizeConfig, CodeRequest } from '../../types';
import { t } from '../../translations';
import { PrizeIcon } from './PrizeIcons';

interface AdminPanelProps {
  onBack: () => void;
  onTestGame: () => void;
}

type Tab = 'dashboard' | 'requests_check' | 'requests' | 'codes' | 'prizes' | 'settings';

const PRIZE_ICONS = ['card', 'headphones', 'tv', 'watch', 'coffee', 'speaker', 'air', 'phone', 'tablet', 'bike', 'ac', 'vacuum', 'oven', 'trip'];

const formatKb = (kb: number) => {
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
};

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
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  
  const [processForm, setProcessForm] = useState({ qty: '1', invoice: '', amount: '', comment: '' });
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const [genCount, setGenCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // DELETION LOGIC (UNDO PATTERN)
  const [requestForConfirmation, setRequestForConfirmation] = useState<CodeRequest | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, number>>({});
  const deletionIntervals = useRef<Record<string, any>>({});

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userResults, setUserResults] = useState<GameResult[]>([]);
  const [userCodes, setUserCodes] = useState<PromoCode[]>([]);
  const [issueForm, setIssueForm] = useState({ invoice: '', amount: '', qty: '1' });

  const [editingPrize, setEditingPrize] = useState<PrizeConfig | null>(null);
  const [isNewPrize, setIsNewPrize] = useState(false);
  
  const [orderPhone, setOrderPhone] = useState('');

  const T = t.ru;

  const loadRequests = async (filter: 'pending' | 'all') => {
      setIsRequestsLoading(true);
      try {
          const reqs = await backend.getCodeRequests(filter);
          setRequestsList(reqs);
      } finally {
          setIsRequestsLoading(false);
      }
  };

  const loadInitialStats = async () => {
    setLoading(true);
    try {
        const adminStats = await backend.getAdminStats();
        setStats(adminStats);
        setUsers(adminStats.users);
        setPrizes(adminStats.prizesConfig);
        
        const sortedCodes = [...adminStats.allCodes].sort((a, b) => {
            if (a.isUsed !== b.isUsed) return a.isUsed ? 1 : -1;
            return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
        });
        setCodes(sortedCodes);

        const phone = await backend.getOrderPhone();
        setOrderPhone(phone);
        
        if (activeTab === 'requests_check') {
            await loadRequests(requestFilter);
        }
    } catch (e) {
        console.error("Error loading stats", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'requests_check') {
        loadRequests(requestFilter);
    }
  }, [requestFilter, activeTab]);

  const totalPhotosSizeKb = useMemo(() => {
      return requestsList.reduce((acc, req) => acc + (req.photoSizeKb || 0), 0);
  }, [requestsList]);

  const handleGenerate = async () => {
    setLoading(true);
    await backend.generateCodes(genCount);
    await loadInitialStats();
    setLoading(false);
  };

  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    const results = await backend.getUserResults(user.id);
    setUserResults(results);
    const uCodes = await backend.getUserUnusedCodes(user.id);
    setUserCodes(uCodes);
    setIssueForm({ invoice: '', amount: '', qty: '1' });
  };

  const handleViewRequest = async (req: CodeRequest) => {
      setViewingRequest(req);
      setViewingPhoto(null);
      setIsPhotoLoading(true);
      try {
          const photo = await backend.getRequestPhoto(req.id);
          setViewingPhoto(photo);
      } catch (e) {
          console.error("Error loading photo", e);
      } finally {
          setIsPhotoLoading(false);
      }
  };

  const handleIssueCodes = async () => {
    if (!selectedUser) return;
    if (!issueForm.invoice || !issueForm.amount || !issueForm.qty) {
        alert("Заполните все поля");
        return;
    }
    setLoading(true);
    try {
        await backend.issueCodesToUser(
            selectedUser.id, 
            parseInt(issueForm.qty), 
            issueForm.invoice, 
            parseFloat(issueForm.amount)
        );
        alert(T.codeGenerated);
        const uCodes = await backend.getUserUnusedCodes(selectedUser.id);
        setUserCodes(uCodes);
        setIssueForm({ invoice: '', amount: '', qty: '1' });
        await loadInitialStats();
    } catch (e: any) {
        alert(e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleSavePrize = async () => {
      if (!editingPrize) return;
      setLoading(true);
      try {
          if (isNewPrize) {
              await backend.addPrize(editingPrize);
          } else {
              await backend.updatePrize(editingPrize);
          }
          setEditingPrize(null);
          await loadInitialStats();
      } catch (e) {
          alert("Ошибка при сохранении приза");
      } finally {
          setLoading(false);
      }
  };

  const handleDeletePrize = async (id: string) => {
      if(window.confirm('Вы уверены, что хотите удалить этот приз?')) {
          await backend.deletePrize(id);
          await loadInitialStats();
      }
  };

  const handleProcessRequest = async (action: 'approve' | 'reject') => {
      if (!viewingRequest) return;
      if (action === 'approve') {
          if (!processForm.qty || !processForm.invoice || !processForm.amount) {
              alert("Введите кол-во кодов, сумму и номер накладной");
              return;
          }
      } else {
          if (!processForm.comment) {
              alert("Укажите причину отказа");
              return;
          }
      }
      setLoading(true);
      try {
          await backend.processCodeRequest(viewingRequest.id, action, {
              qty: parseInt(processForm.qty),
              invoice: processForm.invoice,
              amount: parseFloat(processForm.amount),
              comment: processForm.comment,
              userId: viewingRequest.userId
          });
          setViewingRequest(null);
          setViewingPhoto(null);
          setProcessForm({ qty: '1', invoice: '', amount: '', comment: '' });
          await loadRequests(requestFilter);
          await loadInitialStats(); 
      } catch (e: any) {
          alert(e.message);
      } finally {
          setLoading(false);
      }
  };

  // --- UNDO DELETION LOGIC ---

  const initiateRequestDeletion = (req: CodeRequest) => {
      setRequestForConfirmation(req);
  };

  const confirmDeletionAndStartTimer = () => {
      if (!requestForConfirmation) return;
      const id = requestForConfirmation.id;
      
      setRequestForConfirmation(null);
      
      setPendingDeletions(prev => ({ ...prev, [id]: 5 }));
      
      deletionIntervals.current[id] = setInterval(() => {
          setPendingDeletions(prev => {
              const currentVal = prev[id];
              if (currentVal <= 1) {
                  clearInterval(deletionIntervals.current[id]);
                  performActualDeletion(id);
                  const next = { ...prev };
                  delete next[id];
                  return next;
              }
              return { ...prev, [id]: currentVal - 1 };
          });
      }, 1000);
  };

  const cancelUndoDeletion = (id: string) => {
      if (deletionIntervals.current[id]) {
          clearInterval(deletionIntervals.current[id]);
          delete deletionIntervals.current[id];
      }
      setPendingDeletions(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
      });
  };

  const performActualDeletion = async (id: string) => {
      try {
          await backend.deleteCodeRequest(id);
          setRequestsList(prev => prev.filter(r => r.id !== id));
          if (viewingRequest?.id === id) {
              setViewingRequest(null);
              setViewingPhoto(null);
          }
          const adminStats = await backend.getAdminStats();
          setStats(adminStats);
      } catch (e: any) {
          console.error("Deletion failed:", e.message);
      }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
        await backend.updateOrderPhone(orderPhone);
        alert("Настройки сохранены");
    } catch (e: any) {
        alert(e.message);
    } finally {
        setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
      const term = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(term) || u.phone.includes(term);
  });

  const TabButton = ({ id, label, count }: { id: Tab, label: string, count?: number }) => (
      <button 
          onClick={() => setActiveTab(id)}
          className={`px-6 py-3 rounded-[20px] font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === id 
              ? 'bg-slate-800 text-white shadow-lg' 
              : 'bg-white text-slate-400 hover:bg-slate-50'
          }`}
      >
          {label} {count !== undefined && <span className={`ml-2 px-1.5 py-0.5 rounded-md ${activeTab === id ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>{count}</span>}
      </button>
  );

  if (!stats && loading) return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Загрузка...</div>;

  return (
    <div className="w-full h-full bg-slate-50 overflow-hidden flex flex-col antialiased">
      {/* Top Bar */}
      <div className="p-8 pb-0 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h1 className="text-3xl font-thin text-slate-800 uppercase italic leading-none tracking-tight">{T.adminConsole}</h1>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-2">Панель управления</p>
        </div>
        <div className="flex gap-4">
            <button onClick={onTestGame} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold uppercase text-[9px] tracking-widest hover:bg-blue-700 transition">Тест игры</button>
            <button onClick={onBack} className="bg-slate-200 text-slate-500 px-6 py-3 rounded-2xl font-bold uppercase text-[9px] tracking-widest hover:bg-slate-300 transition">Выход</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 mt-8 max-w-7xl mx-auto w-full flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
         <TabButton id="dashboard" label={T.dashboard} />
         <TabButton id="requests_check" label={T.checkRequests} count={stats?.pendingRequests} />
         <TabButton id="requests" label={T.requests} count={stats?.deliveryRequests} />
         <TabButton id="codes" label={T.codes} count={codes.filter(c => !c.isUsed).length} />
         <TabButton id="prizes" label={T.prizesManage} count={prizes.length} />
         <TabButton id="settings" label="Настройки" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-8 pt-4">
        <div className="max-w-7xl mx-auto">
            
            {activeTab === 'dashboard' && stats && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Игроки', val: stats.totalUsers },
                            { label: 'Коды исп.', val: stats.usedCodes },
                            { label: 'Всего игр', val: stats.totalGames },
                            { label: 'Призы (выбр.)', val: Object.values(stats.prizesAwarded).reduce((a: any, b: any) => (a as any) + (b as any), 0) }
                        ].map((s, i) => (
                            <div key={i} className="bg-white p-8 rounded-[30px] shadow-sm border border-slate-100 text-center">
                                <div className="text-[9px] text-slate-300 font-bold uppercase mb-2 tracking-[0.2em]">{s.label}</div>
                                <div className={`text-4xl font-thin text-slate-800`}>{s.val}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-thin text-slate-800 uppercase italic">Все Пользователи</h2>
                            <input 
                                type="text" 
                                placeholder={T.searchUser}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs w-full md:w-64 outline-none focus:border-blue-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {['Имя', 'Телефон', 'Город', 'Дата'].map(h => (
                                            <th key={h} className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => handleUserClick(user)}>
                                            <td className="px-8 py-4 font-bold text-slate-700 text-xs">{user.name}</td>
                                            <td className="px-8 py-4 font-light text-slate-400 text-xs">{user.phone}</td>
                                            <td className="px-8 py-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">{user.city}</td>
                                            <td className="px-8 py-4 text-slate-300 text-[10px]">{new Date(user.registeredAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'requests_check' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setRequestFilter('pending')}
                                className={`px-6 py-2 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition ${requestFilter === 'pending' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                            >
                                Новые
                            </button>
                            <button 
                                onClick={() => setRequestFilter('all')}
                                className={`px-6 py-2 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition ${requestFilter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                            >
                                История (Все)
                            </button>
                        </div>
                        <div className="bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest shadow-xl">
                            ОБЩИЙ ОБЪЕМ ФОТО: <span className="text-blue-300 font-black">{formatKb(totalPhotosSizeKb)}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden min-h-[50vh] relative">
                        {isRequestsLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Игрок</th>
                                        <th className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Дата</th>
                                        <th className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Инфо</th>
                                        <th className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Статус</th>
                                        <th className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Действие</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {requestsList.map((req) => {
                                        const user = users.find(u => u.id === req.userId);
                                        const isPendingDelete = pendingDeletions[req.id] !== undefined;

                                        if (isPendingDelete) {
                                            return (
                                                <tr key={req.id} className="bg-red-50 transition-all animate-pulse">
                                                    <td colSpan={5} className="px-8 py-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-xs">
                                                                    {pendingDeletions[req.id]}
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">
                                                                    Заявка игрока {user?.name} будет удалена через {pendingDeletions[req.id]} сек.
                                                                </span>
                                                            </div>
                                                            <button 
                                                                onClick={() => cancelUndoDeletion(req.id)}
                                                                className="px-6 py-2 bg-white text-blue-600 border border-blue-100 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-sm hover:bg-blue-50 transition"
                                                            >
                                                                Отменить удаление
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/50 transition">
                                                <td className="px-8 py-4">
                                                    <div className="font-bold text-slate-800 text-xs">{user?.name || 'Загрузка...'}</div>
                                                    <div className="text-[10px] text-slate-400">{user?.phone}</div>
                                                </td>
                                                <td className="px-8 py-4 text-slate-400 text-[10px] font-mono">
                                                    {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </td>
                                                <td className="px-8 py-4 text-[10px] text-slate-500">
                                                    <div className="mb-1 flex items-center gap-1.5 opacity-60">
                                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M11.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                                                        {formatKb(req.photoSizeKb || 0)}
                                                    </div>
                                                    {req.invoiceNumber ? (
                                                        <div>
                                                            <div className="font-bold text-slate-700">{req.invoiceNumber}</div>
                                                            <div className="text-slate-400 font-mono">{req.purchaseAmount} смн</div>
                                                        </div>
                                                    ) : <span className="text-slate-200">нет данных</span>}
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                                                        req.status === 'pending' ? 'bg-orange-50 text-orange-500' :
                                                        req.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                                    }`}>
                                                        {req.status === 'pending' ? 'Ожидает' : 
                                                         req.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 flex gap-2">
                                                    <button onClick={() => handleViewRequest(req)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
                                                        {req.status === 'pending' ? 'Смотреть фото' : 'Детали'}
                                                    </button>
                                                    <button 
                                                        onClick={() => initiateRequestDeletion(req)} 
                                                        className="bg-red-50 text-red-500 px-5 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-red-100 transition"
                                                    >
                                                        {T.delete}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {!isRequestsLoading && requestsList.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                                                Нет заявок в этой категории
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'prizes' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-end">
                        <button onClick={() => { setIsNewPrize(true); setEditingPrize({ id: crypto.randomUUID(), title: '', description: '', icon: 'card', threshold: 50, isValuable: true, isOutOfStock: false }); }} className="bg-slate-800 text-white px-8 py-4 rounded-[20px] font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-900 transition active:scale-95">
                            {T.addPrize}
                        </button>
                    </div>
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {['Название', 'Очки', 'Тип', 'Статус', 'Действия'].map(h => (
                                            <th key={h} className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {prizes.sort((a,b) => a.threshold - b.threshold).map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-8 py-4">
                                                <div className="font-bold text-slate-800 text-xs">{p.title}</div>
                                                <div className="text-[10px] text-slate-400">{p.description}</div>
                                            </td>
                                            <td className="px-8 py-4 font-black text-blue-600 text-lg">{p.threshold}</td>
                                            <td className="px-8 py-4">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${p.isValuable ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {p.isValuable ? 'Ценный' : 'Базовый'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                {p.isOutOfStock ? <span className="text-red-400 font-bold uppercase text-[9px] tracking-widest">Нет в наличии</span> : <span className="text-emerald-500 font-bold uppercase text-[9px] tracking-widest">В наличии</span>}
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex gap-4">
                                                    <button onClick={() => { setIsNewPrize(false); setEditingPrize(p); }} className="text-blue-500 hover:text-blue-700 font-black text-[11px] uppercase tracking-widest">ИЗМ.</button>
                                                    <button onClick={() => handleDeletePrize(p.id)} className="text-red-400 hover:text-red-600 font-black text-[11px] uppercase tracking-widest">УД.</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'codes' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[35px] shadow-sm border border-slate-100">
                        <div className="flex-1 flex gap-4 items-center">
                            <div className="relative w-32">
                                <input type="number" value={genCount} onChange={(e) => setGenCount(Math.max(1, Number(e.target.value)))} className="w-full bg-slate-50 border border-slate-200 py-3 pl-4 pr-10 rounded-2xl font-bold text-slate-700 outline-none focus:border-slate-400 text-center" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">ШТ</span>
                            </div>
                            <button onClick={handleGenerate} disabled={loading} className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-900 transition active:scale-95 disabled:opacity-50"> {loading ? '...' : 'Генерировать'} </button>
                        </div>
                    </div>
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Код</th>
                                        <th className="px-6 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Статус</th>
                                        <th className="px-6 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Создан</th>
                                        <th className="px-6 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Кем использован</th>
                                        <th className="px-6 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Инфо</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {codes.map((c) => {
                                        const statusColor = c.isUsed ? 'bg-slate-100 text-slate-400' : (c.isIssued ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600');
                                        const statusLabel = c.isUsed ? 'Использован' : (c.isIssued ? 'Выдан' : 'Активен');
                                        return (
                                            <tr key={c.code} className="hover:bg-slate-50/50 transition">
                                                <td className="px-6 py-3 font-mono font-bold text-slate-700">{c.code}</td>
                                                <td className="px-6 py-3"> <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${statusColor}`}> {statusLabel} </span> </td>
                                                <td className="px-6 py-3 text-[10px] text-slate-400 font-mono"> {new Date(c.generatedAt).toLocaleDateString()} {new Date(c.generatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} </td>
                                                <td className="px-6 py-3 text-xs text-slate-500"> {c.assignedTo ? users.find(u => u.id === c.assignedTo)?.name || 'Unknown' : '-'} </td>
                                                <td className="px-6 py-3 text-[10px] text-slate-400"> {c.invoiceNumber ? `Накл: ${c.invoiceNumber} | ${c.purchaseAmount || 0} смн` : '-'} </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'settings' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 max-w-2xl">
                        <h2 className="text-xl font-thin text-slate-800 uppercase italic mb-8">Общие настройки приложения</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Номер телефона для заказа продукции</label>
                                <div className="flex gap-4">
                                    <input 
                                        type="tel" 
                                        placeholder="+992000000000"
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-300 transition-all"
                                        value={orderPhone}
                                        onChange={(e) => setOrderPhone(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleSaveSettings}
                                        disabled={loading}
                                        className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-900 transition active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? '...' : 'Сохранить'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Deletion Confirmation Modal */}
      {requestForConfirmation && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
              <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-2xl animate-fade-in text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 uppercase italic mb-2">Подтверждение</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
                      Вы уверены, что хотите удалить заявку игрока <span className="text-slate-800 font-bold">{users.find(u => u.id === requestForConfirmation.userId)?.name}</span>? После подтверждения у вас будет 5 секунд, чтобы отменить это действие.
                  </p>
                  <div className="flex flex-col gap-3">
                      <button onClick={confirmDeletionAndStartTimer} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition active:scale-95"> Подтвердить удаление </button>
                      <button onClick={() => setRequestForConfirmation(null)} className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition"> Отмена </button>
                  </div>
              </div>
          </div>
      )}

      {/* Prize Edit Modal */}
      {editingPrize && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/50 backdrop-blur-xl p-6" onClick={() => setEditingPrize(null)}>
              <div className="bg-white w-full max-w-lg p-10 rounded-[50px] shadow-2xl animate-fade-in relative overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  
                  <h3 className="text-3xl font-black text-slate-800 uppercase italic mb-8 leading-none tracking-tight"> {isNewPrize ? 'Добавить приз' : 'Редактировать приз'} </h3>
                  
                  <div className="space-y-6">
                      {/* Name */}
                      <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Название приза</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-blue-200 focus:bg-white transition-all" 
                            placeholder="Напр. Смартфон"
                            value={editingPrize.title} 
                            onChange={e => setEditingPrize({...editingPrize, title: e.target.value})} 
                          />
                      </div>
                      
                      {/* Points and Icon Selector */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Очки (Порог)</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-blue-200 focus:bg-white transition-all" 
                                value={editingPrize.threshold} 
                                onChange={e => setEditingPrize({...editingPrize, threshold: Number(e.target.value)})} 
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Выбрать иконку</label>
                            <div className="grid grid-cols-7 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                {PRIZE_ICONS.map(icon => (
                                    <button 
                                        key={icon}
                                        onClick={() => setEditingPrize({...editingPrize, icon})}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${editingPrize.icon === icon ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}
                                        title={icon}
                                    >
                                        <PrizeIcon name={icon} className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                          </div>
                      </div>

                      {/* Description */}
                      <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Описание приза</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-800 h-24 resize-none outline-none focus:border-blue-200 focus:bg-white transition-all" 
                            placeholder="Краткое описание для карточки..."
                            value={editingPrize.description} 
                            onChange={e => setEditingPrize({...editingPrize, description: e.target.value})} 
                          />
                      </div>

                      {/* Toggles */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={() => setEditingPrize({...editingPrize, isValuable: !editingPrize.isValuable})}
                            className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all ${editingPrize.isValuable ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editingPrize.isValuable ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${editingPrize.isValuable ? 'text-purple-700' : 'text-slate-400'}`}>Ценный приз</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${editingPrize.isValuable ? 'bg-purple-500 border-purple-500' : 'border-slate-300'}`}></div>
                        </button>

                        <button 
                            onClick={() => setEditingPrize({...editingPrize, isOutOfStock: !editingPrize.isOutOfStock})}
                            className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all ${editingPrize.isOutOfStock ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editingPrize.isOutOfStock ? 'bg-red-500 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${editingPrize.isOutOfStock ? 'text-red-700' : 'text-slate-400'}`}>Нет в наличии</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${editingPrize.isOutOfStock ? 'bg-red-500 border-red-500' : 'border-slate-300'}`}></div>
                        </button>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <button 
                            onClick={() => setEditingPrize(null)} 
                            className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition"
                          >
                            Отмена
                          </button>
                          <button 
                            onClick={handleSavePrize} 
                            disabled={loading || !editingPrize.title}
                            className="px-10 py-5 bg-slate-800 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-900 transition active:scale-95 disabled:opacity-50"
                          >
                            {loading ? '...' : 'Сохранить'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
      {/* (Rest of viewing modals...) */}
    </div>
  );
};
