/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useCustomPrint } from '../hooks/useCustomPrint';
import { schoolDatabase } from '../db/database';
import { Schedule, Classroom, Teacher, Subject } from '../types';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Filter, 
  Users, 
  BookMarked,
  AlertTriangle,
  Grid,
  Printer
} from 'lucide-react';

interface SchedulesViewProps {
  currentUser: any;
}

const DAYS_OF_WEEK = [
  { id: 0, name: 'الأحد' },
  { id: 1, name: 'الاثنين' },
  { id: 2, name: 'الثلاثاء' },
  { id: 3, name: 'الأربعاء' },
  { id: 4, name: 'الخميس' }
];

const PERIODS = [
  { num: 1, time: '07:30 - 08:15' },
  { num: 2, time: '08:15 - 09:00' },
  { num: 3, time: '09:15 - 10:00' }, // فسحة بالنصف
  { num: 4, time: '10:00 - 10:45' },
  { num: 5, time: '11:00 - 11:45' },
  { num: 6, time: '11:45 - 12:30' }
];

export default function SchedulesView({ currentUser }: SchedulesViewProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(schoolDatabase.getSchedules());
  const [classrooms] = useState<Classroom[]>(schoolDatabase.getClassrooms());
  const [teachers] = useState<Teacher[]>(schoolDatabase.getTeachers());
  const [subjects] = useState<Subject[]>(schoolDatabase.getSubjects());

  const schedulePrintRef = useRef<HTMLDivElement>(null);
  const handlePrintSchedule = useCustomPrint(schedulePrintRef);

  // Filters state
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');

  // Add form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formClassId, setFormClassId] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formDay, setFormDay] = useState<number>(0);
  const [formPeriod, setFormPeriod] = useState<number>(1);
  
  const [errorMessage, setErrorMessage] = useState('');

  const refreshData = () => {
    setSchedules(schoolDatabase.getSchedules());
  };

  const handleOpenAddModal = () => {
    setFormClassId(selectedClassId || classrooms[0]?.id || '');
    setFormTeacherId(teachers[0]?.id || '');
    setFormSubjectId(subjects[0]?.id || '');
    setFormDay(0);
    setFormPeriod(1);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formClassId || !formTeacherId || !formSubjectId) {
      setErrorMessage('الرجاء التأكد من اختيار الفصل، المعلم، والمادة بشكل صحيح!');
      return;
    }

    // Attempt insertion, which incorporates conflict checks in mockDb
    const result = schoolDatabase.addSchedule({
      classroomId: formClassId,
      teacherId: formTeacherId,
      subjectId: formSubjectId,
      dayOfWeek: Number(formDay),
      periodNumber: Number(formPeriod)
    }, currentUser.id, currentUser.username);

    if (!result.success) {
      setErrorMessage(result.error || 'تعذر الإضافة بسبب تعارض في المواعيد!');
      return;
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteSchedule = (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في تفريغ وشطب الحصة من جدول المدرسة الأسبوعي؟')) {
      schoolDatabase.deleteSchedule(id, currentUser.id, currentUser.username);
      refreshData();
    }
  };

  // Filter schedules based on active view mode and select keys
  const activeSchedules = schedules.filter(s => {
    if (viewMode === 'class') {
      return s.classroomId === selectedClassId;
    } else {
      return s.teacherId === selectedTeacherId;
    }
  });

  // Helper to obtain booked slot at specific day and period
  const getSlot = (day: number, period: number) => {
    return activeSchedules.find(s => s.dayOfWeek === day && s.periodNumber === period);
  };

  return (
    <div className="space-y-6" id="schedules-tab-view">
      
      {/* Upper options selection boards */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              جدولة الحصص المدرسية الأسبوعية وعرض التعارضات
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">صياغة وتخطيط جودة الحصص الخمس اليومية، استعراض جداول الفصول والمعلمين مع الفلترة</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 max-sm:w-full">
            <button 
              onClick={() => {
                handlePrintSchedule();
                const viewName = viewMode === 'class' ? 
                  (classrooms.find(c => c.id === selectedClassId)?.name || '') : 
                  (teachers.find(t => t.id === selectedTeacherId)?.name || '');
                schoolDatabase.addAuditLog(currentUser.id, currentUser.username, 'طباعة الجدول الدراسي', `أمر طباعة للجدول الأسبوعي: ${viewName}`);
              }}
              className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition max-sm:w-full justify-center hover:cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              طباعة الجدول الأسبوعي
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition max-sm:w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              جدولة وإسناد حصة جديدة
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-4 h-4 text-slate-400" />عرض الجدول حسب:
            </span>
            <div className="inline-flex rounded-lg bg-slate-200 p-0.5 text-xs">
              <button 
                onClick={() => { setViewMode('class'); setSelectedTeacherId(''); }}
                className={`px-3 py-1 rounded-md font-semibold transition ${viewMode === 'class' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
              >
                الفصول والصفوف
              </button>
              <button 
                onClick={() => { setViewMode('teacher'); setSelectedClassId(''); setSelectedTeacherId(teachers[0]?.id || ''); }}
                className={`px-3 py-1 rounded-md font-semibold transition ${viewMode === 'teacher' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
              >
                المعلمين والمشرفين
              </button>
            </div>
          </div>

          <div className="flex-1 w-full">
            {viewMode === 'class' ? (
              <div className="flex items-center gap-2 w-full max-w-xs">
                <span className="text-xs text-slate-500 block shrink-0">الصف المستعرض:</span>
                <select 
                  className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 font-sans font-semibold"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full max-w-xs">
                <span className="text-xs text-slate-500 block shrink-0">المعلم المستهدف:</span>
                <select 
                  className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 font-sans font-semibold"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (التخصص: {t.specialty})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Weekly Schedule Grid Output */}
      <div ref={schedulePrintRef} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden overflow-x-auto print:p-8">
        {/* Printable official header */}
        <div className="hidden print:block mb-6 border-b-2 border-slate-300 pb-4 text-right">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-xs font-bold text-slate-500">وزارة التعليم بالمملكة العربية السعودية</h1>
              <h2 className="text-base font-bold text-slate-800 mt-1">{schoolDatabase.getSettings().schoolName}</h2>
            </div>
            <div className="text-left font-sans text-[10px] text-slate-400">
              <p>نوع التقرير: جدول أسبوعي معتمد</p>
              <p className="font-mono">تاريخ التصدير: {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
          </div>
          <div className="text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg flex justify-between items-center font-semibold text-slate-700">
            <span>العام الدراسي المقيد: {schoolDatabase.getSettings().currentAcademicYear || '1447هـ'}</span>
            <span>الهدف: {viewMode === 'class' ? `جدول الصف الدراسي (${classrooms.find(c => c.id === selectedClassId)?.name || ''})` : `جدول المعلم (${teachers.find(t => t.id === selectedTeacherId)?.name || ''})`}</span>
          </div>
        </div>
        <table className="w-full border-collapse text-right select-none min-w-[750px] print:text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-700 font-bold">
              <th className="py-3 px-4 text-xs font-sans text-center w-[120px]">اليوم / الحصة</th>
              {PERIODS.map(p => (
                <th key={p.num} className="py-3 px-4 text-xs font-sans text-center border-r border-slate-100/55">
                  <span className="block text-slate-800">الحصة {p.num}</span>
                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{p.time}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {DAYS_OF_WEEK.map(day => (
              <tr key={day.id} className="hover:bg-slate-50/20">
                <td className="py-4 px-4 text-sm font-bold bg-slate-50/70 border-l border-slate-100 text-center text-slate-800">
                  {day.name}
                </td>
                
                {PERIODS.map(p => {
                  const slot = getSlot(day.id, p.num);
                  const subName = slot ? subjects.find(s => s.id === slot.subjectId)?.name : null;
                  const tchName = slot ? teachers.find(t => t.id === slot.teacherId)?.name : null;
                  const clsName = slot ? classrooms.find(c => c.id === slot.classroomId)?.name : null;

                  return (
                    <td key={p.num} className="p-2 border-r border-slate-100 text-center align-middle h-28 w-[150px]">
                      {slot ? (
                        <div className="h-full rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-100 p-2.5 flex flex-col justify-between text-right relative group shadow-2xs">
                          <div>
                            <span className="block text-xs font-bold text-slate-800 truncate" title={subName || ''}>{subName}</span>
                            <span className="block text-[10px] text-slate-500 mt-1 truncate" title={viewMode === 'class' ? tchName || '' : clsName || ''}>
                              {viewMode === 'class' ? `👨‍🏫 ${tchName}` : `🏫 ${clsName}`}
                            </span>
                          </div>

                          <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-100/60 font-mono text-[9px] text-slate-400">
                            <span>حصة {slot.periodNumber}</span>
                            <button 
                              onClick={() => handleDeleteSchedule(slot.id)}
                              className="text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="إلغاء الحصة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-medium block italic">- فارغ -</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule booking popup dialog with conflict logs */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 text-slate-700">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-xl overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">إسناد وجدولة حصة جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-900 rounded-xl text-xs flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">الصف الدراسي (الفصل)</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                >
                  <option value="">-- اختر الفصل المستهدف --</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">المعلم المسند لتأدية الدرس</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                >
                  <option value="">-- اختر المدرس --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (تخصص: {t.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">المقرر / المادة الدراسية</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                >
                  <option value="">-- اختر مادة المقرر الدراسي --</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name} (الحد الأقصى {sub.maxGrade})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">اليوم</label>
                  <select 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none font-semibold"
                    value={formDay}
                    onChange={(e) => setFormDay(Number(e.target.value))}
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">الحصة اليومية</label>
                  <select 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none font-mono font-semibold"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(Number(e.target.value))}
                  >
                    {PERIODS.map(p => (
                      <option key={p.num} value={p.num}>الحصة {p.num} ({p.time})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5 text-xs font-semibold">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  تراجع
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm"
                >
                  إضافة وإبرام الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
