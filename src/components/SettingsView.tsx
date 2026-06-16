/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockDb } from '../db/mockDb';
import { SchoolSettings } from '../types';
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
  AlertCircle
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: any;
  onRefreshAll: () => void;
}

export default function SettingsView({ currentUser, onRefreshAll }: SettingsViewProps) {
  const [settings, setSettings] = useState<SchoolSettings>(mockDb.getSettings());
  
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    mockDb.updateSettings({
      schoolName,
      logoUrl,
      contactPhone: phone,
      contactEmail: email,
      currentAcademicYear: year,
      address,
      bankAccount: bank
    }, currentUser.id, currentUser.username);

    setStatusMessage('✓ تم إجراء الحفظ والتعديل على هوية التقارير بنجاح.');
    setTimeout(() => setStatusMessage(''), 3000);
    onRefreshAll();
  };

  const handleFactoryReset = () => {
    if (window.confirm('🚨 هدم وإعادة بناء: هل أنت متأكد من تفريغ كافة الجداول المحلية وعمل إعادة ضبط المصنع؟ سيتم محو الطلاب والدفعات التي أدخلتها وتعبئة قاعدة البيانات بالمدخلات العشوائية الافتراضية للتقييم.')) {
      mockDb.resetToDefaults();
      location.reload(); // reboot app context safely
    }
  };

  // Export database as SQLite-compatible .SQL file
  const handleExportSQL = () => {
    const sql = mockDb.exportSQLBackup();
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
    const jsonStr = mockDb.exportBackupJSON();
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
      const success = mockDb.importBackupJSON(text, currentUser.id, currentUser.username);
      if (success) {
        alert('نجاح: تم استرداد وتركيب كافة الجداول والمحددات القديمة في SQLite الداخلي للمتصفح!');
        location.reload();
      } else {
        alert('خطأ: الملف المختار لا يتوافق مع بنية الجداول أو أنه فاسد الهيكلية!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-tab-view">
      
      {/* Right side config editor form (2 cols on large screen) */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <School className="w-5 h-5 text-sky-500" />
              تعديل هوية ورسميات المدرسة والتقارير
            </h2>
            <p className="text-slate-500 text-xs mt-0.5 font-sans">تحديث الهوية المعمدة، الأرقام الرسمية لتذييل الشهادات، وسندات الفوترة والقبض</p>
          </div>
          {statusMessage && (
            <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl font-bold border border-emerald-100">
              {statusMessage}
            </div>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">اسم المجمع التعليمي / المدرسة</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">العام الدراسي الحالي</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-semibold"
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
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">البريد الإلكتروني للإدارة العامة</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">العنوان الدستوري للمجمع</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
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
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono font-semibold"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Save className="w-4 h-4" />
              حفظ وتطبيق إعدادات الشهادات
            </button>
          </div>
        </form>
      </div>

      {/* Left side database backup tools panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">لوحة أرشفة SQLite والنسخ الاحتياطي</h2>
          <p className="text-slate-400 text-[11px] mt-0.5">أدوات تصنيع النسخ الاحتياطية الفورية وإدارة جداول قاعدة البيانات دون اتصال بالإنترنت</p>
        </div>

        {/* Database Stats info */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-slate-600 space-y-2 font-mono">
          <div className="flex justify-between">
            <span>محرك قاعدة البيانات:</span>
            <span className="font-bold text-slate-800">SQLite Embedded Client</span>
          </div>
          <div className="flex justify-between">
            <span>حجم التباين الفعلي:</span>
            <span className="text-slate-800">نظام فولي Normalized وبنية مفاعيل ممتازة</span>
          </div>
          <div className="flex justify-between">
            <span>الحالة الأمنية:</span>
            <span className="text-emerald-700 font-bold">مؤمنة بالبيئة الرملة بنجاح</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 font-sans text-xs">
          
          {/* Download SQL */}
          <button 
            onClick={handleExportSQL}
            className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 text-slate-700 rounded-xl transition text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="font-semibold block text-slate-800">تنزيل سكربت SQLite (.sql)</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">تصدير مخطط الجداول والـ Inserts الفورية الكريمة</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>

          {/* Download JSON */}
          <button 
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50 text-slate-700 rounded-xl transition text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="font-semibold block text-slate-800">تحميل نسخة احتياطية JSON</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">متوافقة تماماً للاستيراد مرة أخرى في أي متصفح</span>
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
              className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-sky-100 hover:bg-sky-50 text-slate-700 rounded-xl transition text-right cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="font-semibold block text-slate-800">استعادة نسخة backup.json</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">رفع وثيقة بايونير واستيرادها بالحال</span>
                </div>
              </div>
              <Upload className="w-4 h-4 text-slate-400" />
            </label>
          </div>

          <p className="text-[10px] text-slate-400 px-1 leading-relaxed text-rtl block">
            * تنبيه: رفع نسخة احتياطية قديمة سيمحو على الفور كافة السجلات الإضافية التي أدخلتها وسيعتمد البيانات القديمة بالتبعية الكلية!
          </p>

          <div className="pt-4 border-t border-slate-105">
            <button 
              onClick={handleFactoryReset}
              className="w-full flex items-center justify-center gap-1.5 p-3.5 border border-red-100 bg-red-50 hover:bg-red-100 text-red-800 font-bold rounded-xl transition text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              تصفير قاعدة البيانات وإعدادات التهيئة
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
