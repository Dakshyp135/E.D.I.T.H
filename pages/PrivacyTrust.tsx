import React from 'react';
import { useApp } from '../App.js';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, EyeOff, UserCheck, Lock, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';

const PrivacyTrust: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-screen relative flex flex-col p-8 gap-8">
      <div className="max-w-5xl mx-auto w-full">
        <button 
          onClick={() => setCurrentPage('home')}
          className="mb-12 flex items-center gap-3 text-zinc-500 hover:text-accent transition-all font-black text-[10px] uppercase tracking-[0.3em]"
        >
          <ArrowLeft size={16} /> Return to Home
        </button>

        <header className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-20 h-20 bg-accent/10 rounded-[28px] flex items-center justify-center text-accent border border-accent/20 shadow-[0_0_20px_rgba(212,255,63,0.2)]">
              <Shield size={40} />
            </div>
            <div className="px-5 py-2 glass bg-accent/10 border border-accent/30 rounded-full flex items-center gap-3">
              <Zap className="text-accent" size={14} />
              <span className="text-[10px] font-black text-accent uppercase tracking-widest">End-to-End Encrypted (E2EE)</span>
            </div>
          </div>
          <h1 className="text-7xl font-black mb-8 dark:text-white tracking-tighter uppercase leading-[0.9]">Privacy <br />by Design.</h1>
          <p className="text-2xl text-zinc-500 leading-relaxed max-w-2xl font-medium italic">
            "Every individual has the right to digital sovereignty. Our systems are engineered for on-demand emergency succession with human-layer verification."
          </p>
        </header>

        <div className="grid gap-20">
          {[
            {
              icon: <EyeOff className="text-accent" size={36} />,
              title: "Zero-Trace Protocol",
              desc: "We operate on a zero-biometric tracking model. Your legacy is only accessible when your designated heirs initiate a manual verification cycle during a crisis."
            },
            {
              icon: <Lock className="text-accent" size={36} />,
              title: "Frost Encryption (E2EE)",
              desc: "All assets are secured with full End-to-End Encryption. We store the instructions for handover, but never your plaintext passwords or personal files. Not even EDITH can read your vault until it is released to your heir."
            },
            {
              icon: <UserCheck className="text-accent" size={36} />,
              title: "Human Consensus Audit",
              desc: "Critical emergency claims are audited by your Witness Council to ensure legitimacy. No automated script can release your heritage—only your trusted circle can authorize a transfer after verifying the evidence."
            }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-12"
            >
               <div className="w-24 h-24 glass rounded-[36px] flex items-center justify-center shrink-0 shadow-3d border border-white/10">
                  {item.icon}
               </div>
               <div>
                 <h3 className="text-4xl font-black mb-6 dark:text-white tracking-tighter uppercase leading-none">{item.title}</h3>
                 <p className="text-zinc-500 text-xl leading-relaxed font-medium">{item.desc}</p>
               </div>
            </motion.div>
          ))}

          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="mt-20 p-20 glass bg-void-950 rounded-[80px] text-white relative overflow-hidden shadow-3d border border-white/10"
          >
            <div className="absolute -top-20 -right-20 opacity-5">
               <Shield size={400} />
            </div>
            <div className="flex items-center gap-4 mb-12">
               <ShieldAlert className="text-accent" size={24} />
               <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em]">The EDITH Manifesto</span>
            </div>
            <p className="text-zinc-300 leading-[1.3] text-5xl font-black italic mb-16 opacity-90 relative z-10 tracking-tighter">
              "Digital legacies shouldn't be governed by timers—they should be passed on through human trust, verified evidence, and absolute cryptographic consent."
            </p>
            <div className="flex items-center gap-6 relative z-10">
               <div className="w-16 h-16 glass rounded-2xl border border-white/10 flex items-center justify-center text-accent">
                 <ShieldCheck size={32} />
               </div>
               <div>
                 <p className="font-black text-xl uppercase tracking-tighter">The E.D.I.T.H. Council</p>
                 <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Succession Protocol Architects</p>
               </div>
            </div>
          </motion.div>
        </div>
        
        <footer className="mt-40 text-center pb-20">
           <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">Emergency Digital Inheritance and Transfer Hub</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyTrust;