import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { backend, compressImage } from '../../services/mockBackend';
import { PromoCode, GameResult, User, PrizeConfig, CodeRequest, PrizeTier, GameDifficultyConfig } from '../../types';
import { t } from '../../translations';
import { PrizeIcon } from './PrizeIcons';

interface AdminPanelProps {
  onBack: () => void;
  onTestGame: () => void;
  onPrizesUpdated: () => void;
}

type Tab = 'dashboard' | 'requests_check' | 'orders' | 'codes' | 'prizes' | 'settings';

const TIER_LIST: PrizeTier[] = ['BASIC', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];

// Helper icons for custom select
const TierIconSmall = ({ tier }: { tier: PrizeTier }) => {
    switch(tier) {
        case 'BASIC': return <div className="w-2 h-2 rounded-full bg-slate-300" />;
        case 'BRONZE': return <div className="w-2 h-2 rounded-full bg-amber-700" />;
        case 'SILVER': return <div className="w-2 h-2 rounded-full bg-slate-400" />;
        case 'GOLD': return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
        case 'DIAMOND': return <div className="w-2 h-2 rounded-full bg-blue-500" />;
        default: return null;
    }
};

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.34 12m-4.77 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const CopyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
        {visible ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        ) : (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </>
        )}
    </svg>
);

const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CalculatorIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-3-10.5h.008v.008H12.75V7.5zm0 3h.008v.008H12.75v-.008zm0 3h.008v.008H12.75v-.008zm3-6h.008v.008h-.008V7.5zm0 3h.008v.008h-.008v-.008zm3-3h.008v.008h-.008V7.5zm0 3h.008v.008h-.008v-.008zM6.75 6.75h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75zm3-3h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75zm0-6h.75v.75h-.75v-.75zM6.75 15.75h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75zm3-3h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75zm3-3h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75zM15.75 15.75h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75zm3-3h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75z" />
    </svg>
);

