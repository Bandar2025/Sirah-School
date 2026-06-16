/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';

interface SQLiteExplorerProps {
  currentUser: any;
}

export default function SQLiteExplorer({ currentUser }: SQLiteExplorerProps) {
  const [activeTab, setActiveTab] = useState<'tables' | 'erd' | 'console'>('erd');
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM students WHERE status = \'active\'');
  
  // Console results state
  const [consoleResult, setConsoleResult] = useState<any[] | null>(null);
  const [consoleColumns, setConsoleColumns] = useState<string[]>([]);
  const [consoleError, setConsoleError] = useState<string>('');
  const [consoleMessage, setConsoleMessage] = useState<string>('');

  const refreshData = () => {
    // dummy refresh trigger
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

  // Simulated SQL query parser inside our state manager (supporting simple SELECT queries)
  const handleExecuteSQL = (e: React.FormEvent) => {
    e.preventDefault();
    setConsoleError('');
    setConsoleResult(null);
    setConsoleMessage('');

    const cleanQuery = sqlQuery.trim().replace(/\s+/g, ' ').toLowerCase();

    if (!cleanQuery.startsWith('select')) {
      setConsoleError('خطأ SQLite: محرك الاستعراض المستقل يدعم جمل الاستعلام SELECT فقط من أجل حماية اتساق المفاتيح الأجنبية وقواعد التوزيع!');
      return;
    }

    try {
      // Crude parsing of "select * from <table>"
      const fromIndex = cleanQuery.indexOf('from');
      if (fromIndex === -1) {
        setConsoleError('خطأ SQLite: بناء جملة SQL خاطئ! يفتقد للكلمة المفتاحية FROM لتبيين وجهة الجدول!');
        return;
      }

      const rest = cleanQuery.substring(fromIndex + 5).trim();
      const tableNameAndFilters = rest.split(' ');
      const tableName = tableNameAndFilters[0];

      // Retrieve core data rows
      let dataRows: any[] = [];
      switch (tableName) {
        case 'users': dataRows = mockDb.getUsers(); break;
        case 'students': dataRows = mockDb.getStudents(); break;
        case 'parents': dataRows = mockDb.getParents(); break;
        case 'teachers': dataRows = mockDb.getTeachers(); break;
        case 'classrooms': dataRows = mockDb.getClassrooms(); break;
        case 'subjects': dataRows = mockDb.getSubjects(); break;
        case 'schedules': dataRows = mockDb.getSchedules(); break;
        case 'attendance': dataRows = mockDb.getAttendances(); break;
        case 'grades': dataRows = mockDb.getGrades(); break;
        case 'fee_types': dataRows = mockDb.getFeeTypes(); break;
        case 'fee_payments': dataRows = mockDb.getFeePayments(); break;
        case 'audit_logs': dataRows = mockDb.getAuditLogs(); break;
        default:
          setConsoleError(`خطأ SQLite: جدول مجهول أو لا يوجد جدول باسم "${tableName}" في مخطط لقاعدة البيانات!`);
          return;
      }

      // Simple where clause filter simulation (e.g. status = 'active' or gender = 'male')
      let filteredRows = [...dataRows];
      const whereIdx = cleanQuery.indexOf('where');
      if (whereIdx !== -1) {
        const clause = cleanQuery.substring(whereIdx + 5).trim();
        if (clause.includes("gender = 'male'") || clause.includes("gender='male'") || clause.includes("gender = \"male\"")) {
          filteredRows = filteredRows.filter(r => r.gender === 'male');
          setConsoleMessage("تم تنفيذ تصفية الفلتر: gender = 'male'");
        } else if (clause.includes("status = 'active'") || clause.includes("status='active'") || clause.includes("status = \"active\"")) {
          filteredRows = filteredRows.filter(r => r.status === 'active');
          setConsoleMessage("تم تنفيذ تصفية الفلتر: status = 'active'");
        } else {
          setConsoleMessage("تحذير: وحدة المفسر المبسطة لم تدرك شرط التصفية الدقيق WHERE هذا، تم تصدير كافة الجدول.");
        }
      }

      if (filteredRows.length > 0) {
        setConsoleColumns(Object.keys(filteredRows[0]));
        setConsoleResult(filteredRows);
      } else {
        setConsoleColumns([]);
        setConsoleResult([]);
        setConsoleMessage('الاستعلام نجح، ولكن لم ينتج عنه أي صفوف مطابقة (Empty Set).');
      }

    } catch (err: any) {
      setConsoleError(`خطأ SQLite داخلي أثناء المعالجة: ${err.message}`);
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

    </div>
  );
}
