
import React, { useState, useEffect } from 'react';
import { backend } from '../../services/mockBackend';
import { PromoCode, GameResult, User, PrizeConfig } from '../../types';
import { t } from '../../translations';

interface AdminPanelProps {
  onBack: () => void;
  onTestGame: () => void;
}

type Tab = 'dashboard' | 'requests' | 'codes' | 'prizes';

const PRIZE_ICONS = ['card', 'headphones', 'tv', 'watch', 'coffee', 'speaker', 'air', 'phone', 'tablet', 'bike', 'ac', 'vacuum', 'oven', 'trip'];

export const AdminPanel = ({ onBack, onTestGame }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  
  // States for Code Management
  const [genCount, setGenCount] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // State for User Search
  const [searchTerm, setSearchTerm] = useState('');

  // State for User Detail Modal & Code Issue
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userResults, setUserResults] = useState<GameResult[]>([]);
  const [userCodes, setUserCodes] = useState<PromoCode[]>([]); // Codes assigned to specific user
  
  // Code Issue Form
  const [issueForm, setIssueForm] = useState({ invoice: '', amount: '', qty: '1' });

  // State for Prize Editing
  const [editingPrize, setEditingPrize] = useState<PrizeConfig | null>(null);
  const [isNewPrize, setIsNewPrize] = useState(false);
  
  // Use RU translations for Admin interface
  const T = t.ru;

  const fetchData = async () => {
    const adminStats = await backend.getAdminStats();
    setStats(adminStats);
    setUsers(adminStats.users);
    setPrizes(adminStats.prizesConfig);
    // Sort codes: unused first, then by date desc
    const sortedCodes = [...adminStats.allCodes].sort((a, b) => {
        if (a.isUsed !== b.isUsed) return a.isUsed ? 1 : -1;
        return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
    });
    setCodes(sortedCodes);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---

  const handleGenerate = async () => {
    setLoading(true);
    await backend.generateCodes(genCount);
    await fetchData();
    setLoading(false);
  };

  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    const results = await backend.getUserResults(user.id);
    setUserResults(results);
    const uCodes = await backend.getUserUnusedCodes(user.id);
    setUserCodes(uCodes);
    setIssueForm({ invoice: '', amount: '', qty: '1' }); // Reset form
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
        // Refresh user data
        const uCodes = await backend.getUserUnusedCodes(selectedUser.id);
        setUserCodes(uCodes);
        setIssueForm({ invoice: '', amount: '', qty: '1' });
        await fetchData(); // Refresh global stats
    } catch (e: any) {
        alert(e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleSavePrize = async () => {
      if (!editingPrize) return;
      if (isNewPrize) {
          await backend.addPrize(editingPrize);
      } else {
          await backend.updatePrize(editingPrize);
      }
      setEditingPrize(null);
      await fetchData();
  };

  const handleDeletePrize = async (id: string) => {
      if(window.confirm('Вы уверены, что хотите удалить этот приз?')) {
          await backend.deletePrize(id);
          await fetchData();
      }
  };

  // Search filtering
  const filteredUsers = users.filter(u => {
      const term = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(term) || u.phone.includes(term);
  });

  // --- Components ---

  const TabButton = ({ id, label, count }: { id: Tab, label: string, count?: number }) => (
      <button 
          onClick={() => setActiveTab(id)}
          className={`px-6 py-3 rounded-[20px] font-bold text-[10px] uppercase tracking-widest transition-all ${
              activeTab === id 
              ? 'bg-slate-800 text-white shadow-lg' 
              : 'bg-white text-slate-400 hover:bg-slate-50'
          }`}
      >
          {label} {count !== undefined && <span className={`ml-2 px-1.5 py-0.5 rounded-md ${activeTab === id ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>{count}</span>}
      </button>
  );

  if (!stats) return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Загрузка...</div>;

  return (
    <div className="w-full h-full bg-slate-50 overflow-hidden flex flex-col">
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
      <div className="px-8 mt-8 max-w-7xl mx-auto w-full flex gap-3 overflow-x-auto pb-2">
         <TabButton id="dashboard" label={T.dashboard} />
         <TabButton id="requests" label={T.requests} count={stats.deliveryRequests} />
         <TabButton id="codes" label={T.codes} count={codes.filter(c => !c.isUsed).length} />
         <TabButton id="prizes" label={T.prizesManage} count={prizes.length} />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-8 pt-4">
        <div className="max-w-7xl mx-auto">
            
            {/* DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Игроки', val: stats.totalUsers },
                            { label: 'Коды исп.', val: stats.usedCodes },
                            { label: 'Всего игр', val: stats.totalGames },
                            { label: 'Призы (выбр.)', val: Object.values(stats.prizesAwarded).reduce((a: any, b: any) => a + b, 0) }
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
                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-slate-300 text-xs font-bold uppercase">Пользователи не найдены</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* PRIZES MANAGEMENT VIEW */}
            {activeTab === 'prizes' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-end">
                        <button 
                            onClick={() => {
                                setIsNewPrize(true);
                                setEditingPrize({
                                    id: crypto.randomUUID(),
                                    title: '',
                                    description: '',
                                    icon: 'card',
                                    threshold: 50,
                                    isValuable: true,
                                    isOutOfStock: false
                                });
                            }}
                            className="bg-slate-800 text-white px-8 py-4 rounded-[20px] font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-900 transition active:scale-95"
                        >
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
                                            <td className="px-8 py-4 font-mono font-bold text-blue-600">{p.threshold}</td>
                                            <td className="px-8 py-4">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${p.isValuable ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {p.isValuable ? 'Ценный' : 'Базовый'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                {p.isOutOfStock ? (
                                                    <span className="text-red-400 font-bold uppercase text-[9px] tracking-widest">Нет в наличии</span>
                                                ) : (
                                                    <span className="text-emerald-500 font-bold uppercase text-[9px] tracking-widest">В наличии</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setIsNewPrize(false); setEditingPrize(p); }} className="text-blue-500 hover:text-blue-700 font-bold text-[10px] uppercase">Изм.</button>
                                                    <button onClick={() => handleDeletePrize(p.id)} className="text-red-400 hover:text-red-600 font-bold text-[10px] uppercase">Уд.</button>
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

            {/* REQUESTS VIEW */}
            {activeTab === 'requests' && (
                <div className="animate-fade-in">
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden min-h-[50vh]">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h2 className="text-lg font-thin text-slate-800 uppercase italic">Заявки на доставку</h2>
                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                                Активных: {users.filter(u => u.deliveryRequested).length}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {['Имя', 'Телефон', 'Город', 'Выбранные Призы', 'Статус'].map(h => (
                                            <th key={h} className="px-8 py-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.filter(u => u.deliveryRequested).map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => handleUserClick(user)}>
                                            <td className="px-8 py-4 font-bold text-slate-700 text-xs">{user.name}</td>
                                            <td className="px-8 py-4 font-light text-slate-400 text-xs">{user.phone}</td>
                                            <td className="px-8 py-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">{user.city}</td>
                                            <td className="px-8 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.claimedPrizes?.map(p => (
                                                        <span key={p} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase rounded">{p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                                                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                                                    Ожидает
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* CODES VIEW */}
            {activeTab === 'codes' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Actions Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[35px] shadow-sm border border-slate-100">
                        <div className="flex-1 flex gap-4 items-center">
                            <div className="relative w-32">
                                <input 
                                    type="number" 
                                    value={genCount}
                                    onChange={(e) => setGenCount(Math.max(1, Number(e.target.value)))}
                                    className="w-full bg-slate-50 border border-slate-200 py-3 pl-4 pr-10 rounded-2xl font-bold text-slate-700 outline-none focus:border-slate-400 text-center"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">ШТ</span>
                            </div>
                            <button 
                                onClick={handleGenerate} 
                                disabled={loading}
                                className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-900 transition active:scale-95 disabled:opacity-50"
                            >
                                {loading ? '...' : 'Генерировать'}
                            </button>
                        </div>
                    </div>

                    {/* Codes List */}
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
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-[10px] text-slate-400 font-mono">
                                                    {new Date(c.generatedAt).toLocaleDateString()} {new Date(c.generatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </td>
                                                <td className="px-6 py-3 text-xs text-slate-500">
                                                     {c.assignedTo ? users.find(u => u.id === c.assignedTo)?.name || 'Unknown' : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-[10px] text-slate-400">
                                                    {c.invoiceNumber ? `Накл: ${c.invoiceNumber} | ${c.purchaseAmount}` : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>

      {/* Prize Edit Modal */}
      {editingPrize && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6" onClick={() => setEditingPrize(null)}>
              <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold text-slate-800 uppercase italic mb-6">
                      {isNewPrize ? T.addPrize : T.editPrize}
                  </h3>
                  {/* Prize Form (Simplified for brevity as it's not the focus of this change) */}
                  <div className="space-y-4">
                      <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.title}</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold text-slate-800"
                            value={editingPrize.title}
                            onChange={e => setEditingPrize({...editingPrize, title: e.target.value})}
                          />
                      </div>
                      <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.points}</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold text-slate-800"
                                value={editingPrize.threshold}
                                onChange={e => setEditingPrize({...editingPrize, threshold: Number(e.target.value)})}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.icon}</label>
                            <select 
                                className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold text-slate-800"
                                value={editingPrize.icon}
                                onChange={e => setEditingPrize({...editingPrize, icon: e.target.value})}
                            >
                                {PRIZE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.desc}</label>
                          <textarea 
                            className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold text-slate-800 h-24 resize-none"
                            value={editingPrize.description}
                            onChange={e => setEditingPrize({...editingPrize, description: e.target.value})}
                          />
                      </div>
                      
                      <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl flex-1">
                            <input 
                                type="checkbox" 
                                checked={editingPrize.isValuable}
                                onChange={e => setEditingPrize({...editingPrize, isValuable: e.target.checked})}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{T.isValuable}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl flex-1">
                            <input 
                                type="checkbox" 
                                checked={editingPrize.isOutOfStock}
                                onChange={e => setEditingPrize({...editingPrize, isOutOfStock: e.target.checked})}
                                className="w-4 h-4 rounded text-red-500 focus:ring-red-500"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{T.isOutOfStock}</span>
                        </label>
                      </div>

                      <div className="flex gap-3 pt-4">
                          <button onClick={() => setEditingPrize(null)} className="flex-1 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-xl">{T.cancel}</button>
                          <button onClick={handleSavePrize} className="flex-1 py-3 bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-900">{T.save}</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Shared User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6" onClick={() => setSelectedUser(null)}>
          <div className="bg-white w-full max-w-xl rounded-[60px] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-12 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-thin text-slate-800 uppercase italic tracking-tight">{selectedUser.name}</h3>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">{selectedUser.phone} • {selectedUser.city}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-100 hover:text-slate-300 transition text-5xl font-thin leading-none">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
              
              {/* Prize Section in Modal */}
              {selectedUser.claimedPrizes && selectedUser.claimedPrizes.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[35px]">
                      <h4 className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Выбранные призы</h4>
                      <div className="flex flex-wrap gap-2">
                          {selectedUser.claimedPrizes.map(p => (
                              <div key={p} className="bg-white px-4 py-2 rounded-xl text-indigo-800 font-bold text-xs shadow-sm">
                                  {p}
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* ISSUE CODES SECTION */}
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-[35px]">
                  <h4 className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-4">{T.issueCodes}</h4>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.invoiceNum}</label>
                            <input 
                                type="text" 
                                className="w-full bg-white p-3 rounded-xl text-xs font-bold text-slate-800 border border-blue-100"
                                value={issueForm.invoice}
                                onChange={e => setIssueForm({...issueForm, invoice: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.purchaseSum}</label>
                            <input 
                                type="number" 
                                className="w-full bg-white p-3 rounded-xl text-xs font-bold text-slate-800 border border-blue-100"
                                value={issueForm.amount}
                                onChange={e => setIssueForm({...issueForm, amount: e.target.value})}
                            />
                          </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{T.quantity}</label>
                        <input 
                            type="number" 
                            className="w-full bg-white p-3 rounded-xl text-xs font-bold text-slate-800 border border-blue-100"
                            value={issueForm.qty}
                            onChange={e => setIssueForm({...issueForm, qty: e.target.value})}
                        />
                      </div>
                      <button 
                        onClick={handleIssueCodes}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl uppercase text-[10px] tracking-widest hover:bg-blue-700 transition"
                      >
                          {loading ? '...' : T.issue}
                      </button>
                  </div>
              </div>
              
              {/* Issued Codes List */}
              {userCodes.length > 0 && (
                   <div className="space-y-2">
                       <h4 className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-2">{T.issuedCodes}</h4>
                       {userCodes.map(c => (
                           <div key={c.code} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                               <div className="font-mono font-bold text-slate-700">{c.code}</div>
                               <div className="text-[10px] text-slate-400">Накл: {c.invoiceNumber || '-'}</div>
                           </div>
                       ))}
                   </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[35px] text-center border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-300 uppercase mb-2 tracking-widest">Игр</div>
                  <div className="text-3xl font-thin text-slate-800">{userResults.length}</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[35px] text-center border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-300 uppercase mb-2 tracking-widest">Рекорд</div>
                  <div className="text-3xl font-thin text-slate-800">{Math.max(0, ...userResults.map(r => r.score))}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
