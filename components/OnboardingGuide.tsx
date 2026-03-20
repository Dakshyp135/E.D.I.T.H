import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Lock, ChevronRight, X, Heart, ShieldCheck, Database, Key, Activity, Zap } from 'lucide-react';

const steps = [
  {
    title: "Welcome to E.D.I.T.H",
    description: "Your digital life is important. We help you securely pass it on to the people you trust most, ensuring nothing is lost.",
    icon: <Shield className="text-accent" size={56} />,
    color: "accent"
  },
  {
    title: "Store What Matters",
    description: "Save your social accounts, important files, and instructions. Everything is encrypted and locked in your personal vault.",
    icon: <Database className="text-indigo-400" size={56} />,
    color: "indigo-400"
  },
  {
    title: "Choose Your People",
    description: "Select family or friends to be your beneficiaries. They will get a unique key that only works when the time is right.",
    icon: <Users className="text-emerald-400" size={56} />,
    color: "emerald-400"
  },
  {
    title: "Emergency Release",
    description: "Access is never automatic. Heirs initiate a verified claim which is then audited by your Witness Council for safety.",
    icon: <Zap className="text-rose-400" size={56} />,
    color: "rose-400"
  }
];

export default function OnboardingGuide({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [current, setCurrent] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-void-950/80 backdrop-blur-3xl">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass w-full max-w-3xl rounded-[72px] shadow-3d overflow-hidden relative border border-white/10"
      >
        <button onClick={onClose} className="absolute top-12 right-12 p-5 bg-white/5 rounded-full text-zinc-500 hover:text-white hover:shadow-highlight transition-all">
          <X size={32} />
        </button>

        <div className="p-16 md:p-24 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-32 h-32 glass rounded-[48px] flex items-center justify-center mx-auto mb-16 shadow-inner border border-white/5 bg-white/[0.01] shadow-highlight">
                {steps[current].icon}
              </div>
              <p className="text-[11px] font-bold text-accent uppercase tracking-widest mb-6">Node {current + 1} of 4</p>
              <h2 className="text-5xl font-black mb-10 dark:text-white tracking-tight uppercase leading-none">{steps[current].title}</h2>
              <p className="text-zinc-400 text-2xl leading-relaxed mb-20 font-medium max-w-lg mx-auto tracking-tight">
                {steps[current].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-8">
            {current > 0 && (
              <button 
                onClick={() => setCurrent(c => c - 1)}
                className="flex-1 py-7 glass rounded-[32px] font-bold text-sm uppercase tracking-widest text-zinc-500 hover:text-white hover:shadow-highlight transition-all border border-white/5"
              >
                Go Back
              </button>
            )}
            <button 
              onClick={() => {
                if (current < steps.length - 1) setCurrent(c => c + 1);
                else onClose();
              }}
              className="flex-1 py-7 bg-accent text-white rounded-[32px] font-black text-2xl uppercase tracking-tighter flex items-center justify-center gap-5 hover:brightness-110 hover:shadow-button-hover transition-all shadow-accent-glow"
            >
              {current === steps.length - 1 ? "Initialize" : "Continue"} <ChevronRight size={32} />
            </button>
          </div>
          
          <div className="mt-16 flex justify-center gap-4">
             {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${current === i ? 'w-20 bg-accent shadow-accent-glow' : 'w-6 bg-white/10'}`} />
             ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}