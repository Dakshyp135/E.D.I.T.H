import React, { useState, useRef, useEffect } from 'react';
import { useApp, TutorialStep } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Database, Users, User, LogOut, Plus, 
  Trash2, FileText, Lock, Shield, Moon, Sun,
  Smartphone, Eye, PieChart, CreditCard, Scale, Package, 
  Fingerprint, Sparkles, Globe, ChevronRight, X, Phone, 
  ShieldCheck, UserCircle, Settings, Activity, Heart, 
  MessageSquare, AlertTriangle, Key, ArrowUpRight, CheckCircle2,
  Clock, History, Terminal, ShieldAlert, FileDigit, Share2, Bell,
  Camera, Upload, Gamepad2, Coins, Mail, Link as LinkIcon, Info, ChevronDown,
  Edit3, ShieldQuestion, Library, Image as ImageIcon, Video, FileHeart, 
  CloudRain, Zap, Layers, Cpu, Compass, Play, RefreshCw, Download, UserCheck
} from 'lucide-react';
import { AssetCategory, VerificationStatus, Asset, Nominee, Witness, UserRole, Memory } from '../types';

const Dashboard: React.FC = () => {
  const { 
    user, setUser, assets, setAssets, nominees, setNominees, witnesses, setWitnesses,
    memories, setMemories, isDarkMode, setDarkMode, setCurrentPage, tutorialStep, setTutorialStep 
  } = useApp();
  
  const [activeView, setActiveView] = useState<'dashboard' | 'assets' | 'people' | 'archives' | 'safety'>('dashboard');
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isAddingNominee, setIsAddingNominee] = useState(false);
  const [isAddingWitness, setIsAddingWitness] = useState(false);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editingWitness, setEditingWitness] = useState<Witness | null>(null);
  const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isManagingProtocol, setIsManagingProtocol] = useState(false);
  const [showSequence, setShowSequence] = useState(false);
  
  const [assetCategory, setAssetCategory] = useState<AssetCategory>(AssetCategory.SOCIAL);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [nomineePriority, setNomineePriority] = useState<number>(1);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [memoryType, setMemoryType] = useState<'letter' | 'video' | 'image'>('letter');
  const [isMemoryTypeDropdownOpen, setIsMemoryTypeDropdownOpen] = useState(false);
  const [memoryFile, setMemoryFile] = useState<string | null>(null);
  
  const [witnessThreshold, setWitnessThreshold] = useState(user?.witnessThreshold || 2);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const q = query(
      collection(db, 'requests'),
      where('benefactorId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAccessRequests(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'requests'));

    return () => unsubscribe();
  }, [user?.id]);

  const logs = accessRequests.map(req => ({
    event: `Access Request: ${req.nomineeName}`,
    time: req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString() : 'Recent',
    status: req.status.toUpperCase()
  }));

  if (logs.length === 0) {
    logs.push(
      { event: 'Account Sign-in', time: 'Oct 24, 14:22', status: 'Success' },
      { event: 'Safety Rules Updated', time: 'Oct 22, 09:10', status: 'Locked' },
      { event: 'Identity Check', time: 'Oct 20, 11:45', status: 'Verified' },
      { event: 'System Safety Scan', time: 'Oct 15, 23:01', status: 'Passed' },
    );
  }

  const handleDownloadLogs = () => {
    const logData = logs.map(l => `${l.time} - ${l.event} [${l.status}]`).join('\n');
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'EDITH_Activity_Logs.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const memoryFileInputRef = useRef<HTMLInputElement>(null);
  const profilePicRef = useRef<HTMLInputElement>(null);

  const generate12DigitKey = () => {
    return Array.from({length: 12}, () => Math.floor(Math.random() * 10)).join('').replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as any;
    const assetData: Omit<Asset, 'id'> = {
      name: form.assetName.value,
      category: assetCategory,
      handle: form.dynamicField?.value || '',
      password: form.assetPassword?.value || '',
      description: form.description.value,
      attachments: [],
      assignedNomineeIds: [],
      status: 'Locked'
    };
    
    try {
      await addDoc(collection(db, 'users', user.id, 'assets'), assetData);
      setIsAddingAsset(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.id}/assets`);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteDoc(doc(db, 'users', user.id, 'assets', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/assets/${id}`);
      }
    }
  };

  const handleSaveNominee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as any;
    const nomineeData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      relationship: form.relationship.value,
      priority: nomineePriority,
    };

    try {
      if (editingNominee) {
        await updateDoc(doc(db, 'users', user.id, 'nominees', editingNominee.id), nomineeData);
        setEditingNominee(null);
      } else {
        const newNominee: Omit<Nominee, 'id'> = {
          ...nomineeData,
          verificationStatus: VerificationStatus.VERIFIED,
          securityKey: generate12DigitKey()
        };
        await addDoc(collection(db, 'users', user.id, 'nominees'), newNominee);
      }
      setIsAddingNominee(false);
    } catch (error) {
      handleFirestoreError(error, editingNominee ? OperationType.UPDATE : OperationType.CREATE, `users/${user.id}/nominees`);
    }
  };

  const handleDeleteNominee = async (id: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to remove this loved one?")) {
      try {
        await deleteDoc(doc(db, 'users', user.id, 'nominees', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/nominees/${id}`);
      }
    }
  };

  const handleSaveWitness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as any;
    const witnessData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      relationship: form.relationship.value,
    };
    
    try {
      if (editingWitness) {
        await updateDoc(doc(db, 'users', user.id, 'witnesses', editingWitness.id), witnessData);
        setEditingWitness(null);
      } else {
        const newWitness: Omit<Witness, 'id'> = {
          ...witnessData,
          securityKey: generate12DigitKey()
        };
        await addDoc(collection(db, 'users', user.id, 'witnesses'), newWitness);
      }
      setIsAddingWitness(false);
    } catch (error) {
      handleFirestoreError(error, editingWitness ? OperationType.UPDATE : OperationType.CREATE, `users/${user.id}/witnesses`);
    }
  };

  const handleDeleteWitness = async (id: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to revoke trust for this guardian?")) {
      try {
        await deleteDoc(doc(db, 'users', user.id, 'witnesses', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/witnesses/${id}`);
      }
    }
  };

  const handleAddWitnessClick = () => {
    if (nominees.length === 0) {
      alert("Prerequisite Required: Please add at least one Loved One (Heir) to your circle before appointing Guardians for your security council.");
      return;
    }
    setEditingWitness(null);
    setIsAddingWitness(true);
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as any;
    const memoryData = {
      title: form.memoryTitle.value,
      type: memoryType,
      description: form.memoryDescription.value,
      contentUrl: memoryFile || undefined,
    };

    try {
      if (editingMemory) {
        await updateDoc(doc(db, 'users', user.id, 'memories', editingMemory.id), memoryData);
      } else {
        const newMemory: Omit<Memory, 'id'> = {
          ...memoryData,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        };
        await addDoc(collection(db, 'users', user.id, 'memories'), newMemory);
      }
      closeMemoryModal();
    } catch (error) {
      handleFirestoreError(error, editingMemory ? OperationType.UPDATE : OperationType.CREATE, `users/${user.id}/memories`);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!user) return;
    if (confirm("Permanently delete this memory?")) {
      try {
        await deleteDoc(doc(db, 'users', user.id, 'memories', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/memories/${id}`);
      }
    }
  };

  const openEditMemory = (m: Memory) => {
    setEditingMemory(m);
    setMemoryType(m.type);
    setMemoryFile(m.contentUrl || null);
    setIsAddingMemory(true);
  };

  const closeMemoryModal = () => {
    setIsAddingMemory(false);
    setEditingMemory(null);
    setMemoryType('letter');
    setMemoryFile(null);
  };

  const handleMemoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMemoryFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    if (user) {
      const updatedUser = {
        ...user,
        name: form.userName.value,
        phone: form.userPhone.value,
        description: form.userDescription.value,
      };
      try {
        await setDoc(doc(db, 'users', user.id), updatedUser);
        setUser(updatedUser);
        setIsEditingProfile(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      }
    }
  };

  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case AssetCategory.SOCIAL: return <Share2 size={24} />;
      case AssetCategory.FINANCIAL: return <CreditCard size={24} />;
      case AssetCategory.LEGAL: return <FileText size={24} />;
      case AssetCategory.CRYPTO: return <Coins size={24} />;
      case AssetCategory.GAMING: return <Gamepad2 size={24} />;
      default: return <Package size={24} />;
    }
  };

  const showHandles = [AssetCategory.SOCIAL, AssetCategory.GAMING, AssetCategory.CRYPTO].includes(assetCategory);
  const showUpload = [AssetCategory.FINANCIAL, AssetCategory.LEGAL, AssetCategory.PERSONAL].includes(assetCategory);

  return (
    <div className={`flex h-screen overflow-hidden font-['Plus_Jakarta_Sans'] transition-colors duration-700 ${isDarkMode ? 'dark bg-[#020408]' : 'bg-[#F4F7FF]'}`}>
      
      {/* Sidebar */}
      <aside className="w-80 flex flex-col border-r border-slate-200 dark:border-white/10 bg-white/40 dark:bg-void-950/40 backdrop-blur-3xl p-10 z-40">
        <div className="flex flex-col gap-2 mb-20 group cursor-default">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center shadow-accent-glow text-white border-2 border-white/30"
            >
              <Globe size={32} />
            </motion.div>
            <span className="font-black text-5xl tracking-tighter uppercase dark:text-white text-slate-900 leading-none drop-shadow-lg group-hover:text-accent transition-colors duration-500">E.D.I.T.H</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] pl-1 leading-none mt-2 whitespace-nowrap">Emergency Transfer Hub</p>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'assets', label: 'My Assets', icon: <Database size={20} /> },
            { id: 'people', label: 'My Circle', icon: <Users size={20} /> },
            { id: 'archives', label: 'My Memories', icon: <Library size={20} /> },
            { id: 'safety', label: 'Transfer Plan', icon: <ShieldCheck size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-5 px-7 py-5 rounded-[28px] font-black transition-all text-xs uppercase tracking-[0.2em] group relative ${activeView === item.id ? 'bg-accent text-white shadow-accent-glow' : 'text-slate-400 dark:text-zinc-500 hover:text-accent hover:bg-white/10'}`}
            >
              <span className={activeView === item.id ? 'text-white' : 'text-slate-300 dark:text-zinc-700 group-hover:text-accent'}>{item.icon}</span>
              {item.label}
              {activeView === item.id && (
                <motion.div layoutId="nav-glow" className="absolute left-0 w-1.5 h-6 bg-white rounded-full ml-1" />
              )}
            </button>
          ))}
        </nav>

        <div className="pt-10 space-y-3 border-t border-slate-100 dark:border-white/10">
          <button 
            onClick={() => setDarkMode(!isDarkMode)} 
            className="w-full flex items-center gap-5 px-7 py-4 rounded-[28px] font-black text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-xs uppercase tracking-[0.2em]"
          >
            {isDarkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-accent" />} 
            {isDarkMode ? 'Solar' : 'Lunar'}
          </button>
          <button onClick={() => { setUser(null); setCurrentPage('home'); }} className="w-full flex items-center gap-5 px-7 py-4 rounded-[28px] font-black text-rose-500 hover:bg-rose-500/10 transition-all text-xs uppercase tracking-[0.2em]">
            <LogOut size={20} /> Terminate
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-y-auto scroll-smooth custom-scrollbar">
        {/* Header */}
        <header className="mt-14 mb-8 h-28 px-16 flex items-center justify-between sticky top-0 z-30 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto flex items-center gap-5 px-7 py-3 glass border border-slate-200 dark:border-white/20 rounded-full shadow-2xl translate-y-2 h-20"
          >
            <div className="w-14 h-14 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-accent shadow-inner overflow-hidden shrink-0">
               <Sparkles size={24} />
            </div>
            <div className="flex flex-col pr-4">
              <span className="block text-[8px] font-bold uppercase tracking-widest text-accent mb-1">Terminal Secure</span>
              <h2 className="text-sm md:text-base font-black uppercase tracking-[0.1em] dark:text-white text-slate-900 leading-none">Hey, {user?.name.split(' ')[0] || 'User'}</h2>
            </div>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsEditingProfile(true)} 
            className="pointer-events-auto flex items-center gap-5 px-7 py-3 bg-white/20 dark:bg-void-950/40 glass border border-slate-200 dark:border-white/20 rounded-full hover:border-accent transition-all group shadow-2xl active:scale-95 translate-y-2 h-20"
          >
            <div className="text-right hidden md:block pr-5 mr-1 border-r border-white/10">
              <span className="block text-xs font-black uppercase tracking-[0.1em] dark:text-white text-slate-900 leading-none mb-1">{user?.name}</span>
              <span className="block text-[8px] font-bold uppercase tracking-widest text-accent">Active User</span>
            </div>
            <div className="relative group-hover:scale-110 transition-transform duration-500">
              <div className="w-14 h-14 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-accent shadow-inner overflow-hidden">
                 <UserCircle size={40} strokeWidth={1} />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center shadow-lg">
                <Edit3 size={10} className="text-white" />
              </div>
            </div>
          </motion.button>
        </header>

        <div className="p-16 pt-0 pb-40 max-w-[1440px] w-full mx-auto">
          <AnimatePresence mode="wait">
            
            {activeView === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Secured Items', val: assets.length, icon: <Database />, color: 'bg-accent/10 text-accent' },
                    { label: 'My Heirs', val: nominees.length, icon: <Heart />, color: 'bg-rose-500/10 text-rose-500' },
                    { label: 'Witnesses', val: witnesses.length, icon: <ShieldCheck />, color: 'bg-emerald-500/10 text-emerald-500' },
                    { label: 'Hub Status', val: 'Connected', icon: <Activity />, color: 'bg-cyan-500/10 text-cyan-500' },
                  ].map((s, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5, scale: 1.01 }}
                      className="glass p-10 rounded-[56px] shadow-lg flex flex-col justify-between h-56 relative overflow-hidden group border border-white/20"
                    >
                      <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-[0.05] transition-opacity pointer-events-none scale-[2]">{s.icon}</div>
                      <div className={`w-14 h-14 ${s.color} rounded-[22px] flex items-center justify-center mb-4 shadow-inner border-2 border-white/20`}>{s.icon}</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.4em] mb-2">{s.label}</p>
                        <p className="text-4xl font-black dark:text-white text-slate-800 tracking-tighter leading-none">{s.val}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass rounded-[64px] p-12 md:p-16 shadow-xl group border border-white/20 h-full flex flex-col"
                  >
                     <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-10">
                        <div className="flex flex-col">
                          <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white text-slate-800 flex items-center gap-6"><Database size={44} className="text-accent" /> Digital Vault</h3>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2 ml-16">Active heritage assets</p>
                        </div>
                        <button onClick={() => setActiveView('assets')} className="px-10 py-5 glass border-2 border-accent/30 rounded-full text-[11px] font-black text-accent uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-lg active:scale-95">Expand Vault</button>
                     </div>
                     
                     <div className="flex-1">
                      {assets.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 opacity-60">
                            <div className="w-32 h-32 glass rounded-full flex items-center justify-center mb-10 border-2 border-white/10 shadow-inner"><Compass size={64} className="text-slate-300 animate-pulse" /></div>
                            <h4 className="text-3xl font-black uppercase text-slate-400 tracking-tight mb-8">Vault Initializing...</h4>
                            <button onClick={() => setIsAddingAsset(true)} className="px-14 py-7 bg-accent text-white rounded-[32px] font-black text-sm uppercase tracking-widest shadow-accent-glow hover:scale-110 transition-all">Add First Entry</button>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {assets.slice(0, 6).map(a => (
                                <motion.div whileHover={{ y: -3, scale: 1.01 }} key={a.id} className="p-8 glass rounded-[48px] flex items-center gap-6 group/item cursor-pointer hover:bg-white/5 transition-all shadow-md relative overflow-hidden border border-white/10">
                                  <div className="w-16 h-16 md:w-20 md:h-20 icon-box rounded-[32px] flex items-center justify-center shadow-inner group-hover/item:text-accent group-hover/item:scale-110 transition-all border-2 border-white/20 border-b-4 border-b-accent/40 shrink-0">{getCategoryIcon(a.category)}</div>
                                  <div className="min-w-0">
                                      <h5 className="font-black uppercase text-xl dark:text-white text-slate-800 leading-none mb-3 truncate">{a.name}</h5>
                                      <p className="text-[9px] font-black text-accent uppercase tracking-[0.4em] leading-none">{a.category}</p>
                                  </div>
                                </motion.div>
                            ))}
                          </div>
                      )}
                     </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 glass rounded-[64px] p-12 shadow-xl border border-white/20 flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-8">
                       <div className="flex flex-col">
                         <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white text-slate-800 flex items-center gap-4"><Users size={32} className="text-accent" /> My Circle</h3>
                         <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Beneficiaries & Witnesses</p>
                       </div>
                       <button onClick={() => setActiveView('people')} className="w-12 h-12 glass border-2 border-accent/30 rounded-2xl flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all shadow-md active:scale-95"><ChevronRight size={20} /></button>
                    </div>

                    <div className="flex-1 space-y-10">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Loved Ones</span>
                           <span className="text-[10px] font-black text-accent uppercase tracking-widest">{nominees.length}</span>
                        </div>
                        <div className="space-y-3">
                          {nominees.slice(0, 2).map(n => (
                            <div key={n.id} className="p-5 glass rounded-[32px] border border-white/10 flex items-center gap-5 hover:bg-white/5 transition-all">
                               <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/10 shadow-inner shrink-0"><UserCircle size={24} /></div>
                               <div className="min-w-0">
                                  <p className="font-black text-sm dark:text-white uppercase truncate">{n.name}</p>
                                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{n.relationship}</p>
                               </div>
                            </div>
                          ))}
                          {nominees.length === 0 && (
                            <button onClick={() => { setEditingNominee(null); setIsAddingNominee(true); }} className="w-full py-5 border-2 border-dashed border-white/10 rounded-[32px] text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:border-accent hover:text-accent transition-all">+ Add Heir</button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Guardians</span>
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{witnesses.length}</span>
                        </div>
                        <div className="space-y-3">
                          {witnesses.slice(0, 2).map(w => (
                            <div key={w.id} className="p-5 glass rounded-[32px] border border-white/10 flex items-center gap-5 hover:bg-white/5 transition-all">
                               <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner shrink-0"><ShieldCheck size={24} /></div>
                               <div className="min-w-0">
                                  <p className="font-black text-sm dark:text-white uppercase truncate">{w.name}</p>
                                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Witness Council</p>
                               </div>
                            </div>
                          ))}
                          {witnesses.length === 0 && (
                            <button onClick={handleAddWitnessClick} className="w-full py-5 border-2 border-dashed border-white/10 rounded-[32px] text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-all">+ Add Guardian</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                   <motion.div 
                     whileHover={{ scale: 1.01 }}
                     className="bg-accent rounded-[64px] p-16 text-white shadow-lg relative overflow-hidden border border-white/20 group h-full flex flex-col justify-between items-start"
                   >
                      <div className="absolute top-0 right-0 p-20 opacity-15 group-hover:scale-125 transition-transform duration-[4000ms]"><Shield size={360} /></div>
                      <div className="relative z-10 text-left">
                         <div className="flex items-center gap-6 mb-14">
                            <div className="w-20 h-20 bg-white/20 rounded-[32px] flex items-center justify-center shadow-inner border-2 border-white/30"><Zap size={40} className="animate-pulse" /></div>
                            <span className="text-sm font-black uppercase tracking-[0.6em]">Emergency Succession</span>
                         </div>
                         <h3 className="text-7xl font-black uppercase tracking-tighter mb-10 leading-[0.85] text-left">On-Demand <br/>Authorization.</h3>
                         <p className="text-white/80 text-3xl font-medium leading-relaxed italic pr-6 drop-shadow-md text-left">"Legacy release is triggered manually by your designated heirs during emergency events."</p>
                      </div>
                      <button onClick={() => setActiveView('safety')} className="relative z-10 w-full py-9 bg-white text-accent rounded-[40px] font-black text-base uppercase tracking-[0.5em] shadow-xl hover:scale-[1.03] active:scale-95 transition-all mt-10">Audit Succession Plan</button>
                   </motion.div>

                   <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-[64px] p-16 shadow-xl transition-all duration-1000 group flex flex-col border border-white/20"
                  >
                     <div className="flex items-center justify-between mb-12">
                        <div className="flex flex-col">
                          <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white text-slate-800 flex items-center gap-5"><Library size={36} className="text-accent group-hover:rotate-12 transition-transform" /> My Memories</h3>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2 ml-14">Heritage vault preview</p>
                        </div>
                        <button onClick={() => setActiveView('archives')} className="px-10 py-4 glass border-2 border-accent/30 rounded-full text-[10px] font-black text-accent uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-md active:scale-95">Archives</button>
                     </div>
                     <div className="flex-1 space-y-6">
                        {memories.slice(0, 4).map(m => (
                          <motion.div 
                            key={m.id} 
                            whileHover={{ scale: 1.01 }}
                            className="p-8 glass rounded-[44px] border border-white/10 group/item hover:bg-white/10 transition-all cursor-pointer flex items-center gap-8 shadow-sm"
                          >
                             <div className="w-16 h-16 bg-accent/20 text-accent rounded-3xl flex items-center justify-center border-2 border-accent/20">{m.type === 'letter' ? <FileHeart size={28} /> : m.type === 'video' ? <Video size={28} /> : <ImageIcon size={28} />}</div>
                             <div className="min-w-0 flex-1">
                               <h4 className="text-xl font-black uppercase text-slate-800 dark:text-white mb-1 tracking-tight leading-none truncate">{m.title}</h4>
                               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{m.date}</p>
                             </div>
                             <ChevronRight size={16} className="text-accent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </motion.div>
                        ))}
                     </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeView === 'assets' && (
              <motion.div key="assets" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                <div className="flex items-center justify-between border-b border-white/10 pb-8">
                   <div>
                     <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter dark:text-white text-slate-800 leading-none mb-3">My Assets</h3>
                     <p className="text-slate-500 text-xl font-medium italic">"Every digital footprint matters."</p>
                   </div>
                   <button onClick={() => setIsAddingAsset(true)} className="px-8 py-4 bg-accent text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-4 hover:scale-105 active:scale-95 transition-all">
                     <Plus size={24}/> Add New Item
                   </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {assets.map(a => (
                    <motion.div key={a.id} whileHover={{ y: -5, scale: 1.01 }} className="glass p-10 rounded-[48px] shadow-lg relative overflow-hidden group border border-white/20">
                        <div className="absolute -top-10 -right-10 opacity-[0.03] dark:opacity-[0.07] group-hover:opacity-15 transition-all duration-700 pointer-events-none scale-[2]"><Database size={150}/></div>
                         <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="w-16 h-16 bg-accent/10 rounded-[24px] flex items-center justify-center text-accent shadow-inner border-2 border-accent/20 group-hover:scale-110 transition-transform">{getCategoryIcon(a.category)}</div>
                            <button onClick={() => handleDeleteAsset(a.id)} className="w-10 h-10 rounded-[18px] bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-md border border-rose-500/20"><Trash2 size={20} /></button>
                         </div>
                         <h4 className="text-2xl font-black uppercase tracking-tight dark:text-white text-slate-800 mb-2 relative z-10 leading-tight group-hover:text-accent transition-colors truncate">{a.name}</h4>
                         <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-8 relative z-10">{a.category}</p>
                         
                         <div className="bg-slate-50 dark:bg-black/30 p-8 rounded-[32px] border border-white/10 mb-8 relative z-10 shadow-inner group-hover:border-accent/20 transition-all">
                            <p className="text-zinc-500 text-base leading-relaxed font-medium line-clamp-3 italic">"{a.description || 'No specific instructions added...'}"</p>
                         </div>
                    </motion.div>
                  ))}
                  {assets.length === 0 && (
                    <button onClick={() => setIsAddingAsset(true)} className="col-span-full py-32 border-4 border-dashed border-white/20 rounded-[64px] flex flex-col items-center justify-center gap-8 group hover:border-accent hover:bg-accent/5 transition-all shadow-inner">
                       <Database size={64} className="text-zinc-700 group-hover:scale-125 transition-all duration-700 animate-pulse" />
                       <p className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">Secure your first asset</p>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {activeView === 'people' && (
               <motion.div key="people" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-16">
                  <section>
                    <div className="flex items-center justify-between border-b border-white/10 pb-8">
                      <div>
                        <h3 className="text-5xl font-black uppercase tracking-tighter dark:text-white text-slate-800 leading-none mb-4">Loved Ones</h3>
                        <p className="text-slate-500 text-lg font-medium italic">"The people who will keep your legacy alive."</p>
                      </div>
                      <button onClick={() => { setEditingNominee(null); setIsAddingNominee(true); }} className="px-10 py-5 bg-accent text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all border border-white/20"><Plus size={20}/> Add Loved One</button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
                      {nominees.map(n => (
                        <motion.div key={n.id} whileHover={{ y: -5, scale: 1.01 }} className="glass p-10 rounded-[48px] shadow-lg relative overflow-hidden group border border-white/20">
                           <div className="flex items-center justify-between mb-8">
                              <div className="w-16 h-16 bg-accent/10 rounded-[24px] flex items-center justify-center text-accent shadow-inner border-2 border-accent/20 group-hover:scale-110 transition-transform"><UserCircle size={32} /></div>
                              <div className="flex flex-col items-end">
                                <span className={`px-4 py-1.5 rounded-full ${n.priority === 1 ? 'bg-accent text-white shadow-md' : 'bg-white/5 text-zinc-500'} font-black text-[9px] uppercase tracking-widest mb-2`}>Heir {n.priority}</span>
                                <span className="text-[8px] font-black text-accent uppercase tracking-[0.2em]">ID: {n.securityKey}</span>
                              </div>
                           </div>
                           <h4 className="text-2xl font-black dark:text-white text-slate-800 uppercase mb-2 tracking-tighter leading-none">{n.name}</h4>
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">{n.relationship}</p>
                           <div className="flex justify-between items-center pt-8 border-t border-white/10">
                              <div className="flex items-center gap-4">
                                <button onClick={() => { setEditingNominee(n); setNomineePriority(n.priority); setIsAddingNominee(true); }} className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline transition-all">Edit Details</button>
                                <button onClick={() => handleDeleteNominee(n.id)} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all">Remove</button>
                              </div>
                              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/><span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Added</span></div>
                           </div>
                        </motion.div>
                      ))}
                      {nominees.length === 0 && (
                        <div className="col-span-full py-24 glass rounded-[48px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center px-10">
                           <Heart size={48} className="text-zinc-500 mb-6 opacity-30" />
                           <h4 className="text-2xl font-black uppercase text-zinc-500 tracking-tighter mb-3">No Heirs Designated</h4>
                           <p className="text-zinc-500 font-medium max-w-sm mb-8">Add your loved ones here to ensure they can securely receive your digital legacy when the time comes.</p>
                           <button onClick={() => { setEditingNominee(null); setIsAddingNominee(true); }} className="px-10 py-5 bg-accent text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-lg flex items-center gap-3 hover:scale-105 transition-all border border-white/20">+ Add Your First Heir</button>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="pt-8">
                    <div className="flex items-center justify-between border-b border-white/10 pb-8">
                      <div>
                        <h3 className="text-5xl font-black uppercase tracking-tighter dark:text-white text-slate-800 leading-none mb-4">Guardians</h3>
                        <p className="text-slate-500 text-lg font-medium italic">"Trusted witnesses who confirm important life events."</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setIsManagingProtocol(true)}
                          className="px-8 py-5 glass border-2 border-white/10 text-zinc-500 rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3 border border-white/10"
                        >
                          <Settings size={20} /> Manage Threshold
                        </button>
                        <button 
                          onClick={handleAddWitnessClick} 
                          className="px-10 py-5 bg-emerald-500 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all border border-white/20"
                        >
                          <Plus size={20}/> Add Guardian
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
                      {witnesses.map(w => (
                        <motion.div key={w.id} whileHover={{ y: -5, scale: 1.01 }} className="glass p-10 rounded-[48px] shadow-lg relative overflow-hidden group border border-white/20">
                           <div className="flex items-center justify-between mb-8">
                              <div className="w-16 h-16 bg-emerald-500/10 rounded-[24px] flex items-center justify-center text-emerald-500 shadow-inner border-2 border-emerald-500/20 group-hover:scale-110 transition-transform"><ShieldCheck size={32} /></div>
                              <div className="flex flex-col items-end">
                                <span className="px-4 py-1.5 rounded-full bg-white/10 text-zinc-500 font-black text-[9px] uppercase tracking-widest mb-2 border border-white/5">Guardian</span>
                                <span className="text-[8px] font-black text-accent uppercase tracking-[0.2em]">ID: {w.securityKey}</span>
                              </div>
                           </div>
                           <h4 className="text-2xl font-black dark:text-white text-slate-800 uppercase mb-2 tracking-tighter leading-none">{w.name}</h4>
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">{w.relationship}</p>
                           <div className="flex justify-between items-center pt-8 border-t border-white/10">
                              <div className="flex items-center gap-4">
                                <button onClick={() => { setEditingWitness(w); setIsAddingWitness(true); }} className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline transition-all">Edit Details</button>
                                <button onClick={() => handleDeleteWitness(w.id)} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all">Revoke Trust</button>
                              </div>
                              <div className="flex items-center gap-2"><Activity size={16} className="text-emerald-500"/><span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Active Witness</span></div>
                           </div>
                        </motion.div>
                      ))}
                      {witnesses.length === 0 && (
                        <div className="col-span-full py-24 glass rounded-[48px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center px-10">
                           <ShieldCheck size={48} className="text-zinc-500 mb-6 opacity-30" />
                           <h4 className="text-2xl font-black uppercase text-zinc-500 tracking-tighter mb-3">No Guardians Appointed</h4>
                           <p className="text-zinc-500 font-medium max-w-sm mb-8">
                              {nominees.length > 0 
                                ? "Appoint trusted witnesses to verify heritage release requests and ensure your assets are shared safely."
                                : "You must add at least one Loved One (Heir) before you can appoint guardians for your security council."
                              }
                           </p>
                           <button 
                              onClick={handleAddWitnessClick} 
                              className={`px-10 py-5 ${nominees.length > 0 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'} rounded-[24px] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 transition-all border border-white/20`}
                           >
                              + Add Your Security Council
                           </button>
                        </div>
                      )}
                    </div>
                  </section>
               </motion.div>
            )}

            {activeView === 'archives' && (
              <motion.div key="archives" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-16">
                 <div className="flex items-center justify-between border-b border-white/10 pb-12">
                   <div>
                     <h3 className="text-7xl font-black uppercase tracking-tighter dark:text-white text-slate-800 leading-none mb-6">My Memories</h3>
                     <p className="text-slate-500 text-2xl font-medium italic">"Preserve the narrative, not just the data."</p>
                   </div>
                   <button onClick={() => setIsAddingMemory(true)} className="px-12 py-7 bg-accent text-white rounded-[40px] font-black text-sm uppercase tracking-[0.3em] shadow-lg flex items-center gap-4 hover:scale-105 active:scale-95 transition-all border border-white/20"><Plus size={32}/> Save New Story</button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {memories.map(m => (
                    <motion.div key={m.id} whileHover={{ y: -10, scale: 1.01 }} className="glass p-14 rounded-[72px] shadow-xl relative overflow-hidden group border border-white/20">
                       <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button onClick={() => openEditMemory(m)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-accent text-white transition-all shadow-md border border-white/10"><Edit3 size={20} /></button>
                          <button onClick={() => handleDeleteMemory(m.id)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-rose-500 text-white transition-all shadow-md border border-white/10"><Trash2 size={20} /></button>
                       </div>
                       <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:opacity-15 transition-all duration-700 pointer-events-none scale-150"><Library size={200}/></div>
                       <div className="w-20 h-20 bg-accent/10 rounded-[32px] flex items-center justify-center text-accent mb-12 border-2 border-accent/20 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                          {m.contentUrl && (m.type === 'image' || m.type === 'video') ? (
                            <img src={m.contentUrl} className="w-full h-full object-cover" />
                          ) : (
                            m.type === 'letter' ? <FileHeart size={40} /> : m.type === 'video' ? <Video size={40} /> : <ImageIcon size={40} />
                          )}
                       </div>
                       <h4 className="text-4xl font-black uppercase text-slate-800 dark:text-white mb-6 tracking-tighter leading-none">{m.title}</h4>
                       <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-12 leading-relaxed font-medium line-clamp-3 italic">"{m.description}"</p>
                       <div className="flex items-center justify-between pt-10 border-t border-white/10">
                          <span className="text-xs font-black uppercase text-accent tracking-[0.25em]">{m.type}</span>
                          <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">{m.date}</span>
                       </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'safety' && (
              <motion.div key="safety" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
                 <header className="mb-24 text-left border-l-8 border-accent pl-12">
                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.7em] mb-4">Safety Control Hub</p>
                    <h2 className="text-8xl font-black uppercase tracking-tighter dark:text-white text-slate-800 mb-10 leading-none">Safety <br/><span className="text-accent italic">Plan</span></h2>
                    <p className="text-zinc-500 text-3xl font-medium max-w-4xl leading-relaxed italic opacity-80">Review who has accessed your vault and check the security steps your family will follow during an emergency.</p>
                 </header>

                 <div className="grid lg:grid-cols-2 gap-12 w-full items-stretch">
                    {/* Activity Logs (Simplified) */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass p-16 rounded-[64px] shadow-2xl flex flex-col border-2 border-white/10 overflow-hidden text-left bg-white/[0.01]"
                    >
                       <div className="flex items-center gap-6 mb-12">
                          <div className="w-16 h-16 bg-accent/20 rounded-[24px] flex items-center justify-center border-2 border-accent/30 shadow-highlight">
                             <History size={32} className="text-accent" />
                          </div>
                          <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white text-slate-800">Recent Activity</h3>
                       </div>

                       <div className="flex-1 space-y-6 mb-12 overflow-y-auto custom-scrollbar pr-4">
                          {logs.map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-[32px] bg-black/5 dark:bg-white/5 border border-white/10 hover:border-accent/30 transition-all group">
                               <div className="min-w-0">
                                  <p className="text-base font-black dark:text-white uppercase truncate tracking-tight">{log.event}</p>
                                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">{log.time}</p>
                               </div>
                               <span className="text-[10px] font-black text-accent uppercase tracking-widest px-4 py-1.5 bg-accent/10 rounded-xl border border-accent/20 shadow-inner">{log.status}</span>
                            </div>
                          ))}
                          <p className="text-[11px] text-zinc-400 italic opacity-60 pl-2">Last checked: Just now</p>
                       </div>

                       <button 
                         onClick={handleDownloadLogs}
                         className="w-full py-7 bg-white/5 hover:bg-accent hover:text-white border border-white/10 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group mt-auto"
                       >
                         <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> Download Activity Record
                       </button>
                    </motion.div>

                    {/* How Access Works (Simplified) */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass p-16 rounded-[64px] shadow-lg flex flex-col border-2 border-white/10 relative overflow-hidden group text-left bg-white/[0.01]"
                    >
                       <div className="absolute -top-10 -right-10 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                          <Shield size={300} className="text-accent" />
                       </div>
                       
                       <div className="relative z-10 flex flex-col h-full">
                          <div className="w-16 h-16 bg-accent/20 rounded-[24px] flex items-center justify-center mb-12 border-2 border-accent/30 shadow-accent-glow">
                             <Zap size={32} className="text-accent animate-pulse"/>
                          </div>
                          <h3 className="text-4xl font-black uppercase tracking-tighter mb-8 dark:text-white text-slate-800">Emergency Access Steps</h3>
                          <p className="text-zinc-500 text-xl font-medium leading-relaxed mb-12">
                             Your vault is private by default. If an emergency happens, your family can gain access only after completing 5 verified safety checks.
                          </p>
                          
                          <div className="grid grid-cols-1 gap-4 mb-auto">
                             <div className="p-6 glass rounded-[32px] border border-white/5 bg-white/1 flex items-center gap-6">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><Heart size={20}/></div>
                                <div>
                                  <span className="block text-[8px] font-black text-accent uppercase mb-1 tracking-widest">Setup Type</span>
                                  <span className="block text-sm font-black text-white uppercase tracking-tighter">Family Trust Sharing</span>
                                </div>
                             </div>
                             <div className="p-6 glass rounded-[32px] border border-white/5 bg-white/1 flex items-center gap-6">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><UserCheck size={20}/></div>
                                <div>
                                  <span className="block text-[8px] font-black text-accent uppercase mb-1 tracking-widest">Approval</span>
                                  <span className="block text-sm font-black text-white uppercase tracking-tighter">Human Witness Check</span>
                                </div>
                             </div>
                          </div>

                          <button 
                            onClick={() => setShowSequence(true)}
                            className="group relative w-full py-8 mt-12 bg-accent text-white rounded-[32px] font-black text-xl uppercase tracking-[0.2em] shadow-accent-glow hover:scale-[1.02] transition-all overflow-hidden border-t-2 border-white/20"
                          >
                             <div className="relative z-10 flex items-center justify-center gap-5">
                                <Eye size={28} /> View Access Blueprint
                             </div>
                             <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                          </button>
                       </div>
                    </motion.div>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* MODALS */}
      
      {/* Sequence Overlay Modal */}
      <AnimatePresence>
        {showSequence && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-void-950/90 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass w-full max-w-2xl rounded-[64px] shadow-3d border border-white/20 p-12 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowSequence(false)}
                className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-white"
              >
                <X size={28} />
              </button>

              <div className="flex flex-col items-center text-center mb-12">
                 <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 border border-accent/20">
                    <ShieldCheck size={32} />
                 </div>
                 <h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter leading-none mb-4">Security Checks</h2>
                 <p className="text-zinc-500 font-medium text-lg">Safe access requires 5 layers of verification.</p>
              </div>

              <div className="space-y-4">
                {[
                  { step: 1, icon: <Key size={20} />, title: "Family Key Check", desc: "Your heir provides the private 12-digit heritage key." },
                  { step: 2, icon: <Lock size={20} />, title: "Identity Scan", desc: "We verify your family member is who they say they are." },
                  { step: 3, icon: <FileText size={20} />, title: "Event Evidence", desc: "Your heir uploads proof like a legal certificate." },
                  { step: 4, icon: <UserCheck size={20} />, title: "Council Approval", desc: "Your chosen witnesses manually review and approve access." },
                  { step: 5, icon: <Activity size={20} />, title: "Secure Release", desc: "The vault is safely shared with your designated heir." }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-6 p-6 glass rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-black text-sm border border-accent/20">
                      {item.step}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-black text-xs uppercase tracking-widest dark:text-white flex items-center gap-2">
                         {item.icon} {item.title}
                      </p>
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={() => setShowSequence(false)}
                className="w-full mt-10 py-5 glass border border-white/10 rounded-3xl font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-all shadow-inner"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Asset Modal */}
      <AnimatePresence>
        {isAddingAsset && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/95 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="glass p-6 md:p-10 rounded-[32px] md:rounded-[56px] max-w-3xl w-full shadow-2xl relative overflow-hidden border border-white/20"
            >
               <button onClick={() => setIsAddingAsset(false)} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-rose-500"><X size={28}/></button>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-accent/10 rounded-[20px] flex items-center justify-center text-accent shadow-inner border-2 border-accent/20"><Database size={24} /></div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black dark:text-white text-slate-800 uppercase tracking-tighter leading-none">Vault Record</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Secure a high-value digital asset</p>
                  </div>
               </div>
               
               <form onSubmit={handleSaveAsset} className="space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] px-4">Asset Name</label>
                       <input name="assetName" required placeholder="Asset title..." className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[20px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] px-4">Class</label>
                       <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[20px] text-left font-black dark:text-white text-base flex items-center justify-between shadow-inner focus:border-accent transition-all"
                        >
                           <span>{assetCategory}</span>
                           <ChevronDown size={18} className={`text-accent transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isCategoryDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-full left-0 right-0 mt-3 glass bg-white/95 dark:bg-[#0A0F1E]/95 backdrop-blur-3xl rounded-[28px] border-2 border-white/10 shadow-3d z-[100] overflow-hidden"
                            >
                              <div className="max-h-60 overflow-y-auto custom-scrollbar p-3">
                                {Object.values(AssetCategory).map(c => (
                                  <button 
                                    key={c}
                                    type="button"
                                    onClick={() => { setAssetCategory(c); setIsCategoryDropdownOpen(false); }}
                                    className={`w-full text-left px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${assetCategory === c ? 'bg-accent text-white shadow-md' : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-accent'}`}
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                       </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {showHandles && (
                      <motion.div key="handles" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid grid-cols-2 gap-6 overflow-hidden">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] px-4">Account ID</label>
                           <input name="dynamicField" placeholder="@myaccount" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[20px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] px-4">Password</label>
                           <input name="assetPassword" type="password" placeholder="••••••••" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[20px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                        </div>
                      </motion.div>
                    )}
                    {showUpload && (
                      <motion.div key="upload" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                        <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] px-4">Files</label>
                        <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="w-full p-8 border-2 border-dashed border-white/20 rounded-[24px] glass flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-accent hover:bg-accent/5 transition-all shadow-inner"
                        >
                           <Upload className="text-zinc-600 group-hover:text-accent transition-all" size={32}/>
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Upload high-res files</span>
                           <input type="file" ref={fileInputRef} className="hidden" multiple />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] px-4">Succession Notes</label>
                    <textarea name="description" placeholder="Final instructions for this asset..." className="w-full h-24 px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-medium dark:text-white text-sm resize-none shadow-inner leading-relaxed transition-all"></textarea>
                  </div>

                  <div className="flex gap-6 pt-4">
                    <button type="submit" className="flex-1 py-5 bg-accent text-white rounded-[24px] font-black text-xl uppercase tracking-tighter shadow-lg hover:scale-[1.02] active:scale-95 transition-all border border-white/20">Secure Entry</button>
                    <button type="button" onClick={() => setIsAddingAsset(false)} className="px-8 py-5 glass border-2 border-white/10 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black/5 dark:hover:bg-white/10 transition-all">Cancel</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Nominee Modal */}
      <AnimatePresence>
        {isAddingNominee && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-8 md:p-12 rounded-[40px] md:rounded-[64px] max-w-3xl w-full shadow-2xl relative border border-white/20">
               <button onClick={() => { setIsAddingNominee(false); setEditingNominee(null); }} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-rose-500"><X size={32}/></button>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-accent/10 rounded-[24px] flex items-center justify-center text-accent shadow-inner border-2 border-accent/20"><Heart size={28} /></div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black dark:text-white text-slate-800 uppercase tracking-tighter leading-none">{editingNominee ? 'Edit Details' : 'Add Loved One'}</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Designate a legacy heir</p>
                  </div>
               </div>
               
               <form onSubmit={handleSaveNominee} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <input name="name" required defaultValue={editingNominee?.name} placeholder="Legal Full Name" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                    <input name="relationship" required defaultValue={editingNominee?.relationship} placeholder="Relationship (e.g. Spouse)" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <input name="email" required type="email" defaultValue={editingNominee?.email} placeholder="Personal Email" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                    <input name="phone" required defaultValue={editingNominee?.phone} placeholder="Contact Number" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-accent uppercase tracking-[0.3em] px-4">Heir Priority</label>
                     <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                          className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] text-left font-black dark:text-white text-base flex items-center justify-between shadow-inner focus:border-accent transition-all"
                        >
                           <span>{nomineePriority === 1 ? 'Primary Heir' : nomineePriority === 2 ? 'Secondary Heir' : 'Tertiary Heir'}</span>
                           <ChevronDown size={20} className={`text-accent transition-transform duration-300 ${isPriorityDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isPriorityDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-full left-0 right-0 mt-3 glass bg-white/95 dark:bg-[#0A0F1E]/95 backdrop-blur-3xl rounded-[32px] border-2 border-white/10 shadow-3d z-[100] overflow-hidden"
                            >
                              <div className="max-h-60 overflow-y-auto custom-scrollbar p-3">
                                {[1, 2, 3].map(p => (
                                  <button 
                                    key={p}
                                    type="button"
                                    onClick={() => { setNomineePriority(p); setIsPriorityDropdownOpen(false); }}
                                    className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${nomineePriority === p ? 'bg-accent text-white shadow-sm' : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-accent'}`}
                                  >
                                    {p === 1 ? 'Primary Heir' : p === 2 ? 'Secondary Heir' : 'Tertiary Heir'}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                  </div>

                  <div className="flex gap-6 pt-6">
                    <button type="submit" className="flex-1 py-5 bg-accent text-white rounded-[24px] font-black text-xl uppercase tracking-tighter shadow-lg hover:scale-[1.02] active:scale-95 transition-all border border-white/20">{editingNominee ? 'Save Changes' : 'Enroll Heir'}</button>
                    <button type="button" onClick={() => { setIsAddingNominee(false); setEditingNominee(null); }} className="px-8 py-5 glass border-2 border-white/10 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black/5 dark:hover:bg-white/10 transition-all">Cancel</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Witness Modal */}
      <AnimatePresence>
        {isAddingWitness && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-8 md:p-12 rounded-[40px] md:rounded-[64px] max-w-3xl w-full shadow-2xl relative border border-white/20">
               <button onClick={() => { setIsAddingWitness(false); setEditingWitness(null); }} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-rose-500"><X size={32}/></button>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-[24px] flex items-center justify-center text-emerald-500 shadow-inner border-2 border-emerald-500/20"><ShieldCheck size={28} /></div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black dark:text-white text-slate-800 uppercase tracking-tighter leading-none">{editingWitness ? 'Edit Guardian' : 'Appoint Guardian'}</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Designate a trusted witness</p>
                  </div>
               </div>
               
               <form onSubmit={handleSaveWitness} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <input name="name" required defaultValue={editingWitness?.name} placeholder="Legal Full Name" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                    <input name="relationship" required defaultValue={editingWitness?.relationship} placeholder="Relationship (e.g. Attorney)" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <input name="email" required type="email" defaultValue={editingWitness?.email} placeholder="Verified Email" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                    <input name="phone" required defaultValue={editingWitness?.phone} placeholder="Contact Number" className="w-full px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner" />
                  </div>

                  <div className="p-6 glass bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[32px] flex items-start gap-5">
                    <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
                    <p className="text-[11px] font-medium text-zinc-500 leading-relaxed italic">"Guardians are only alerted when heirs initiate a heritage claim. They act as impartial witnesses to confirm the validity of the request."</p>
                  </div>

                  <div className="flex gap-6 pt-6">
                    <button type="submit" className="flex-1 py-5 bg-emerald-500 text-white rounded-[24px] font-black text-xl uppercase tracking-tighter shadow-lg hover:scale-[1.02] active:scale-95 transition-all border border-white/20">{editingWitness ? 'Save Changes' : 'Appoint Witness'}</button>
                    <button type="button" onClick={() => { setIsAddingWitness(false); setEditingWitness(null); }} className="px-8 py-5 glass border-2 border-white/10 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black/5 dark:hover:bg-white/10 transition-all">Cancel</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Memory Modal */}
      <AnimatePresence>
        {isAddingMemory && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-8 md:p-10 rounded-[40px] md:rounded-[56px] max-w-xl w-full shadow-2xl relative border border-white/20">
               <button onClick={closeMemoryModal} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-rose-500"><X size={28}/></button>
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-[20px] flex items-center justify-center text-accent shadow-inner border-2 border-accent/20 shadow-accent-glow"><Library size={24} /></div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black dark:text-white text-slate-800 uppercase tracking-tighter leading-none">{editingMemory ? 'Update Story' : 'Preserve Story'}</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Archive a legacy memory</p>
                  </div>
               </div>
               
               <form onSubmit={handleSaveMemory} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] px-4">Title</label>
                       <input name="memoryTitle" required defaultValue={editingMemory?.title} placeholder="Name your memory..." className="w-full px-5 py-3 glass bg-white/5 border-2 border-white/10 rounded-[18px] outline-none focus:border-accent font-black dark:text-white text-sm shadow-inner" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] px-4">Media Type</label>
                       <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setIsMemoryTypeDropdownOpen(!isMemoryTypeDropdownOpen)}
                          className="w-full px-5 py-3 glass bg-white/5 border-2 border-white/10 rounded-[18px] text-left font-black dark:text-white text-sm flex items-center justify-between shadow-inner focus:border-accent transition-all"
                        >
                           <span className="capitalize">{memoryType}</span>
                           <ChevronDown size={16} className={`text-accent transition-transform duration-300 ${isMemoryTypeDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isMemoryTypeDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-full left-0 right-0 mt-2 glass bg-white/95 dark:bg-[#0A0F1E]/95 backdrop-blur-3xl rounded-[22px] border-2 border-white/10 shadow-3d z-[100] overflow-hidden"
                            >
                              <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                {['letter', 'video', 'image'].map(type => (
                                  <button 
                                    key={type}
                                    type="button"
                                    onClick={() => { setMemoryType(type as any); setIsMemoryTypeDropdownOpen(false); setMemoryFile(null); }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all capitalize ${memoryType === type ? 'bg-accent text-white shadow-sm' : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-accent'}`}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                       </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {memoryType !== 'letter' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2">
                         <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] px-4">Upload {memoryType}</label>
                         <div 
                           onClick={() => memoryFileInputRef.current?.click()}
                           className="relative w-full aspect-[21/9] border-2 border-dashed border-white/20 rounded-[22px] glass flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-accent transition-all shadow-inner overflow-hidden"
                         >
                            {memoryFile ? (
                              <div className="absolute inset-0 w-full h-full">
                                {memoryType === 'image' ? (
                                  <img src={memoryFile} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-black/40">
                                    <Play size={32} className="text-white fill-white" />
                                    <p className="absolute bottom-3 font-black text-[8px] text-white uppercase tracking-widest">Video selected</p>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <RefreshCw size={24} className="text-white" />
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="text-zinc-600 group-hover:text-accent" size={24} />
                                <div className="text-center">
                                  <p className="text-[10px] font-black dark:text-white uppercase tracking-tighter">Click to upload</p>
                                </div>
                              </>
                            )}
                            <input type="file" ref={memoryFileInputRef} className="hidden" accept={memoryType === 'image' ? "image/*" : "video/*"} onChange={handleMemoryFileUpload} />
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] px-4">Description</label>
                    <textarea name="memoryDescription" required defaultValue={editingMemory?.description} placeholder="The message behind this memory..." className="w-full h-24 px-5 py-3 glass bg-white/5 border-2 border-white/10 rounded-[18px] outline-none focus:border-accent font-medium dark:text-white text-sm resize-none shadow-inner leading-relaxed"></textarea>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button type="submit" className="flex-1 py-4 bg-accent text-white rounded-[18px] font-black text-base uppercase tracking-tighter shadow-lg hover:scale-[1.02] active:scale-95 transition-all border border-white/20">{editingMemory ? 'Save Changes' : 'Preserve Memory'}</button>
                    <button type="button" onClick={closeMemoryModal} className="px-6 py-4 glass border-2 border-white/10 rounded-[18px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black/5 dark:hover:bg-white/10 transition-all">Cancel</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Threshold Modal */}
      <AnimatePresence>
        {isManagingProtocol && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-slate-900/60 dark:bg-black/90 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-12 rounded-[50px] max-w-lg w-full shadow-2xl text-center relative border border-white/20">
               <h2 className="text-2xl font-black mb-10 dark:text-white uppercase tracking-tighter">Council Quorum</h2>
               <div className="flex items-center justify-center gap-6 mb-10">
                  <button onClick={() => setWitnessThreshold(Math.max(1, witnessThreshold - 1))} className="w-14 h-14 glass rounded-2xl border-2 border-white/10 text-2xl font-black text-zinc-400 hover:text-white transition-all shadow-sm">-</button>
                  <div className="text-center">
                     <p className="text-6xl font-black dark:text-white">{witnessThreshold}</p>
                     <p className="text-[8px] font-black uppercase text-accent mt-2 tracking-widest">Required Consensus</p>
                  </div>
                  <button onClick={() => setWitnessThreshold(Math.min(witnesses.length || 3, witnessThreshold + 1))} className="w-14 h-14 glass rounded-2xl border-2 border-white/10 text-2xl font-black text-zinc-400 hover:text-white transition-all shadow-sm">+</button>
               </div>
               <button onClick={() => setIsManagingProtocol(false)} className="w-full py-5 bg-accent text-white rounded-[24px] font-black uppercase tracking-widest shadow-lg border border-white/20">Lock Protocol</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-0 rounded-[48px] max-w-2xl w-full border border-white/20 shadow-2xl relative overflow-hidden">
               <div className="bg-accent/10 px-10 py-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-md border-2 border-white/30"><UserCircle size={24} /></div>
                    <div>
                       <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter leading-none">Identity Core</h2>
                       <p className="text-[8px] font-black text-accent uppercase tracking-[0.3em] mt-1">Benefactor Metadata Update</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditingProfile(false)} className="p-2.5 bg-black/10 dark:bg-white/10 hover:bg-rose-500/10 hover:text-rose-500 rounded-full transition-all text-zinc-500"><X size={20}/></button>
               </div>

               <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
                  <div className="flex flex-col md:flex-row gap-10 items-start">
                     <div className="flex flex-col items-center gap-4 shrink-0">
                        <div className="relative group cursor-pointer" onClick={() => profilePicRef.current?.click()}>
                           <div className="w-32 h-32 rounded-[40px] bg-accent/5 border-2 border-dashed border-accent/20 flex items-center justify-center text-accent group-hover:border-accent transition-all overflow-hidden shadow-sm">
                              {user?.profileImage ? (
                                <img src={user.profileImage} className="w-full h-full object-cover" />
                              ) : (
                                <UserCircle size={64} strokeWidth={1} />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera size={24} className="text-white" />
                              </div>
                           </div>
                           <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-xl flex items-center justify-center text-white shadow-md border-2 border-white dark:border-zinc-900"><Plus size={16} /></div>
                        </div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Master Portrait</p>
                        <input type="file" ref={profilePicRef} className="hidden" accept="image/*" />
                     </div>

                     <div className="flex-1 w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><User size={10} className="text-accent" /> Legal Name</label>
                             <input name="userName" defaultValue={user?.name} required className="w-full px-5 py-3.5 glass bg-white/5 border-2 border-white/10 rounded-[20px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner transition-all" placeholder="Enter Full Name" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><Phone size={10} className="text-accent" /> Emergency Phone</label>
                             <input name="userPhone" defaultValue={user?.phone} required className="w-full px-5 py-3.5 glass bg-white/5 border-2 border-white/10 rounded-[20px] outline-none focus:border-accent font-black dark:text-white text-base shadow-inner transition-all" placeholder="+1 XXX XXX XXXX" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><Mail size={10} className="text-accent" /> Verified Terminal Email</label>
                           <div className="w-full px-5 py-3.5 glass bg-white/5 border-2 border-white/10 rounded-[20px] font-black text-zinc-400 text-base shadow-inner flex justify-between items-center opacity-60 grayscale cursor-not-allowed border border-white/5">
                              {user?.email}
                              <Lock size={14} />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><FileHeart size={10} className="text-accent" /> Personal Statement / Legacy Mission</label>
                     <textarea name="userDescription" defaultValue={user?.description} className="w-full h-32 px-6 py-4 glass bg-white/5 border-2 border-white/10 rounded-[24px] outline-none focus:border-accent font-medium dark:text-white text-sm resize-none shadow-inner leading-relaxed transition-all" placeholder="Tell your heirs about the vision for your digital estate..."></textarea>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button type="submit" className="flex-1 py-5 bg-accent text-white rounded-[24px] font-black text-lg uppercase tracking-tighter shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/20">Synchronize Identity <ShieldCheck size={20} /></button>
                     <button type="button" onClick={() => setIsEditingProfile(false)} className="px-10 py-5 glass border-2 border-white/10 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm">Dismiss</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;