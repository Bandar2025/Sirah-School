import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, GraduationCap } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] bg-indigo-600 flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute w-[600px] h-[600px] border border-white/20 rounded-full" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute w-[800px] h-[800px] border border-white/10 rounded-full" 
      />

      <div className="relative text-center">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 60 }}
          className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-8 mx-auto transform rotate-6 border-4 border-white/50"
        >
          <ShieldCheck className="w-16 h-16 text-indigo-600" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-extrabold text-white tracking-tight mb-2"
        >
          نظام المنارة ERP
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className="h-[1px] w-8 bg-indigo-300" />
          <p className="text-indigo-100 text-sm font-medium tracking-[0.2em] uppercase">Al-Manara School Management</p>
          <span className="h-[1px] w-8 bg-indigo-300" />
        </motion.div>

        <div className="space-y-4">
          <div className="w-48 h-1 bg-indigo-800 rounded-full mx-auto overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full bg-indigo-300"
            />
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-indigo-200 text-xs font-semibold"
          >
            جاري تهيئة محرك البيانات والاتصال بقاعدة بيانات المدرسة...
          </motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-white/50 text-xs font-bold mb-1 tracking-widest">تطوير وتوزيع</p>
        <p className="text-white text-sm font-black tracking-tight">BANDR SOLUTIONS | شركة بن درر للحلول البرمجية</p>
        <p className="text-white/40 text-[10px] mt-2 font-mono uppercase tracking-widest">Version 2.5.0-GOLD-YEM</p>
      </motion.div>
    </div>
  );
}
