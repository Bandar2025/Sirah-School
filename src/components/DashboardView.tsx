/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { mockDb } from '../db/mockDb';
import { 
  Users, 
  GraduationCap, 
  School, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  FileCheck2,
  CalendarCheck2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DashboardViewProps {
  currentUser: any;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ currentUser, onNavigate }: DashboardViewProps) {
  const students = mockDb.getStudents();
  const teachers = mockDb.getTeachers();
  const classes = mockDb.getClassrooms();
  const attendance = mockDb.getAttendances();
  const payments = mockDb.getFeePayments();
  const settings = mockDb.getSettings();

  // 1. Calculate figures
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Today Attendance rate
  const uniqueDates = Array.from(new Set(attendance.map(a => a.date))).sort();
  const latestDate = uniqueDates[uniqueDates.length - 1] || 'اليوم';
  const latestAttendance = attendance.filter(a => a.date === latestDate);
  const presentCount = latestAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentCount = latestAttendance.length - presentCount;
  const attendanceRate = latestAttendance.length > 0 
    ? Math.round((presentCount / latestAttendance.length) * 100) 
    : 100;

  // Pie chart data for attendance
  const pieData = [
    { name: 'الحضور (الملتزمين)', value: presentCount || 4, color: '#0F8A5F' },
    { name: 'الغياب (بعذر وبدون)', value: absentCount || 1, color: '#D4A017' }
  ];

  // Map schedules to list of classes
  const schedules = mockDb.getSchedules();
  const subjects = mockDb.getSubjects();
  const classrooms = mockDb.getClassrooms();
  const teachersList = mockDb.getTeachers();

  const todayPeriods = schedules.slice(0, 5).map((sch, i) => {
    const cls = classrooms.find(c => c.id === sch.classroomId);
    const sub = subjects.find(s => s.id === sch.subjectId);
    const tch = teachersList.find(t => t.id === sch.teacherId);
    return {
      id: sch.id || `per-${i}`,
      periodNumber: sch.periodNumber,
      className: cls?.name || 'الصف التاسع - أ',
      subjectName: sub?.name || 'القرآن الكريم',
      teacherName: tch?.name || 'أ. نجيب اليوسفي'
    };
  });

  // Fallback if schedule is empty
  const defaultPeriods = [
    { id: '1', periodNumber: 1, className: 'الصف التاسع الأساسي - أ', subjectName: 'القرآن الكريم والتجويد', teacherName: 'أ. نجيب عبده اليوسفي' },
    { id: '2', periodNumber: 2, className: 'الصف الثالث الثانوي (علمي)', subjectName: 'الفيزياء المتقدمة', teacherName: 'أ. خالد محمد الحيمي' },
    { id: '3', periodNumber: 3, className: 'الصف الأول الابتدائي - مختلط', subjectName: 'اللغة العربية (نحو وقراءة)', teacherName: 'أ. فاطمة عبد الله العلفي' },
    { id: '4', periodNumber: 4, className: 'الصف الثالث الثانوي (أدبي)', subjectName: 'الأدب العربي والبلاغة', teacherName: 'أ. نجيب عبده اليوسفي' }
  ];

  const displayPeriods = todayPeriods.length > 0 ? todayPeriods : defaultPeriods;

  // Custom activities requested by user
  const activities = [
    {
      id: 'act-1',
      title: 'تم تسجيل طالب جديد للعام الحالي',
      desc: 'تم فحص وقيد الطالب "حمير بن عبد الله السريحي" بشعبة الصف التاسع والتحقق من ملف سنده المالي ورقم جلوسه الوزاري الموثق.',
      type: 'student',
      time: 'منذ ساعتين - نظام التسجيل',
      tag: 'شؤون الطلاب'
    },
    {
      id: 'act-2',
      title: 'تم اعتماد واعتماد كشوف الدرجات والمعدلات',
      desc: 'صادق رئيس الكنترول المدرسي على نتيجة رصد مواد اختبارات نصف الفصل الأول وتثبيت التقارير الوزارية في خادم الأرشيف الآمن.',
      type: 'result',
      time: 'منذ 4 ساعات - الكنترول العام',
      tag: 'إدارة الكنترول'
    },
    {
      id: 'act-3',
      title: 'تم دفع الرسوم وإصدار سندات التحصيل',
      desc: 'تقييد كفيل الطالب الطالبة "أروى بنت عبد الله السريحي" لمبلغ المساهمة المجتمعية السنوية ورسم التشغيل بقيمة 35,000 ريال نقداً.',
      type: 'payment',
      time: 'يوم أمس - مكتب الصندوق والمالية',
      tag: 'الحسابات المالية'
    }
  ];

  return (
    <div className="space-y-6" id="dashboard-tab-view">
      
      {/* Title block */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] bg-[#0F4C81]/15 text-[#0F4C81] px-2.5 py-1 rounded-full font-bold tracking-wider">الجمهورية اليمنية - وزارة التربية والتعليم</span>
          <h1 className="text-xl font-bold text-slate-800 font-sans tracking-tight pt-1">لوحة القيادة والمؤشرات التربوية العامة</h1>
          <p className="text-slate-500 text-xs">
            مرحباً بك في النظام الوطني الموحد لـ <span className="font-semibold text-[#0F4C81]">{settings.schoolName}</span>. العام الدراسي الحالي {settings.currentAcademicYear}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#0F8A5F]/10 flex items-center justify-center text-[#0F8A5F] text-lg">🏫</div>
          <div>
            <span className="block text-[9px] text-slate-400 font-mono">المديرية والقطاع</span>
            <span className="block text-xs font-bold text-slate-700">{settings.governorate} - {settings.district}</span>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="dashboard-statistics">
        
        {/* Card 1: Students */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="flex items-start justify-between">
            <span className="text-[32px]">📚</span>
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
              <TrendingUp className="w-3 h-3 text-emerald-600 ml-0.5 shrink-0" />
              +4.2% مقارنة بالعام الماضي
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-slate-400 text-[10px] font-bold">إجمالي الطلاب المقيدين</span>
            <h3 className="text-3xl font-extrabold text-[#0F4C81] tracking-tight">{totalStudents} <span className="text-xs text-slate-400 font-medium">طلاب</span></h3>
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs hover:shadow-sm transition-all duration-200 font-sans">
          <div className="flex items-start justify-between">
            <span className="text-[32px]">👨‍🏫</span>
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              استقرار تام
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-slate-400 text-[10px] font-bold">الكادر التعليمي والتربوي</span>
            <h3 className="text-3xl font-extrabold text-[#0F4C81] tracking-tight">{totalTeachers} <span className="text-xs text-slate-400 font-medium">معلماً</span></h3>
          </div>
        </div>

        {/* Card 3: Classes */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="flex items-start justify-between">
            <span className="text-[32px]">🏫</span>
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              +1 فصل إضافي
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-slate-400 text-[10px] font-bold">إجمالي الصفوف والشعب</span>
            <h3 className="text-3xl font-extrabold text-[#0F4C81] tracking-tight">{totalClasses} <span className="text-xs text-slate-400 font-medium">شعبة</span></h3>
          </div>
        </div>

        {/* Card 4: Daily Attendance */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs hover:shadow-sm transition-all duration-200 font-sans">
          <div className="flex items-start justify-between">
            <span className="text-[32px]">📅</span>
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-[#0F8A5F]/10 text-[#0F8A5F] px-2 py-0.5 rounded-full font-bold">
              +1.8% انضباط ملموس
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-[#0F8A5F] text-[10px] font-bold">نسبة الحضور والانضباط اليوم</span>
            <h3 className="text-3xl font-extrabold text-[#0F8A5F] tracking-tight">{attendanceRate}%</h3>
          </div>
        </div>

        {/* Card 5: Fees Collected */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs hover:shadow-sm transition-all duration-200">
          <div className="flex items-start justify-between">
            <span className="text-[32px]">💰</span>
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-yellow-50 text-yellow-800 border border-yellow-100 px-2 py-0.5 rounded-full font-bold">
              +15.3% مساهمة سنوية
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="block text-slate-400 text-[10px] font-bold">الرسوم والمساهمات المحصلة</span>
            <h3 className="text-3xl font-extrabold text-[#D4A017] tracking-tight">{totalCollected.toLocaleString()} <span className="text-xs font-semibold">ريال</span></h3>
          </div>
        </div>

      </div>

      {/* Middle Sections: Right (Today's Classes) and Left (Attendance statistics chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Right Section: Today's classes */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0F4C81]" />
              جدول توزيع الحصص الدراسية اليوم
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">الحصص الحالية والدروس القائمة اليوم في مجمع المنارة التعليمي</p>
          </div>

          <div className="overflow-x-auto text-right">
            <table className="w-full text-xs text-slate-600">
              <thead className="bg-[#0F4C81]/5 border-b border-[#0F4C81]/10 text-[#0F4C81] font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-right">رقم المرجعالحصة</th>
                  <th className="py-2.5 px-3 text-right">الفصل والشعبة</th>
                  <th className="py-2.5 px-3 text-right">المادة والمنهج</th>
                  <th className="py-2.5 px-3 text-right">المعلم المعتمد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayPeriods.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="inline-flex w-6 h-6 bg-[#0F4C81]/10 text-[#0F4C81] items-center justify-center rounded-md font-bold font-mono">
                        {p.periodNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-bold">{p.className}</td>
                    <td className="py-3 px-3 text-slate-600">{p.subjectName}</td>
                    <td className="py-3 px-3 text-[#0F8A5F]">{p.teacherName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-50">
            <button 
              type="button"
              onClick={() => onNavigate('academic')}
              className="w-full text-center text-xs font-bold text-[#0F4C81] hover:text-[#0F4C81]/90 bg-slate-50 py-2 rounded-xl border border-slate-150 transition"
            >
              عرض كامل الجداول الأكاديمية والخطط الأسبوعية
            </button>
          </div>
        </div>

        {/* Left Section: Attendance Statistics (Pie Chart) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-[#0F8A5F]" />
              التقرير الدائري لحضور وانضباط الطلاب
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">توزيع الطلاب الحاضرين والغائبين الموثق في السجلات لهذا اليوم</p>
          </div>

          {/* Pie Chart display inside Recharts Container */}
          <div className="h-[200px] flex items-center justify-center relative font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} طلاب`} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Absolute percentage overlay in the center */}
            <div className="absolute flex flex-col items-center justify-center pt-2">
              <span className="text-2xl font-black text-[#0F8A5F] tracking-tight">{attendanceRate}%</span>
              <span className="text-[9px] text-slate-400 font-bold">نسبة الحضور</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-50 font-sans">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">آخر قيد غياب:</span>
              <span className="text-slate-800 font-extrabold">{latestDate}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Latest Activities */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="w-full flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#D4A017]" />
              آخر الأنشطة والاعتمادات الرسمية
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">العمليات الأخيرة المجراة في دوائر التسجيل والكنترول والمالية بالمنارة</p>
          </div>
          <span className="text-[10px] bg-[#D4A017]/15 text-[#D4A017] px-3 py-1 rounded-full font-bold">مجمع منارة اليمن التعليمي</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="dashboard-activities">
          {activities.map((act) => (
            <div key={act.id} className="relative bg-slate-50 border border-slate-150 hover:border-slate-200 p-5 rounded-2xl transition duration-150 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">{act.tag}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{act.time}</span>
                </div>
                <h4 className="text-slate-800 font-extrabold font-sans text-xs leading-relaxed pt-1.5 flex items-center gap-1">
                  <span>{act.type === 'student' ? '📝' : act.type === 'result' ? '🏆' : '💰'}</span>
                  <span>{act.title}</span>
                </h4>
                <p className="text-slate-500 font-semibold text-[11px] leading-relaxed pt-1 line-clamp-3">{act.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#0F4C81] font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-[#0F8A5F] shrink-0" />
                <span>العملية مسجلة في الذاكرة بنجاح</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
