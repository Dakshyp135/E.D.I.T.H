import React, { useState } from 'react';
import { useApp } from '../App';
import { motion } from 'framer-motion';
import { UserRole, AccountStatus, UserProfile } from '../types';
import { ArrowLeft, Globe, Eye, EyeOff, Smartphone, Mail, ChevronRight, Loader2 } from 'lucide-react';
import OnboardingGuide from '../components/OnboardingGuide';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Auth: React.FC = () => {
  const { setUser, setCurrentPage, currentPage, setTutorialStep } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(currentPage === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNomineeAuth = currentPage === 'nominee-auth';
  const isWitnessAuth = currentPage === 'witness-auth';
  const isPersonalVault = currentPage === 'login' || currentPage === 'signup';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const role = isNomineeAuth ? UserRole.NOMINEE : (isWitnessAuth ? UserRole.WITNESS : UserRole.BENEFACTOR);
    
    try {
      if (activeTab === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const newUser: UserProfile = {
          id: firebaseUser.uid,
          name: name || (role === UserRole.BENEFACTOR ? 'Alexander Reed' : 'Verified User'),
          email: email,
          phone: phone || '+91 9999999999',
          role: role,
          status: AccountStatus.ACTIVE,
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        if (role === UserRole.BENEFACTOR) {
          setShowOnboarding(true);
        } else {
          setUser(newUser);
          if (role === UserRole.NOMINEE) setCurrentPage('nominee-portal');
          else setCurrentPage('witness-portal');
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setUser(userData);
          if (userData.role === UserRole.BENEFACTOR) setCurrentPage('dashboard');
          else if (userData.role === UserRole.NOMINEE) setCurrentPage('nominee-portal');
          else setCurrentPage('witness-portal');
        } else {
          throw new Error("User profile not found in database.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      if (err.code?.includes('firestore')) {
        handleFirestoreError(err, activeTab === 'signup' ? OperationType.CREATE : OperationType.GET, 'users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <OnboardingGuide 
        isOpen={showOnboarding} 
        onClose={() => { 
          const currentUser = auth.currentUser;
          if (currentUser) {
            getDoc(doc(db, 'users', currentUser.uid)).then(docSnap => {
              if (docSnap.exists()) {
                setUser(docSnap.data() as UserProfile);
                setTutorialStep('WELCOME'); 
                setCurrentPage('dashboard');
              }
            });
          }
        }} 
      />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <button 
          onClick={() => setCurrentPage('gateway')}
          className="mb-8 flex items-center gap-3 text-zinc-500 hover:text-accent font-black text-[11px] uppercase tracking-[0.3em] transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="glass p-10 md:p-14 rounded-[48px] shadow-3d relative overflow-hidden border border-white/5">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className={`w-20 h-20 ${isWitnessAuth ? 'bg-emerald-500' : (isNomineeAuth ? 'bg-blue-500' : 'bg-accent')} rounded-[28px] flex items-center justify-center mb-8 shadow-accent-glow`}>
              <Globe className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black dark:text-white tracking-tighter uppercase leading-none mb-3">
              {isNomineeAuth ? 'Nominee Entry' : (isWitnessAuth ? 'Council Entry' : (activeTab === 'login' ? 'Vault Login' : 'Secure Vault'))}
            </h1>
            <p className="text-zinc-500 font-medium">{isNomineeAuth || isWitnessAuth ? 'Verify your credentials to proceed.' : 'Secure your digital future.'}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {isPersonalVault && (
            <div className="flex bg-white/5 p-1.5 rounded-2xl mb-10 border border-white/5 shadow-inner">
              <button onClick={() => setActiveTab('login')} className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'login' ? 'bg-accent text-white shadow-accent-glow' : 'text-zinc-500'}`}>Log In</button>
              <button onClick={() => setActiveTab('signup')} className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'signup' ? 'bg-accent text-white shadow-accent-glow' : 'text-zinc-500'}`}>Sign Up</button>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {activeTab === 'signup' && isPersonalVault && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-4">Master Identity</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-8 py-5 glass rounded-2xl outline-none focus:border-accent dark:text-white font-bold text-lg" placeholder="Full Legal Name" />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-4">Terminal Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-8 py-5 glass rounded-2xl outline-none focus:border-accent dark:text-white font-bold text-lg" placeholder="verified@email.net" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-4">Secret Key</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-8 py-5 glass rounded-2xl outline-none focus:border-accent dark:text-white font-bold text-lg pr-16" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-accent">{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}</button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-6 ${isWitnessAuth ? 'bg-emerald-500' : (isNomineeAuth ? 'bg-blue-500' : 'bg-accent')} text-white rounded-[24px] font-black text-xl uppercase tracking-tighter shadow-accent-glow hover:scale-[1.02] active:scale-95 transition-all mt-8 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                <>Initialize Protocol <ChevronRight size={24} /></>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;