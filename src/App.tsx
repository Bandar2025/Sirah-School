/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockDb } from './db/mockDb';
import { User } from './types';

// Importing all modules we developed
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import StudentsView from './components/StudentsView';
import TeachersView from './components/TeachersView';
import ClassesView from './components/ClassesView';
import SubjectsView from './components/SubjectsView';
import SchedulesView from './components/SchedulesView';
import AttendanceView from './components/AttendanceView';
import GradesView from './components/GradesView';
import FinancialView from './components/FinancialView';
import SQLiteExplorer from './components/SQLiteExplorer';
import SettingsView from './components/SettingsView';

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
  KeyRound
} from 'lucide-react';

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(() => mockDb.getCurrentSession());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');
  
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

  // If user is not authenticated, show elegant official Saudi school landing sign-in screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-right leading-relaxed relative overflow-hidden" dir="rtl" id="login-portal">
        {/* Abstract design blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-55/10 rounded-full blur-3xl -z-10"></div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-md p-8 shadow-2xl border border-white/20 space-y-6 text-slate-800">
          
          {/* Logo Brand / Coat of arms */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-sky-600 to-indigo-65 text-white text-3xl flex items-center justify-center rounded-2xl mx-auto shadow-md">
              🏫
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">نظام منارة الأكاديمي لإدارة المدارس</h1>
            <p className="text-slate-450 text-[11px] text-slate-400">منظومة حوكمة مدرسية متكاملة تعمل دون اتصال بالإنترنت (Offline-First)</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 font-medium text-xs">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-xl text-[11px] font-bold">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-slate-600 font-bold block">اسم مستخدم الحساب</label>
              <input 
                type="text" 
                required
                placeholder="اسم المستخدم (e.g. admin)"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-bold block">كلمة المرور</label>
              <input 
                type="password" 
                required
                placeholder="كلمة المرور (e.g. admin123)"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              تأكيد تسجيل الدخول الآمن
            </button>
          </form>

          {/* Guidelines notes */}
          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed text-center space-y-1">
            <p className="font-bold text-slate-600">📌 حسابات التقييم الموفرة للتجربة والسندات:</p>
            <p>• حساب المدير: <code className="bg-slate-100 font-mono text-slate-700 px-1 py-0.5 rounded">admin</code> / السر: <code className="bg-slate-100 font-mono text-slate-700 px-1 py-0.5 rounded">admin123</code></p>
            <p>• حساب المشرف: <code className="bg-slate-100 font-mono text-slate-700 px-1 py-0.5 rounded">staff</code> / السر: <code className="bg-slate-100 font-mono text-slate-700 px-1 py-0.5 rounded">staff123</code></p>
          </div>

        </div>
      </div>
    );
  }

  // Define sidebar menu options
  const menuItems = [
    { id: 'dashboard', label: 'لوحة القيادة والمؤشرات', icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
    { id: 'users', label: 'المستخدمون وسجل التدقيق', icon: Users, roles: ['admin'] },
    { id: 'students', label: 'ملفات الطلاب المقيدين', icon: GraduationCap, roles: ['admin', 'supervisor'] },
    { id: 'teachers', label: 'المدرسين والموظفين', icon: School, roles: ['admin', 'supervisor'] },
    { id: 'classrooms', label: 'الفصول والمراحل', icon: Layers, roles: ['admin', 'supervisor'] },
    { id: 'subjects', label: 'المناهج والخطط المقررة', icon: BookOpen, roles: ['admin', 'supervisor'] },
    { id: 'schedules', label: 'جدولة الحصص الأسبوعية', icon: Calendar, roles: ['admin', 'supervisor'] },
    { id: 'attendance', label: 'كشف الحضور والغياب', icon: ClipboardList, roles: ['admin', 'supervisor'] },
    { id: 'grades', label: 'رصد العلامات والشهادات', icon: Calculator, roles: ['admin', 'supervisor'] },
    { id: 'financial', label: 'المحاسبة والرسوم المدرسية', icon: DollarSign, roles: ['admin', 'supervisor'] },
    { id: 'explorer', label: 'مستكشف داتابيس SQLite', icon: Database, roles: ['admin', 'supervisor'] },
    { id: 'settings', label: 'إعدادات المنارة والنسخ', icon: Settings, roles: ['admin'] }
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView key={refreshSeed} currentUser={currentUser} onNavigate={setActiveTab} />;
      case 'users': return <UsersView currentUser={currentUser} />;
      case 'students': return <StudentsView currentUser={currentUser} />;
      case 'teachers': return <TeachersView currentUser={currentUser} />;
      case 'classrooms': return <ClassesView currentUser={currentUser} />;
      case 'subjects': return <SubjectsView currentUser={currentUser} />;
      case 'schedules': return <SchedulesView currentUser={currentUser} />;
      case 'attendance': return <AttendanceView currentUser={currentUser} />;
      case 'grades': return <GradesView currentUser={currentUser} />;
      case 'financial': return <FinancialView currentUser={currentUser} />;
      case 'explorer': return <SQLiteExplorer currentUser={currentUser} />;
      case 'settings': return <SettingsView currentUser={currentUser} onRefreshAll={handleRefreshAll} />;
      default: return <DashboardView key={refreshSeed} currentUser={currentUser} onNavigate={setActiveTab} />;
    }
  };

  const activeLabel = menuItems.find(x => x.id === activeTab)?.label || 'اللوحة';

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans leading-relaxed" dir="rtl">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform border-l border-slate-800 flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 font-sans'
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
              <span className="block text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">{currentUser.role === 'admin' ? 'مدير النظام' : 'مشرف إداري'}</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 text-xs font-medium">
          {visibleMenuItems.map(item => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-900/10' 
                    : 'hover:bg-slate-800/60 text-slate-450 hover:text-slate-200'
                }`}
              >
                <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
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
      <div className="flex-1 lg:mr-64 min-h-screen flex flex-col overflow-hidden bg-slate-50">
        
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
              <div className="relative cursor-pointer hover:text-indigo-600 transition" title="التنبيهات">
                <svg xmlns="http://www.w3.org/2050/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          {renderActiveView()}
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
