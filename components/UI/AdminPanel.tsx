
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { backend } from '../../services/mockBackend';
import { PromoCode, GameResult, User, PrizeConfig, CodeRequest, PrizeTier } from '../../types';
import { t } from '../../translations';
import { PrizeIcon } from './PrizeIcons';

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
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  
  const [processForm, setProcessForm] = useState({ qty: '1', invoice: '', amount: '', comment: '', tier: 'BASIC' as PrizeTier });
  const [isTierSelectOpen, setIsTierSelectOpen] = useState(false);
  const tierDropdownRef = useRef<HTMLDivElement>(null);
  
  const [genCount, setGenCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (tierDropdownRef.current && !tierDropdownRef.current.contains(event.target as Node)) {
            setIsTierSelectOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      // Reset form on new request
      setProcessForm({ qty: '1', invoice: '', amount: '', comment: '', tier: 'BASIC' });
      try {
          const photo = await backend.getRequestPhoto(req.id);
          setViewingPhoto(photo);
      } catch (e) {
          console.error("Error loading photo", e);
          alert("Не удалось загрузить фото");
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
        // Explicitly calculate tier for manual issue if needed, or pass BASIC
        await backend.issueCodesToUser(
            selectedUser.id, 
            parseInt(issueForm.qty), 
            issueForm.invoice, 
            parseFloat(issueForm.amount),
            'BASIC' 
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
              userId: viewingRequest.userId,
              tier: processForm.tier
          });
          setViewingRequest(null);
          setViewingPhoto(null);
          await loadRequests(requestFilter);
          await loadInitialStats(); 
      } catch (e: any) {
          alert(e.message);
      } finally {
          setLoading(false);
      }
  };

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
    <div className="w-full h-full bg-slate-50 overflow-hidden flex flex-col antialiased relative">
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
                                        {['Имя', 'Телефон', 'Пароль', 'Город', 'Дата'].map(h => (
                                            <th key={h} className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => handleUserClick(user)}>
                                            <td className="px-8 py-4 font-bold text-slate-700 text-xs">{user.name}</td>
                                            <td className="px-8 py-4 font-light text-slate-400 text-xs">{user.phone}</td>
                                            <td className="px-8 py-4 font-mono font-bold text-blue-600 text-[11px] tracking-widest">{user.password}</td>
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
                        <button onClick={() => { setIsNewPrize(true); setEditingPrize({ id: crypto.randomUUID(), title: '', description: '', icon: 'card', threshold: 50, isValuable: true, isOutOfStock: false, tier: 'BASIC' }); }} className="bg-slate-800 text-white px-8 py-4 rounded-[20px] font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-900 transition active:scale-95">
                            {T.addPrize}
                        </button>
                    </div>
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {['Название', 'Очки', 'Категория', 'Тип', 'Статус', 'Действия'].map(h => (
                                            <th key={h} className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {prizes.sort((a,b) => {
                                        const tiers: PrizeTier[] = ['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];
                                        const tierDiff = tiers.indexOf(a.tier) - tiers.indexOf(b.tier);
                                        if (tierDiff !== 0) return tierDiff;
                                        return a.threshold - b.threshold;
                                    }).map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-8 py-4">
                                                <div className="font-bold text-slate-800 text-xs">{p.title}</div>
                                                <div className="text-[10px] text-slate-400">{p.description}</div>
                                            </td>
                                            <td className="px-8 py-4 font-black text-blue-600 text-lg">{p.threshold}</td>
                                            <td className="px-8 py-4">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                                                    p.tier === 'DIAMOND' ? 'bg-blue-50 text-blue-600' :
                                                    p.tier === 'GOLD' ? 'bg-yellow-50 text-yellow-700' :
                                                    p.tier === 'SILVER' ? 'bg-slate-100 text-slate-600' :
                                                    p.tier === 'BRONZE' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {p.tier}
                                                </span>
                                            </td>
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

      {/* Request Detail Modal (Approval/Rejection) */}
      {viewingRequest && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6" onClick={() => { setViewingRequest(null); setViewingPhoto(null); setIsTierSelectOpen(false); }}>
              <div className="bg-white w-full max-w-4xl p-0 rounded-[50px] shadow-2xl animate-fade-in relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  
                  {/* Left Side: Photo View */}
                  <div className="md:w-1/2 bg-slate-100 flex items-center justify-center relative min-h-[300px] border-r border-slate-50">
                      {isPhotoLoading ? (
                          <div className="flex flex-col items-center gap-4">
                              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Загрузка фото...</span>
                          </div>
                      ) : viewingPhoto ? (
                          <img 
                            src={viewingPhoto} 
                            className="w-full h-full object-contain cursor-zoom-in" 
                            alt="Invoice"
                            onClick={() => window.open(viewingPhoto, '_blank')}
                          />
                      ) : (
                          <div className="text-slate-400 text-xs font-bold uppercase italic">Фото не найдено</div>
                      )}
                      
                      <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white shadow-sm">
                          <span className="text-[10px] font-black text-slate-800 uppercase">Накладная</span>
                      </div>
                  </div>

                  {/* Right Side: Form */}
                  <div className="md:w-1/2 p-10 flex flex-col overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-start mb-8">
                          <div>
                              <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none tracking-tight">Обработка заявки</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Игрок: {users.find(u => u.id === viewingRequest.userId)?.name}</p>
                          </div>
                          <button onClick={() => { setViewingRequest(null); setViewingPhoto(null); setIsTierSelectOpen(false); }} className="text-slate-300 hover:text-slate-600 text-3xl font-light transition">&times;</button>
                      </div>

                      <div className="space-y-6">
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Одобрение (Начислить коды)</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 px-1">Кол-во кодов</label>
                                      <input 
                                          type="number" 
                                          className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-300 transition-all"
                                          value={processForm.qty}
                                          onChange={e => setProcessForm({...processForm, qty: e.target.value})}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 px-1">Сумма (СМН)</label>
                                      <input 
                                          type="number" 
                                          className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-300 transition-all"
                                          placeholder="Напр. 5000"
                                          value={processForm.amount}
                                          onChange={e => setProcessForm({...processForm, amount: e.target.value})}
                                      />
                                  </div>
                              </div>
                              
                              {/* PREMIUM TIER SELECTOR (DROPDOWN) */}
                              <div className="relative" ref={tierDropdownRef}>
                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 px-1">Категория призов (Уровень)</label>
                                  <button 
                                      type="button"
                                      onClick={() => setIsTierSelectOpen(!isTierSelectOpen)}
                                      className="w-full bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center transition-all focus:border-blue-300 hover:bg-slate-50/50 shadow-sm"
                                  >
                                      <div className="flex items-center gap-3">
                                          <div className={`p-1.5 rounded-lg ${
                                              processForm.tier === 'DIAMOND' ? 'bg-blue-500' :
                                              processForm.tier === 'GOLD' ? 'bg-yellow-500' :
                                              processForm.tier === 'SILVER' ? 'bg-slate-400' :
                                              processForm.tier === 'BRONZE' ? 'bg-amber-700' : 'bg-slate-200'
                                          }`}>
                                              <AdminTierIcon tier={processForm.tier} active={true} />
                                          </div>
                                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{processForm.tier}</span>
                                      </div>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-300 ${isTierSelectOpen ? 'rotate-180' : ''}`}><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                  </button>

                                  {isTierSelectOpen && (
                                      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[1000] animate-fade-in">
                                          {TIER_LIST.map((t) => (
                                              <button
                                                  key={t}
                                                  type="button"
                                                  onClick={() => {
                                                      setProcessForm({...processForm, tier: t});
                                                      setIsTierSelectOpen(false);
                                                  }}
                                                  className={`w-full px-5 py-3 text-left flex items-center justify-between group transition-colors ${processForm.tier === t ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                              >
                                                  <div className="flex items-center gap-3">
                                                      <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${
                                                          t === 'DIAMOND' ? 'bg-blue-500' :
                                                          t === 'GOLD' ? 'bg-yellow-500' :
                                                          t === 'SILVER' ? 'bg-slate-400' :
                                                          t === 'BRONZE' ? 'bg-amber-700' : 'bg-slate-200'
                                                      }`}>
                                                          <AdminTierIcon tier={t} active={true} />
                                                      </div>
                                                      <span className={`text-[10px] font-black uppercase tracking-widest ${processForm.tier === t ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'}`}>{t}</span>
                                                  </div>
                                                  {processForm.tier === t && (
                                                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                                                  )}
                                              </button>
                                          ))}
                                      </div>
                                  )}
                              </div>

                              <div>
                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 px-1">Номер накладной</label>
                                  <input 
                                      type="text" 
                                      className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-300 transition-all"
                                      placeholder="Напр. №12345"
                                      value={processForm.invoice}
                                      onChange={e => setProcessForm({...processForm, invoice: e.target.value})}
                                  />
                              </div>
                              <button 
                                onClick={() => handleProcessRequest('approve')}
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 mt-2"
                              >
                                {loading ? '...' : 'Одобрить и начислить'}
                              </button>
                          </div>

                          <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Отказ</span>
                              </div>
                              <div>
                                  <label className="block text-[9px] font-black text-red-400 uppercase mb-2 px-1">Причина отказа</label>
                                  <textarea 
                                      className="w-full bg-white border border-red-100 p-3 rounded-xl text-xs font-bold text-slate-800 h-20 resize-none outline-none focus:border-red-300 transition-all"
                                      placeholder="Напр. Фото нечитабельно"
                                      value={processForm.comment}
                                      onChange={e => setProcessForm({...processForm, comment: e.target.value})}
                                  />
                              </div>
                              <button 
                                onClick={() => handleProcessRequest('reject')}
                                disabled={loading}
                                className="w-full py-4 bg-red-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition active:scale-95 disabled:opacity-50"
                              >
                                {loading ? '...' : 'Отклонить заявку'}
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Deletion Confirmation Modal */}
      {requestForConfirmation && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
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
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-xl p-6" onClick={() => setEditingPrize(null)}>
              <div className="bg-white w-full max-w-lg p-10 rounded-[50px] shadow-2xl animate-fade-in relative overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  
                  <h3 className="text-3xl font-black text-slate-800 uppercase italic mb-8 leading-none tracking-tight"> {isNewPrize ? 'Добавить приз' : 'Редактировать приз'} </h3>
                  
                  <div className="space-y-6">
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
                      
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Уровень закупки (Категория)</label>
                        <div className="grid grid-cols-5 gap-2">
                            {TIER_LIST.map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setEditingPrize({...editingPrize, tier: t})}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${editingPrize.tier === t ? 'bg-slate-800 border-slate-700 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                >
                                    <AdminTierIcon tier={t} active={editingPrize.tier === t} />
                                    <span className="text-[7px] font-black mt-1 uppercase">{t}</span>
                                </button>
                            ))}
                        </div>
                      </div>

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

                      <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Описание приза</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-800 h-24 resize-none outline-none focus:border-blue-200 focus:bg-white transition-all" 
                            placeholder="Краткое описание для карточки..."
                            value={editingPrize.description} 
                            onChange={e => setEditingPrize({...editingPrize, description: e.target.value})} 
                          />
                      </div>

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
    </div>
  );
};
