/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockDb } from './db/mockDb';
import { User } from './types';

// Importing all modules we developed
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import StudentsView from './components/StudentsView';
import TeachersView from './components/TeachersView';
import AcademicView from './components/AcademicView';
import AttendanceView from './components/AttendanceView';
import GradesView from './components/GradesView';
import FinancialView from './components/FinancialView';
import ReportsView from './components/ReportsView';
import ParentsView from './components/ParentsView';
import SQLiteExplorer from './components/SQLiteExplorer';
import SettingsView from './components/SettingsView';
import AIAssistantView from './components/AIAssistantView';

import { 
  School, 
  Users, 
  GraduationCap, 
  Layers, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  Calculator, 
  DollarSign, 
  Database, 
  Settings, 
  LogOut, 
  UserCheck, 
  LayoutDashboard,
  Menu,
  X,
  KeyRound,
  Sparkles,
  FileText,
  Award,
  Terminal,
  Cpu,
  Laptop,
  Activity,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(() => mockDb.getCurrentSession());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentsAction, setStudentsAction] = useState<string | null>(null);
  const [studentsStatusFilter, setStudentsStatusFilter] = useState<string | null>(null);
  const [academicSubTab, setAcademicSubTab] = useState<'classrooms' | 'subjects' | 'schedules' | 'import-center'>('classrooms');
  const [reportsType, setReportsType] = useState<'academic' | 'attendance' | 'financial' | 'unified'>('unified');
  const [settingsSubTab, setSettingsSubTab] = useState<string>('general');
  const [aiAssistantTab, setAiAssistantTab] = useState<'dropout' | 'recommend' | 'chatbot' | 'teacher'>('chatbot');
  
  // Mobile responsive sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Trigger app-wide stats/header refreshes when settings update
  const [refreshSeed, setRefreshSeed] = useState(0);
  const handleRefreshAll = () => {
    setRefreshSeed(prev => prev + 1);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Attempt authentication inside mock SQLite
    const user = mockDb.authenticate(username, password);
    if (user) {
      setCurrentUser(user);
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة! يرجى تجربة الحسابات الافتراضية.');
    }
  };

  const handleLogout = () => {
    mockDb.clearSession();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // If user is not authenticated, show elegant official Yemeni Ministry of Education school landing interface
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 font-sans text-right leading-relaxed relative overflow-hidden" dir="rtl" id="login-portal">
        {/* Dynamic backlights */}
        <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-[140px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] -z-10 animate-pulse-slow"></div>

        {/* Global Ministry Header Banner (Top-Center) */}
        <div className="w-full max-w-6xl mb-8 select-none text-white animate-fade-in duration-500">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-black tracking-wide text-slate-300">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-500/10 text-amber-400 flex items-center justify-center rounded-xl border border-amber-500/20 text-md">🇾🇪</span>
              <div className="text-right">
                <span className="block text-[13px] font-black text-[#F8FAFC]">الجمهورية اليمنية</span>
                <span className="block text-[11px] text-slate-400 font-sans">وزارة التربية والتعليم - قطاع المعايير والرقابة</span>
              </div>
            </div>
            <div className="hidden md:flex gap-1.5">
              <div className="w-12 h-3 bg-[#CE1126] rounded-sm shadow-xs"></div>
              <div className="w-12 h-3 bg-white rounded-sm shadow-xs"></div>
              <div className="w-12 h-3 bg-black rounded-sm shadow-xs"></div>
            </div>
            <div className="text-center sm:text-left">
              <span className="bg-slate-900 border border-slate-800 text-sky-400 font-mono text-[10.5px] px-3 py-1.5 rounded-full block">
                تكامل تام مـع مكتبة محـلي مدمجة SQLite v3.45
              </span>
            </div>
          </div>
        </div>

        {/* Responsive Dual-Panel Dashboard/Login Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-w-6xl w-full gap-8 items-stretch animate-scale-in">
          
          {/* RIGHT COLUMN: HIGH-FIDELITY OFFICIAL MANARA SHOWCASE & HONOR CARD (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full inline-block mb-3">★ مجمع ريادي نموذجي متكامل ★</span>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  مجمع منارة اليمن التعليمي والتربوي النموذجي <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">الذكي</span>
                </h1>
                <p className="text-slate-400 text-xs md:text-sm mt-3 leading-relaxed">
                  يُمثل هذا النظام القلعة الرقمية المتكاملة لإدارة الكشوفات الذكية، ورصد درجات الطلاب، وجدولة الحصص المدرسية، والمتابعة اللحظية للسلوك والمواظبة المالي والأكاديمي الكفيل بصقل كفاءات الغد للجمهورية اليمنية.
                </p>
              </div>

              {/* Statistics Panel in Land Page */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60 text-right">
                  <span className="text-slate-400 text-[10px] block font-sans">عدد الطلاب المنخرطين</span>
                  <span className="text-white text-lg font-black block mt-1">1,500+ طالب</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60 text-right">
                  <span className="text-slate-400 text-[10px] block font-sans">الفصول الأكاديمية</span>
                  <span className="text-white text-lg font-black block mt-1">24 شعبة</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60 text-right">
                  <span className="text-slate-400 text-[10px] block font-sans">الكادر التدريسي المعتمد</span>
                  <span className="text-white text-lg font-black block mt-1">48 معلّم</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60 text-right">
                  <span className="text-[#38BDF8] text-[10px] flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping"></span>
                    حالة قاعدة البيانات
                  </span>
                  <span className="text-white text-lg font-black block mt-1 font-mono">SQLite Mapped</span>
                </div>
              </div>

              {/* 🏅 OFFICIAL CREATORS CARD EXPLICITLY FEATURING BANDAR & RASHEED */}
              <div className="bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A]/90 to-slate-950 rounded-2xl p-5 border border-amber-500/30 relative">
                <div className="absolute top-3 left-3 text-amber-400 opacity-60">
                  <Award className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xs font-black text-amber-400 tracking-wide uppercase flex items-center gap-1.5">
                  <span>★</span> بطاقة شرف واعتزاز هندسي للجمهورية اليمنية <span>★</span>
                </h3>
                <h4 className="text-white font-extrabold text-sm mt-1">مُنشئو ومصممو كود المعمار النمطي لمجمع المنارة:</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800/60">
                  {/* Creator 1 */}
                  <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/30">
                    <span className="text-amber-300 font-extrabold text-[12.5px] block">
                      المهندس / بندر محمد اسماعيل سعيد قملان
                    </span>
                    <span className="text-slate-400 text-[10px] block leading-tight">
                      رئيس هيكلة وتشفير السجلات وإدارة البيانات ونمذجة الـ SQLite
                    </span>
                  </div>

                  {/* Creator 2 */}
                  <div className="space-y-1 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/30">
                    <span className="text-slate-100 font-extrabold text-[12.5px] block text-sky-450 text-sky-400 font-bold">
                      المهندس / رشيد شكري سلطان المخلافي
                    </span>
                    <span className="text-slate-400 text-[10px] block leading-tight">
                      كبير مصممي الواجهات الفائقة الشاملة لتسهيل الإدارة المدرسية
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-slate-500 text-left font-mono">
                  Designed & Engineered locally in Taiz & Sana'a with absolute perfection
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-slate-500 text-[11px] font-sans">مؤمن بالكامل لحمايتنا ضد الانقطاع الكهربائي والشبكي</span>
              <div className="flex gap-2">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  حماية متكاملة للبث والإنتاج المحلي
                </span>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN: THE SPACIOUS GLASSMORPHISM REGISTER/LOGIN PANEL (5 cols on lg) */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="text-right">
                <h2 className="text-xl font-extrabold text-white leading-normal">بوابة الدخول الموحد الآمنة</h2>
                <p className="text-slate-400 text-[11px] mt-1">الرجاء إدخال بيانات الكود المدرسي المرتبط بالوزارة للدخول فوراً</p>
              </div>

              {/* Login Error Notification */}
              {loginError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold text-right leading-relaxed">
                  ⚠️ {loginError}
                </div>
              )}

              {/* Form Input fields */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-slate-300 font-bold block text-xs">اسم مستخدم الحساب الرسمي</label>
                  <input 
                    type="text" 
                    required
                    placeholder="أدخل اسم الحساب (مثل: director)"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 text-xs text-right placeholder-slate-700 outline-none transition"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-slate-300 font-bold block text-xs">كلمة المرور المشفرة</label>
                  <input 
                    type="password" 
                    required
                    placeholder="أدخل كلمة المرور (مثل: director123)"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 text-xs text-right placeholder-slate-700 outline-none transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-black py-3 rounded-xl text-xs transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <KeyRound className="w-4.5 h-4.5 shrink-0 text-white" />
                  <span>تأكيد تسجيل الدخول للأمن والتحقق المدرسي</span>
                </button>
              </form>
            </div>

            {/* Quick Fast Login Buttons */}
            <div className="pt-5 border-t border-slate-800/80 space-y-3">
              <span className="text-[11px] font-black text-slate-300 tracking-wider block text-right">🔑 تجديد سريع للتجريب الفوري للنظام المفتوح:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button type="button" onClick={() => { setUsername('director'); setPassword('director123'); }} className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-xl text-right transition cursor-pointer">
                  <span className="block font-bold text-white text-[11px]">مدير المجمع 🇾🇪</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5">director / director123</span>
                </button>
                <button type="button" onClick={() => { setUsername('vicedirector'); setPassword('vice123'); }} className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-xl text-right transition cursor-pointer">
                  <span className="block font-bold text-white text-[11px]">وكيل المدرسة لشؤون التوجيه</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5">vicedirector / vice123</span>
                </button>
                <button type="button" onClick={() => { setUsername('studentaffairs'); setPassword('stud123'); }} className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-xl text-right transition cursor-pointer">
                  <span className="block font-bold text-white text-[11px]">شؤون الطلاب والقبول</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5">studentaffairs / stud123</span>
                </button>
                <button type="button" onClick={() => { setUsername('teacher'); setPassword('teacher123'); }} className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-xl text-right transition cursor-pointer">
                  <span className="block font-bold text-white text-[11px]">المعلم والمدرس العربي</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5">teacher / teacher123</span>
                </button>
                <button type="button" onClick={() => { setUsername('accountant'); setPassword('acc123'); }} className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-xl text-right transition cursor-pointer">
                  <span className="block font-bold text-white text-[11px]">المحاسب المسؤول</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5">accountant / acc123</span>
                </button>
                <button type="button" onClick={() => { setUsername('admin'); setPassword('admin123'); }} className="p-2.5 bg-slate-950 hover:bg-indigo-950/20 border border-[#D4A017]/30 hover:border-[#D4A017]/50 rounded-xl text-right transition cursor-pointer">
                  <span className="block font-bold text-[#D4A017] text-[11px]">المدير التقني للمطورين</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5">admin / admin123</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Helper to translate roles into stylized labels
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام التقني المطور';
      case 'director': return 'مدير مدرسة مجمع المنارة';
      case 'vice_director': return 'وكيل المدرسة لشؤون التوجيه';
      case 'student_affairs': return 'مسؤول شؤون وقبول الطلاب';
      case 'teacher': return 'الأستاذ الفاضل المعلم';
      case 'accountant': return 'المحاسب المالي العام المعتمد';
      case 'parent': return 'ولي الأمر الموقر الكفيل';
      default: return 'مشرف تربوي عام';
    }
  };

  // Grouped Sidebar layout as explicitly requested
  const menuCategories = [
    {
      title: 'لوحة التحكم والتهيئة',
      icon: Settings,
      roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher', 'accountant', 'parent'],
      items: [
        { id: 'dashboard', label: 'لوحة قياس الأداء والقيادة', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher', 'accountant', 'parent'] },
        { id: 'settings', label: 'إدارة حسابات المستخدمين', subTab: 'users', roles: ['admin', 'director'] },
        { id: 'settings', label: 'الصلاحيات والضبط العام', subTab: 'general', roles: ['admin'] }
      ]
    },
    {
      title: 'الشؤون التعليمية والأكاديمية',
      icon: BookOpen,
      roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher'],
      items: [
        { id: 'academic', label: 'الفصول والشعب المدرسية', subTab: 'classrooms', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs'] },
        { id: 'academic', label: 'المقررات وتوزيع المناهج', subTab: 'subjects', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher'] },
        { id: 'academic', label: 'جداول الحصص المدرسية', subTab: 'schedules', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher'] },
        { id: 'academic', label: 'استيراد البيانات ودمج Excel', subTab: 'import-center', roles: ['admin', 'director', 'vice_director', 'student_affairs'] }
      ]
    },
    {
      title: 'شؤون الطلاب والتسجيل',
      icon: GraduationCap,
      roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher', 'parent'],
      items: [
        { id: 'students', label: 'الطلاب والملفات الأكاديمية', statusFilter: 'all', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher', 'parent'] },
        { id: 'students', label: 'التسجيل والقبول الجديد', action: 'register', roles: ['admin', 'director', 'student_affairs'] },
        { id: 'students', label: 'النقل والطلبات النشطة', statusFilter: 'transferred', roles: ['admin', 'director', 'student_affairs'] },
        { id: 'students', label: 'أرشيف الخريجين والمنقولين', statusFilter: 'graduated', roles: ['admin', 'director', 'student_affairs'] },
        { id: 'parents', label: 'دليل أولياء الأمور المعتمد', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'parent'] }
      ]
    },
    {
      title: 'الحضور والانضباط اليومي',
      icon: ClipboardList,
      roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher'],
      items: [
        { id: 'attendance', label: 'حضور وغياب الفصول الدراسية', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher'] },
        { id: 'teachers', label: 'سجل الكادر والهيئة التدريسية', roles: ['admin', 'supervisor', 'director', 'vice_director'] }
      ]
    },
    {
      title: 'الاختبارات والكنترول المدرسي',
      icon: Calculator,
      roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher', 'parent'],
      items: [
        { id: 'grades', label: 'رصد درجات اختبارات الطلاب', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher', 'parent'] },
        { id: 'grades', label: 'كنترول النتائج والإحصائيات', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher'] }
      ]
    },
    {
      title: 'الشؤون المالية والصندوق',
      icon: DollarSign,
      roles: ['admin', 'director', 'accountant'],
      items: [
        { id: 'financial', label: 'الرسوم والمستحقات المدرسية', roles: ['admin', 'director', 'accountant'] },
        { id: 'financial', label: 'سندات المقبوضات وصرف الخزينة', roles: ['admin', 'director', 'accountant'] }
      ]
    },
    {
      title: 'التقارير والمستندات الرسمية',
      icon: FileText,
      roles: ['admin', 'director', 'vice_director', 'student_affairs', 'accountant', 'teacher'],
      items: [
        { id: 'reports', label: 'التقرير المدرسي الإحصائي الموحد', subTab: 'unified', roles: ['admin', 'director', 'vice_director', 'student_affairs', 'accountant', 'teacher'] },
        { id: 'reports', label: 'كشوف التحصيل ومعدلات الأداء', subTab: 'academic', roles: ['admin', 'director', 'vice_director', 'student_affairs', 'accountant', 'teacher'] },
        { id: 'reports', label: 'سجلات الغياب والانضباط العام', subTab: 'attendance', roles: ['admin', 'director', 'vice_director', 'student_affairs', 'accountant', 'teacher'] }
      ]
    },
    {
      title: 'مساعد الذكاء الاصطناعي (AI)',
      icon: Sparkles,
      roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher', 'parent'],
      items: [
        { id: 'ai-assistant', label: 'مستشار المنارة الذكي الفوري', subTab: 'chatbot', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher', 'parent'] },
        { id: 'ai-assistant', label: 'تحليل تنبؤ غياب وتسرب الطلاب', subTab: 'dropout', roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs'] },
        { id: 'ai-assistant', label: 'التوصيات الأكاديمية الذكية', subTab: 'recommend', roles: ['admin', 'supervisor', 'director', 'vice_director', 'teacher'] },
        { id: 'ai-assistant', label: 'صياغة تقييمات وملاحظات الصف', subTab: 'teacher', roles: ['admin', 'supervisor', 'director', 'vice_director', 'teacher'] }
      ]
    }
  ];

  const handleSidebarClick = (item: any) => {
    setActiveTab(item.id);
    if (item.action) {
      setStudentsAction(item.action);
    } else {
      setStudentsAction(null);
    }
    if (item.statusFilter) {
      setStudentsStatusFilter(item.statusFilter);
    } else {
      setStudentsStatusFilter(null);
    }
    if (item.subTab) {
      if (item.id === 'academic') {
        setAcademicSubTab(item.subTab);
      } else if (item.id === 'settings') {
        setSettingsSubTab(item.subTab);
      } else if (item.id === 'reports') {
        setReportsType(item.subTab);
      } else if (item.id === 'ai-assistant') {
        setAiAssistantTab(item.subTab);
      }
    }
    setIsSidebarOpen(false);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': 
        return (
          <div key={refreshSeed} className="contents">
            <DashboardView currentUser={currentUser} onNavigate={setActiveTab} />
          </div>
        );
      case 'students': 
        return (
          <div key={`${refreshSeed}-${studentsAction}-${studentsStatusFilter}`} className="contents">
            <StudentsView currentUser={currentUser} initialAction={studentsAction} initialStatusFilter={studentsStatusFilter} />
          </div>
        );
      case 'academic': 
        return (
          <div key={`${refreshSeed}-${academicSubTab}`} className="contents">
            <AcademicView currentUser={currentUser} initialSubTab={academicSubTab} />
          </div>
        );
      case 'teachers': 
        return (
          <div key={`${refreshSeed}-teachers`} className="contents">
            <TeachersView currentUser={currentUser} />
          </div>
        );
      case 'attendance': 
        return (
          <div key={`${refreshSeed}-attendance`} className="contents">
            <AttendanceView currentUser={currentUser} />
          </div>
        );
      case 'grades': 
        return (
          <div key={`${refreshSeed}-grades`} className="contents">
            <GradesView currentUser={currentUser} />
          </div>
        );
      case 'financial': 
        return (
          <div key={`${refreshSeed}-financial`} className="contents">
            <FinancialView currentUser={currentUser} />
          </div>
        );
      case 'reports': 
        return (
          <div key={`${refreshSeed}-${reportsType}`} className="contents">
            <ReportsView currentUser={currentUser} initialReportType={reportsType} />
          </div>
        );
      case 'parents': 
        return (
          <div key={`${refreshSeed}-parents`} className="contents">
            <ParentsView currentUser={currentUser} />
          </div>
        );
      case 'ai-assistant':
        return (
          <div key={`${refreshSeed}-ai-${aiAssistantTab}`} className="contents">
            <AIAssistantView currentUser={currentUser} initialTab={aiAssistantTab} />
          </div>
        );
      case 'settings': 
        if (settingsSubTab === 'users') {
          return (
            <div key={`${refreshSeed}-users`} className="contents">
              <UsersView currentUser={currentUser} />
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <SettingsView currentUser={currentUser} onRefreshAll={handleRefreshAll} />
            {currentUser.role === 'admin' && (
              <div className="mt-8 border-t border-slate-200 pt-8" id="admin-db-tools-section">
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 mb-2">أدوات الإدارة والتحكم الفني بقاعدة بيانات المجمع</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">بصفتك مديراً للنظام التقني بالمجمع، يمكنك تصفح حوكمة جداول SQLite المنسقة وإجراء استعلامات SQL حرة مباشرة بأمان:</p>
                  <SQLiteExplorer currentUser={currentUser} />
                </div>
              </div>
            )}
          </div>
        );
      default: 
        return (
          <div key={refreshSeed} className="contents">
            <DashboardView currentUser={currentUser} onNavigate={setActiveTab} />
          </div>
        );
    }
  };

  const getActiveViewLabel = () => {
    for (const cat of menuCategories) {
      for (const item of cat.items) {
        const anyItem = item as any;
        if (activeTab === anyItem.id) {
          if (anyItem.id === 'academic' && anyItem.subTab) {
            if (academicSubTab === anyItem.subTab) return `${cat.title} - ${anyItem.label}`;
          } else if (anyItem.id === 'reports' && anyItem.subTab) {
            if (reportsType === anyItem.subTab) return `${cat.title} - ${anyItem.label}`;
          } else if (anyItem.id === 'students' && anyItem.statusFilter) {
            if (studentsStatusFilter === anyItem.statusFilter) return `${cat.title} - ${anyItem.label}`;
          } else if (anyItem.id === 'ai-assistant' && anyItem.subTab) {
            if (aiAssistantTab === anyItem.subTab) return `${cat.title} - ${anyItem.label}`;
          } else if (anyItem.id === 'settings' && anyItem.subTab) {
            if (settingsSubTab === anyItem.subTab) return `${cat.title} - ${anyItem.label}`;
          } else {
            return anyItem.label;
          }
        }
      }
    }
    return 'لوحة القيادة والمؤشرات';
  };

  const activeLabel = getActiveViewLabel();

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans leading-relaxed" dir="rtl">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-72 bg-slate-900 text-slate-300 transform transition-transform border-l border-slate-800 flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0 font-sans' : 'translate-x-full lg:translate-x-0 font-sans'
      }`} id="app-sidebar">
        
        {/* Sidebar Header branding */}
        <div className="p-6 border-b border-slate-800 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-extrabold text-sm tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-white/10">م</span>
              <span className="truncate">{mockDb.getSettings().schoolName}</span>
            </h2>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-sm leading-none shrink-0">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="truncate text-right">
              <span className="block text-xs font-bold text-slate-100 truncate" title={currentUser.name}>{currentUser.name}</span>
              <span className="block text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">{getRoleLabel(currentUser.role)}</span>
            </div>
          </div>
        </div>

        {/* Navigation list with Categorized Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 text-xs font-medium">
          {menuCategories.map((category) => {
            if (!category.roles.includes(currentUser.role)) return null;
            
            const visibleItems = category.items.filter(item => item.roles.includes(currentUser.role));
            if (visibleItems.length === 0) return null;
            
            const SidebarIcon = category.icon;
            
            return (
              <div key={category.title} className="space-y-1">
                {/* Category Header */}
                <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-slate-400/80 tracking-wider select-none pr-3 mt-1 underline decoration-primary/20 underline-offset-4">
                  <SidebarIcon className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                  <span>{category.title}</span>
                </div>
                
                {/* Category Items */}
                <div className="space-y-0.5 pr-1">
                  {visibleItems.map(rawItem => {
                    const item = rawItem as any;
                    // Determine if active
                    let isActive = activeTab === item.id;
                    if (item.subTab && item.id === 'academic') {
                      isActive = isActive && academicSubTab === item.subTab;
                    }
                    if (item.subTab && item.id === 'reports') {
                      isActive = isActive && reportsType === item.subTab;
                    }
                    if (item.subTab && item.id === 'ai-assistant') {
                      isActive = isActive && aiAssistantTab === item.subTab;
                    }
                    if (item.subTab && item.id === 'settings') {
                      isActive = isActive && settingsSubTab === item.subTab;
                    }
                    if (item.statusFilter && item.id === 'students') {
                      isActive = isActive && studentsStatusFilter === item.statusFilter;
                    }
                    if (item.action && item.id === 'students') {
                      isActive = isActive && studentsAction === item.action;
                    }
                    
                    return (
                      <button
                        type="button"
                        key={`${item.label}-${item.id}`}
                        onClick={() => handleSidebarClick(item)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-right text-[11px] font-bold ${
                          isActive 
                            ? 'bg-gradient-to-l from-[#0F4C81] to-[#0F8A5F]/20 text-white shadow-xs font-extrabold border-r-4 border-[#D4A017]' 
                            : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]"></span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer logout */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700/80 text-rose-450 hover:text-rose-400 text-xs font-bold py-2.5 rounded-lg transition border border-slate-800"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            خروج من الحساب
          </button>
        </div>

      </aside>

      {/* MAIN CONTAINER CONTENT BODY */}
      <div className="flex-1 lg:mr-72 min-h-screen flex flex-col overflow-hidden bg-slate-50">
        
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30" id="app-header">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">م</div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight block">{activeLabel}</h1>
                <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">العام الدراسي: {mockDb.getSettings().currentAcademicYear}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 max-sm:hidden">
              <span className="text-xs font-semibold text-slate-700">أ. {currentUser.name}</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold uppercase text-xs">
                {currentUser.username[0]}
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              {/* Yemeni National Flag and golden Eagle Emblem */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-xl select-none" id="yemen-national-badges">
                {/* Horizontal flag strip */}
                <div className="flex flex-col h-3.5 w-6 rounded-sm overflow-hidden border border-slate-200 shadow-inner" title="علم الجمهورية اليمنية">
                  <div className="h-1/3 bg-[#CE1126]"></div>
                  <div className="h-1/3 bg-white"></div>
                  <div className="h-1/3 bg-black"></div>
                </div>
                {/* Eagle of Saladin emblem */}
                <span className="text-[10px] text-amber-600 font-black flex items-center gap-1 font-serif" title="الجمهورية اليمنية">
                  <svg viewBox="0 0 100 100" className="w-5 h-5 text-amber-550 fill-current inline-block">
                    <path d="M50 15c-1.5 0-3 1-3.5 2.5l-3 7.5c-4.5 2-8.5 5-11.5 9-1.5 2-3 4-4.5 6.5s-2.5 5-3 7.5L23 54c-.5 1 .5 2 1.5 1.5l6-3.5c1-1 2.5-1.5 4-1 .5 0 1 .5 1.5.5s1-.5 1-1c1-4 3-7.5 6-10.5l4-3.5c.5-.5 1-.5 1-.5s0 1-.5 1.5l-6 6.5c-2.5 2.5-4.5 6-5 9.5 0 1 1 1.5 1.5.5l5.5-5.5c2-2 4.5-3.5 7.5-4 .5 0 .5.5 0 .5l-4.5 4c-2 2-3.5 4.5-4 7.5 0 .5.5 1 1 .5l4.5-4.5c2.5-2.5 5.5-4 9-4.5.5 0 .5.5 0 1l-3 3c-2 2-3 4.5-3.5 7.5 0 .5.5 1 1 .5l3.5-3.5c2.5-2.5 6-4 9.5-4 .5 0 .5.5 0 .5l-2.5 2.5c-2.5 2.5-4 5.5-4.5 9 0 .5.5 1 1 .5l3.5-3.5c3-3 6.5-5 10.5-6h1c.5 0 .5.5 0 1l-1.5 1.5c-2 2-3.5 4.5-4 7.5 0 .5.5 1 1 .5l3-3c3-3 6.5-5 11-5.5.5 0 .5.5 0 1L73 66c-2 2-3.5 5-4.5 8 0 .5.5 1 1 .5l2.5-2.5c3.5-3.5 8-5.5 13-5.5 1 0 1.5 1 1 1.5l-3.5 3.5c-3 3-5 7-6 11 0 .5.5 1 1 .5l2-2c4.5-4.5 10.5-7 16.5-7 1 0 1.5 1.5.5 2l-7 4.5c-4 2.5-7 6-9 10.5l-1 2c-.5 1 .5 2 1.5 1.5l7.5-3c2.5-1 5-2.5 7.5-4s4.5-3.5 6.5-5.5L96 79c1-.5 1.5.5 1 1.5l-3 7.5c-.5 1.5-2 2.5-3.5 2.5m-83 0h74m-37-33l3-7.5c.5-1.5-1-3-2.5-2.5l-7.5 3c-1.5.5-2.5 2-2.5 3.5v1c0 1.5 1 3 2.5 3.5l7.5 1c1.5 0 2.5-1 2.5-2.5z" />
                  </svg>
                  <span className="max-sm:hidden">شعار الجمهورية اليمنية</span>
                </span>
              </div>

              <div className="relative cursor-pointer hover:text-indigo-600 transition" title="التنبيهات">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              </div>
              <div className="cursor-pointer hover:text-indigo-600 transition" title="إعدادات سريعة" onClick={() => setActiveTab('settings')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* App view canvas */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Bar */}
        <footer className="h-10 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-6 shrink-0 text-[10px] text-slate-500" id="app-footer">
          <div className="flex gap-4">
            <span>المستخدم الحالي: <span className="font-bold text-slate-700">{currentUser.name}</span></span>
            <span className="max-sm:hidden">النسخة: 2.4.0 (إصدار ومزامنة ذكية)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>قاعدة البيانات: SQLite متصلة بنشاط</span>
            </div>
            <span className="max-sm:hidden">أمان البيانات: تشفير محلي تام</span>
          </div>
        </footer>

      </div>

    </div>
  );
}
