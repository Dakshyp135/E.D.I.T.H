
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CheckCircle2, XCircle, Clock, Eye, Download, 
  ArrowLeft, LogOut, ChevronRight, User, Database, AlertCircle, FileText, RefreshCw
} from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const WitnessPortal: React.FC = () => {
  const { user, setUser, setCurrentPage } = useApp();
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch all pending requests
    // In a real app, we'd use a more targeted query or collection group
    const q = query(collection(db, 'requests'), where('status', '==', 'Pending'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allPending = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      // Filter requests where the current user is a witness for the benefactor
      const myRequests = [];
      for (const req of allPending) {
        try {
          // Check if this user is a witness for the benefactor
          // We assume the witness document ID in the subcollection is the witness's email
          const witnessRef = doc(db, 'users', req.benefactorId, 'witnesses', user.email);
          const witnessSnap = await getDoc(witnessRef);
          
          if (witnessSnap.exists()) {
            myRequests.push(req);
          } else {
            // Try searching by email if ID isn't email
            const witnessQ = query(collection(db, 'users', req.benefactorId, 'witnesses'), where('email', '==', user.email));
            const witnessSnapshot = await getDocs(witnessQ);
            if (!witnessSnapshot.empty) {
              myRequests.push(req);
            }
          }
        } catch (e) {
          console.error("Error checking witness status:", e);
        }
      }
      
      setRequests(myRequests);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'requests');
    });

    return () => unsubscribe();
  }, [user]);

  const handleAdjudicate = async (status: 'Approve' | 'Reject') => {
    if (!selectedRequest || !user) return;
    setIsVerifying(true);
    
    try {
      const requestRef = doc(db, 'requests', selectedRequest.id);
      const updateData: any = {};
      
      if (status === 'Approve') {
        updateData.witnessApprovals = arrayUnion(user.email);
        // If threshold met (e.g., 1 for now), approve the whole request
        // In a real app, we'd check the benefactor's witnessThreshold
        updateData.status = 'Approved'; 
      } else {
        updateData.witnessRejections = arrayUnion(user.email);
        updateData.status = 'Rejected';
      }

      await updateDoc(requestRef, updateData);
      alert(`Access Request ${status}d successfully.`);
      setSelectedRequest(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'requests');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-8 md:p-16 bg-void-950 text-white font-['Plus_Jakarta_Sans']">
      <nav className="flex items-center justify-between mb-20 max-w-6xl mx-auto w-full">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
               <Shield size={24} />
            </div>
            <div>
               <h1 className="text-2xl font-black uppercase tracking-tighter">Witness Council</h1>
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Council Node Adjudication</p>
            </div>
         </div>
         <button onClick={() => { setUser(null); setCurrentPage('home'); }} className="flex items-center gap-3 px-6 py-3 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-rose-500 transition-all">
            <LogOut size={16} /> Sign Out
         </button>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full">
         <header className="mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Pending Requests</h2>
            <p className="text-zinc-500 font-medium">Verify the evidence and adjudicate legacy release protocols.</p>
         </header>

         {loading ? (
            <div className="py-40 text-center">
               <RefreshCw className="animate-spin mx-auto text-emerald-500 mb-8" size={64} />
               <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Syncing Council Data...</p>
            </div>
         ) : requests.length === 0 ? (
            <div className="py-40 text-center glass rounded-[48px] border-2 border-dashed border-white/5">
               <CheckCircle2 className="mx-auto text-emerald-500 mb-8 opacity-20" size={64} />
               <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Council is currently at rest. No pending actions.</p>
            </div>
         ) : (
            <div className="grid gap-6">
               {requests.map(req => (
                  <motion.div 
                    key={req.id} 
                    layoutId={req.id}
                    className="glass p-10 rounded-[48px] border border-white/5 flex items-center justify-between group hover:shadow-accent-glow transition-all cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                     <div className="flex items-center gap-10">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                           <User size={36} />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{req.nomineeName}</h3>
                              <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-500">Nominee</span>
                           </div>
                           <p className="text-zinc-500 text-sm font-medium leading-relaxed">Requesting access to archive of <span className="text-accent font-bold">{req.benefactorName}</span></p>
                        </div>
                     </div>
                     <div className="text-right flex items-center gap-10">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Reason</p>
                           <p className="font-bold text-white uppercase text-sm">{req.reason}</p>
                        </div>
                        <button className="px-8 py-4 bg-white/5 rounded-2xl group-hover:bg-accent group-hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                           Review Evidence <ChevronRight size={16} />
                        </button>
                     </div>
                  </motion.div>
               ))}
            </div>
         )}
      </main>

      <AnimatePresence>
         {selectedRequest && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-void-950/90 backdrop-blur-3xl">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="glass p-12 md:p-16 rounded-[64px] max-w-2xl w-full border border-white/10 shadow-3d relative overflow-hidden"
               >
                  <button onClick={() => setSelectedRequest(null)} className="absolute top-10 right-10 p-3 hover:bg-white/5 rounded-full transition-all text-zinc-500"><XCircle size={24} /></button>
                  
                  <div className="flex flex-col items-center text-center mb-12">
                     <div className="w-20 h-20 bg-emerald-500/10 rounded-[28px] flex items-center justify-center text-emerald-500 mb-8"><FileText size={40} /></div>
                     <h3 className="text-4xl font-black uppercase tracking-tighter leading-none mb-3">Case Audit: {selectedRequest.nomineeName}</h3>
                     <p className="text-zinc-500 font-medium">Verify documents provided for inheritance claim.</p>
                  </div>

                  <div className="space-y-8">
                     <div className="p-8 glass rounded-[32px] border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Nominee Justification</p>
                        <p className="text-lg leading-relaxed text-zinc-300 font-medium italic">"{selectedRequest.details}"</p>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-4">Attached Evidence</p>
                        <div className="grid grid-cols-2 gap-4">
                           {selectedRequest.evidence.length > 0 ? (
                             selectedRequest.evidence.map((ev: any, i: number) => (
                                <div key={i} className="p-5 glass rounded-2xl flex items-center justify-between border border-white/10 group cursor-pointer hover:border-accent transition-all">
                                   <div className="flex items-center gap-3">
                                      <FileText className="text-zinc-500 group-hover:text-accent" size={20} />
                                      <span className="text-[10px] font-black uppercase tracking-tight">{ev}</span>
                                   </div>
                                   <Download size={16} className="text-zinc-600" />
                                </div>
                             ))
                           ) : (
                             <div className="col-span-2 p-5 text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">No evidence files attached</div>
                           )}
                        </div>
                     </div>

                     <div className="flex gap-4 pt-10">
                        <button 
                           onClick={() => handleAdjudicate('Approve')}
                           disabled={isVerifying}
                           className="flex-1 py-6 bg-emerald-500 text-white rounded-3xl font-black text-lg uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                           {isVerifying ? <RefreshCw className="animate-spin" /> : "Approve Release"}
                        </button>
                        <button 
                           onClick={() => handleAdjudicate('Reject')}
                           disabled={isVerifying}
                           className="flex-1 py-6 glass border border-rose-500/30 text-rose-500 rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-rose-500/10 transition-all"
                        >
                           Reject Claim
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default WitnessPortal;
