import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, Database, Phone, Globe, Mail, Github } from 'lucide-react';
import { schoolDatabase } from '../db/database';

interface AboutDialogProps {
  onClose: () => void;
}

export default function AboutDialog({ onClose }: AboutDialogProps) {
  const settings = schoolDatabase.getSettings();

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl" />
          
          <button 
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 relative">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 overflow-hidden">
              <div className="relative">
                <ShieldCheck className="w-10 h-10 text-indigo-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">نظام المنارة ERP</h2>
              <p className="text-indigo-100 text-xs font-medium">النسخة الذهبية للإصدار النهائي</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">الإصدار</p>
              <p className="text-sm font-bold text-slate-900">{settings.version || '2.5.0-YEM'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">نمط التشغيل</p>
              <p className="text-sm font-bold text-emerald-600">
                محلي كامل (دون اتصال)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold leading-none mb-1">مسار قاعدة البيانات</p>
                <code className="text-xs font-mono text-slate-600">/data/school.db (SQLite 3)</code>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold leading-none mb-1">المطور</p>
                <p className="text-xs font-bold text-slate-900">Bandr Solutions - شركة بن درر للحلول البرمجية</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold leading-none mb-1">الدعم الفني والواتساب</p>
                <p className="text-xs font-bold text-slate-900 dir-ltr">+967 77XXX XXXX</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-center gap-4">
             <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Mail className="w-5 h-5" /></button>
             <button className="text-slate-400 hover:text-slate-900 transition-colors"><Github className="w-5 h-5" /></button>
             <button className="text-slate-400 hover:text-blue-500 transition-colors"><Globe className="w-5 h-5" /></button>
          </div>

          <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed px-4">
            جميع الحقوق محفوظة © 2026 لصالح شركة بن درر للحلول البرمجية. يمنع النسخ أو إعادة التوزيع دون تصريح كتابي.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