export const AdminPanel = ({ onBack, onTestGame, onPrizesUpdated }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [orderSubTab, setOrderSubTab] = useState<'active' | 'archive'>('active');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [deliveryUsers, setDeliveryUsers] = useState<User[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [requestFilter, setRequestFilter] = useState<'pending' | 'all'>('pending');
  const [viewingRequest, setViewingRequest] = useState<any | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const [processForm, setProcessForm] = useState({ qty: '1', invoice: '', amount: '', comment: '', tier: 'BASIC' as PrizeTier });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userResults, setUserResults] = useState<GameResult[]>([]);
  const [userCodes, setUserCodes] = useState<PromoCode[]>([]);
  const [editingPrize, setEditingPrize] = useState<PrizeConfig | null>(null);
  const [isTierSelectOpen, setIsTierSelectOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderPhone, setOrderPhone] = useState('');
  const [gameDifficulty, setGameDifficulty] = useState<GameDifficultyConfig>({ baseSpeed: 0.035, speedIncrement: 0.0025, speedStep: 8, maxSpeed: 0.075 });
  const [genCount, setGenCount] = useState('10');
  const [codeSearch, setCodeSearch] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  
  // Quick Code Issuance for single user
  const [quickCodeQty, setQuickCodeQty] = useState('1');

  // Calculator State
  const [calcFields, setCalcFields] = useState<Record<string, string>>({
      'Иммубелс': '',
      'Ламбротин сироп 15мг': '',
      'Ламбротин сироп 30мг': '',
      'Ламбротин тб 30мг': '',
      'Седалайт бейби': '',
      'Седалайт тб': '',
      'Фиатфон': ''
  });

  // Crop States
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cropImgRef = useRef<HTMLImageElement>(null);
  const prizePhotoInputRef = useRef<HTMLInputElement>(null);
  const tierSelectRef = useRef<HTMLDivElement>(null);

  // Для отображения инфо о пользователе внутри заявки
  const [requestUserResults, setRequestUserResults] = useState<GameResult[]>([]);

  const loadInitialStats = async () => {
    setLoading(true);
    try {
        const adminStats = await backend.getAdminStats();
        setStats(adminStats);
        setUsers(adminStats.users);
        setPrizes(adminStats.prizesConfig);
        setCodes(adminStats.allCodes);
        if (adminStats.gameConfig) {
            setGameDifficulty(adminStats.gameConfig);
        }
        const phone = await backend.getOrderPhone();
        setOrderPhone(phone);
        
        if (activeTab === 'requests_check') {
            const reqs = await backend.getCodeRequests(requestFilter);
            setRequestsList(reqs);
        }
        
        if (activeTab === 'orders') {
            if (orderSubTab === 'active') {
                const deliveries = await backend.getDeliveryUsers();
                setDeliveryUsers(deliveries);
            } else {
                const completed = await backend.getCompletedOrders();
                setCompletedOrders(completed);
            }
        }
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { loadInitialStats(); }, []);
  
  useEffect(() => {
    if (activeTab === 'requests_check') {
        backend.getCodeRequests(requestFilter).then(setRequestsList);
    }
    if (activeTab === 'orders') {
        if (orderSubTab === 'active') {
            backend.getDeliveryUsers().then(setDeliveryUsers);
        } else {
            backend.getCompletedOrders().then(setCompletedOrders);
        }
    }
  }, [requestFilter, activeTab, orderSubTab]);

  // Invoice Calculator Logic, added explicit casting to string[] for Object.values(calcFields)
  useEffect(() => {
    const total = (Object.values(calcFields) as string[]).reduce((acc: number, val: string) => acc + (parseFloat(val) || 0), 0);
    if (total > 0) {
        let codes = 1;
        let tier: PrizeTier = 'BRONZE';

        if (total >= 100000) { codes = 40; tier = 'DIAMOND'; }
        else if (total >= 40000) { codes = 16; tier = 'GOLD'; }
        else if (total >= 20000) { codes = 7; tier = 'SILVER'; }
        else if (total >= 10000) { codes = 3; tier = 'BRONZE'; }
        else if (total >= 5000) { codes = 1; tier = 'BRONZE'; }
        else { codes = 0; tier = 'BASIC'; }

        setProcessForm(prev => ({
            ...prev,
            amount: total.toString(),
            qty: codes.toString(),
            tier: tier
        }));
    }
  }, [calcFields]);

  // Click outside custom select
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (tierSelectRef.current && !tierSelectRef.current.contains(event.target as Node)) {
            setIsTierSelectOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    setShowPassword(false);
    const results = await backend.getUserResults(user.id);
    setUserResults(results);
    const uCodes = await backend.getUserCodes(user.id);
    setUserCodes(uCodes);
  };

  const handleToggleEmployee = async (userId: string, current: boolean) => {
    setLoading(true);
    try {
        await backend.setUserEmployeeStatus(userId, !current);
        const updatedUsers = users.map(u => u.id === userId ? { ...u, isEmployee: !current } : u);
        setUsers(updatedUsers);
        if (selectedUser?.id === userId) {
            setSelectedUser({ ...selectedUser, isEmployee: !current });
        }
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleQuickIssue = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
        const qty = parseInt(quickCodeQty);
        await backend.issueCodesToUser(
            selectedUser.id, 
            qty, 
            selectedUser.isEmployee ? 'STAFF_GRANT' : 'ADMIN_GRANT', 
            0, 
            undefined, 
            selectedUser.isEmployee
        );
        alert(`Выдано кодов: ${qty}`);
        const uCodes = await backend.getUserCodes(selectedUser.id);
        setUserCodes(uCodes);
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleOpenRequest = async (req: any) => {
      setViewingRequest(req);
      const photo = await backend.getRequestPhoto(req.id);
      setViewingPhoto(photo);
      const results = await backend.getUserResults(req.userId);
      setRequestUserResults(results);
      // Reset calculator when opening new request
      setCalcFields({
          'Иммубелс': '',
          'Ламбротин сироп 15мг': '',
          'Ламбротин сироп 30мг': '',
          'Ламбротин тб 30мг': '',
          'Седалайт бейби': '',
          'Седалайт тб': '',
          'Фиатфон': ''
      });
      setProcessForm({ qty: '1', invoice: '', amount: '', comment: '', tier: 'BASIC' });
  };

  const handleDeleteRequest = async (requestId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm("Удалить эту заявку навсегда? Фото и данные будут стерты.")) return;
      setLoading(true);
      try {
          await backend.deleteCodeRequest(requestId);
          setRequestsList(prev => prev.filter(r => r.id !== requestId));
      } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Вы уверены? Это действие необратимо.")) return;
    setLoading(true);
    try {
      await backend.deleteUser(userId);
      setSelectedUser(null);
      await loadInitialStats();
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleCompleteOrder = async (userId: string) => {
    if (!window.confirm("Пометить заказ как выполненный? Данные будут сохранены в архиве.")) return;
    setLoading(true);
    try {
        await backend.completeDelivery(userId);
        setDeliveryUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleDeleteCompletedOrder = async (orderId: string) => {
      if (!window.confirm("Удалить запись из истории? Это действие необратимо.")) return;
      setLoading(true);
      try {
          await backend.deleteCompletedOrder(orderId);
          setCompletedOrders(prev => prev.filter(o => o.id !== orderId));
      } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleCopyOrder = (u: User) => {
    const prizeList = u.claimedPrizes.map(p => `• ${p}`).join('\n');
    const message = `📦 ЗАКАЗ: ЛАМБРОТИН STACK\n👤 Имя: ${u.name}\n📍 Город: ${u.city}\n📞 Телефон: ${u.phone}\n🎁 Призы:\n${prizeList}`;
    
    navigator.clipboard.writeText(message).then(() => {
        setCopiedOrderId(u.id);
        setTimeout(() => setCopiedOrderId(null), 2000);
    });
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
          await loadInitialStats(); 
      } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleUpdateSettings = async () => {
      setLoading(true);
      try {
          await backend.updateOrderPhone(orderPhone);
          await backend.updateGameConfig(gameDifficulty);
          alert("Настройки обновлены");
      } catch (e: any) {
          alert("Ошибка при сохранении: " + e.message);
      } finally { setLoading(false); }
  };

  const handleGenerateCodes = async () => {
      setLoading(true);
      try {
          await backend.generateCodes(parseInt(genCount));
          await loadInitialStats();
          alert("Коды сгенерированы");
      } catch (e) {} finally { setLoading(false); }
  };

  const handleSavePrize = async () => {
      if (!editingPrize) return;
      setLoading(true);
      try {
          await backend.updatePrize(editingPrize);
          setEditingPrize(null);
          await loadInitialStats();
          onPrizesUpdated(); // Мгновенно обновляем призы в основном приложении
      } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handlePrizePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingPrize) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            setCropImage(event.target?.result as string);
            setCropZoom(1);
            setCropPos({ x: 0, y: 0 });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleApplyCrop = async () => {
    if (!cropImgRef.current || !editingPrize) return;
    setLoading(true);
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 512;
        canvas.height = 512;

        const img = cropImgRef.current;
        const rect = img.getBoundingClientRect();
        const scaleFactor = 512 / 300;
        const centerX = 150;
        const centerY = 150;
        
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,512,512);

        const drawX = (cropPos.x + centerX) * scaleFactor;
        const drawY = (cropPos.y + centerY) * scaleFactor;
        const drawW = rect.width * scaleFactor;
        const drawH = rect.height * scaleFactor;

        ctx.drawImage(img, drawX - (drawW / 2), drawY - (drawH / 2), drawW, drawH);
        
        const finalData = canvas.toDataURL('image/jpeg', 0.7);
        setEditingPrize({ ...editingPrize, imageUrl: finalData });
        setCropImage(null);
    } catch (err) {
        alert("Ошибка при обрезке");
    } finally {
        setLoading(false);
    }
  };

  const onCropPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - cropPos.x, y: e.clientY - cropPos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onCropPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setCropPos({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
    });
  };

  const onCropPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm));
  }, [users, searchTerm]);

  const filteredCodes = useMemo(() => {
      return codes.filter(c => 
        c.code.toLowerCase().includes(codeSearch.toLowerCase()) || 
        c.invoiceNumber?.toLowerCase().includes(codeSearch.toLowerCase()) ||
        c.assignedToName?.toLowerCase().includes(codeSearch.toLowerCase())
      );
  }, [codes, codeSearch]);

  const totalRequestsStorageMb = useMemo(() => {
      const kb = requestsList.reduce((acc, r) => acc + (r.photoSizeKb || 0), 0);
      return (kb / 1024).toFixed(2);
  }, [requestsList]);

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col antialiased font-sans">
      <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center shadow-sm z-50 shrink-0">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl transition">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-xl font-black text-slate-800 uppercase italic">Админ-панель</h2>
          </div>
          <button onClick={onTestGame} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition">Тест игры</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
          <div className="w-20 sm:w-64 bg-white border-r border-slate-100 flex flex-col p-4 gap-2 shrink-0">
              {(['dashboard', 'requests_check', 'orders', 'codes', 'prizes', 'settings'] as Tab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === tab ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-slate-50'}`}>
                      <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">
                        {tab === 'dashboard' ? 'Пользователи' : tab === 'requests_check' ? 'Заявки' : tab === 'orders' ? 'Заказы' : tab === 'codes' ? 'Коды' : tab === 'prizes' ? 'Призы' : 'Настройки'}
                      </span>
                  </button>
              ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
              {activeTab === 'dashboard' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                          <input type="text" placeholder="Поиск по имени или телефону..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300" />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          {filteredUsers.map(u => (
                              <div key={u.id} onClick={() => handleUserClick(u)} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${u.isEmployee ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{u.name.charAt(0)}</div>
                                      <div>
                                          <div className="flex items-center gap-2">
                                            <div className="text-sm font-black text-slate-800">{u.name}</div>
                                            {u.isEmployee && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Сотрудник</span>}
                                          </div>
                                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.phone} • {u.city}</div>
                                      </div>
                                  </div>
                                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">{u.maxPurchaseTier}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'requests_check' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                          <div className="flex gap-2">
                              {(['pending', 'all'] as const).map(f => (
                                  <button key={f} onClick={() => setRequestFilter(f)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${requestFilter === f ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                      {f === 'pending' ? 'Ожидают' : 'Все'}
                                  </button>
                              ))}
                          </div>
                          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-right">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Вес всех фото</div>
                              <div className="text-lg font-black text-slate-800 tracking-tight">{totalRequestsStorageMb} <span className="text-sm font-black text-slate-400 uppercase">МБ</span></div>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          {requestsList.map(req => (
                              <div key={req.id} onClick={() => handleOpenRequest(req)} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-200 transition group relative">
                                  <div className="flex items-center gap-6">
                                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 overflow-hidden shadow-inner">
                                          <div className="text-[8px] font-black text-slate-400 uppercase">IMG</div>
                                          <div className="text-[9px] font-black text-slate-800">{req.photoSizeKb} КБ</div>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                          <div className="text-sm font-black text-slate-800">{req.userName || 'Без имени'}</div>
                                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.userPhone || 'Без номера'} • {new Date(req.createdAt).toLocaleDateString()}</div>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{req.status}</span>
                                      <button 
                                        onClick={(e) => handleDeleteRequest(req.id, e)}
                                        className="p-3 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-xl"
                                      >
                                          <TrashIcon />
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'orders' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                              <button 
                                onClick={() => setOrderSubTab('active')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderSubTab === 'active' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                Активные ({deliveryUsers.length})
                              </button>
                              <button 
                                onClick={() => setOrderSubTab('archive')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderSubTab === 'archive' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                История ({completedOrders.length})
                              </button>
                          </div>
                      </div>

                      {orderSubTab === 'active' ? (
                          <div className="grid grid-cols-1 gap-6">
                              {deliveryUsers.length === 0 ? (
                                  <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
                                      <p className="text-slate-400 font-black text-sm uppercase italic">Пока нет новых заказов</p>
                                  </div>
                              ) : (
                                  deliveryUsers.map(u => (
                                      <div key={u.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-fade-in">
                                          <div className="flex-1">
                                              <div className="flex items-center gap-4 mb-4">
                                                  <div className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center font-black text-xl">{u.name.charAt(0)}</div>
                                                  <div>
                                                      <div className="text-base font-black text-slate-800">{u.name}</div>
                                                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.phone} • {u.city}</div>
                                                  </div>
                                              </div>
                                              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Выбранные награды:</h4>
                                              <div className="flex flex-wrap gap-2">
                                                  {u.claimedPrizes.map((p, i) => (
                                                      <span key={i} className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight">{p}</span>
                                                  ))}
                                              </div>
                                          </div>
                                          <div className="shrink-0 flex flex-wrap gap-2">
                                              <button 
                                                onClick={() => handleCopyOrder(u)}
                                                className={`flex-1 md:flex-none py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${copiedOrderId === u.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'}`}
                                              >
                                                  {copiedOrderId === u.id ? (
                                                      <><span>Скопировано! ✅</span></>
                                                  ) : (
                                                      <><CopyIcon /> <span>Скопировать для доставки</span></>
                                                  )}
                                              </button>
                                              <a href={`tel:${u.phone}`} className="flex-1 md:flex-none py-4 px-6 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition text-center">Позвонить</a>
                                              <button 
                                                onClick={() => handleCompleteOrder(u.id)}
                                                className="flex-1 md:flex-none py-4 px-8 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition"
                                              >
                                                  Выдано / Завершить
                                              </button>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {completedOrders.length === 0 ? (
                                  <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
                                      <p className="text-slate-400 font-black text-sm uppercase italic">Архив пуст</p>
                                  </div>
                              ) : (
                                  completedOrders.map(order => (
                                      <div key={order.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between gap-6 animate-fade-in">
                                          <div className="flex-1">
                                              <div className="flex items-center gap-4 mb-3">
                                                  <div className="text-sm font-black text-slate-800">{order.user_name}</div>
                                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.user_phone} • {order.user_city}</span>
                                                  <span className="text-[10px] font-bold text-slate-300 italic">{new Date(order.completed_at).toLocaleDateString()}</span>
                                              </div>
                                              <div className="flex flex-wrap gap-2">
                                                  {order.prizes.map((p: string, i: number) => (
                                                      <span key={i} className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{p}</span>
                                                  ))}
                                              </div>
                                          </div>
                                          <button 
                                            onClick={() => handleDeleteCompletedOrder(order.id)}
                                            className="p-3 text-slate-200 hover:text-red-400 transition-colors"
                                          >
                                              <TrashIcon />
                                          </button>
                                      </div>
                                  ))
                              )}
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'codes' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4">Генерация кодов</h4>
                              <div className="flex gap-2">
                                  <input type="number" value={genCount} onChange={e => setGenCount(e.target.value)} className="w-20 p-4 bg-slate-50 rounded-xl text-sm font-black outline-none border border-slate-100 text-slate-900" />
                                  <button onClick={handleGenerateCodes} className="flex-1 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase">Создать</button>
                              </div>
                          </div>
                          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm md:col-span-2">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4">Статистика</h4>
                              <div className="flex gap-10">
                                  <div><div className="text-2xl font-black text-slate-800">{codes.length}</div><div className="text-[9px] font-black text-slate-400 uppercase">Всего</div></div>
                                  <div><div className="text-2xl font-black text-blue-600">{codes.filter(c => c.isUsed).length}</div><div className="text-[9px] font-black text-slate-400 uppercase">Использовано</div></div>
                                  <div><div className="text-2xl font-black text-emerald-500">{codes.filter(c => !c.assignedTo).length}</div><div className="text-[9px] font-black text-slate-400 uppercase">Свободно</div></div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                          <input type="text" placeholder="Поиск по коду, имени или накладной..." value={codeSearch} onChange={e => setCodeSearch(e.target.value)} className="flex-1 outline-none text-sm font-bold text-slate-900" />
                      </div>

                      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="bg-slate-50/50 border-b border-slate-100">
                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Код</th>
                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Статус</th>
                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Владелец</th>
                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Тип</th>
                                      <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Дата</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {filteredCodes.map((c, idx) => (
                                      <tr key={c.code} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                                          <td className="p-5 text-xs font-bold text-slate-400">{idx + 1}</td>
                                          <td className="p-5 font-mono font-black text-slate-800">{c.code}</td>
                                          <td className="p-5">
                                              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase ${c.isUsed ? 'bg-red-50 text-red-500' : c.assignedTo ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-400'}`}>
                                                  {c.isUsed ? 'Использован' : c.assignedTo ? 'Выдан' : 'Свободен'}
                                              </span>
                                          </td>
                                          <td className="p-5">
                                              {c.assignedToName ? (
                                                  <div className="flex flex-col">
                                                      <span className="text-xs font-black text-slate-700">{c.assignedToName}</span>
                                                      <span className="text-[9px] font-bold text-slate-400">{c.assignedToPhone}</span>
                                                  </div>
                                              ) : <span className="text-xs font-bold text-slate-200">—</span>}
                                          </td>
                                          <td className="p-5">
                                              {c.isStaffCode ? (
                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">Сотрудник</span>
                                              ) : c.invoiceNumber ? (
                                                <span className="text-[8px] font-black uppercase text-slate-400">#{c.invoiceNumber}</span>
                                              ) : <span className="text-slate-200">—</span>}
                                          </td>
                                          <td className="p-5 text-[10px] font-bold text-slate-400 text-right">{new Date(c.generatedAt).toLocaleDateString()}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {activeTab === 'prizes' && (
                  <div className="space-y-8 animate-fade-in">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-black text-slate-800 uppercase italic">Управление призами</h3>
                          <button onClick={() => setEditingPrize({ id: 'new_'+Date.now(), title: '', description: '', icon: 'card', threshold: 10, isValuable: true, isOutOfStock: false, tier: 'BRONZE' })} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-slate-200">Добавить приз</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {prizes.map(p => (
                              <div key={p.id} onClick={() => setEditingPrize(p)} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-6 cursor-pointer hover:border-blue-200 transition">
                                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-500 overflow-hidden shadow-inner">
                                      {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.title} /> : <PrizeIcon name={p.icon} />}
                                  </div>
                                  <div className="flex-1">
                                      <div className="text-sm font-black text-slate-800">{p.title}</div>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-400 px-2 py-0.5 rounded">{p.tier}</span>
                                          <span className="text-[9px] font-black text-blue-600">{p.threshold} очков</span>
                                      </div>
                                  </div>
                                  {p.isOutOfStock && <span className="text-[8px] font-black text-red-500 uppercase border border-red-100 px-2 py-1 rounded">Нет в наличии</span>}
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'settings' && (
                  <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Общие настройки */}
                          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-3 mb-8">
                                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><SettingsIcon /></div>
                                  <h3 className="text-lg font-black text-slate-800 uppercase italic">Общие настройки</h3>
                              </div>
                              <div className="space-y-6">
                                  <div>
                                      <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Телефон для заказов (TG)</label>
                                      <input type="text" value={orderPhone} onChange={e => setOrderPhone(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-blue-400 transition shadow-inner text-slate-900" />
                                  </div>
                                  <button onClick={handleUpdateSettings} className="w-full py-5 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-slate-200 hover:bg-slate-900 transition">Сохранить всё</button>
                              </div>
                          </div>

                          {/* Сложность игры */}
                          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-3 mb-8">
                                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                                  </div>
                                  <h3 className="text-lg font-black text-slate-800 uppercase italic">Сложность игры</h3>
                              </div>
                              <div className="space-y-5">
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Нач. скорость</label>
                                          <input type="number" step="0.001" value={gameDifficulty.baseSpeed} onChange={e => setGameDifficulty({...gameDifficulty, baseSpeed: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm outline-none shadow-inner" />
                                      </div>
                                      <div>
                                          <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Прирост скор.</label>
                                          <input type="number" step="0.0001" value={gameDifficulty.speedIncrement} onChange={e => setGameDifficulty({...gameDifficulty, speedIncrement: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm outline-none shadow-inner" />
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Ускорение каждые N</label>
                                          <input type="number" value={gameDifficulty.speedStep} onChange={e => setGameDifficulty({...gameDifficulty, speedStep: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm outline-none shadow-inner" />
                                      </div>
                                      <div>
                                          <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Макс. скорость</label>
                                          <input type="number" step="0.001" value={gameDifficulty.maxSpeed} onChange={e => setGameDifficulty({...gameDifficulty, maxSpeed: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm outline-none shadow-inner" />
                                      </div>
                                  </div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                      Подсказка: Скорость увеличивается на {gameDifficulty.speedIncrement} каждые {gameDifficulty.speedStep} блоков, пока не достигнет {gameDifficulty.maxSpeed}.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6">
              <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh]">
                  <button onClick={() => { setSelectedUser(null); setShowPassword(false); }} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 text-3xl font-light transition">&times;</button>
                  <div className="p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
                      <div className="flex flex-col md:flex-row md:items-center gap-6 pb-10 border-b border-slate-50 justify-between">
                          <div className="flex items-center gap-6">
                            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-2xl font-black transition-colors ${selectedUser.isEmployee ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-800 text-white'}`}>{selectedUser.name.charAt(0)}</div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-slate-800 italic uppercase">{selectedUser.name}</h3>
                                    {selectedUser.isEmployee && <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">Сотрудник</span>}
                                </div>
                                <p className="text-sm font-black text-slate-400 uppercase mt-1">{selectedUser.phone} • {selectedUser.city}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                                  <div>
                                      <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Пароль игрока</div>
                                      <div className="text-base font-mono font-black text-slate-800 tracking-wider">
                                          {showPassword ? selectedUser.password : '••••••••'}
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`p-3 rounded-xl transition-colors ${showPassword ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
                                  >
                                      <EyeIcon visible={showPassword} />
                                  </button>
                              </div>
                              <button onClick={() => handleDeleteUser(selectedUser.id)} className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-xl font-black text-[10px] uppercase">Удалить профиль</button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Управление сотрудником и быстрая выдача */}
                          <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase mb-4 tracking-widest">Управление</h4>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between cursor-pointer group bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-300 transition-all">
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Это сотрудник</span>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={selectedUser.isEmployee} 
                                            onChange={() => handleToggleEmployee(selectedUser.id, !!selectedUser.isEmployee)}
                                        />
                                        <div className={`w-10 h-5 rounded-full p-1 transition-colors ${selectedUser.isEmployee ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${selectedUser.isEmployee ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                    </label>
                                    
                                    <div className="pt-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-tight">Выдать коды (шт.)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                value={quickCodeQty} 
                                                onChange={e => setQuickCodeQty(e.target.value)} 
                                                className="w-16 p-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none"
                                            />
                                            <button 
                                                onClick={handleQuickIssue}
                                                className="flex-1 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-50 hover:bg-blue-700 transition"
                                            >
                                                Выдать
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                              <h4 className="text-[11px] font-black text-slate-300 uppercase">История игр</h4>
                              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                {userResults.length > 0 ? userResults.map(r => (
                                    <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between">
                                        <div><div className="text-[9px] font-black text-slate-400">{new Date(r.playedAt).toLocaleString()}</div><div className="text-lg font-black text-slate-800">{r.score} очков</div></div>
                                        <span className="text-[8px] font-black text-blue-500 uppercase">{r.codeUsed}</span>
                                    </div>
                                )) : <p className="text-[10px] font-bold text-slate-300 italic py-4">Игр пока нет</p>}
                              </div>
                          </div>
                          <div className="space-y-4">
                              <h4 className="text-[11px] font-black text-slate-300 uppercase">Коды пользователя</h4>
                              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                {userCodes.length > 0 ? userCodes.map(c => (
                                    <div key={c.code} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <div className="font-mono font-black text-base text-slate-800">{c.code}</div>
                                            {c.isStaffCode && <span className="text-[7px] font-black text-indigo-500 uppercase">Персонал</span>}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase ${c.isUsed ? 'text-red-400' : 'text-emerald-500'}`}>{c.isUsed ? 'Использован' : 'Активен'}</span>
                                    </div>
                                )) : <p className="text-[10px] font-bold text-slate-300 italic py-4">Кодов нет</p>}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {viewingRequest && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 overflow-y-auto">
              <div className="bg-white w-full max-w-[1200px] rounded-[48px] shadow-2xl relative border border-slate-100 flex flex-col md:flex-row max-h-[95vh] overflow-hidden">
                  <button onClick={() => setViewingRequest(null)} className="absolute top-8 right-8 z-50 text-slate-400 hover:text-slate-600 text-3xl font-light transition">&times;</button>
                  
                  {/* Photo area */}
                  <div className="flex-1 bg-slate-100 relative min-h-[300px] md:min-h-full">
                      {viewingPhoto ? <img src={viewingPhoto} className="w-full h-full object-contain" alt="Invoice" /> : <div className="flex items-center justify-center h-full text-slate-300">Загрузка фото...</div>}
                  </div>

                  {/* Sidebar with user info and processing */}
                  <div className="w-full md:w-[600px] bg-white border-l border-slate-100 flex flex-col max-h-full">
                      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                          {/* User Profile Header */}
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm">
                                      {viewingRequest.userName?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                      <h3 className="text-lg font-black text-slate-800 italic uppercase leading-none">{viewingRequest.userName}</h3>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{viewingRequest.userPhone} • {viewingRequest.userCity}</p>
                                  </div>
                              </div>
                              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-right">
                                  <div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Тир игрока</div>
                                  <div className="text-sm font-black text-blue-600 uppercase">{viewingRequest.userTier || 'BASIC'}</div>
                              </div>
                          </div>

                          {/* Calculator Section */}
                          <div className="bg-blue-50/30 p-6 rounded-[32px] border border-blue-100/50">
                              <div className="flex items-center gap-2 mb-6">
                                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><CalculatorIcon /></div>
                                  <h4 className="text-[11px] font-black text-slate-800 uppercase italic tracking-wider">Калькулятор накладной</h4>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  {Object.keys(calcFields).map(name => (
                                      <div key={name} className="space-y-1.5">
                                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight truncate block">{name}</label>
                                          <input 
                                              type="number" 
                                              value={calcFields[name]} 
                                              onChange={e => setCalcFields({...calcFields, [name]: e.target.value})} 
                                              placeholder="0"
                                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:border-blue-400 transition shadow-sm"
                                          />
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-6 pt-6 border-t border-blue-100 flex justify-between items-center">
                                  <div>
                                      <div className="text-[10px] font-black text-slate-400 uppercase">Итого сумма</div>
                                      <div className="text-2xl font-black text-slate-800 tracking-tighter">
                                          {(Object.values(calcFields) as string[]).reduce((acc: number, v: string) => acc + (parseFloat(v) || 0), 0).toLocaleString()} <span className="text-sm font-bold text-slate-400 uppercase">смн</span>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-[10px] font-black text-slate-400 uppercase">Авто-коды</div>
                                      <div className="text-2xl font-black text-blue-600 tracking-tighter">+{processForm.qty}</div>
                                  </div>
                              </div>
                          </div>

                          {/* Final Confirmation Fields */}
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Накладная #</label>
                                      <input type="text" value={processForm.invoice} onChange={e => setProcessForm({...processForm, invoice: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm shadow-inner text-slate-900" />
                                  </div>
                                  <div>
                                      <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Количество кодов</label>
                                      <input type="number" value={processForm.qty} onChange={e => setProcessForm({...processForm, qty: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm shadow-inner text-slate-900" />
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Сумма (смн)</label>
                                      <input type="number" value={processForm.amount} onChange={e => setProcessForm({...processForm, amount: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm shadow-inner text-slate-900" />
                                  </div>
                                  <div>
                                      <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Повысить уровень до:</label>
                                      <div className="relative" ref={tierSelectRef}>
                                          <button 
                                            onClick={() => setIsTierSelectOpen(!isTierSelectOpen)}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-sm shadow-inner text-slate-900 flex justify-between items-center text-left"
                                          >
                                              <div className="flex items-center gap-2">
                                                  <TierIconSmall tier={processForm.tier} />
                                                  <span className="uppercase">{processForm.tier}</span>
                                              </div>
                                              <svg className={`w-4 h-4 text-slate-400 transition-transform ${isTierSelectOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} /></svg>
                                          </button>
                                          {isTierSelectOpen && (
                                              <div className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-fade-in">
                                                  {TIER_LIST.map(t => (
                                                      <button 
                                                        key={t}
                                                        onClick={() => { setProcessForm({...processForm, tier: t}); setIsTierSelectOpen(false); }}
                                                        className={`w-full px-5 py-3 text-left text-xs font-black flex items-center gap-3 transition-colors ${processForm.tier === t ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                                      >
                                                          <TierIconSmall tier={t} />
                                                          {t}
                                                      </button>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                              <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Комментарий (если отказ)</label>
                                  <textarea value={processForm.comment} onChange={e => setProcessForm({...processForm, comment: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold shadow-inner text-slate-900 resize-none h-20" placeholder="Причина отказа..." />
                              </div>
                          </div>
                      </div>

                      <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4 shrink-0">
                          <button onClick={() => handleProcessRequest('reject')} className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl uppercase text-[10px] hover:text-red-500 hover:border-red-100 transition">Отказать</button>
                          <button onClick={() => handleProcessRequest('approve')} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] shadow-xl shadow-blue-100 hover:bg-blue-700 transition">Одобрить и начислить</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {editingPrize && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6">
              <div className="bg-white w-full max-lg rounded-[48px] shadow-2xl relative border border-slate-100 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                  <button onClick={() => setEditingPrize(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 text-3xl font-light transition z-50">&times;</button>
                  
                  <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                      <div className="flex flex-col items-center">
                          <div 
                            onClick={() => prizePhotoInputRef.current?.click()}
                            className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mb-4 relative cursor-pointer group border-4 border-white shadow-xl overflow-hidden"
                          >
                              {editingPrize.imageUrl ? (
                                  <img src={editingPrize.imageUrl} className="w-full h-full object-cover" alt="Prize" />
                              ) : (
                                  <PrizeIcon name={editingPrize.icon} className="w-10 h-10" />
                              )}
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  <span className="text-[8px] font-black uppercase">Изменить</span>
                              </div>
                          </div>
                          <input type="file" accept="image/*" ref={prizePhotoInputRef} onChange={handlePrizePhotoChange} className="hidden" />
                          <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Настройка приза</h3>
                          {editingPrize.imageUrl && (
                              <button onClick={() => setEditingPrize({ ...editingPrize, imageUrl: undefined })} className="text-[9px] font-black text-red-400 uppercase tracking-widest mt-2 hover:text-red-600 transition">Сбросить до иконки</button>
                          )}
                      </div>

                      <div className="space-y-4">
                          <div>
                              <label className="text-[9px] font-black text-slate-500 mb-2 block uppercase tracking-widest">Название</label>
                              <input type="text" placeholder="Введите название..." value={editingPrize.title} onChange={e => setEditingPrize({...editingPrize, title: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border border-slate-100 outline-none focus:bg-white focus:border-blue-400 transition-all shadow-inner text-slate-900 placeholder:text-slate-300" />
                          </div>
                          <div>
                              <label className="text-[9px] font-black text-slate-500 mb-2 block uppercase tracking-widest">Описание</label>
                              <textarea placeholder="О чем этот приз..." value={editingPrize.description} onChange={e => setEditingPrize({...editingPrize, description: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold border border-slate-100 h-24 outline-none focus:bg-white focus:border-blue-400 transition-all shadow-inner resize-none text-sm text-slate-900 placeholder:text-slate-300" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-[9px] font-black text-slate-500 mb-2 block uppercase tracking-widest">Порог очков</label>
                                  <input type="number" value={editingPrize.threshold} onChange={e => setEditingPrize({...editingPrize, threshold: parseInt(e.target.value)})} className="w-full p-5 bg-slate-50 rounded-2xl font-black border border-slate-100 shadow-inner outline-none focus:bg-white focus:border-blue-400 text-slate-900" />
                              </div>
                              <div>
                                  <label className="text-[9px] font-black text-slate-500 mb-2 block uppercase tracking-widest">Уровень (Тир)</label>
                                  <div className="relative" ref={tierSelectRef}>
                                      <button 
                                        type="button"
                                        onClick={() => setIsTierSelectOpen(!isTierSelectOpen)}
                                        className="w-full p-5 bg-slate-50 rounded-2xl font-black border border-slate-100 shadow-inner text-slate-900 flex justify-between items-center text-left focus:border-blue-400 bg-white"
                                      >
                                          <div className="flex items-center gap-2">
                                              <TierIconSmall tier={editingPrize.tier} />
                                              <span>{editingPrize.tier}</span>
                                          </div>
                                          <svg className={`w-4 h-4 text-slate-400 transition-transform ${isTierSelectOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} /></svg>
                                      </button>
                                      {isTierSelectOpen && (
                                          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[300] animate-fade-in">
                                              {TIER_LIST.map(t => (
                                                  <button 
                                                    key={t}
                                                    type="button"
                                                    onClick={() => { setEditingPrize({...editingPrize, tier: t}); setIsTierSelectOpen(false); }}
                                                    className={`w-full px-5 py-3 text-left text-xs font-black flex items-center gap-3 transition-colors ${editingPrize.tier === t ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                                  >
                                                      <TierIconSmall tier={t} />
                                                      {t}
                                                  </button>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-4 py-4 px-2">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                  <input type="checkbox" checked={editingPrize.isOutOfStock} onChange={e => setEditingPrize({...editingPrize, isOutOfStock: e.target.checked})} className="hidden" />
                                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${editingPrize.isOutOfStock ? 'bg-red-500' : 'bg-slate-200'}`}>
                                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${editingPrize.isOutOfStock ? 'translate-x-6' : 'translate-x-0'}`} />
                                  </div>
                                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-800">Нет в наличии</span>
                              </label>
                          </div>
                      </div>
                  </div>

                  <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex gap-3 shrink-0">
                      <button onClick={() => setEditingPrize(null)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-100 transition">Отмена</button>
                      <button onClick={handleSavePrize} disabled={loading} className="flex-[2] py-5 bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200 uppercase text-[10px] tracking-widest hover:bg-slate-900 transition active:scale-95 disabled:opacity-50">
                          {loading ? 'Обработка...' : 'Сохранить'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Manual Crop Modal */}
      {cropImage && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6">
              <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl flex flex-col animate-fade-in overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tight">Обрезка фото</h3>
                      <button onClick={() => setCropImage(null)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                  </div>

                  <div className="relative bg-slate-900 h-[400px] flex items-center justify-center overflow-hidden touch-none"
                       onPointerDown={onCropPointerDown}
                       onPointerMove={onCropPointerMove}
                       onPointerUp={onCropPointerUp}
                       onPointerLeave={onCropPointerUp}
                  >
                      {/* Viewport Overlay */}
                      <div className="absolute inset-0 pointer-events-none z-10">
                          <div className="absolute inset-0 bg-slate-900/60" style={{ clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 150px 150px, 450px 150px, 450px 450px, 150px 450px, 150px 150px)' }}></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border-2 border-white shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]"></div>
                      </div>

                      <img 
                        ref={cropImgRef}
                        src={cropImage} 
                        alt="Crop target" 
                        draggable={false}
                        className="max-w-none transition-transform duration-75 ease-out select-none"
                        style={{ 
                            transform: `translate(${cropPos.x}px, ${cropPos.y}px) scale(${cropZoom})`,
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                      />
                  </div>

                  <div className="p-10 space-y-8">
                      <div>
                          <div className="flex justify-between mb-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Масштаб</label>
                              <span className="text-[10px] font-black text-blue-600">{Math.round(cropZoom * 100)}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="3" 
                            step="0.01" 
                            value={cropZoom} 
                            onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                      </div>

                      <div className="flex gap-4">
                          <button onClick={() => setCropImage(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition">Отмена</button>
                          <button onClick={handleApplyCrop} className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 uppercase text-[10px] tracking-widest hover:bg-blue-700 transition active:scale-95">Применить</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};