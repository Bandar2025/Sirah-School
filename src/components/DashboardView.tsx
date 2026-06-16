/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockDb } from '../db/mockDb';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  Layers, 
  DollarSign, 
  Clock, 
  FileText, 
  Database, 
  ShieldCheck, 
  Activity, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: any;
  onNavigate: (tab: string) => void;
  key?: any;
}

export default function DashboardView({ currentUser, onNavigate }: DashboardViewProps) {
  const students = mockDb.getStudents();
  const teachers = mockDb.getTeachers();
  const classes = mockDb.getClassrooms();
  const attendance = mockDb.getAttendances();
  const payments = mockDb.getFeePayments();
  const settings = mockDb.getSettings();
  const auditLogs = mockDb.getAuditLogs();

  // Calculate figures
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  
  // Total tuition fees collected
  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Today Attendance rate (based on latest date of attendance)
  const uniqueDates = Array.from(new Set(attendance.map(a => a.date))).sort();
  const latestDate = uniqueDates[uniqueDates.length - 1] || 'اليوم';
  const latestAttendance = attendance.filter(a => a.date === latestDate);
  const presentCount = latestAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = latestAttendance.length > 0 
    ? Math.round((presentCount / latestAttendance.length) * 100) 
    : 100;

  // Gender demographics
  const maleCount = students.filter(s => s.gender === 'male').length;
  const femaleCount = students.filter(s => s.gender === 'female').length;

  return (
    <div className="space-y-6" id="dashboard-tab-view">
      {/* Upper Status & Brand Board */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-sans tracking-tight">أهلاً بك، {currentUser?.fullName || 'عضو طاقم الإدارة'}</h1>
          <p className="text-slate-500 text-sm mt-1">
            مرحباً بك في لوحة تحكم <span className="font-semibold text-sky-600">{settings.schoolName}</span>. العام الدراسي الحالي: {settings.currentAcademicYear}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 font-mono border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            قاعدة البيانات: متصلة محلياً (SQLite)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 font-mono border border-purple-100">
            <Database className="w-3.5 h-3.5" />
            وضع عدم الاتصال نشط (Offline Mode)
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">اجمالي الطلاب</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">{totalStudents}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{maleCount} ذكور / {femaleCount} إناث</span>
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">الكادر التعليمي</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">{totalTeachers}</h3>
            <p className="text-xs text-slate-500 mt-1">أعضاء هيئة التدريس الفاعلين</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">الفصول والمجموعات</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">{totalClasses}</h3>
            <p className="text-xs text-slate-500 mt-1">توزيع الفصول الدراسية النشطة</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">الرسوم المحصلة</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">{totalCollected.toLocaleString()} <span className="text-xs font-semibold">ريال</span></h3>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>مسجلة ومثبتة في الخزينة</span>
            </p>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">نسبة الحضور</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">{attendanceRate}%</h3>
            <p className="text-xs text-slate-500 mt-1">كشف حصر غياب: {latestDate}</p>
          </div>
        </div>
      </div>

      {/* Middle Data Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right: School Quick Access Panels */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 drop-shadow-sm">
            <Activity className="w-5 h-5 text-sky-500" />
            مركز الوصول السريع للعمليات
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => onNavigate('students')} 
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-sky-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 transition duration-150 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">ملفات الطلاب والقبول</span>
            </button>
            <button 
              onClick={() => onNavigate('attendance')} 
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition duration-150 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">رصد الحضور والغياب اليومي</span>
            </button>
            <button 
              onClick={() => onNavigate('grades')} 
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-amber-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 transition duration-150 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">إدخال الاختبارات والدرجات</span>
            </button>
            <button 
              onClick={() => onNavigate('schedules')} 
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-purple-100 hover:bg-purple-50 text-slate-700 hover:text-purple-800 transition duration-150 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold font-sans">توليد جدول الحصص الأسبوعي</span>
            </button>
            <button 
              onClick={() => onNavigate('financial')} 
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-rose-100 hover:bg-rose-50 text-slate-700 hover:text-rose-800 transition duration-150 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">سندات القبض والشؤون المالية</span>
            </button>
            <button 
              onClick={() => onNavigate('sqlite-explorer')} 
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 transition duration-150 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-100 flex items-center justify-center mb-2">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold">مستعرض قاعدة بيانات SQLite</span>
            </button>
          </div>

          {/* Demographic summary / Progress charts */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3 block">توزيع الطلاب حسب المراحل الدراسية</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>المرحلة الابتدائية</span>
                  <span>{students.filter(s => {
                    const cls = classes.find(c => c.id === s.classId);
                    return cls?.stage === 'primary';
                  }).length} طالباً</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full" 
                    style={{ width: `${(students.filter(s => classes.find(c => c.id === s.classId)?.stage === 'primary').length / Math.max(1, students.length)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>المرحلة المتوسطة</span>
                  <span>{students.filter(s => {
                    const cls = classes.find(c => c.id === s.classId);
                    return cls?.stage === 'middle';
                  }).length} طالباً</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(students.filter(s => classes.find(c => c.id === s.classId)?.stage === 'middle').length / Math.max(1, students.length)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>المرحلة الثانوية</span>
                  <span>{students.filter(s => {
                    const cls = classes.find(c => c.id === s.classId);
                    return cls?.stage === 'high';
                  }).length} طالباً</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${(students.filter(s => classes.find(c => c.id === s.classId)?.stage === 'high').length / Math.max(1, students.length)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left column: Security Logs & System info */}
        <div className="space-y-6">
          {/* Active school config info */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 transform translate-x-3 -translate-y-3 opacity-10">
              <Database className="w-40 h-40" />
            </div>
            <div className="relative z-10 space-y-4">
              <h3 className="font-bold text-lg font-sans border-b border-slate-700 pb-2 flex items-center gap-1.5 text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ملخص أمان النظام المحلي
              </h3>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>محرك قواعد البيانات:</span>
                  <span className="text-emerald-400 font-semibold">SQLite Embedded</span>
                </div>
                <div className="flex justify-between">
                  <span>نوع الاتصال:</span>
                  <span className="text-white">ذاكرة دائمة (localStorage Async)</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي العمليات المدققة:</span>
                  <span className="text-white">{auditLogs.length} عملية</span>
                </div>
                <div className="flex justify-between">
                  <span>المستخدم النشط:</span>
                  <span className="text-yellow-400 font-semibold">{currentUser?.username} ({currentUser?.role})</span>
                </div>
                <div className="flex justify-between">
                  <span>التأريخ المحلي للسيفر:</span>
                  <span className="text-white">جون 2026</span>
                </div>
              </div>
              <div className="pt-2">
                <div className="bg-slate-800/80 rounded-lg p-3 text-slate-300 text-xs border border-slate-700/50">
                  <span className="font-bold text-white block mb-0.5">💡 إرشادات ترحيل قاعدة البيانات:</span>
                  يمكنك في أي وقت تحميل ملف النسخة الاحتياطية SQL وتركيبها مباشرة على سيرفر SQLite الفعلي أو أي محرك SQL محلي.
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail quick feed */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase block">سجل التدقيق المحلي (العمليات الأخيرة)</h3>
              <button onClick={() => onNavigate('users')} className="text-[11px] font-semibold text-sky-600 hover:underline">عرض الكل</button>
            </div>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs border-r-2 border-slate-200 pr-2.5 py-0.5 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString('ar-SA')}</span>
                  </div>
                  <p className="text-slate-500 line-clamp-1">{log.details}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{log.username} (صلاحية محلية)</p>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs text-rtl">لا توجد عمليات مسجلة باللوج حالياً.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Financial Income Ledger snapshot */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          سندات القبض الأخيرة وعقود التحصيل
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-sans text-xs">رقم المرجع</th>
                <th className="py-3 px-4 font-sans text-xs">اسم الطالب</th>
                <th className="py-3 px-4 font-sans text-xs">نوع الرسم المستحق</th>
                <th className="py-3 px-4 font-sans text-xs">المبلغ المستلم</th>
                <th className="py-3 px-4 font-sans text-xs">تاريخ التحصيل</th>
                <th className="py-3 px-4 font-sans text-xs">طريقة الاستلام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {payments.slice(0, 5).map((p) => {
                const std = students.find(s => s.id === p.studentId);
                const fee = mockDb.getFeeTypes().find(f => f.id === p.feeTypeId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-800 text-xs font-semibold">{p.referenceNumber}</td>
                    <td className="py-3 px-4 font-medium">{std?.name || 'طالب مجهول'}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{fee?.name || 'نوع مجهول'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">{p.amountPaid.toLocaleString()} ريال</td>
                    <td className="py-3 px-4 text-xs font-mono">{p.paymentDate}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        p.paymentMethod === 'bank_transfer' ? 'bg-indigo-50 text-indigo-700' :
                        p.paymentMethod === 'card' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                         p.paymentMethod === 'card' ? 'حساب بطاقة شبكة' : 'نقد كاش'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">لم يتم تقييد أو تحصيل أي مبالغ مالية إلى حد الآن.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
