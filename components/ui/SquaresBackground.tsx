'use client';

import { motion } from 'framer-motion';

export default function SquaresBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-zinc-950 overflow-hidden">
      {/* Deep grid perspective */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Emerald Glow Orb */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"
      />
      
      {/* Floating React Bits Style Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-500/50 rounded-full"
          initial={{
            y: "100vh",
            x: `${(i * 17.5 + 13) % 100}vw`,
            opacity: 0,
          }}
          animate={{
            y: "-10vh",
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: ((i * 4.3 + 7) % 10) + 10,
            repeat: Infinity,
            delay: (i * 3.1) % 10,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
