import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, Shield, AlertCircle, Upload, CheckCircle2, ChevronRight, 
  ArrowLeft, FileText, Database, Lock, Eye, RefreshCw, Smartphone, Clipboard,
  Clock, User, LogOut, Search, Send
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, setDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const NomineePortal: React.FC = () => {
  const { user, setUser, setCurrentPage } = useApp();
  const [view, setView] = useState<'selection' | 'wizard'>('selection');
  const [selectedBenefactor, setSelectedBenefactor] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch requests made by this nominee
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'requests'), where('nomineeId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(reqs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'requests');
    });

    return () => unsubscribe();
  }, [user]);

  const handleSelectBenefactor = (benefactor: any) => {
    const existingRequest = requests.find(r => r.benefactorId === benefactor.id);
    if (existingRequest) {
      if (existingRequest.status === 'Approved') {
        setCurrentPage('beneficiary-dashboard');
      } else {
        setSelectedBenefactor(benefactor);
        setView('wizard');
        setStep(5); // Go straight to adjudication if already requested
      }
    } else {
      setSelectedBenefactor(benefactor);
      setView('wizard');
      setStep(1);
    }
  };

  const handleSearchBenefactor = async () => {
    if (!searchEmail.trim()) return;
    setIsSearching(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail.trim()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        alert("No benefactor found with this email.");
        return;
      }

      const benefactorData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      
      // Check if this user is a nominee for this benefactor
      const nomineeRef = doc(db, 'users', benefactorData.id, 'nominees', user!.email);
      const nomineeSnap = await getDoc(nomineeRef);
      
      if (!nomineeSnap.exists()) {
        const nomineeQ = query(collection(db, 'users', benefactorData.id, 'nominees'), where('email', '==', user!.email));
        const nomineeSnapshot = await getDocs(nomineeQ);
        if (nomineeSnapshot.empty) {
          alert("You are not listed as a nominee for this benefactor.");
          return;
        }
      }

      handleSelectBenefactor(benefactorData);
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching for benefactor.");
    } finally {
      setIsSearching(false);
    }
  };

  const startVerification = async () => {
    if (!user || !selectedBenefactor) return;
    setIsVerifying(true);
    
    const requestId = `${user.id}_${selectedBenefactor.id}`;
    const requestData = {
      id: requestId,
      nomineeId: user.id,
      nomineeName: user.name,
      nomineeEmail: user.email,
      benefactorId: selectedBenefactor.id,
      benefactorName: selectedBenefactor.name,
      benefactorEmail: selectedBenefactor.email,
      reason,
      details,
      evidence: [],
      status: 'Pending',
      timestamp: new Date().toISOString(),
      witnessApprovals: [],
      witnessRejections: []
    };

    try {
      await setDoc(doc(db, 'requests', requestId), requestData);
      setStep(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'requests');
    } finally {
      setIsVerifying(false);
    }
  };

  const currentRequest = selectedBenefactor ? requests.find(r => r.benefactorId === selectedBenefactor.id) : null;

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tight dark:text-white">Security Key Authentication</h2>
            <p className="text-zinc-500 font-medium">Enter your unique 12-digit security key provided by {selectedBenefactor?.name}.</p>
            <input placeholder="XXXX-XXXX-XXXX" className="w-full px-8 py-5 glass rounded-2xl text-center text-2xl font-black tracking-widest outline-none border border-white/10 focus:border-accent" />
            <button onClick={() => setStep(2)} className="w-full py-5 bg-accent text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-accent-glow">Verify Key</button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 text-center">
            <h2 className="text-3xl font-black uppercase tracking-tight dark:text-white">Identity Verification</h2>
            <p className="text-zinc-500 font-medium mb-10">We need to confirm you are the designated nominee. DigiLocker is the safest and fastest option.</p>
            <div className="grid gap-4">
              <button onClick={() => setStep(3)} className="flex items-center justify-between p-6 glass rounded-[32px] border border-accent/30 hover:bg-accent/10 transition-all group">
                <div className="flex items-center gap-4">
                  <Smartphone className="text-accent" size={28} />
                  <div className="text-left">
                    <span className="block font-black uppercase tracking-widest text-xs">Connect DigiLocker</span>
                    <span className="text-[10px] text-zinc-500 font-bold">Safe Path (Aadhar Verified)</span>
                  </div>
                </div>
                <ChevronRight size={24} className="text-accent" />
              </button>
              <button onClick={() => setStep(3)} className="flex items-center justify-between p-6 glass rounded-[32px] border border-white/10 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <FileText className="text-zinc-400" size={28} />
                  <div className="text-left">
                    <span className="block font-black uppercase tracking-widest text-xs">Manual ID Upload</span>
                    <span className="text-[10px] text-zinc-500 font-bold">PAN / Passport / Aadhar Scan</span>
                  </div>
                </div>
                <ChevronRight size={24} className="text-zinc-500" />
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tight dark:text-white">Emergency Context</h2>
            <p className="text-zinc-500 font-medium">Select the reason for requesting legacy access.</p>
            <div className="grid grid-cols-1 gap-3">
              {['Death', 'Medical Crisis', 'Legal Incapacity', 'Missing Person'].map(r => (
                <button key={r} onClick={() => { setReason(r); setStep(4); }} className="w-full py-5 glass rounded-2xl font-black uppercase tracking-widest hover:border-accent border border-white/5 transition-all text-left px-8">{r}</button>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tight dark:text-white">Evidence node</h2>
            <p className="text-zinc-500 font-medium italic leading-relaxed">Verification requirement for: <span className="text-accent font-black uppercase">{reason}</span></p>
            <div className="border-2 border-dashed border-white/10 p-10 rounded-[32px] glass flex flex-col items-center gap-4 group cursor-pointer hover:border-accent transition-all">
               <Upload size={32} className="text-zinc-500 group-hover:text-accent" />
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Upload Event Certificate</p>
            </div>
            <textarea 
              placeholder="Please describe the situation for the witness council..." 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full h-32 px-6 py-4 glass rounded-2xl outline-none border border-white/10 resize-none font-medium" 
            />
            <button onClick={startVerification} className="w-full py-5 bg-accent text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-accent-glow flex items-center justify-center gap-3">
              {isVerifying ? <RefreshCw className="animate-spin" /> : "Submit Evidence"}
            </button>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center">
            <h2 className="text-3xl font-black uppercase tracking-tight dark:text-white">Council Adjudication</h2>
            <p className="text-zinc-500 font-medium mb-10">Waiting for witness validation. This typically takes 24-48 hours, but we've broadcasted your emergency request.</p>
            
            <div className="space-y-4">
               {currentRequest?.witnessApprovals?.length > 0 ? (
                 currentRequest.witnessApprovals.map((w: string, i: number) => (
                   <div key={i} className="p-5 glass rounded-2xl flex items-center justify-between border border-white/5">
                      <span className="font-black text-xs uppercase tracking-widest dark:text-white">Witness {i + 1}</span>
                      <div className={`flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest`}>
                         <CheckCircle2 size={16} /> Approved
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="p-5 glass rounded-2xl flex items-center justify-center border border-white/5 text-zinc-500 uppercase tracking-widest text-[10px] font-black">
                   No approvals yet
                 </div>
               )}
               {currentRequest?.status === 'Pending' && (
                 <div className="p-5 glass rounded-2xl flex items-center justify-between border border-white/5">
                    <span className="font-black text-xs uppercase tracking-widest text-zinc-500">Awaiting Council...</span>
                    <RefreshCw className="animate-spin text-accent" size={16} />
                 </div>
               )}
            </div>

            <div className="py-6">
               <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: '0%' }} 
                    animate={{ width: currentRequest?.status === 'Approved' ? '100%' : '50%' }} 
                    className="h-full bg-accent shadow-accent-glow" 
                  />
               </div>
               <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                 Status: {currentRequest?.status || 'Pending'}
               </p>
            </div>

            {currentRequest?.status === 'Approved' && (
              <button onClick={() => setStep(6)} className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                Proceed to Vault
              </button>
            )}
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-10">
            <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto shadow-emerald-500/20 shadow-lg mb-8 rotate-12">
               <CheckCircle2 size={48} className="text-white -rotate-12" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tight dark:text-white leading-none">Access Authorized</h2>
            <p className="text-zinc-500 font-medium text-lg max-w-sm mx-auto">Verification protocol complete. The digital legacy archive has been released to your gateway.</p>
            <button onClick={() => setCurrentPage('beneficiary-dashboard')} className="w-full mt-8 py-6 bg-accent text-white rounded-[24px] font-black text-2xl uppercase tracking-tighter shadow-accent-glow flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all">
              Claim Assets <Database size={28} />
            </button>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-void-950">
      <div className="w-full max-w-4xl relative">
        <button 
          onClick={() => view === 'wizard' ? setView('selection') : setCurrentPage('gateway')}
          className="absolute -top-20 left-0 flex items-center gap-3 text-zinc-500 hover:text-accent font-black text-[11px] uppercase tracking-[0.3em] transition-all"
        >
          <ArrowLeft size={18} /> {view === 'wizard' ? 'Back to Selection' : 'Exit Portal'}
        </button>

        <AnimatePresence mode="wait">
          {view === 'selection' ? (
            <motion.div key="selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="text-center">
                <h1 className="text-5xl font-black dark:text-white tracking-tighter uppercase leading-none mb-4">Legacy <span className="text-accent italic">Succession</span></h1>
                <p className="text-zinc-500 font-medium">Choose a benefactor archive or search for a new node.</p>
              </div>

              <div className="max-w-md mx-auto mb-12">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input 
                    type="email" 
                    placeholder="Search benefactor by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-accent transition-all"
                  />
                  <button 
                    onClick={handleSearchBenefactor}
                    disabled={isSearching}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    {isSearching ? <RefreshCw className="animate-spin" size={14} /> : "Search"}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <RefreshCw className="animate-spin mx-auto text-accent mb-4" size={32} />
                  <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-black">Syncing Vault Data...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {requests.map((req, i) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -5 }}
                      onClick={() => handleSelectBenefactor({ id: req.benefactorId, name: req.benefactorName })}
                      className="glass p-10 rounded-[48px] border border-white/5 cursor-pointer group hover:shadow-accent-glow transition-all"
                    >
                      <div className="flex items-center gap-6 mb-8">
                         <div className="w-16 h-16 bg-accent/10 rounded-[24px] flex items-center justify-center text-accent group-hover:scale-110 transition-transform"><User size={32} /></div>
                         <div>
                           <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{req.benefactorName}</h3>
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Benefactor Node</p>
                         </div>
                      </div>
                      <div className="space-y-4 mb-10">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-zinc-500">Request Status</span>
                            <span className={req.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'}>{req.status}</span>
                         </div>
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-zinc-500">Approvals</span>
                            <span className="text-accent">{req.witnessApprovals?.length || 0}</span>
                         </div>
                      </div>
                      <div className="w-full py-4 bg-white/5 rounded-2xl group-hover:bg-accent group-hover:text-white transition-all text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                        {req.status === 'Approved' ? "Access Vault" : "View Status"} <ChevronRight size={18} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="wizard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl mx-auto">
              <div className="mb-16 flex justify-between items-center gap-4 px-10">
                {[1,2,3,4,5,6].map(s => (
                  <div key={s} className="flex-1 h-1.5 rounded-full bg-white/5 relative">
                    <motion.div 
                      initial={false}
                      animate={{ width: step >= s ? '100%' : '0%' }}
                      className={`absolute inset-0 rounded-full ${step >= s ? 'bg-accent shadow-accent-glow' : ''}`}
                    />
                  </div>
                ))}
              </div>

              <div className="glass p-12 md:p-16 rounded-[64px] border border-white/10 shadow-3d min-h-[500px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NomineePortal;
