import React, { useState, useEffect, createContext, useContext, Component, ErrorInfo, ReactNode } from 'react';
import { UserRole, AccountStatus, UserProfile, Asset, Nominee, Witness, Memory } from './types';
import LandingPage from './pages/LandingPage';
import AccessSelection from './pages/AccessSelection';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NomineePortal from './pages/NomineePortal';
import WitnessPortal from './pages/WitnessPortal';
import TriggerSettings from './pages/TriggerSettings';
import PrivacyTrust from './pages/PrivacyTrust';
import BeneficiaryDashboard from './pages/BeneficiaryDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection } from 'firebase/firestore';

// Error Boundary Component
class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-void-950 text-white text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Something went wrong</h1>
          <p className="text-zinc-500 mb-8 max-w-md">
            {this.state.error?.message.includes('authInfo') 
              ? "A security error occurred. Please check your permissions or try logging in again."
              : "An unexpected error occurred. Please try refreshing the page."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-accent rounded-2xl font-black uppercase tracking-widest text-[10px]"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export type TutorialStep = 
  | 'WELCOME' 
  | 'NAV_VAULT' 
  | 'ADD_ASSET' 
  | 'NAV_PEOPLE' 
  | 'ADD_NOMINEE' 
  | 'ADD_WITNESS'
  | 'NAV_PROFILE'
  | 'EDIT_PROFILE'
  | 'COMPLETE';

interface AppContextType {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  isDarkMode: boolean;
  setDarkMode: (d: boolean) => void;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  nominees: Nominee[];
  setNominees: React.Dispatch<React.SetStateAction<Nominee[]>>;
  witnesses: Witness[];
  setWitnesses: React.Dispatch<React.SetStateAction<Witness[]>>;
  memories: Memory[];
  setMemories: React.Dispatch<React.SetStateAction<Memory[]>>;
  currentPage: string;
  setCurrentPage: (p: string) => void;
  tutorialStep: TutorialStep | null;
  setTutorialStep: (step: TutorialStep | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDarkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('edith_theme');
    return saved ? saved === 'dark' : true;
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep | null>(null);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // If user exists in Auth but not in Firestore, we might need to create the profile
            // This happens right after signup
            setUser(null);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Data Listeners
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const unsubAssets = onSnapshot(collection(db, 'users', user.id, 'assets'), (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Asset)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.id}/assets`));

    const unsubNominees = onSnapshot(collection(db, 'users', user.id, 'nominees'), (snapshot) => {
      setNominees(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Nominee)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.id}/nominees`));

    const unsubWitnesses = onSnapshot(collection(db, 'users', user.id, 'witnesses'), (snapshot) => {
      setWitnesses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Witness)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.id}/witnesses`));

    const unsubMemories = onSnapshot(collection(db, 'users', user.id, 'memories'), (snapshot) => {
      setMemories(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Memory)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.id}/memories`));

    return () => {
      unsubAssets();
      unsubNominees();
      unsubWitnesses();
      unsubMemories();
    };
  }, [user, isAuthReady]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('edith_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('edith_theme', 'light');
    }
  }, [isDarkMode]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void-950">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderPage = () => {
    if (!user) {
      switch (currentPage) {
        case 'gateway': return <AccessSelection />;
        case 'login': 
        case 'signup': 
        case 'nominee-auth':
        case 'witness-auth': return <Auth />;
        case 'privacy': return <PrivacyTrust />;
        case 'home':
        default: return <LandingPage />;
      }
    }

    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'nominee-portal': return <NomineePortal />;
      case 'beneficiary-dashboard': return <BeneficiaryDashboard />;
      case 'witness-portal': return <WitnessPortal />;
      case 'triggers': return <TriggerSettings />;
      case 'privacy': return <PrivacyTrust />;
      case 'home': return <LandingPage />;
      default: 
        if (user.role === UserRole.BENEFACTOR) return <Dashboard />;
        if (user.role === UserRole.NOMINEE) return <NomineePortal />;
        return <WitnessPortal />;
    }
  };

  return (
    <ErrorBoundary>
      <AppContext.Provider value={{ 
        user, setUser, isDarkMode, setDarkMode, assets, setAssets, 
        nominees, setNominees, witnesses, setWitnesses, memories, setMemories,
        currentPage, setCurrentPage,
        tutorialStep, setTutorialStep
      }}>
        <div className="min-h-screen relative overflow-x-hidden selection:bg-accent selection:text-white transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage + (user?.id || 'guest')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </AppContext.Provider>
    </ErrorBoundary>
  );
};

export default App;