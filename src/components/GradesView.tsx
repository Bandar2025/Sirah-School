/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { mockDb } from '../db/mockDb';
import { Classroom, Student, Subject, Grade } from '../types';
import { 
  FileText, 
  Calculator, 
  Printer, 
  Search, 
  Check, 
  X, 
  AlertTriangle,
  Award,
  BookOpen,
  Plus
} from 'lucide-react';

interface GradesViewProps {
  currentUser: any;
}

export default function GradesView({ currentUser }: GradesViewProps) {
  const [classrooms] = useState<Classroom[]>(mockDb.getClassrooms());
  const [students] = useState<Student[]>(mockDb.getStudents());
  const [subjects] = useState<Subject[]>(mockDb.getSubjects());
  const [grades, setGrades] = useState<Grade[]>(mockDb.getGrades());

  const certificatePrintRef = useRef<HTMLDivElement>(null);
  const handlePrintCertificate = useReactToPrint({
    contentRef: certificatePrintRef,
  });

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedExamName, setSelectedExamName] = useState('اختبار نصف الفصل الدراسي الثاني');

  // Input states
  const [tempCoursework, setTempCoursework] = useState<{ [studentId: string]: string }>({});
  const [tempFinal, setTempFinal] = useState<{ [studentId: string]: string }>({});

  const [notification, setNotification] = useState('');
  
  // Custom printable report modal
  const [reportStudent, setReportStudent] = useState<Student | null>(null);

  const refreshData = () => {
    setGrades(mockDb.getGrades());
  };

  // Find students in class
  const activeStudents = students.filter(s => s.classId === selectedClassId && s.status === 'active');

  // Find subjects matching selected class stage
  const cls = classrooms.find(c => c.id === selectedClassId);
  const activeSubjects = subjects.filter(sub => sub.stage === cls?.stage);

  // Sync selected subject to first valid subject
  React.useEffect(() => {
    if (activeSubjects.length > 0) {
      setSelectedSubjectId(prev => {
        const isValid = activeSubjects.some(s => s.id === prev);
        return isValid ? prev : activeSubjects[0].id;
      });
    } else {
      setSelectedSubjectId('');
    }
  }, [selectedClassId]);

  // Read grades into form state when combinations shift
  React.useEffect(() => {
    const cw: typeof tempCoursework = {};
    const fn: typeof tempFinal = {};

    activeStudents.forEach(std => {
      const g = grades.find(x => x.studentId === std.id && x.subjectId === selectedSubjectId && x.examName === selectedExamName);
      cw[std.id] = g ? String(g.courseworkGrade) : '';
      fn[std.id] = g ? String(g.finalExamGrade) : '';
    });

    setTempCoursework(cw);
    setTempFinal(fn);
  }, [selectedClassId, selectedSubjectId, selectedExamName, grades]);

  const handleSaveGradeRow = (studentId: string) => {
    const rawCw = tempCoursework[studentId] || '0';
    const rawFn = tempFinal[studentId] || '0';

    mockDb.addOrUpdateGrade({
      studentId,
      subjectId: selectedSubjectId,
      examName: selectedExamName,
      examDate: new Date().toISOString().split('T')[0],
      courseworkGrade: Number(rawCw),
      finalExamGrade: Number(rawFn)
    }, currentUser.id, currentUser.username);

    setNotification('✓ تم رصد وحساب النتيجة الإجمالية للطالب بنجاح.');
    refreshData();
    setTimeout(() => setNotification(''), 3000);
  };

  // Compute stats for one student overall subjects to draw the report card certificate
  const getStudentGradesReport = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    let totalMarks = 0;
    let maxPossible = 0;
    let failedSubjectsCount = 0;

    const items = studentGrades.map(g => {
      const sub = subjects.find(s => s.id === g.subjectId);
      totalMarks += g.totalGrade;
      maxPossible += sub ? sub.maxGrade : 100;
      if (g.resultStatus === 'fail') {
        failedSubjectsCount++;
      }

      return {
        subjectName: sub?.name || 'مقرر',
        minLimit: sub?.minGrade || 50,
        maxLimit: sub?.maxGrade || 100,
        coursework: g.courseworkGrade,
        finalExam: g.finalExamGrade,
        total: g.totalGrade,
        status: g.resultStatus
      };
    });

    const averageRate = items.length > 0 ? Math.round((totalMarks / maxPossible) * 100) : 0;

    return {
      items,
      totalMarks,
      maxPossible,
      averageRate,
      isPass: failedSubjectsCount === 0 && items.length > 0,
      failedSubjectsCount
    };
  };

  return (
    <div className="space-y-6" id="grades-tab-view">
      
      {/* Upper selector controls */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-sans">
              <Calculator className="w-5 h-5 text-sky-500" />
              رصد الدرجات التفصيلية والامتحانات
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">تقييد أعمال السنة والاختبارات النهائية، الاحتساب الآلي للمعدلات، وطباعة كشوف التحصيل الأكاديمي</p>
          </div>
          {notification && (
            <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold">
              {notification}
            </div>
          )}
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0 font-semibold">المقرر المستهدف:</span>
            <select 
              className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              {activeSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} (درجة النجاح: {s.minGrade})</option>
              ))}
              {activeSubjects.length === 0 && (
                <option value="">- لا تتوفر مواد لهذا الفصل -</option>
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0 font-semibold">دورة الاختبار:</span>
            <input 
              type="text" 
              className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 font-medium"
              value={selectedExamName}
              onChange={(e) => setSelectedExamName(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grade entry sheet */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="overflow-x-auto text-right">
          <table className="w-full text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
              <tr>
                <th className="py-3 px-4 text-xs font-sans">اسم الطالب الكريم</th>
                <th className="py-3 px-4 text-xs font-sans text-center">أعمال السنة (Coursework)</th>
                <th className="py-3 px-4 text-xs font-sans text-center">الامتحان النهائي (Final Exam)</th>
                <th className="py-3 px-4 text-xs font-sans text-center">المجموع الإجمالي</th>
                <th className="py-3 px-4 text-xs font-sans text-center">النتيجة والتقدير</th>
                <th className="py-3 px-4 text-xs font-sans text-left">التعديل والشهادات الرسمية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {activeStudents.map((std) => {
                const cw = tempCoursework[std.id] || '';
                const fn = tempFinal[std.id] || '';
                const sum = Number(cw || 0) + Number(fn || 0);
                
                const targetSub = subjects.find(s => s.id === selectedSubjectId);
                const isPass = targetSub ? sum >= targetSub.minGrade : sum >= 50;

                return (
                  <tr key={std.id} className="hover:bg-slate-50/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <span>{std.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-20 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-center font-mono text-xs focus:outline-none focus:border-sky-500"
                        value={cw}
                        onChange={(e) => setTempCoursework({ ...tempCoursework, [std.id]: e.target.value })}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-20 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-center font-mono text-xs focus:outline-none focus:border-sky-500"
                        value={fn}
                        onChange={(e) => setTempFinal({ ...tempFinal, [std.id]: e.target.value })}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {sum} درجة
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {(cw || fn) ? (
                        isPass ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">ناجح</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">دون النصاب (راسب)</span>
                        )
                      ) : (
                        <span className="text-slate-300 text-xs italic">بانتظار الرصد</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-left font-sans">
                      <div className="inline-flex items-center gap-1.5">
                        <button 
                          onClick={() => handleSaveGradeRow(std.id)}
                          className="px-2.5 py-1 bg-emerald-55 text-xs font-semibold hover:bg-emerald-100 border border-emerald-100 text-emerald-800 rounded-lg transition"
                        >
                          رصد الدرجة
                        </button>
                        <button 
                          onClick={() => setReportStudent(std)}
                          className="p-1 px-2.5 border border-slate-200 text-slate-600 hover:text-indigo-700 hover:border-indigo-100 hover:bg-indigo-50 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>كشف النتيجة</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {activeStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">لا يتوفر أي طلاب بهذا الصف الدراسي لرصد درجاتهم.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Beautiful printable Student Academic Report Certificate Modal */}
      {reportStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-xl overflow-hidden text-right leading-relaxed flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
              <span className="font-bold text-slate-800">إشعار نتيجة تحصيل أكاديمي رسمي لمراجعة ولى الأمر</span>
              <button onClick={() => setReportStudent(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <div ref={certificatePrintRef} className="p-8 overflow-y-auto space-y-6 flex-1 bg-white" id="official-report-certificate">
              {/* Certificate Head branding */}
              <div className="flex justify-between items-center border-b-4 border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm">وزارة التعليم بالمملكة العربية السعودية</h3>
                  <h4 className="text-xs text-slate-500">{mockDb.getSettings().schoolName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">المرجع: CRT-{Date.now().toString().slice(-6)}</p>
                </div>
                <div className="text-center font-bold text-3xl text-sky-600 leading-none p-2 bg-slate-50 border border-slate-100 rounded-xl">
                  🎨
                </div>
              </div>

              {/* Title label */}
              <div className="text-center space-y-1 py-2">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight font-sans">إشعار درجات أعمال السنة والتحصيل</h1>
                <p className="text-xs text-slate-400 font-mono">العام الدراسي: 1447هـ (2026م)</p>
              </div>

              {/* Metadata columns */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-400">اسم الطالب الكريم:</p>
                  <p className="font-bold text-slate-850 text-sm">{reportStudent.name}</p>
                  <p className="text-slate-400">السجل المدني / الهوية:</p>
                  <p className="font-bold font-mono text-slate-800">{reportStudent.nationalId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">الصف الدراسي المقيد:</p>
                  <p className="font-bold text-slate-850 text-sm">{classrooms.find(c => c.id === reportStudent.classId)?.name || 'غير محدد'}</p>
                  <p className="text-slate-400">حالة ملف الطالب:</p>
                  <p className="font-bold text-slate-800">نشط قائم بالعام الحالي</p>
                </div>
              </div>

              {/* Grades Table */}
              <div>
                <table className="w-full text-xs text-slate-700 text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-right border border-slate-800">
                      <th className="p-2">اسم المادة والمقرر</th>
                      <th className="p-2 text-center border-r border-slate-700">أعمال السنة</th>
                      <th className="p-2 text-center border-r border-slate-700">الامتحان النهائي</th>
                      <th className="p-2 text-center border-r border-slate-700">المجموع</th>
                      <th className="p-2 text-center border-r border-slate-700">الحد الأقصى</th>
                      <th className="p-2 text-center border-r border-slate-700">النتيجة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getStudentGradesReport(reportStudent.id).items.map((it, i) => (
                      <tr key={i} className="border border-slate-200">
                        <td className="p-2.5 font-bold font-sans">{it.subjectName}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 font-mono">{it.coursework}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 font-mono">{it.finalExam}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 font-mono font-bold text-slate-800">{it.total}</td>
                        <td className="p-2.5 text-center border-r border-slate-200 font-mono text-slate-400">{it.maxLimit}</td>
                        <td className="p-2.5 text-center border-r border-slate-200">
                          {it.status === 'pass' ? (
                            <span className="text-emerald-700 font-bold font-sans">ناجح</span>
                          ) : (
                            <span className="text-rose-700 font-bold font-sans">دون النصاب</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {getStudentGradesReport(reportStudent.id).items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">لا يوجد أي درجات مسجلة ومرصودة حالياً للطالب في SQLite.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Average Rating */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 text-xs">
                <div>
                  <p className="text-slate-400">التقدير والمعدل العام المقدر:</p>
                  <p className="text-2xl font-extrabold text-slate-800 font-mono">
                    {getStudentGradesReport(reportStudent.id).averageRate}%
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-slate-400">القرار النهائي للإدارة:</p>
                  {getStudentGradesReport(reportStudent.id).items.length > 0 ? (
                    getStudentGradesReport(reportStudent.id).isPass ? (
                      <span className="text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-lg font-bold">✓ يترفع إلى الصف الدراسي الأعلى</span>
                    ) : (
                      <span className="text-sm bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1 rounded-lg font-bold">⚠️ بانتظار اختبار الدور الثاني</span>
                    )
                  ) : (
                    <span className="text-slate-400 italic">مبهم لعدم استكمال الرصد</span>
                  )}
                </div>
              </div>

              {/* Stamps Signatures */}
              <div className="flex justify-between pt-10 text-xs text-slate-500">
                <div className="text-center space-y-6">
                  <span>مرشد شؤون الطلاب</span>
                  <p className="font-serif italic font-medium text-slate-400">توقيع معتمد</p>
                </div>
                <div className="text-center space-y-6">
                  <span>ختم مدير المدرسة العام</span>
                  <div className="w-14 h-14 rounded-full border-4 border-dashed border-sky-400/40 flex items-center justify-center text-xl text-sky-400/60 font-sans mx-auto rotate-12">
                     معتمد
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => setReportStudent(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold transition"
              >
                إغلاق النافذة
              </button>
              <button 
                onClick={() => {
                  handlePrintCertificate();
                  mockDb.addAuditLog(currentUser.id, currentUser.username, 'طباعة شهادة تقدير علامات', `أمر طباعة لشهادة علامات الطالب: ${reportStudent.name}`);
                }}
                className="px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                تصدير وطباعة الشهادة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
