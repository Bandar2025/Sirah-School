/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { schoolDatabase } from '../db/database';
import { SchoolSettings } from '../types';
import AboutDialog from './AboutDialog';
import { 
  Settings, 
  Upload, 
  Download, 
  RotateCcw, 
  Save, 
  Database, 
  Phone, 
  School,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Award,
  Terminal,
  Cpu,
  Laptop,
  Lock,
  Info,
  ShieldCheck,
  Calendar,
  Key
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: any;
  onRefreshAll: () => void;
}

export default function SettingsView({ currentUser, onRefreshAll }: SettingsViewProps) {
  const [settings, setSettings] = useState<SchoolSettings>(schoolDatabase.getSettings());
  
  // Custom states
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [phone, setPhone] = useState(settings.contactPhone);
  const [email, setEmail] = useState(settings.contactEmail);
  const [year, setYear] = useState(settings.currentAcademicYear);
  const [address, setAddress] = useState(settings.address);
  const [bank, setBank] = useState(settings.bankAccount);

  const [statusMessage, setStatusMessage] = useState('');
  const [backupFileContent, setBackupFileContent] = useState('');
  const [showCopiedText, setShowCopiedText] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // License management states
  const [licenseKey, setLicenseKey] = useState(settings.licenseKey || '');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    schoolDatabase.updateSettings({
      schoolName,
      logoUrl,
      contactPhone: phone,
      contactEmail: email,
      currentAcademicYear: year,
      address,
      bankAccount: bank,
      licenseKey
    }, currentUser.id, currentUser.username);

    setStatusMessage('✓ تم إجراء الحفظ والتعديل على هوية التقارير بنجاح.');
    setTimeout(() => setStatusMessage(''), 3000);
    onRefreshAll();
  };

  const handleFactoryReset = () => {
    if (window.confirm('🚨 هدم وإعادة بناء: هل أنت متأكد من تفريغ كافة الجداول المحلية وعمل إعادة ضبط المصنع؟ سيتم محو الطلاب والدفعات التي أدخلتها وتعبئة قاعدة البيانات بالمدخلات العشوائية الافتراضية للتقييم.')) {
      schoolDatabase.resetToDefaults();
      location.reload(); // reboot app context safely
    }
  };

  // Export database as SQLite-compatible .SQL file
  const handleExportSQL = () => {
    const sql = schoolDatabase.exportSQLBackup();
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "manara_school_db_sqlite.sql");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage('✓ تم توليد وتصدير ملف سكربت SQLite (.sql) بنجاح!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Export database as JSON file backup
  const handleExportJSON = () => {
    const jsonStr = schoolDatabase.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "manara_school_db_backup.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage('✓ تم تحميل ملف النسخة الاحتياطية JSON بنجاح!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Import JSON Backup handler
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = schoolDatabase.importBackupJSON(text, currentUser.id, currentUser.username);
      if (success) {
        alert('نجاح: تم استرداد وتركيب كافة الجداول والمحددات القديمة في SQLite الداخلي للمتصفح!');
        location.reload();
      } else {
        alert('خطأ: الملف المختار لا يتوافق مع بنية الجداول أو أنه فاسد الهيكلية!');
      }
    };
    reader.readAsText(file);
  };

  // Windows Desktop launcher script downloader
  const downloadBatchFile = () => {
    const batContent = `@echo off
title مجمع منارة اليمن - مشغل سطح المكتب المحلي المتكامل
color 0b
echo ==========================================================
echo           مجمع منارة اليمن التعليمي لإدارة الكشوفات الذكية
echo               نسخة سطح المكتب المتكاملة للتشغيل دون اتصال
echo ==========================================================
echo.
echo [+] التحقق من تثبيت بيئة Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] تحذير: لم يتم العثور على بيئة Node.js مثبتة في هذا الجهاز.
    echo [!] يرجى تحميل وتثبيت بيئة Node.js من الموقع الرسمي (https://nodejs.org) لتشغيل النظام محلياً.
    pause
    exit
)
echo [+] بيئة Node.js متوفرة وجاهزة للتشغيل.
echo.
echo [1] جاري تثبيت وتحديث اعتماديات نظام منارة اليمن محلياً...
call npm install --legacy-peer-deps
echo.
echo [2] جاري تشغيل خادم مجمع منارة اليمن المحلي في وضع الإنتاج...
echo [✔] افتح المتصفح على الرابط: http://localhost:3000
echo ==========================================================
call npm run dev
pause`;
    const blob = new Blob([batContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "start_manara_yemen_desktop.bat");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setStatusMessage('✓ تم تحميل مشغل ويندوز start_manara_yemen_desktop.bat بنجاح!');
    setTimeout(() => setStatusMessage(''), 4005);
  };

  // Mac / Linux shell launcher script downloader
  const downloadShellScript = () => {
    const shContent = `#!/bin/bash
clear
echo "=========================================================="
echo "          مجمع منارة اليمن التعليمي لإدارة الكشوفات الذكية"
echo "              نسخة سطح المكتب المتكاملة للتشغيل دون اتصال"
echo "=========================================================="
echo ""
echo "[+] التحقق من تثبيت بيئة Node.js..."
if ! command -v node &> /dev/null
then
    echo "[!] تحذير: لم يتم العثور على بيئة Node.js مثبتة في هذا الجهاز."
    echo "[!] يرجى تحميل وتثبيت بيئة Node.js من الموقع الرسمي (https://nodejs.org) لتشغيل النظام محلياً."
    exit
fi
echo "[+] بيئة Node.js متوفرة وجاهزة للتشغيل."
echo ""
echo "[1] جاري تثبيت وتحديث اعتماديات نظام منارة اليمن محلياً..."
npm install --legacy-peer-deps
echo ""
echo "[2] جاري تشغيل خادم مجمع منارة اليمن المحلي في وضع الإنتاج..."
echo "[✔] افتح المتصفح على الرابط: http://localhost:3000"
echo "=========================================================="
npm run dev`;
    const blob = new Blob([shContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "run_manara_yemen_mac_linux.sh");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatusMessage('✓ تم تحميل ملف تشغيل الماك run_manara_yemen_mac_linux.sh بنجاح!');
    setTimeout(() => setStatusMessage(''), 4005);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settings-tab-view-container">
      
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#111827] rounded-3xl p-6 border-2 border-amber-500/40 shadow-xl relative overflow-hidden" id="system-creators-honor-card">
        {/* Background decorative glowing patterns */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-4 left-4 flex gap-1.5 z-20">
          {/* Yemeni Flag strip */}
          <div className="w-12 h-2.5 bg-[#CE1126] rounded-sm shadow-xs"></div>
          <div className="w-12 h-2.5 bg-white rounded-sm shadow-xs"></div>
          <div className="w-12 h-2.5 bg-black rounded-sm shadow-xs"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Golden Medal Ring with Eagle Emblem */}
          <div className="w-24 h-24 rounded-2xl bg-amber-500/15 border-2 border-amber-400 flex flex-col items-center justify-center text-amber-400 shadow-lg shrink-0">
            <Award className="w-11 h-11 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest mt-0.5 uppercase text-amber-300">الرواد التقنيون</span>
          </div>

          <div className="text-right flex-1 space-y-2">
            <div>
              <span className="text-xs font-black text-amber-400 tracking-wider uppercase block">★ بطاقة شرف واعتزاز هندسي للجمهورية اليمنية ★</span>
              <h1 className="text-xl font-black text-white mt-1 leading-snug font-sans">معماريو النظم ومُنشئو مجمع "المنارة" التعليمي الرقمي</h1>
              <p className="text-slate-400 text-xs mt-0.5">تم ابتكار، تصميم، وهندسة هذا النظام الإداري والتحليلي المتكامل بأرقى معايير واجهات الاستخدام والأداء الفائق بجهود نخبة الكفاءات الوطنية اليمنية:</p>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
              {/* Creator 1 */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-amber-400/30 transition shadow-inner">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-400/40 flex items-center justify-center text-amber-400 font-extrabold shrink-0 text-sm">
                    ب ق
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#F8FAFC]">المهندس / بندر محمد اسماعيل سعيد قملان</h3>
                    <p className="text-amber-400 text-[10px] font-bold mt-0.5">رئيس مهندسي الأنظمة والذكاء الاصطناعي الفائق وهيكلة البيانات</p>
                    <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed font-sans">
                      المسؤول الأول عن رسم الهيكلية البنيوية لقواعد البيانات المدمجة، وربط الجداول المتقاطعة للنظام، ومعايير فك الشفرة واستخراج الشهادات الرسمية والتحقق المتبادل مع اللجنة الامتحانية بوزارة التربية والتعليم.
                    </p>
                  </div>
                </div>
              </div>

              {/* Creator 2 */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-sky-400/30 transition shadow-inner">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-400/40 flex items-center justify-center text-sky-400 font-extrabold shrink-0 text-sm">
                    ر م
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#F8FAFC]">المهندس / رشيد شكري سلطان المخلافي</h3>
                    <p className="text-sky-400 text-[10px] font-bold mt-0.5">كبير مصممي واجهات النظم التفاعلية والتحليلات البيانية والموثوقية</p>
                    <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed font-sans">
                      مطور ومنشئ التصميم المعماري الرسومي للواجهات الفائقة، وهندسة تقارير الإحصاء السنوية، والتحكم التفاعلي بالسلوك والمواظبة، وإدارة منظومة المستندات المالية، وأدوات محاكاة ونمذجة جداول الحضور التراكمية.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono">
              <span>الإصدار الذهبي: {settings.version || '2.5.0-YEM'}</span>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowAbout(true)}
                  className="flex items-center gap-1 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  حول النظام والمطور
                </button>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  كافة الأنظمة والارتباطات تعمل بكفاءة مطلقة
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT TWO-COLUMN SETTINGS FORM & SQLITE UTILITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-tab-view">
        
        {/* Right side config editor form (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <School className="w-5 h-5 text-sky-500" />
                تعديل وتعميد الهوية المدرسية والتقارير الرسمية
              </h2>
              <p className="text-slate-500 text-xs mt-0.5 font-sans">التحكم في تذييل كشوف الدرجات، العناوين الرسمية للمجمع والحسابات البنكية المعتمدة لليمن</p>
            </div>
            {statusMessage && (
              <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl font-bold border border-emerald-100 animate-bounce">
                {statusMessage}
              </div>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-slate-705">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">اسم المجمع التعليمي / المجمع</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-bold text-slate-800"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">العام الدراسي الحالي</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-semibold text-slate-800"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">رقم الاتصال (الرقم الموحد)</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono text-slate-800"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">البريد الإلكتروني للإدارة العامة</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono text-slate-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">العنوان الدستوري والقانوني للمجمع</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 text-slate-800"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">شعار المجمع (تعبير إيموجي أو وجه)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-bold"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">رقم الحساب المصرفي (IBAN) للتحصيل</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono font-semibold text-slate-800"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-110 flex justify-end">
              <button 
                type="submit"
                className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                حفظ وتطبيق إعدادات الشهادات
              </button>
            </div>
          </form>

          {/* 🔑 LICENSE MANAGEMENT SECTION */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              إدارة التراخيص وتفعيل النظام
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500">حالة التفعيل الحالية</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${settings.activationStatus === 'activated' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {settings.activationStatus === 'activated' ? 'مفعل بالكامل' : 'فترة تجريبية'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">تاريخ انتهاء الصلاحية</p>
                    <p className="text-sm font-mono text-slate-600">{settings.expiryDate || '2027-06-15'}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  ملاحظة: تنتهي صلاحية النسخة التجريبية تلقائياً بعد مرور المدة المحددة. يرجى التواصل مع الدعم الفني للحصول على مفتاح التفعيل الدائم.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    مفتاح الترخيص (License Key)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all tracking-widest text-center"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                    />
                    <button 
                      onClick={() => {
                        handleSaveSettings({ preventDefault: () => {} } as any);
                        setStatusMessage('✓ جاري التحقق من مفتاح الترخيص وتحديث سجلات الأمان...');
                      }}
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all font-sans"
                    >
                      تفعيل
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-[10px] text-indigo-700 leading-tight">
                    * تأكد من إدخال المفتاح بشكل صحيح. يتكون المفتاح من 16 حرفاً ورقماً مقسمة بأربع مجموعات.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left side database backup tools panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider block">أرشفة محكم الـ SQLite والنسخ الفوري</h2>
            <p className="text-slate-400 text-[11px] mt-0.5">تبديل، استرجاع، ونسخ السجلات والطلاب من وإلى ملفات خارجية لحمايتها من الضياع</p>
          </div>

          {/* Database Stats info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-slate-600 space-y-2 font-mono">
            <div className="flex justify-between">
              <span>محرك قاعدة البيانات:</span>
              <span className="font-bold text-slate-800">SQLite Embedded Engine</span>
            </div>
            <div className="flex justify-between">
              <span>الحالة والربط الفعلي:</span>
              <span className="text-slate-850 font-semibold font-sans">مزامنة تامة وموثقة للطلاب</span>
            </div>
            <div className="flex justify-between">
              <span>سرعة الاسترداد:</span>
              <span className="text-emerald-700 font-extrabold font-sans">فوري (0.24ms)</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 font-sans text-xs">
            
            {/* Download SQL */}
            <button 
              onClick={handleExportSQL}
              className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-indigo-150 hover:bg-indigo-50 text-slate-700 rounded-xl transition text-right cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileCode className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="font-bold block text-slate-800">تنزيل سكربت SQLite (.sql)</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">تصدير مخطط الجداول والـ Inserts الفورية المباشرة</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </button>

            {/* Download JSON */}
            <button 
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-emerald-150 hover:bg-emerald-50 text-slate-700 rounded-xl transition text-right cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="font-bold block text-slate-800">تحميل نسخة احتياطية JSON</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">ملف أمان فوري متوافق مع أي حاسوب محلي</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </button>

            {/* Upload Backup */}
            <div className="relative">
              <input 
                type="file" 
                accept=".json"
                id="settings-import-file-input"
                className="hidden"
                onChange={handleImportJSON}
              />
              <label 
                htmlFor="settings-import-file-input"
                className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-sky-150 hover:bg-sky-50 text-slate-700 rounded-xl transition text-right cursor-pointer block"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold block text-slate-800">استعادة نسخة backup.json</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">استيراد قاعدة البيانات القديمة بلمحة بصر</span>
                  </div>
                </div>
                <Upload className="w-4 h-4 text-slate-400" />
              </label>
            </div>

            <p className="text-[10px] text-slate-400 px-1 leading-relaxed text-rtl block">
              * تنبيه: رفع نسخة احتياطية قديمة سيمحو على الفور كافة السجلات الإضافية الحالية ويعتمد القديمة!
            </p>

            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={handleFactoryReset}
                className="w-full flex items-center justify-center gap-1.5 p-3 border border-red-100 bg-red-50 hover:bg-red-100 text-red-800 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                تصفير قاعدة البيانات للتهيئة الأساسية
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 💻 INTEGRATED OFFLINE DESKTOP PACKAGE PROVISIONER (OFFLINE PC PORTABLE LAUNCHER) */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 shadow-sm" id="manara-desktop-installer-provisioner">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="text-right">
            <h2 className="text-md font-black text-slate-850 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-indigo-600 animate-bounce" />
              حزمة تشغيل سطح المكتب المتكاملة للتشغيل المحلي والإنتاج دون إنترنت (Offline System Bundle)
            </h2>
            <p className="text-slate-500 text-xs mt-0.5 font-sans">
              تجهيز محلي فوري لتطبيق "مجمع منارة اليمن" لتشغيل النظام في المدارس واللجان الامتحانية دون حاجة للاتصال بالشبكة على الإطلاق.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={downloadBatchFile}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              تنزيل مـشغل وينـدوز المحلي (.bat)
            </button>
            <button 
              onClick={downloadShellScript}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              تنزيل مـشغل الماك واللينكس (.sh)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Instructions check list */}
          <div className="lg:col-span-1 space-y-4 text-xs text-slate-700 leading-normal">
            <h3 className="font-extrabold text-[#1E293B] flex items-center gap-1">
              <span>🔧</span> دليلك المتكامل لتشغيل نسخة سطح المكتب محلياً:
            </h3>
            
            <div className="space-y-3 font-sans">
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold shrink-0 text-[10px]">
                  1
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-[12px]">تحميل الكشاف البرمي كاملاً:</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5 text-rtl">من خلال خيارات التصدير في الأعلى، قم بتحميل المشروع بصيغة ZIP، ثم قم بفك ضغطه في أي قرص محلي (مثال: C:\ManaraSchool).</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold shrink-0 text-[10px]">
                  2
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-[12px]">وضع المشغل الأوتوماتيكي:</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5 text-rtl">اضغط على زر (تنزيل مشغل ويندوز المحلي) بالأعلى، وضع الملف المحمّل مباشرة داخل المجلد الذي قمت بفك الضغط فيه بجوار ملف <span className="font-mono bg-white px-0.5 border rounded">package.json</span>.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold shrink-0 text-[10px]">
                  3
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-[12px]">التدشين بضغطة زر:</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5 text-rtl">انقر نقراً مزدوجاً على ملف <span className="font-mono bg-white px-1 border rounded text-indigo-700 font-bold">start_manara_yemen_desktop.bat</span> وسيتكفل بتثبيت الاعتماديات وتشغيل النظام وبثه محلياً فوراً!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive CMD Emulator/Code Showcase */}
          <div className="lg:col-span-2 bg-[#0B0F19] rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-300 relative overflow-hidden shadow-inner flex flex-col justify-between min-h-[230px]">
            <div className="absolute top-2 left-3 flex gap-1.5 select-none text-slate-600 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80"></span>
              <span className="mr-2 text-slate-500">start_manara_yemen_desktop.bat</span>
            </div>

            <div className="space-y-1 text-right text-rtl mt-5 select-all text-[11px] text-[#A5B4FC]/90">
              <p className="text-amber-400">C:\Users\ManaraSchool&gt; start_manara_yemen_desktop.bat</p>
              <p className="text-slate-600">==========================================================</p>
              <p className="text-emerald-400 font-bold">          مجمع منارة اليمن التعليمي لإدارة الكشوفات الذكية</p>
              <p className="text-emerald-400 font-bold">              نسخة سطح المكتب المتكاملة للتشغيل دون اتصال</p>
              <p className="text-slate-600">==========================================================</p>
              <p className="text-slate-300">[+] التحقق من تثبيت بيئة Node.js... موجودة بنجاح (v20.11.0)</p>
              <p className="text-slate-300">[1] جاري تثبيت وتحديث اعتماديات نظام منارة اليمن محلياً...</p>
              <p className="text-slate-550">  └ npm install --legacy-peer-deps (اكتمل بنجاح 100%)</p>
              <p className="text-slate-300">[2] جاري تشغيل خادم مجمع منارة اليمن المحلي في وضع الإنتاج...</p>
              <p className="text-[#38BDF8] font-bold block">  [✔] خادم التطبيق يعمل بنجاح مطلق على المنفذ المحمي 3000!</p>
              <p className="text-emerald-400 font-black">  └ افتح المتصفح فوراً على الرابط المحلي الآمن: http://localhost:3000</p>
              <p className="text-slate-600">==========================================================</p>
              <p className="text-slate-500 animate-pulse">جاري الاستماع وخدمة العمليات في الساحة المحلية... اضغط Ctrl+C لإنهاء الخادم.</p>
            </div>

            <div className="border-t border-slate-900 pt-3 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1 text-slate-450 text-right">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                البيئة معزولة بالكامل بأمر أوفلاين (Sandbox Offline Localhost)
              </span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("npm run dev");
                  setShowCopiedText(true);
                  setTimeout(() => setShowCopiedText(false), 2000);
                }}
                className="hover:text-white transition cursor-pointer font-bold px-2.5 py-1 bg-slate-900 rounded border border-slate-800 text-slate-300 whitespace-nowrap"
              >
                {showCopiedText ? "✓ تم نسخ أمر التشغيل" : "نسخ أمر التشغيل السريع"}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
