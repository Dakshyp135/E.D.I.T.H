import React, { useState, useEffect } from 'react';
import { useApp } from '../App.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, FileText, Upload, ChevronRight, Lock, CheckCircle2, 
  AlertCircle, LogOut, Info, Download, ExternalLink, X, 
  Heart, User, Clock, ShieldCheck, Database, Key, Fingerprint,
  RefreshCw, Smartphone, Share2, Video, Image as ImageIcon,
  Library, Play, FileDigit, File, Sun, Moon, Loader2
} from 'lucide-react';
import { VerificationStatus, AccountStatus } from '../types.js';
import { db, auth } from '../firebase.js';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';

const BeneficiaryDashboard: React.FC = () => {
  const { user, setUser, setCurrentPage, isDarkMode, setDarkMode } = useApp();
  const [selectedBenefactor, setSelectedBenefactor] = useState<any>(null);
  const [step, setStep] = useState<'selection' | 'credentials' | 'verification' | 'granted'>('selection');
  const [securityKey, setSecurityKey] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvedBenefactors, setApprovedBenefactors] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.email) return;

    const fetchApprovedAccess = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'requests'),
          where('nomineeEmail', '==', user.email),
          where('status', '==', 'approved')
        );

        const querySnapshot = await getDocs(q);
        const benefactorsData: any[] = [];

        for (const requestDoc of querySnapshot.docs) {
          const request = requestDoc.data();
          const benefactorId = request.benefactorId;

          // Fetch benefactor profile
          const benefactorDoc = await getDoc(doc(db, 'users', benefactorId));
          if (benefactorDoc.exists()) {
            const benefactorProfile = benefactorDoc.data();

            // Fetch assets
            const assetsSnapshot = await getDocs(collection(db, `users/${benefactorId}/assets`));
            const assets = assetsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Fetch memories
            const memoriesSnapshot = await getDocs(collection(db, `users/${benefactorId}/memories`));
            const memories = memoriesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            benefactorsData.push({
              id: benefactorId,
              name: benefactorProfile.name,
              relationship: request.relationship || 'Benefactor',
              email: benefactorProfile.email,
              assets: assets,
              legacyMessage: benefactorProfile.legacyMessage || "No final message left.",
              legacyMedia: memories,
              securityKey: benefactorProfile.securityKey // In a real app, this would be handled more securely
            });
          }
        }

        setApprovedBenefactors(benefactorsData);
      } catch (error) {
        console.error("Error fetching approved access:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedAccess();
  }, [user?.email]);

  const handleClaimInitiate = (benefactor: any) => {
    setSelectedBenefactor(benefactor);
    setStep('credentials');
  };

  const handleVerify = () => {
    if (securityKey === selectedBenefactor?.securityKey) {
        setStep('verification');
    } else {
        alert("Invalid Heritage Key. Please check the 12-digit code provided to you.");
    }
  };

  const handleFinishUpload = () => {
    setIsUploading(true);
    // Simulating a "verification" process for the death certificate
    setTimeout(() => {
        setIsUploading(false);
        setStep('granted');
    }, 2500);
  };

  const downloadAttachment = (base64: string, index: number) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `Heritage_Document_${index + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAssetClick = (asset: any) => {
    setSelectedAsset(asset);
    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex flex-col p-6 md:p-10 lg:p-16 gap-8 md:gap-12 text-zinc-800 dark:text-zinc-100">
       <nav className="glass h-16 md:h-20 px-6 md:px-10 rounded-[20px] md:rounded-[28px] flex items-center justify-between shadow-glass border border-slate-200 dark:border-white/20 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-9 h-9 md:w-11 md:h-11 bg-accent rounded-xl flex items-center justify-center shadow-accent-glow border border-white/20">
                <Library className="text-white w-5 h-5 md:w-6 md:h-6" />
             </div>
             <div className="flex flex-col">
                <span className="font-extrabold text-lg md:text-2xl tracking-tighter dark:text-white uppercase leading-none">E.D.I.T.H</span>
                <span className="text-[7px] md:text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-1">Heir Gateway</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setDarkMode(!isDarkMode)}
              className="p-2.5 md:p-3 glass rounded-xl hover:bg-white/10 transition-colors text-zinc-500 hover:text-accent border border-slate-200 dark:border-white/10"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button onClick={() => { setUser(null); setCurrentPage('home'); }} className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 glass rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 hover:text-rose-500 transition-all border border-slate-200 dark:border-white/10">
              <LogOut size={16} /> <span className="hidden sm:inline">Leave Portal</span>
            </button>
          </div>
       </nav>

       <main className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-16">
          <header className="mb-10 md:mb-14">
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter dark:text-white uppercase leading-none">Heritage Portals</h1>
            <p className="text-zinc-500 text-base md:text-lg font-medium">Safe passage for the legacies entrusted to you.</p>
          </header>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Synchronizing Heritage Nodes...</p>
              </motion.div>
            ) : step === 'selection' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 md:gap-8">
                {approvedBenefactors.length === 0 ? (
                  <div className="glass p-10 rounded-[32px] text-center border border-slate-200 dark:border-white/10">
                    <Shield className="mx-auto text-zinc-300 mb-4" size={48} />
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">No Granted Legacies</h3>
                    <p className="text-zinc-500 mt-2">You don't have any approved heritage access requests yet.</p>
                  </div>
                ) : approvedBenefactors.map(b => (
                  <div key={b.id} className="glass p-6 md:p-10 rounded-[28px] md:rounded-[40px] shadow-3d flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group hover:shadow-highlight transition-all border border-slate-200 dark:border-white/20">
                    <div className="flex items-center gap-5 md:gap-8 relative z-10">
                       <div className="w-14 h-14 md:w-20 md:h-20 glass rounded-[20px] md:rounded-[32px] border-2 border-slate-200 dark:border-white/20 flex items-center justify-center text-zinc-400 group-hover:text-accent transition-colors shadow-inner">
                         <User size={28} className="md:w-10 md:h-10" />
                       </div>
                       <div>
                         <p className="text-[7px] md:text-[9px] font-black text-accent uppercase tracking-[0.5em] mb-1.5 md:mb-3">{b.relationship}</p>
                         <h3 className="text-xl md:text-3xl font-black dark:text-white uppercase leading-none tracking-tighter">{b.name}</h3>
                         <p className="text-[7px] md:text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-2.5 md:mt-3">{b.assets.length} shared items</p>
                       </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-4 md:gap-6 relative z-10">
                       <button onClick={() => handleClaimInitiate(b)} className="px-6 md:px-10 py-4 md:py-6 bg-accent text-white rounded-2xl md:rounded-[24px] font-black text-base md:text-lg uppercase tracking-tighter shadow-accent-glow hover:scale-105 transition-all flex items-center gap-3 border border-white/20">
                         Access Legacy <ChevronRight size={20} className="md:w-6 md:h-6" />
                       </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 'credentials' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-3d text-center relative border border-white/20 mt-10">
                <button onClick={() => setStep('selection')} className="absolute top-6 left-6 text-zinc-500 font-black uppercase tracking-[0.4em] text-[7px] md:text-[9px] hover:text-accent transition-all">← Go Back</button>
                <div className="w-14 h-14 md:w-20 md:h-20 bg-accent/10 rounded-2xl md:rounded-[32px] flex items-center justify-center mx-auto mb-6 md:mb-8 text-accent border-2 border-accent/20 shadow-highlight">
                  <Key size={28} className="md:w-10 md:h-10" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-2 dark:text-white uppercase leading-none tracking-tighter">Secret Access</h2>
                <p className="text-zinc-500 mb-8 md:mb-12 text-base md:text-lg font-medium px-4">Enter the unique Heritage Key to unlock the vault.</p>
                <div className="space-y-6 md:space-y-8 text-left">
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[7px] md:text-[9px] font-black text-zinc-500 uppercase tracking-[0.5em] px-3">Heritage Access Code</label>
                    <input 
                      type="text" 
                      value={securityKey}
                      onChange={(e) => setSecurityKey(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XXXX" 
                      className="w-full px-6 md:px-8 py-5 md:py-6 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl md:rounded-[24px] outline-none font-black tracking-[0.3em] md:tracking-[0.4em] text-xl md:text-3xl text-center focus:border-accent dark:text-white transition-all uppercase shadow-inner" 
                    />
                  </div>
                  <button onClick={handleVerify} className="w-full py-5 md:py-6 bg-accent text-white rounded-2xl md:rounded-[24px] font-black text-base md:text-lg uppercase tracking-widest shadow-accent-glow hover:shadow-button-hover transition-all active:scale-95 border border-white/20">
                    Unlock Portal
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'verification' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-3d text-center border border-white/20 mt-10">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-rose-500 border-2 border-rose-500/30 shadow-highlight">
                  <FileDigit size={28} className="md:w-10 md:h-10" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-2 dark:text-white uppercase leading-none tracking-tighter">Release Verification</h2>
                <p className="text-zinc-500 mb-8 md:mb-12 text-base md:text-lg font-medium px-6 leading-relaxed">Please provide a death certificate to finalize the legacy transfer process for the benefactor.</p>
                <div className="space-y-6 md:space-y-8">
                  <div className="p-4 md:p-6 glass rounded-2xl md:rounded-[24px] border-2 border-rose-500/20 text-rose-500 font-bold italic text-sm md:text-base bg-rose-500/5 shadow-inner leading-relaxed">
                    "I am verifying a legacy event for {selectedBenefactor?.name}."
                  </div>
                  <div className="border-2 border-dashed border-slate-200 dark:border-white/20 glass rounded-2xl md:rounded-[32px] p-8 md:p-12 text-center group hover:border-accent transition-all cursor-pointer bg-white/1 shadow-highlight">
                    <Upload className="mx-auto text-zinc-400 mb-4 group-hover:text-accent transition-all" size={32} />
                    <p className="font-black text-base md:text-lg dark:text-white uppercase tracking-tighter">Upload Death Certificate</p>
                    <p className="text-[7px] md:text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-2">PDF, JPG, or PNG</p>
                  </div>
                  <button onClick={handleFinishUpload} disabled={isUploading} className="w-full py-5 md:py-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl md:rounded-[24px] font-black text-base md:text-lg uppercase tracking-widest shadow-3d hover:scale-[1.02] active:scale-95 transition-all border border-white/20">
                    {isUploading ? "Verifying..." : "Release Heritage"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'granted' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-10 md:space-y-14 pb-40">
                <div className="p-10 md:p-14 bg-accent rounded-[32px] md:rounded-[48px] text-white shadow-accent-glow text-center relative overflow-hidden border-2 border-white/30">
                    <CheckCircle2 className="mx-auto mb-6 md:mb-8 relative z-10 w-16 h-16 md:w-20 md:h-20" />
                    <h2 className="text-4xl md:text-6xl font-black mb-2 md:mb-3 relative z-10 tracking-tighter uppercase leading-none">ACCESS GRANTED</h2>
                    <p className="text-white/80 text-base md:text-lg font-bold relative z-10 uppercase tracking-widest">Connected to {selectedBenefactor?.name}'s archive.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
                    <div className="glass p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-slate-200 dark:border-white/20 shadow-3d relative hover:shadow-highlight transition-all">
                        <div className="flex items-center gap-4 mb-8 md:mb-10">
                            <Database size={28} className="text-accent md:w-10 md:h-10" />
                            <h3 className="text-lg md:text-xl font-black dark:text-white uppercase tracking-[0.2em] md:tracking-[0.3em]">Heritage Vault</h3>
                        </div>
                        <div className="space-y-4 md:space-y-5">
                            {selectedBenefactor?.assets.map((asset: any) => (
                                <motion.div key={asset.id} onClick={() => handleAssetClick(asset)} className="flex items-center justify-between p-5 md:p-7 glass rounded-[20px] md:rounded-[28px] border-2 border-slate-200 dark:border-white/10 hover:border-accent/40 transition-all cursor-pointer group shadow-highlight">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-black text-lg md:text-xl dark:text-white group-hover:text-accent transition-all mb-1 uppercase tracking-tighter truncate">{asset.name}</p>
                                        <p className="text-[7px] md:text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">{asset.category}</p>
                                    </div>
                                    <ChevronRight size={20} className="text-zinc-400 group-hover:text-accent shrink-0 md:w-7 md:h-7" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="glass p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-3d border border-slate-200 dark:border-white/20 hover:shadow-highlight transition-all">
                        <div className="flex items-center gap-4 mb-8 md:mb-10">
                            <Heart size={28} className="text-accent md:w-10 md:h-10" />
                            <h3 className="text-lg md:text-xl font-black dark:text-white uppercase tracking-[0.2em] md:tracking-[0.3em]">Final Note</h3>
                        </div>
                        <div className="italic text-zinc-600 dark:text-zinc-300 text-lg md:text-xl leading-relaxed mb-8 md:mb-12 p-6 md:p-8 glass rounded-[20px] md:rounded-[28px] border-2 border-slate-200 dark:border-white/10 shadow-inner font-medium">
                           "{selectedBenefactor?.legacyMessage}"
                        </div>
                        <button className="w-full py-5 md:py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl md:rounded-[32px] font-black text-base md:text-lg uppercase tracking-widest flex items-center justify-center gap-3 md:gap-4 hover:scale-[1.02] transition-all shadow-3d border border-white/20">
                            <Download size={20} className="md:w-6 md:h-6" /> Download All
                        </button>
                    </div>
                </div>

                <div className="glass p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-3d border border-slate-200 dark:border-white/20 hover:shadow-highlight transition-all">
                    <div className="flex items-center gap-4 mb-8 md:mb-10">
                        <ImageIcon size={28} className="text-accent md:w-10 md:h-10" />
                        <h3 className="text-lg md:text-xl font-black dark:text-white uppercase tracking-[0.2em] md:tracking-[0.3em]">Shared Memories</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
                        {selectedBenefactor?.legacyMedia?.map((media: any) => (
                          <motion.div 
                            key={media.id}
                            whileHover={{ y: -5 }}
                            className="group relative aspect-square glass rounded-[24px] md:rounded-[32px] overflow-hidden border-2 border-white/20 shadow-highlight"
                          >
                            {media.type === 'image' ? (
                              <img src={media.url} alt={media.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                                <Video size={40} className="text-white/20 group-hover:text-accent transition-colors md:w-12 md:h-12" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-accent-glow">
                                  <Play size={16} className="text-white fill-white ml-1 md:w-5 md:h-5" />
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 md:p-8 flex flex-col justify-end">
                              <p className="text-sm md:text-base font-black text-white uppercase tracking-tighter mb-1.5 md:mb-2 truncate">{media.name}</p>
                              <button className="flex items-center gap-2 text-[7px] md:text-[8px] font-bold text-accent uppercase tracking-widest hover:text-white transition-colors">
                                <Download size={12} /> High-Res
                              </button>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
       </main>

       <AnimatePresence>
          {selectedAsset && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 md:p-8 bg-void-950/80 backdrop-blur-2xl">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass p-6 md:p-10 rounded-[32px] md:rounded-[40px] w-full max-w-lg shadow-3d border border-white/20 relative text-center">
                    <button onClick={() => setSelectedAsset(null)} className="absolute top-5 right-5 p-2.5 bg-white/10 rounded-full text-zinc-500 hover:text-white hover:shadow-highlight transition-all"><X size={20} /></button>
                    
                    <AnimatePresence mode="wait">
                      {isDecrypting ? (
                        <motion.div key="decrypting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-10 md:py-16 flex flex-col items-center">
                            <RefreshCw className="text-accent animate-spin mb-6 md:mb-8" size={50} />
                            <h4 className="text-2xl md:text-3xl font-black dark:text-white uppercase tracking-tighter mb-3">Decrypting</h4>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Accessing heritage nodes...</p>
                        </motion.div>
                      ) : (
                        <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 md:space-y-8">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent border-2 border-accent/30">
                                <Database size={28} className="md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h4 className="text-2xl md:text-3xl font-black dark:text-white uppercase tracking-tighter mb-1.5">{selectedAsset.name}</h4>
                                <p className="text-accent font-black uppercase tracking-widest text-[8px] md:text-[9px] mb-5">{selectedAsset.category}</p>
                                <div className="p-5 md:p-7 glass rounded-[20px] md:rounded-[28px] border-2 border-white/10 bg-white/1 text-zinc-400 font-medium text-base md:text-lg leading-relaxed shadow-inner mb-6 md:mb-8 text-left">
                                    {selectedAsset.description}
                                </div>

                                {selectedAsset.attachments && selectedAsset.attachments.length > 0 && (
                                  <div className="text-left space-y-3">
                                     <h5 className="text-[8px] md:text-[9px] font-black text-accent uppercase tracking-widest px-3">Heritage Files</h5>
                                     <div className="grid grid-cols-1 gap-2.5">
                                        {selectedAsset.attachments.map((file: string, idx: number) => (
                                          <div key={idx} className="flex items-center justify-between p-3.5 md:p-5 glass rounded-[18px] md:rounded-[22px] border border-white/10 hover:border-accent/40 transition-all shadow-highlight group">
                                             <div className="flex items-center gap-3 overflow-hidden">
                                                <File size={18} className="text-accent shrink-0 md:w-5 md:h-5" />
                                                <span className="text-xs md:sm font-black dark:text-white uppercase tracking-tighter truncate">Document_{idx + 1}</span>
                                             </div>
                                             <button 
                                              onClick={() => downloadAttachment(file, idx)}
                                              className="p-2.5 bg-accent/10 text-accent rounded-xl hover:bg-accent hover:text-white transition-all shadow-inner"
                                             >
                                                <Download size={16} />
                                             </button>
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:gap-5 pt-6 md:pt-8 border-t border-white/10">
                                <button className="py-4 md:py-5 bg-accent text-white rounded-xl md:rounded-[20px] font-black text-sm md:text-base uppercase tracking-widest shadow-accent-glow hover:shadow-button-hover transition-all border border-white/20">
                                    Open
                                </button>
                                <button className="py-4 md:py-5 glass text-zinc-500 rounded-xl md:rounded-[20px] font-black text-sm md:text-base uppercase tracking-widest hover:text-white hover:shadow-highlight transition-all border-2 border-white/10">
                                    Key
                                </button>
                            </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </motion.div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
};

export default BeneficiaryDashboard;