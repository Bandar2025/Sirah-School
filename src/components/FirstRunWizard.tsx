import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { schoolDatabase } from '../db/database';
import { SchoolSettings } from '../types';
import { 
  Building2, 
  MapPin, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface FirstRunWizardProps {
  onComplete: () => void;
}

export default function FirstRunWizard({ onComplete }: FirstRunWizardProps) {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<Partial<SchoolSettings>>({
    schoolName: '',
    governorate: 'أمانة العاصمة',
    district: '',
    principalName: '',
    schoolType: 'private',
    currentAcademicYear: '2025/2026',
    semester: 'first',
    isConfigured: true,
    activationStatus: 'trial',
    version: '2.5.0-YEM'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = () => {
    schoolDatabase.updateSettings(settings as any, 'system', 'نظام البدء');
    onComplete();
  };

  const steps = [
    {
      title: 'مرحباً بك في نظام السيرة',
      description: 'نظام إدارة المدارس اليمني المتكامل. لنقم بضبط بعض الإعدادات الأساسية.',
      icon: <GraduationCap className="w-12 h-12 text-indigo-600" />
    },
    {
      title: 'بيانات المدرسة',
      description: 'أدخل الاسم الرسمي والعنوان لظهوره في التقارير.',
      icon: <Building2 className="w-10 h-10 text-indigo-600" />
    },
    {
      title: 'الموقع الجغرافي',
      description: 'تحديد المحافظة والمديرية.',
      icon: <MapPin className="w-10 h-10 text-indigo-600" />
    },
    {
      title: 'الإدارة والترخيص',
      description: 'بيانات مدير المدرسة وتفعيل النسخة.',
      icon: <ShieldCheck className="w-10 h-10 text-indigo-600" />
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white text-center">
          <motion.div 
            key={step}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              {steps[step-1].icon}
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">{steps[step-1].title}</h1>
          <p className="text-indigo-100 text-sm">{steps[step-1].description}</p>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="py-8">
                  <p className="text-slate-600 mb-4">أهلاً بك في النسخة النهائية من نظام السيرة ERP.</p>
                  <p className="text-slate-500 text-sm italic">بواسطة: Bandr Solutions - Version 2.5.0</p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">اسم المدرسة بالكامل</label>
                  <input 
                    type="text" 
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold text-lg"
                    placeholder="مثال: مدرسة الثورة الحديثة"
                    value={settings.schoolName}
                    onChange={e => setSettings({...settings, schoolName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">نوع المدرسة</label>
                    <select 
                      className="w-full h-11 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={settings.schoolType}
                      onChange={e => setSettings({...settings, schoolType: e.target.value as any})}
                    >
                      <option value="government">حكومي</option>
                      <option value="private">أهلي / خاص</option>
                      <option value="complex">مجمع تربوي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">العام الدراسي الحالي</label>
                    <input 
                      type="text" 
                      className="w-full h-11 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="2025/2026"
                      value={settings.currentAcademicYear}
                      onChange={e => setSettings({...settings, currentAcademicYear: e.target.value})}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المحافظة</label>
                  <select 
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={settings.governorate}
                    onChange={e => setSettings({...settings, governorate: e.target.value})}
                  >
                    <option value="أمانة العاصمة">أمانة العاصمة</option>
                    <option value="صنعاء">صنعاء</option>
                    <option value="تعز">تعز</option>
                    <option value="عدن">عدن</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="إب">إب</option>
                    <option value="حضرموت">حضرموت</option>
                    {/* ... other governorates */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المديرية</label>
                  <input 
                    type="text" 
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="اسم المديرية"
                    value={settings.district}
                    onChange={e => setSettings({...settings, district: e.target.value})}
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">اسم مدير المدرسة المختص</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      className="w-full h-12 pr-12 pl-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="الاسم الرباعي"
                      value={settings.principalName}
                      onChange={e => setSettings({...settings, principalName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    ملاحظة: سيتم تفعيل النسخة كفترة تجريبية لمدة عام كامل (SR-TRIAL). يمكنك إدخال مفتاح الترخيص الرسمي لاحقاً من إعدادات النظام.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex gap-2">
            {Array.from({length: 4}).map((_, i) => (
              <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full transition-all ${i+1 === step ? 'bg-indigo-600 w-6' : 'bg-slate-300'}`}
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="px-6 h-11 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                السابق
              </button>
            )}
            
            {step < 4 ? (
              <button 
                onClick={nextStep}
                disabled={step === 2 && !settings.schoolName}
                className="px-8 h-11 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                التالي
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                disabled={!settings.principalName}
                className="px-8 h-11 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all flex items-center gap-2"
              >
                بدء تشغيل النظام
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
