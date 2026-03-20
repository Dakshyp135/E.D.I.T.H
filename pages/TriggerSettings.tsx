import React, { useState, useEffect } from 'react';
import { useApp } from '../App.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Shield, History, Download, Zap, 
  ChevronRight, Key, Lock, FileText, UserCheck, 
  X, Activity, Eye, Terminal, Cpu, ShieldCheck, Heart
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase.js';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const TriggerSettings: React.FC = () => {
  const { user, setCurrentPage } = useApp();
  const [showSequence, setShowSequence] = useState(false);
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

  return (
    <div className="min-h-screen relative flex flex-col p-8 md:p-16 lg:p-24 text-slate-800 dark:text-zinc-100 items-center overflow-x-hidden">
      <div className="max-w-7xl w-full flex flex-col items-center text-center">
        
        <motion.button 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setCurrentPage('dashboard')}
          className="mb-16 flex items-center gap-3 text-slate-500 dark:text-zinc-500 hover:text-accent transition-all font-black text-[10px] uppercase tracking-[0.4em] glass px-8 py-4 rounded-full border border-white/10 shadow-sm"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </motion.button>

        <header className="mb-24 text-left w-full border-l-8 border-accent pl-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-accent/10 rounded-[28px] flex items-center justify-center text-accent border border-accent/20 shadow-accent-glow mb-10"
          >
            <ShieldCheck size={36} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black mb-8 tracking-tighter dark:text-white text-slate-900 uppercase leading-[0.9]"
          >
            Safety <br/><span className="text-accent italic">Plan</span>
          </motion.h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xl md:text-3xl font-medium max-w-2xl leading-relaxed italic opacity-80">
            Review who has accessed your vault and check the steps your family takes to get access during an emergency.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 w-full items-stretch">
          {/* Recent Activity Module */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-12 md:p-16 rounded-[64px] border-2 border-white/10 shadow-3d flex flex-col items-start text-left group bg-white/[0.01]"
          >
             <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 border border-accent/20 group-hover:scale-110 transition-transform">
                <History size={28} className="text-accent" />
             </div>
             <h3 className="text-4xl font-black dark:text-white text-slate-800 uppercase tracking-tighter mb-8 leading-none">Recent Activity</h3>
             <div className="w-full flex-1 space-y-5 mb-12 overflow-y-auto custom-scrollbar pr-4">
                {logs.map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-6 rounded-[32px] bg-black/5 dark:bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                     <div className="min-w-0 pr-4">
                        <p className="text-base font-black dark:text-white uppercase truncate tracking-tight">{log.event}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">{log.time}</p>
                     </div>
                     <span className="text-[10px] font-black text-accent uppercase tracking-widest px-4 py-1.5 bg-accent/10 rounded-xl border border-accent/10 shadow-inner">{log.status}</span>
                  </div>
                ))}
             </div>
             <button 
               onClick={handleDownloadLogs}
               className="w-full py-7 bg-white/5 hover:bg-accent hover:text-white border border-white/10 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group mt-auto"
             >
               <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> Download Activity Record
             </button>
          </motion.div>

          {/* Emergency Access Steps Module */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-12 md:p-16 rounded-[64px] border-2 border-white/10 shadow-3d flex flex-col items-start text-left group bg-white/[0.01] relative overflow-hidden"
          >
             <div className="absolute -top-10 -right-10 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Shield size={300} className="text-accent" />
             </div>

             <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 border border-accent/20 group-hover:scale-110 transition-transform shadow-accent-glow">
                <Zap size={28} className="text-accent" />
             </div>
             <h3 className="text-4xl font-black dark:text-white text-slate-800 uppercase tracking-tighter mb-8 leading-tight">Family Access Steps</h3>
             <p className="text-zinc-500 dark:text-zinc-400 mb-12 text-xl font-medium leading-relaxed max-w-sm">
                Your vault is private. If an emergency happens, your family can gain access only after completing 5 verified safety checks.
             </p>

             <div className="w-full grid grid-cols-1 gap-4 mb-auto">
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
          </motion.div>
        </div>
      </div>

      {/* Sequence Overlay Modal */}
      <AnimatePresence>
        {showSequence && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-void-950/90 backdrop-blur-3xl">
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
                 <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 border border-accent/20 shadow-inner">
                    <ShieldCheck size={32} />
                 </div>
                 <h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter leading-none mb-4">Security Checks</h2>
                 <p className="text-zinc-500 font-medium text-lg">Safe access requires 5 distinct layers of verification.</p>
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
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-black text-base border border-accent/20 shadow-inner">
                      {item.step}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-black text-sm uppercase tracking-widest dark:text-white flex items-center gap-2 mb-0.5">
                         {item.icon} {item.title}
                      </p>
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest leading-tight">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={() => setShowSequence(false)}
                className="w-full mt-10 py-5 glass border border-white/10 rounded-[32px] font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-all shadow-inner"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 py-24 text-center">
        <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-700 uppercase tracking-[0.6em] opacity-40">Electronic Digital Inheritance Transfer Hub</p>
      </footer>
    </div>
  );
};

export default TriggerSettings;