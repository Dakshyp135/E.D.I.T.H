import React, { useState } from 'react';
import { useApp } from '../App';
import { motion } from 'framer-motion';
import { Database, Users, Shield, ArrowLeft, ChevronRight, Key, Eye } from 'lucide-react';

const AccessSelection: React.FC = () => {
  const { setCurrentPage } = useApp();

  const options = [
    {
      id: 'login',
      title: "My Personal Vault",
      desc: "Secure or manage your own digital heritage and trust circle.",
      icon: <Database className="text-accent" size={32} />,
      btnText: "Open Vault",
      color: "border-accent/40"
    },
    {
      id: 'nominee-auth',
      title: "Nominee Gateway",
      desc: "Access a legacy archive that has been shared with you.",
      icon: <Key className="text-blue-500" size={32} />,
      btnText: "Claim Heritage",
      color: "border-blue-500/40"
    },
    {
      id: 'witness-auth',
      title: "Witness Council",
      desc: "Verify and adjudicate heritage release requests.",
      icon: <Shield className="text-emerald-500" size={32} />,
      btnText: "Validate Requests",
      color: "border-emerald-500/40"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-void-950">
      <div className="w-full max-w-6xl">
        <button 
          onClick={() => setCurrentPage('home')}
          className="mb-12 flex items-center gap-3 text-zinc-500 hover:text-accent font-black text-[11px] uppercase tracking-[0.3em] transition-all"
        >
          <ArrowLeft size={18} /> Return Home
        </button>

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black dark:text-white uppercase tracking-tighter mb-4 leading-none">Access <span className="text-accent italic">Terminal</span></h1>
          <p className="text-zinc-500 text-lg font-medium">Select your authorized protocol to initialize the hub session.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {options.map((opt, i) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => setCurrentPage(opt.id)}
              className={`glass p-10 rounded-[48px] border-2 ${opt.color} flex flex-col justify-between h-full group cursor-pointer shadow-3d hover:shadow-accent-glow transition-all`}
            >
              <div>
                <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform border-2 border-white/20">
                  {opt.icon}
                </div>
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-4">{opt.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed mb-12">{opt.desc}</p>
              </div>
              
              <div className="w-full py-5 glass bg-white/10 rounded-2xl group-hover:bg-accent group-hover:text-white transition-all text-center text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 border border-white/10">
                {opt.btnText} <ChevronRight size={18} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessSelection;