/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { mockDb } from '../db/mockDb';
import { 
  Database, 
  Terminal, 
  Network, 
  Table, 
  Play, 
  ArrowLeft, 
  Search, 
  RefreshCw,
  GitMerge,
  HelpCircle,
  HardDrive,
  Settings,
  Wrench,
  ShieldAlert,
  Download,
  Upload
} from 'lucide-react';

interface SQLiteExplorerProps {
  currentUser: any;
}

export default function SQLiteExplorer({ currentUser }: SQLiteExplorerProps) {
  const [activeTab, setActiveTab] = useState<'tables' | 'erd' | 'console' | 'admin'>('erd');
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM students WHERE status = \'active\'');
  
  // Console results state
  const [consoleResult, setConsoleResult] = useState<any[] | null>(null);
  const [consoleColumns, setConsoleColumns] = useState<string[]>([]);
  const [consoleError, setConsoleError] = useState<string>('');
  const [consoleMessage, setConsoleMessage] = useState<string>('');

  // Database manager states
  const [dbInfo, setDbInfo] = useState<any | null>(null);
  const [loadingDbInfo, setLoadingDbInfo] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  const refreshData = () => {
    // dummy refresh trigger
  };

  // Fetch real SQLite DB file statistics from Server API
  const fetchDbInfo = async () => {
    setLoadingDbInfo(true);
    setActionMessage('');
    setActionError('');
    try {
      const response = await fetch('/api/db/info');
      const res = await response.json();
      if (res.success) {
        setDbInfo(res);
      } else {
        setActionError(res.error || 'فشلت قراءة إحصاءات الملف.');
      }
    } catch (e: any) {
      setActionError(`حدث خطأ أثناء التواصل مع الخادم: ${e.message}`);
    } finally {
      setLoadingDbInfo(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchDbInfo();
    }
  }, [activeTab]);

  // Execute Repair DB (VACUUM & Integrity)
  const handleRepairDb = async () => {
    setActionMessage('');
    setActionError('');
    try {
      const response = await fetch('/api/db/repair', { method: 'POST' });
      const res = await response.json();
      if (res.success) {
        setActionMessage(`✓ بنية قاعدة البيانات سليمة (Integrity: ${res.integrity}). ${res.message}`);
        await fetchDbInfo();
      } else {
        setActionError(res.error || 'فشلت محاولة إصلاح وضغط قاعدة البيانات.');
      }
    } catch (e: any) {
      setActionError(`فشل إرسال طلب الإصلاح: ${e.message}`);
    }
  };

  // Execute Backup DB copy
  const handleBackupDb = async () => {
    setActionMessage('');
    setActionError('');
    try {
      const response = await fetch('/api/db/backup', { method: 'POST' });
      const res = await response.json();
      if (res.success) {
        setActionMessage(`✓ تم نسخ وحفظ ملف قاعدة البيانات بنجاح في: ${res.backupFile}`);
        await fetchDbInfo();
      } else {
        setActionError(res.error || 'فشلت محاولة إنشاء نسخة احتياطية للقرص.');
      }
    } catch (e: any) {
      setActionError(`فشل عملية النسخ الاحتياطي: ${e.message}`);
    }
  };

  // Execute Restore DB from JSON dump import file
  const handleRestoreDb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionMessage('');
    setActionError('');

    if (!window.confirm('🚨 تحذير أمني هام: ستقوم هذه العملية باستبدال الجداول الحالية بأكملها بالنسخة المستوردة. هل تريد الاستمرار وإعادة تشغيل التطبيق؟')) {
      e.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const response = await fetch('/api/db/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonDump: parsed })
      });
      const res = await response.json();
      if (res.success) {
        setActionMessage(`✓ مبارك! تمت صيانة الجداول والمفاتيح بنجاح من الاستيراد الهيكلي. جارٍ إعادة تحميل النظام...`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setActionError(res.error || 'فشلت معالجة الاسترداد من ملف النسخ.');
      }
    } catch (err: any) {
      setActionError(`فشل قراءة وتحليل ملف Backup المرفق: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  // Helper formatting database file size nicely
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get raw records based on selected table
  const getRawTableData = () => {
    switch (selectedTable) {
      case 'users': return mockDb.getUsers();
      case 'students': return mockDb.getStudents();
      case 'parents': return mockDb.getParents();
      case 'teachers': return mockDb.getTeachers();
      case 'classrooms': return mockDb.getClassrooms();
      case 'subjects': return mockDb.getSubjects();
      case 'schedules': return mockDb.getSchedules();
      case 'attendance': return mockDb.getAttendances();
      case 'grades': return mockDb.getGrades();
      case 'fee_types': return mockDb.getFeeTypes();
      case 'fee_payments': return mockDb.getFeePayments();
      case 'audit_logs': return mockDb.getAuditLogs();
      default: return [];
    }
  };

  const getTableColumns = () => {
    const data = getRawTableData();
    if (data.length > 0) {
      return Object.keys(data[0]);
    }
    return [];
  };

  // Execute SQL statements directly on the real SQLite database server
  const handleExecuteSQL = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsoleError('');
    setConsoleResult(null);
    setConsoleMessage('');

    try {
      const response = await fetch('/api/sqlite/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery })
      });
      const res = await response.json();
      if (!response.ok || !res.success) {
        setConsoleError(`خطأ في تنفيذ SQL: ${res.error || 'خطأ غير معروف في خادم SQLite علائقي'}`);
        return;
      }

      if (res.type === 'select') {
        const rows = res.rows || [];
        if (rows.length > 0) {
          setConsoleColumns(Object.keys(rows[0]));
          setConsoleResult(rows);
          setConsoleMessage(`تم تنفيذ الاستعلام العلائقي بنجاح. تم العثور على ${rows.length} سجل.`);
        } else {
          setConsoleColumns([]);
          setConsoleResult([]);
          setConsoleMessage('الاستعلام نجح، ولكن لم ينتج عنه أي صفوف مطابقة (Empty Set).');
        }
      } else {
        setConsoleMessage(res.message || 'نفذ الاستعلام بنجاح ودون أية أخطاء علائقية.');
        // Refresh local cache values synchronously just in case they modified tables
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err: any) {
      setConsoleError(`فشل الاتصال بخادم قاعدة البيانات SQLite: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6" id="sqlite-tab-view">
      
      {/* Title block */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            بنية وتحليل قاعدة بيانات SQLite المحلية
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-sans">دراسة وفحص مخطط الكيانات والعلاقات (ERD)، ومعاينة الجداول الفيزيائية والمفاتيح الفاعلة بـ SQLite</p>
        </div>
        
        {/* Navigation selectors switcher */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs gap-1 shrink-0 font-semibold font-sans">
          <button 
            onClick={() => setActiveTab('erd')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition ${activeTab === 'erd' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Network className="w-4 h-4 text-indigo-500 shrink-0" />
            مخطط العلاقات (ERD Diagram)
          </button>
          <button 
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition ${activeTab === 'tables' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Table className="w-4 h-4 text-emerald-500 shrink-0" />
            مستعرض الجداول والصفوف
          </button>
          <button 
            onClick={() => { setActiveTab('console'); setConsoleResult(null); }}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition ${activeTab === 'console' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Terminal className="w-4 h-4 text-sky-500 shrink-0" />
            موجه ومفسر أوامر SQL
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition ${activeTab === 'admin' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Settings className="w-4 h-4 text-rose-500 shrink-0" />
            أدوات الصيانة والنسخ الاستراتيجي
          </button>
        </div>
      </div>

      {/* ERD DIAGRAM VIEW - Highly satisfying system layout */}
      {activeTab === 'erd' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-8 overflow-x-auto text-rtl text-right">
          <div>
            <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">SQLite DBMS Mode</span>
            <h2 className="text-base font-bold text-slate-800 mt-2">مخطط الكيانات العلائقي المطبع (Normalized Entity Relationship Schema)</h2>
            <p className="text-slate-450 text-slate-450 text-slate-400 text-xs mt-0.5 leading-relaxed font-sans">
              قاعدة البيانات هذه مطهرة تماماً وموزعة على جداول (Normalized 3NF) مع وسم مفاتيح أجنبية لضمان سلامة العمليات وعدم التراكم.
            </p>
          </div>

          {/* Graphical mapping simulation of SQLite tables relations */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-left text-xs min-w-[700px]">
            
            {/* Table block 1 */}
            <div className="bg-white p-4 rounded-xl border-t-4 border-indigo-600 shadow-2xs space-y-2">
              <span className="font-bold text-slate-800 block border-b pb-1 font-sans">parents (أولياء الأمور)</span>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="font-bold text-red-650 text-indigo-700">🔑 id <span className="text-[10px] text-slate-400 font-normal">(PK - TEXT)</span></li>
                <li>name <span className="text-[10px] text-slate-400">(TEXT)</span></li>
                <li className="font-semibold">nationalId <span className="text-[10px] text-slate-400">(TEXT - Unique)</span></li>
                <li>phone <span className="text-[10px] text-slate-400">(TEXT)</span></li>
              </ul>
            </div>

            {/* Entity Arrow connector simulation in columns */}
            <div className="bg-white p-4 rounded-xl border-t-4 border-emerald-600 shadow-2xs space-y-2 relative">
              <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 text-indigo-400 hidden md:block select-none font-bold">➡️</div>
              <span className="font-bold text-slate-800 block border-b pb-1 font-sans">students (الطلاب المقيدون)</span>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="font-bold text-indigo-700">🔑 id <span className="text-[10px] text-slate-400 font-normal">(PK - TEXT)</span></li>
                <li>name <span className="text-[10px] text-slate-400">(TEXT)</span></li>
                <li className="font-semibold text-emerald-700 border-b border-indigo-100">🔗 parentId <span className="text-[10px] text-slate-400">(FK - parents)</span></li>
                <li className="font-semibold text-sky-700">🔗 classId <span className="text-[10px] text-slate-400">(FK - classrooms)</span></li>
                <li>nationalId <span className="text-[10px] text-slate-400">(TEXT - Unique)</span></li>
              </ul>
            </div>

            {/* Table block 3 */}
            <div className="bg-white p-4 rounded-xl border-t-4 border-purple-600 shadow-2xs space-y-2 relative">
              <span className="font-bold text-slate-800 block border-b pb-1 font-sans">classrooms (الفصول والصفوف)</span>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="font-bold text-indigo-700">🔑 id <span className="text-[10px] text-slate-400 font-normal">(PK - TEXT)</span></li>
                <li>name <span className="text-[10px] text-slate-400">(TEXT)</span></li>
                <li>maxCapacity <span className="text-[10px] text-slate-400">(INTEGER)</span></li>
                <li>roomNumber <span className="text-[10px] text-slate-400">(TEXT)</span></li>
              </ul>
            </div>

            {/* Table block 4 */}
            <div className="bg-white p-4 rounded-xl border-t-4 border-amber-600 shadow-2xs space-y-2">
              <span className="font-bold text-slate-800 block border-b pb-1 font-sans">grades (كشوف الامتحانات)</span>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="font-bold text-indigo-700">🔑 id <span className="text-[10px] text-slate-400 font-normal">(PK - TEXT)</span></li>
                <li className="font-semibold text-emerald-700">🔗 studentId <span className="text-[10px] text-slate-400">(FK - students)</span></li>
                <li className="font-semibold text-indigo-700">🔗 subjectId <span className="text-[10px] text-slate-400">(FK - subjects)</span></li>
                <li>courseworkGrade <span className="text-[10px] text-slate-400">(REAL)</span></li>
                <li>finalExamGrade <span className="text-[10px] text-slate-400">(REAL)</span></li>
              </ul>
            </div>

          </div>

          {/* Educational relational explanation card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 leading-relaxed">
              <span className="font-bold text-slate-800 block font-sans">💡 مفاهيم المفاتيح والروابط الفعالة بالداتابيس:</span>
              <p>1. <strong>المفتاح الرئيسي (Primary Key - PK):</strong> هو عمود فريد لا يتكرر لتمييز السجل (مثل حقل <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">id</code>).</p>
              <p>2. <strong>المفتاح الأجنبي (Foreign Key - FK):</strong> حقل يربط جدولاً بآخر لإنشاء روابط منطقية (مثال: حقل <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">studentId</code> في جدول الدرجات يشير مباشرة إلى <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">students.id</code> لمنع رصد درجة لطالب غير مسجل).</p>
            </div>
          </div>
        </div>
      )}

      {/* TABLE VIEW SYSTEM - Direct inspection of raw columns & rows */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">بيان ومعاينة جداول SQLite الجاهزة</h2>
              <p className="text-slate-400 text-xs mt-0.5">اختر جدولاً لمعاينة كيف يقوم النظام بحفظ المفاصير من كولومات وصفوف</p>
            </div>
            
            {/* Table select control dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 shrink-0 block font-bold font-sans">الجدول الفيزيائي:</span>
              <select 
                className="bg-slate-50 rounded-xl px-4 py-2 text-xs border border-slate-100 focus:outline-none font-mono"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                <option value="users">users (المستخدمين)</option>
                <option value="students">students (الطلاب)</option>
                <option value="parents">parents (أولياء الأمور)</option>
                <option value="teachers">teachers (المعلمين)</option>
                <option value="classrooms">classrooms (الفصول)</option>
                <option value="subjects">subjects (المواد)</option>
                <option value="schedules">schedules (الجدول الأسبوعي)</option>
                <option value="attendance">attendance (الحضور والغياب)</option>
                <option value="grades">grades (الدرجات)</option>
                <option value="fee_types">fee_types (بنود الرسوم)</option>
                <option value="fee_payments">fee_payments (سندات القبض)</option>
                <option value="audit_logs">audit_logs (سجل التدقيق)</option>
              </select>
            </div>
          </div>

          {/* Raw list of columns and rows */}
          <div className="overflow-x-auto text-[11px] font-mono text-left leading-normal border border-slate-100 rounded-xl p-3 bg-slate-900 text-slate-100">
            <span className="text-[10px] text-emerald-400 block mb-2 font-bold font-sans text-right"># SQLite SELECT * FROM {selectedTable};</span>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-sky-400 font-bold">
                  {getTableColumns().map((col, i) => (
                    <th key={i} className="p-2 border-r border-slate-800 font-mono">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {getRawTableData().map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-800/50">
                    {getTableColumns().map((col, j) => (
                      <td key={j} className="p-2 border-r border-slate-800 truncate max-w-[200px]" title={String(row[col])}>
                        {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
                {getRawTableData().length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-4 text-center text-slate-500 font-sans">الجدول فارغ من المدخلات حالياً في SQLite.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SQL CONSOLE COMMAND EXECUTIVE INTERFACE */}
      {activeTab === 'console' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6 text-slate-700">
          <div>
            <span className="text-xs bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded border border-sky-100">Live Parser SQL Simulator</span>
            <h2 className="text-base font-bold text-slate-800 mt-2">موجه أوامر SQLite للتحكم والاستعلام المباشر</h2>
            <p className="text-slate-450 text-slate-400 text-xs mt-0.5 leading-relaxed font-sans">
              اكتب استعلام SQL صريح (مثال: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">SELECT * FROM students</code>) وانقر تشغيل لتجربة السرعة الفائقة لـ SQLite.
            </p>
          </div>

          <form onSubmit={handleExecuteSQL} className="space-y-4 font-mono">
            <div className="relative">
              <textarea 
                rows={3}
                placeholder="SELECT * FROM students WHERE status = 'active'"
                className="w-full bg-slate-950 text-slate-200 p-4 border border-slate-800 rounded-xl focus:outline-none text-xs focus:ring-1 focus:ring-sky-500 leading-relaxed font-mono"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute left-3 bottom-3 flex items-center gap-1.5 bg-sky-500 text-slate-950 hover:bg-sky-450 px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                تشغيل الاستعلام (F5)
              </button>
            </div>
          </form>

          {/* Error Message */}
          {consoleError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs font-semibold rounded-xl space-y-1leading-relaxed">
              <p className="font-bold flex items-center gap-1">❌ {consoleError}</p>
            </div>
          )}

          {/* Success message details */}
          {consoleMessage && (
            <p className="text-xs font-mono text-slate-400 text-ltr text-left">-- {consoleMessage}</p>
          )}

          {/* Result view table */}
          {consoleResult !== null && (
            <div className="space-y-2 text-rtl text-right">
              <span className="text-slate-500 text-xs font-mono block">-- إجمالي النتائج: {consoleResult.length} صفوف</span>
              <div className="overflow-x-auto font-mono text-[11px] p-3 rounded-xl bg-slate-950 border border-slate-900 border-t-4 border-sky-500 text-slate-200">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-sky-300 font-bold">
                      {consoleColumns.map((col, i) => (
                        <th key={i} className="p-2 border-r border-slate-900">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 text-slate-300">
                    {consoleResult.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-900/30">
                        {consoleColumns.map((col, j) => (
                          <td key={j} className="p-2 border-r border-slate-900 truncate max-w-[200px]" title={String(row[col])}>
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {consoleResult.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-4 text-center text-slate-600 font-sans">لم ينتج عن استعلام SQLite هذا أي سجلات.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADMIN SQLITE DATABASE MAINTENANCE SUITE */}
      {activeTab === 'admin' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6 text-rtl text-right">
          <div>
            <span className="text-xs bg-rose-50 border border-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded font-sans">SQLite System Ops</span>
            <h2 className="text-lg font-bold text-slate-800 mt-2">مدير صيانة وإصلاح قاعدة البيانات الفيزيائية (school.db)</h2>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-sans">
              تحكم كامل في فحص سلامة اتساق المفاتيح والملفات، النسخ الاحتياطي التلقائي على القرص الصلب، واستعادة البيانات والتهيئة لمرحلة الإنتاج الفوري.
            </p>
          </div>

          {actionMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl leading-relaxed">
              {actionMessage}
            </div>
          )}

          {actionError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs font-semibold rounded-xl leading-relaxed">
              {actionError}
            </div>
          )}

          {/* Database Diagnostics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-slate-400 text-[10px] block font-sans">مسار قاعدة البيانات الفعلي عل القرص</span>
                <span className="text-slate-700 font-mono text-[11px] block truncate text-ltr text-left" title={dbInfo?.path || 'جارٍ القراءة...'}>
                  {dbInfo?.path || 'data/school.db'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">الحجم الحالي والمشغول على الهارد</span>
                <span className="text-slate-700 font-bold text-xs block font-sans">
                  {dbInfo?.size ? formatBytes(dbInfo.size) : '0 Bytes (in-memory mode for standalone test)'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-lg shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">حالة المحرك الفيزيائي النشط</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span className="text-emerald-700 font-bold text-xs font-sans">
                    {dbInfo?.status || 'نشط وملتزم (Active / Synced)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-150 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-500" />
              صيانة وضغط قاعدة البيانات وإدارة المزامنة الشاملة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: Repair DB */}
              <div className="p-5 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 hover:border-indigo-105 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <span className="p-2 bg-indigo-50 text-indigo-650 rounded-lg inline-block">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 font-sans mt-2">محاذاة وضغط الجداول (VACUUM)</h4>
                  <p className="text-[11px] text-slate-550 text-slate-400 leading-relaxed font-sans">
                    تقوم هذه العملية بطلب تهجير المساحات الشاغرة وتنظيف السجلات الفارغة، مما يسرع تنفيذ الفهارس والاستعلامات.
                  </p>
                </div>
                <button 
                  onClick={handleRepairDb}
                  disabled={loadingDbInfo}
                  className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 rounded-xl text-xs font-bold transition font-sans"
                >
                  تشغيل أداة الصيانة الدورية
                </button>
              </div>

              {/* Option 2: Dump SQL backups */}
              <div className="p-5 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 hover:border-emerald-105 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <span className="p-2 bg-emerald-50 text-emerald-650 rounded-lg inline-block">
                    <Download className="w-4 h-4 text-emerald-600" />
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 font-sans mt-2">عمل نسخة احتياطية محلية (school_backup.db)</h4>
                  <p className="text-[11px] text-slate-550 text-slate-400 leading-relaxed font-sans">
                    حفظ نسخة مكررة جديدة ممهورة بالوقت والتاريخ لسلامة السجلات والدرجات، حيث تحفظ آلياً في مجلد data/ الفرعي للتطبيق.
                  </p>
                </div>
                <button 
                  onClick={handleBackupDb}
                  disabled={loadingDbInfo}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-2 rounded-xl text-xs font-bold transition font-sans"
                >
                  نسخ احتياطي فوري للقرص
                </button>
              </div>

              {/* Option 3: Restore Database JSON */}
              <div className="p-5 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 hover:border-rose-105 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <span className="p-2 bg-rose-50 text-rose-650 rounded-lg inline-block">
                    <Upload className="w-4 h-4 text-rose-650 shrink-0 text-rose-500" />
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 font-sans mt-2">استيراد واستعادة البيانات بالكامل</h4>
                  <p className="text-[11px] text-slate-550 text-slate-400 leading-relaxed font-sans">
                    تحميل ملفات النسخ الاحتياطي بصيغة JSON المصدّرة لاستعادة كافة السجلات وهيكلة الجداول والدرجات بسلامة كاملة.
                  </p>
                </div>
                <label className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-bold transition font-sans text-center cursor-pointer block">
                  تحميل ملف الاستيراد (.json)
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleRestoreDb}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
