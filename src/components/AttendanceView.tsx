/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { mockDb } from '../db/mockDb';
import { Classroom, Student, Attendance } from '../types';
import { 
  UserCheck, 
  Calendar, 
  Search, 
  Check, 
  X, 
  AlertTriangle, 
  ClipboardList, 
  Users,
  CheckCircle,
  Clock,
  Heart,
  Printer
} from 'lucide-react';

interface AttendanceViewProps {
  currentUser: any;
}

export default function AttendanceView({ currentUser }: AttendanceViewProps) {
  const [classrooms] = useState<Classroom[]>(mockDb.getClassrooms());
  const [students, setStudents] = useState<Student[]>(mockDb.getStudents());
  const [attendance, setAttendance] = useState<Attendance[]>(mockDb.getAttendances());

  const attendancePrintRef = useRef<HTMLDivElement>(null);
  const handlePrintAttendance = useReactToPrint({
    contentRef: attendancePrintRef,
  });

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Bulk Edit state (temporary state for form submission)
  const [tempRecords, setTempRecords] = useState<{ [studentId: string]: { status: 'present' | 'absent' | 'excused' | 'late'; notes: string } }>({});
  const [notification, setNotification] = useState('');

  const refreshData = () => {
    setAttendance(mockDb.getAttendances());
  };

  // Filter students in selected classroom
  const activeStudents = students.filter(s => s.classId === selectedClassId && s.status === 'active');

  // Trigger loading existing data for selected class and date into editable form
  React.useEffect(() => {
    const initial: typeof tempRecords = {};
    activeStudents.forEach(std => {
      const match = attendance.find(a => a.studentId === std.id && a.date === selectedDate);
      initial[std.id] = {
        status: match ? match.status : 'present',
        notes: match ? match.notes : ''
      };
    });
    setTempRecords(initial);
  }, [selectedClassId, selectedDate, attendance]);

  // State change handler for individual student rows
  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'excused' | 'late') => {
    setTempRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setTempRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.keys(tempRecords).map(studentId => ({
      studentId,
      date: selectedDate,
      status: tempRecords[studentId].status,
      notes: tempRecords[studentId].notes
    }));

    mockDb.saveAttendanceBatch(payload, currentUser.id, currentUser.username);
    setNotification('✓ تم حفظ كشف الحضور والغياب بنجاح في قاعدة بيانات المدرسة.');
    refreshData();
    setTimeout(() => setNotification(''), 4000);
  };

  // Calculates absence percentage for warning triggers
  const getAbsenceStats = (studentId: string) => {
    const studentHistory = attendance.filter(a => a.studentId === studentId);
    const totalDays = studentHistory.length;
    if (totalDays === 0) return { count: 0, rate: 0 };

    const absents = studentHistory.filter(h => h.status === 'absent').length;
    return {
      count: absents,
      rate: Math.round((absents / totalDays) * 100)
    };
  };

  return (
    <div className="space-y-6" id="attendance-tab-view">
      
      {/* Upper selector controls */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-sky-500" />
              رصد الحضور والغياب اليومي للطلاب
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">تسجيل الدفاتر اليومية للصفوف مع توليد ذكي لإنذارات الغياب المتكرر بنموذج SQLite المعياري</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {notification && (
              <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold">
                {notification}
              </div>
            )}
            <button 
              type="button"
              onClick={() => {
                handlePrintAttendance();
                const viewName = classrooms.find(c => c.id === selectedClassId)?.name || '';
                mockDb.addAuditLog(currentUser.id, currentUser.username, 'طباعة كشف الحضور والغياب', `أمر طباعة لدفتر الحضور للصف ${viewName} بتاريخ ${selectedDate}`);
              }}
              className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition hover:cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              طباعة كشف الغياب اليومي
            </button>
          </div>
        </div>

        {/* Date and Classroom Selector Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <div className="flex items-center gap-2 w-full sm:max-w-xs">
            <span className="text-xs text-slate-500 shrink-0 font-semibold">تأريخ التحضير:</span>
            <input 
              type="date" 
              className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 font-mono"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:max-w-xs">
            <span className="text-xs text-slate-500 shrink-0 font-semibold">الفصل الدراسي:</span>
            <select 
              className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 font-semibold"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Attendance List Sheet */}
      <div ref={attendancePrintRef} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm print:p-8">
        {/* Printable official header */}
        <div className="hidden print:block mb-6 border-b-2 border-slate-300 pb-4 text-right">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-xs font-bold text-slate-500 font-sans">وزارة التعليم بالمملكة العربية السعودية</h1>
              <h2 className="text-base font-bold text-slate-800 mt-1">{mockDb.getSettings().schoolName}</h2>
            </div>
            <div className="text-left font-sans text-[10px] text-slate-400">
              <p>نوع المسند: كشف الرصد اليومي للحضور والغياب</p>
              <p className="font-mono">تاريخ الرصد: {selectedDate}</p>
              <p className="font-mono">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
          </div>
          <div className="text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg flex justify-between items-center font-semibold text-slate-700">
            <span>العام الدراسي الحاصل: {mockDb.getSettings().currentAcademicYear || '1447هـ'}</span>
            <span>الفصل المدرسي المستهدف: {classrooms.find(c => c.id === selectedClassId)?.name || ''}</span>
          </div>
        </div>

        <form onSubmit={handleSaveBatch} className="space-y-6">
          <div className="overflow-x-auto text-right">
            <table className="w-full text-sm text-slate-600 print:text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="py-3 px-4 text-xs font-sans">اسم الطالب</th>
                  <th className="py-3 px-4 text-xs font-sans">معايرة وحالة حضور اليوم</th>
                  <th className="py-3 px-4 text-xs font-sans">ملاحظات التحضير المستندي</th>
                  <th className="py-3 px-4 text-xs font-sans">سجل الغياب الإجمالي والإنذارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {activeStudents.map((student) => {
                  const record = tempRecords[student.id] || { status: 'present', notes: '' };
                  const stats = getAbsenceStats(student.id);

                  // Show red warning if student has absent rate >= 20% or total absent days >= 2 days in dummy system
                  const hasWarning = stats.count >= 2;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-4 px-4 font-medium flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{student.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({student.nationalId})</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold gap-1">
                          <button 
                            type="button" 
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                              record.status === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>حاضر</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                              record.status === 'absent' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>غائب</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleStatusChange(student.id, 'late')}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                              record.status === 'late' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>متأخر</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleStatusChange(student.id, 'excused')}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                              record.status === 'excused' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            <Heart className="w-3.5 h-3.5 hover:scale-105 transition" />
                            <span>مستأذن</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="text" 
                          placeholder="ملاحظات العجز الصحي أو المبرر..."
                          className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 text-xs focus:outline-none w-full max-w-xs focus:border-sky-500"
                          value={record.notes}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        />
                      </td>
                      <td className="py-4 px-4 text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">مجموع الغيابات: <strong className="text-slate-700">{stats.count} أيام</strong> ({stats.rate}%)</span>
                          
                          {/* Exceeded limit warning */}
                          {hasWarning && (
                            <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                              تجاوز حد الغياب القانوني!
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {activeStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400 text-xs text-rtl">لم يتم رصد أو وتثبيت أي طلاب بهذا الفصل الدراسي بعد.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {activeStudents.length > 0 && (
            <div className="pt-4 border-t border-slate-102 flex justify-end">
              <button 
                type="submit"
                className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition"
              >
                <UserCheck className="w-4 h-4" />
                تأكيد الكشف وحفظ الحضور بـ SQLite
              </button>
            </div>
          )}
        </form>
      </div>

    </div>
  );
}
