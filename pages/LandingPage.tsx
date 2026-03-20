
import React from 'react';
import { useApp } from '../App';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, ChevronRight, Moon, Sun, Heart, Activity, Globe } from 'lucide-react';
import VaultAnimation from '../components/VaultAnimation';

const LandingPage: React.FC = () => {
  const { setCurrentPage, isDarkMode, setDarkMode } = useApp();
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);
  
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 glass rounded-[28px] px-8 h-16 flex items-center justify-between shadow-glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-accent-glow">
            <Globe className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter dark:text-white uppercase">E.D.I.T.H</span>
        </div>
        
        <div className="flex items-center gap-6 md:gap-10">
          <button 
            onClick={() => setCurrentPage('privacy')}
            className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-accent transition-colors hidden md:block"
          >
            Trust Center
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-zinc-500 hover:text-accent"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-44 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center min-h-[600px]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ y: y1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/5 rounded-full border border-slate-200 dark:border-white/10 mb-10 shadow-highlight">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Emergency Digital Inheritance & Transfer Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] dark:text-white tracking-tight mb-10">
              Your legacy, <br /><span className="text-accent italic">safely passed on.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-14 max-w-lg leading-relaxed font-medium">
              E.D.I.T.H provides a high-fidelity gateway for your digital estate—ensuring vital assets reach your heirs with absolute cryptographic security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <button 
                onClick={() => setCurrentPage('gateway')}
                className="px-12 py-6 bg-accent text-white rounded-[24px] font-black text-xl flex items-center justify-center gap-4 shadow-accent-glow hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-tight"
              >
                Access Hub Portal <ChevronRight size={28} />
              </button>
            </div>
          </motion.div>

          <motion.div 
            className="hidden lg:flex relative h-full w-full items-center justify-center"
            style={{ y: y2 }}
          >
            <VaultAnimation />
          </motion.div>
        </div>
      </main>
      
      <footer className="relative z-10 py-20 text-center">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] opacity-50">High-Security Temporal Handover • E.D.I.T.H Architects</p>
      </footer>
    </div>
  );
};

export default LandingPage;
