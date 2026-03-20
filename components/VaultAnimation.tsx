import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const VaultAnimation: React.FC = () => {
  // Enhanced background particles radiating from the center to fill the screen
  const particles = useMemo(() => 
    Array.from({ length: 250 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1.5,
      angle: Math.random() * Math.PI * 2,
      distance: 300 + Math.random() * 1500, 
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.7 + 0.2, // Increased visibility
      sway: (Math.random() - 0.5) * 100,
    })), []);

  return (
    <div className="relative w-full h-[350px] md:h-[550px] flex items-center justify-center overflow-visible perspective-1000">
      
      {/* ENHANCED GLOBAL BACKGROUND PARTICLES */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] flex items-center justify-center">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ 
              x: [0, Math.cos(p.angle) * p.distance + p.sway],
              y: [0, Math.sin(p.angle) * p.distance],
              opacity: [0, p.opacity, p.opacity * 0.8, 0],
              scale: [0, 1.4, 1.1, 0.4]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeOut"
            }}
            className={`absolute rounded-full ${p.id % 4 === 0 ? 'bg-cyan-400' : 'bg-accent'} shadow-accent-glow`}
            style={{ 
              width: p.size, 
              height: p.size,
              filter: p.size > 3 ? 'blur(1.5px)' : 'none' 
            }}
          />
        ))}
      </div>

      {/* REFINED MECHANICAL INDUSTRIAL VAULT (Slightly Smaller) */}
      <motion.div 
        initial={{ rotateY: -30, rotateX: 15, opacity: 0, scale: 0.9 }}
        animate={{ rotateY: -10, rotateX: 8, opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-64 h-64 md:w-[400px] md:h-[400px]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Reinforced Outer Shell */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-700 dark:from-zinc-800 dark:to-zinc-950 rounded-[50px] md:rounded-[70px] shadow-3d border-[10px] md:border-[16px] border-slate-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
          
          {/* Industrial Rivets */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className={`absolute w-3 h-3 md:w-5 md:h-5 rounded-full bg-slate-400 dark:bg-zinc-600 shadow-inner border border-white/10 ${
                i === 0 ? 'top-6 left-6' : i === 1 ? 'top-6 right-6' : i === 2 ? 'bottom-6 left-6' : i === 3 ? 'bottom-6 right-6' :
                i === 4 ? 'top-1/2 left-4' : i === 5 ? 'top-1/2 right-4' : i === 6 ? 'left-1/2 top-4' : 'left-1/2 bottom-4'
              }`}
            />
          ))}

          {/* Internal Border Lining */}
          <div className="absolute inset-8 md:inset-12 rounded-[35px] md:rounded-[55px] border-2 border-slate-500/30 dark:border-zinc-500/30 shadow-inner" />

          {/* Precision Dial Hub */}
          <div 
            className="relative w-52 h-52 md:w-[290px] md:h-[290px] rounded-full bg-gradient-to-br from-slate-300 to-slate-500 dark:from-zinc-800 dark:to-zinc-900 shadow-glass border-[6px] md:border-[12px] border-slate-200 dark:border-zinc-700 flex items-center justify-center"
            style={{ transform: 'translateZ(30px)' }}
          >
            {/* Tick Marks */}
            {[...Array(40)].map((_, i) => (
              <div 
                key={i} 
                className={`absolute w-0.5 md:w-1 flex flex-col justify-between items-center ${i % 5 === 0 ? 'h-[92%] py-2' : 'h-[86%] py-1'}`}
                style={{ transform: `rotate(${i * 9}deg)` }}
              >
                <div className={`w-full bg-slate-400 dark:bg-zinc-600 rounded-full ${i % 5 === 0 ? 'h-3 md:h-5' : 'h-1.5 md:h-2 opacity-50'}`} />
              </div>
            ))}

            {/* Rotating Spoke Wheel */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="relative w-36 h-36 md:w-48 md:h-48 rounded-full bg-slate-400 dark:bg-zinc-800 shadow-3d flex items-center justify-center border-4 border-slate-300 dark:border-zinc-700"
              style={{ transform: 'translateZ(15px)' }}
            >
              {/* Massive Industrial Spokes */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div 
                  key={deg} 
                  className="absolute w-4 md:w-6 h-[115%] bg-gradient-to-b from-slate-200 to-slate-600 dark:from-zinc-600 dark:to-zinc-900 rounded-full shadow-2xl border-x border-white/5"
                  style={{ transform: `rotate(${deg}deg)` }}
                />
              ))}

              {/* Central Core Bio-Plate */}
              <div className="absolute inset-0 m-auto w-16 h-16 md:w-24 md:h-24 bg-slate-700 dark:bg-zinc-950 rounded-full shadow-glass border-4 border-slate-200 dark:border-zinc-600 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-accent/10 animate-pulse" />
                <motion.div 
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-6 h-6 md:w-10 md:h-10 bg-accent rounded-full shadow-accent-glow flex items-center justify-center"
                >
                   <div className="w-2 h-2 md:w-4 md:h-4 bg-white rounded-full opacity-40 blur-sm" />
                </motion.div>
                
                {/* Core Radial Lines */}
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute w-full h-px bg-accent/20" style={{ transform: `rotate(${i * 30}deg)` }} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default VaultAnimation;