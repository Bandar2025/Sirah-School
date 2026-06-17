import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, ExternalLink, Lightbulb, BookOpen, AlertCircle } from 'lucide-react';

interface HelpContext {
  title: string;
  guide: string[];
  tips: string[];
  faq: { q: string; a: string }[];
}

const HELP_DATA: Record<string, HelpContext> = {
  dashboard: {
    title: 'لوحة التحكم المركزية',
    guide: ['تعرض هذه الصفحة نظرة شاملة لمؤشرات أداء المدرسة اليومية.', 'يمكنك متابعة الغياب والتحصيل المالي في أوزان مباشرة.'],
    tips: ['انقر على البطاقات للانتقال السريع للموديول المختص.', 'الرسوم البيانية تدعم العرض التفاعلي عند تمرير الماوس.'],
    faq: [{ q: 'كيف يتم تحديث الأرقام؟', a: 'يتم التحديث تلقائياً فور تسجيل أي بيانات جديدة في النظام.' }]
  },
  students: {
    title: 'إدارة الطلاب والشؤون',
    guide: ['إضافة الطلاب وتسجيلهم في الفصول الدراسية.', 'إدارة ملفات الطلاب والبيانات الصحية والأكاديمية.'],
    tips: ['استخدم كرات البحث (Filter) لتصفية الطلاب حسب الصف أو الحالة.', 'يمكنك طباعة كروات الطلاب (Student IDs) مباشرة من ملف الطالب.'],
    faq: [{ q: 'هل يمكنني نقل طالب من فصل لآخر؟', a: 'نعم، عبر خيار "ترحيل وترفيع" الموجود في أعلى الصفحة.' }]
  },
  finance: {
    title: 'النظام المالي والمحاسبي',
    guide: ['إدارة الرسوم الدراسية والأنشطة.', 'إصدار سندات القبض الآلية.'],
    tips: ['تأكد من تعريف "أنواع الرسوم" أولاً قبل إصدار أي سند.', 'النظام يدعم الطباعة الحرارية والعادية.'],
    faq: [{ q: 'كيف أعرف من لم يسدد؟', a: 'استخدم تقرير "المتأخرات المالية" في قسم التقارير.' }]
  },
  grades: {
    title: 'الكنترول المركزي ورصد الدرجات',
    guide: ['رصد أعمال السنة، درجات نصف العام، والنهائي.', 'اعتماد النتائج وإغلاق الفترات.'],
    tips: ['يمكنك استيراد الدرجات من ملف Excel لتوفير الوقت.', 'تأكد من رصد درجات السلوك والمواظبة لاكتمال الشهادة.'],
    faq: [{ q: 'ماذا أفعل في حال الخطأ في الرصد؟', a: 'يمكنك التعديل طالما لم يتم "اعتماد النتيجة" نهائياً.' }]
  }
};

export function HelpButton({ context }: { context: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const data = HELP_DATA[context] || HELP_DATA.dashboard;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all z-50 group border-4 border-white"
      >
        <HelpCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">{data.title}</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                    <AlertCircle className="w-4 h-4 text-indigo-500" />
                    دليل الاستخدام السريع
                  </h4>
                  <ul className="space-y-2">
                    {data.guide.map((item, i) => (
                      <li key={i} className="text-xs text-slate-600 flex gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                    <Lightbulb className="w-4 h-4" />
                    نصائح ذكية
                  </h4>
                  <ul className="space-y-2">
                    {data.tips.map((item, i) => (
                      <li key={i} className="text-xs text-amber-700 leading-relaxed font-medium">✨ {item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center justify-between">
                    الأسئلة الشائعة
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </h4>
                  <div className="space-y-4">
                    {data.faq.map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs font-bold text-indigo-600">Q: {item.q}</p>
                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">A: {item.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                <p className="text-[10px] text-slate-400 font-medium">للمزيد من المساعدة، تواصل مع فريق شركة بن درر للحلول</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
