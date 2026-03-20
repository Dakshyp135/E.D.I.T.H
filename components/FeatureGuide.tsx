
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Info } from 'lucide-react';

interface FeatureGuideProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  steps: {
    icon: React.ReactNode;
    text: string;
  }[];
}

const FeatureGuide: React.FC<FeatureGuideProps> = ({ isOpen, onClose, title, steps }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-void-950/40 backdrop-blur-sm pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="glass p-8 md:p-10 rounded-[32px] max-w-md w-full shadow-2xl border border-white/10 pointer-events-auto relative overflow-hidden"
        >
          {/* Technical Blueprint lines */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-accent/20" />
          <div className="absolute top-0 right-10 w-px h-full bg-accent/5" />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                <Info size={18} />
              </div>
              <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{title}</h4>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="mt-1 text-accent p-1 bg-accent/5 rounded-md">
                  {step.icon}
                </div>
                <p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-10 py-4 bg-accent text-white rounded-[16px] font-black text-[11px] uppercase tracking-widest shadow-accent-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Acknowledge <ChevronRight size={16} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeatureGuide;
