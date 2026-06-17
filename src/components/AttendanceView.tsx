/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCustomPrint } from '../hooks/useCustomPrint';
import { schoolDatabase } from '../db/database';
import { Classroom, Student, Attendance, BehaviorEvaluation } from '../types';
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
  Printer,
  FileSpreadsheet,
  Award,
  ShieldCheck,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AttendanceViewProps {
  currentUser: any;
}

// The 20 official Yemeni school behavior indicators (5 marks each, Total = 100)
const YEMENI_BEHAVIOR_INDICATORS = [
  { id: "1", text: "الالتزام بالزي المدرسي الموحد والشرعي ونظافة المظهر الشخصي" },
  { id: "2", text: "الحضور المبكر للمدرسة والاصطفاف في طابور الصباح بانتظام" },
  { id: "3", text: "ترديد النشيد الوطني والوقوف عند سلام الجمهورية وتحية العلم بمهابة" },
  { id: "4", text: "الالتزام بإحضار الكتب والدفاتر المدرسية لجميع المواد يومياً" },
  { id: "5", text: "المحافظة على سلامة ونظافة الكتب المدرسية والخلية التنظيمية للدفاتر" },
  { id: "6", text: "المشاركة الفعالة والتفاعل الإيجابي مع المعلمين أثناء شرح الحصص" },
  { id: "7", text: "أداء الواجبات المدرسية اليومية والأنشطة الصفية والمنزلية بانتظام" },
  { id: "8", text: "المحافظة على نظافة الفصل المدرسي والجدران والممرات والساحات" },
  { id: "9", text: "المحافظة على الأثاث المدرسي والمقاعد والأجهزة والشبكة الكهربائية" },
  { id: "10", text: "احترام أعضاء الهيئة الإدارية والتعليمية ومعاملتهم بوقار وأدب تام" },
  { id: "11", text: "الالتزام بتعاليم وتوجيهات مشرفي ومناوبي النظام والانتظام المدرسي" },
  { id: "12", text: "حسن التعامل والزمالة وعدم التحرش أو الإساءة للزملاء الطلاب بالقول أو الفعل" },
  { id: "13", text: "الالتزام بالهدوء والسكينة داخل الفصول وأثناء مغادرتها والممرات" },
  { id: "14", text: "المشاركة الإيجابية الهادفة في الأنشطة المدرسية والجمعيات اللاصفية" },
  { id: "15", text: "تجنب العنف والشجار والاندفاع والمشاحنات البدنية داخل المحيط المدرسي" },
  { id: "16", text: "الالتزام التام بجدول الحصص والتحضير الفعلي وتجنب الهروب والغياب" },
  { id: "17", text: "عدم إحضار أي أدوات حادة أو مواد تخالف رسالة الصرح التعليمي والتربوي" },
  { id: "18", text: "المحافظة على الصحة والنظافة الشخصية والعيش الآمن الخالي من التدخين" },
  { id: "19", text: "الصدق والأمانة والنزاهة في تقديم الاختبارات المدرسية والمعاملات" },
  { id: "20", text: "الاستجابة الفورية والتفاعل الواعي مع نصائح الأخصائي الاجتماعي بالمجمع" }
];

export default function AttendanceView({ currentUser }: AttendanceViewProps) {
  const [classrooms] = useState<Classroom[]>(schoolDatabase.getClassrooms());
  const [students, setStudents] = useState<Student[]>(schoolDatabase.getStudents());
  const [attendance, setAttendance] = useState<Attendance[]>(schoolDatabase.getAttendances());
  const [behaviorEvals, setBehaviorEvals] = useState<BehaviorEvaluation[]>(schoolDatabase.getBehaviorEvaluations());

  // Navigation: daily, monthly, behavior, warnings
  const [activeTab, setActiveTab2] = useState<'daily' | 'monthly' | 'behavior' | 'warnings'>('daily');

  // References for print hooks
  const dailyPrintRef = useRef<HTMLDivElement>(null);
  const monthlyPrintRef = useRef<HTMLDivElement>(null);
  const behaviorPrintRef = useRef<HTMLDivElement>(null);
  const warningPrintRef = useRef<HTMLDivElement>(null);

  const handlePrintDaily = useCustomPrint(dailyPrintRef);
  const handlePrintMonthly = useCustomPrint(monthlyPrintRef);
  const handlePrintBehavior = useCustomPrint(behaviorPrintRef);
  const handlePrintWarning = useCustomPrint(warningPrintRef);

  // Filters for Attendance
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Bulk Edit state (temporary state for form submission in daily tab)
  const [tempRecords, setTempRecords] = useState<{ [studentId: string]: { status: 'present' | 'absent' | 'excused' | 'late'; notes: string } }>({});
  const [notification, setNotification] = useState('');

  // Monthly ledger states
  const [monthlyYear, setMonthlyYear] = useState<number>(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState<number>(new Date().getMonth() + 1); // 1-12

  // Behavior evaluations active inputs
  const [selectedEvalStudentId, setSelectedEvalStudentId] = useState<string>('');
  const [evalAcademicYear, setEvalAcademicYear] = useState<string>(schoolDatabase.getSettings().currentAcademicYear);
  const [evalSemester, setEvalSemester] = useState<'first' | 'second' | 'second_round'>('first');
  const [evalMarks, setEvalMarks] = useState<Record<string, number>>({});
  const [evalNotes, setEvalNotes] = useState<string>('');
  const [evalNotification, setEvalNotification] = useState<string>('');

  // Warnings / Notifications states
  const [selectedWarnStudentId, setSelectedWarnStudentId] = useState<string>('');
  const [warnType, setWarnType] = useState<'warn1' | 'warn2' | 'final'>('warn1');

  const refreshData = () => {
    setAttendance(schoolDatabase.getAttendances());
    setBehaviorEvals(schoolDatabase.getBehaviorEvaluations());
    setStudents(schoolDatabase.getStudents());
  };

  const activeStudents = students.filter(s => s.classId === selectedClassId && s.status === 'active');

  // Trigger loading existing data for selected class and date into editable form
  useEffect(() => {
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

  // Set default student for warnings and evaluations when class changes
  useEffect(() => {
    if (activeStudents.length > 0) {
      setSelectedEvalStudentId(activeStudents[0].id);
      setSelectedWarnStudentId(activeStudents[0].id);
    } else {
      setSelectedEvalStudentId('');
      setSelectedWarnStudentId('');
    }
  }, [selectedClassId]);

  // Load existing behavior evaluation if matching exists
  useEffect(() => {
    if (selectedEvalStudentId) {
      const existing = behaviorEvals.find(
        e => e.studentId === selectedEvalStudentId &&
             e.academicYear === evalAcademicYear &&
             e.semester === evalSemester
      );
      if (existing) {
        setEvalMarks(existing.marks);
        setEvalNotes(existing.notes || '');
      } else {
        // Default all indicators to 5 (Full Mark)
        const defaults: Record<string, number> = {};
        YEMENI_BEHAVIOR_INDICATORS.forEach(ind => {
          defaults[ind.id] = 5;
        });
        setEvalMarks(defaults);
        setEvalNotes('');
      }
    }
  }, [selectedEvalStudentId, evalAcademicYear, evalSemester, behaviorEvals]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'excused' | 'late') => {
    setTempRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setTempRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], notes } }));
  };

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.keys(tempRecords).map(studentId => ({
      studentId,
      date: selectedDate,
      status: tempRecords[studentId].status,
      notes: tempRecords[studentId].notes
    }));

    schoolDatabase.saveAttendanceBatch(payload, currentUser.id, currentUser.username);
    setNotification('✓ تم حفظ كشف الحضور والغياب بنجاح في قاعدة بيانات المدرسة.');
    refreshData();
    setTimeout(() => setNotification(''), 4000);
  };

  // Stats for warning trigger thresholds
  const getAbsenceStats = (studentId: string) => {
    const studentHistory = attendance.filter(a => a.studentId === studentId);
    const totalDays = studentHistory.length;
    
    const absents = studentHistory.filter(h => h.status === 'absent').length;
    const excuses = studentHistory.filter(h => h.status === 'excused').length;
    const lates = studentHistory.filter(h => h.status === 'late').length;

    return {
      count: absents,
      rate: totalDays > 0 ? Math.round((absents / totalDays) * 100) : 0,
      excusedCount: excuses,
      lateCount: lates,
      totalDays
    };
  };

  // Export Daily to CSV/Excel
  const handleExportAttendance = () => {
    let csvContent = `الرقم الوطني,اسم الطالب,الحالة,تأريخ التحضير,الملاحظات والذرائع الموثقة\n`;
    activeStudents.forEach(std => {
      const rec = tempRecords[std.id] || { status: 'present', notes: '' };
      const statusText = rec.status === 'present' ? 'حاضر' :
                         rec.status === 'absent' ? 'غائب بدون عذر' :
                         rec.status === 'late' ? 'متأخر' : 'غياب مبرر (عذر)';
      csvContent += `"${std.nationalId}","${std.name}","${statusText}","${selectedDate}","${(rec.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const classNameFull = classrooms.find(c => c.id === selectedClassId)?.name || '';
    link.setAttribute("download", `حضور_${classNameFull}_بتاريخ_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    schoolDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'تصدير كشف الحضور والغياب',
      `تصدير ملف Excel/CSV لكشف حضور طلاب الصف (${classNameFull}) لليوم المعني`
    );
  };

  // Export Monthly registry to Excel CSV
  const handleExportMonthly = () => {
    const daysInMonth = new Date(monthlyYear, monthlyMonth, 0).getDate();
    let csvContent = `اسم الطالب,الرقم الوطني`;
    for (let day = 1; day <= daysInMonth; day++) {
      csvContent += `,${day}`;
    }
    csvContent += `,مجموع الغياب,الغياب بعذر\n`;

    activeStudents.forEach(std => {
      csvContent += `"${std.name}","${std.nationalId}"`;
      let totalAbs = 0;
      let totalExc = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${monthlyYear}-${String(monthlyMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const match = attendance.find(a => a.studentId === std.id && a.date === dStr);
        let symb = '•';
        if (match) {
          if (match.status === 'absent') { symb = 'غ'; totalAbs++; }
          else if (match.status === 'excused') { symb = 'أ'; totalExc++; }
          else if (match.status === 'late') symb = 'ت';
          else if (match.status === 'present') symb = 'ح';
        }
        csvContent += `,${symb}`;
      }
      csvContent += `,${totalAbs},${totalExc}\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const classNameFull = classrooms.find(c => c.id === selectedClassId)?.name || '';
    link.setAttribute("download", `سجل_الغياب_الشهري_${classNameFull}_${monthlyMonth}_${monthlyYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    schoolDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'تصدير السجل الشهري',
      `تصدير سجل الغياب الشهري المجمع لطلاب (${classNameFull}) لشهر ${monthlyMonth}/${monthlyYear}`
    );
  };

  // Save Behavior evaluation
  const handleSaveBehaviorEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvalStudentId) return;

    // Calculate sum of marks
    let total = 0;
    YEMENI_BEHAVIOR_INDICATORS.forEach(ind => {
      total += evalMarks[ind.id] || 0;
    });

    // Auto classify behavior grade
    let grade = 'ممتاز';
    if (total >= 90) grade = 'ممتاز';
    else if (total >= 80) grade = 'جيد جداً';
    else if (total >= 65) grade = 'جيد';
    else if (total >= 50) grade = 'مقبول';
    else grade = 'ضعيف';

    schoolDatabase.saveBehaviorEvaluation({
      studentId: selectedEvalStudentId,
      academicYear: evalAcademicYear,
      semester: evalSemester,
      marks: evalMarks,
      totalMark: total,
      behaviorGrade: grade,
      evaluatorId: currentUser.id,
      date: new Date().toISOString(),
      notes: evalNotes
    }, currentUser.id, currentUser.username);

    setEvalNotification('✓ تم حفظ واعتماد استمارة السلوك والمواظبة في قاعدة البيانات بنجاح.');
    refreshData();
    setTimeout(() => setEvalNotification(''), 4000);
  };

  // Handle single indicator marking changes
  const handleMarkChange = (indId: string, value: number) => {
    setEvalMarks(prev => ({
      ...prev,
      [indId]: value
    }));
  };

  const currentMonthDaysCount = new Date(monthlyYear, monthlyMonth, 0).getDate();
  const daysArray = Array.from({ length: currentMonthDaysCount }, (_, i) => i + 1);

  const selectedStudentObj = students.find(s => s.id === selectedEvalStudentId);
  const selectedWarnStudentObj = students.find(s => s.id === selectedWarnStudentId);
  const selectedWarnAbsences = selectedWarnStudentId ? getAbsenceStats(selectedWarnStudentId) : { count: 0, rate: 0 };

  // Calculate sum for active evaluation card
  const calculatedEvalTotal = YEMENI_BEHAVIOR_INDICATORS.reduce((acc, ind) => acc + (evalMarks[ind.id] || 0), 0);
  const getCalculatedBehaviorGrade = (total: number) => {
    if (total >= 90) return 'ممتاز';
    if (total >= 80) return 'جيد جداً';
    if (total >= 65) return 'جيد';
    if (total >= 50) return 'مقبول';
    return 'ضعيف';
  };

  // Arabic Month names
  const arabicMonths = [
    'يناير / كانون الثاني', 'فبراير / شباط', 'مارس / آذار', 'أبريل / نيسان',
    'مايو / أيار', 'يونيو / حزيران', 'يوليو / تموز', 'أغسطس / آب',
    'سبتمبر / أيلول', 'أكتوبر / تشرين الأول', 'نوفمبر / تشرين الثاني', 'ديسمبر / كانون الأول'
  ];

  return (
    <div className="space-y-6" id="attendance-composite-panel">
      
      {/* Title Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              حضور وغياب وضوابط السلوك الطلابي
            </h2>
            <p className="text-slate-500 text-xs mt-1">الدفاتر الرسمية والمواظبة واستشارات السلوك لوزارة التربية والتعليم بالجمهورية اليمنية</p>
          </div>
          
          <div className="flex items-center gap-2 max-sm:w-full">
            <span className="text-xs text-slate-500 font-bold block shrink-0 max-sm:hidden">الفصل المستهدف:</span>
            <select 
              className="bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 w-44"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic sub-tabs navigation matching Yemeni school documents */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 mt-5 pt-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab2('daily')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'daily' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-55 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            📋 الرصد والتحضير اليومي للصف
          </button>
          <button
            type="button"
            onClick={() => setActiveTab2('monthly')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'monthly' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-55 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            📅 السجل الشهري المكتمل (1-31)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab2('warnings')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'warnings' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-55 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            ⚠️ إنذارات وإشعارات الغياب الرسمية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab2('behavior')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'behavior' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-55 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            🌟 استمارة تقييم السلوك والمواظبة (وزارة التربية)
          </button>
        </div>
      </div>

      {/* TAB 1: DAILY ATTENDANCE SHEET */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Daily parameters and buttons */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5 w-full sm:max-w-xs">
              <span className="text-xs text-slate-500 font-bold shrink-0">تاريخ التحضير:</span>
              <input 
                type="date" 
                className="w-full bg-slate-50 rounded-xl border border-slate-150 px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 shrink-0 max-sm:w-full">
              {notification && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  {notification}
                </span>
              )}
              <button 
                type="button"
                onClick={handleExportAttendance}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 hover:cursor-pointer text-white px-3.5 py-2 rounded-xl text-xs font-bold"
              >
                <FileSpreadsheet className="w-4 h-4" />
                تصدير لملف Excel
              </button>
              <button 
                type="button"
                onClick={() => {
                  handlePrintDaily();
                  const clsName = classrooms.find(c => c.id === selectedClassId)?.name || '';
                  schoolDatabase.addAuditLog(currentUser.id, currentUser.username, 'طباعة حضور يومي', `طباعة دفتر حضور غياب ${clsName} بتاريخ ${selectedDate}`);
                }}
                className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 px-3.5 py-2 rounded-xl text-xs font-bold hover:cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                طباعة كشف ومحضر اليوم
              </button>
            </div>
          </div>

          {/* Daily Table Sheet container */}
          <div ref={dailyPrintRef} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm print:p-8">
            {/* Printable official header for Daily Sheet */}
            <div className="hidden print:block mb-6 border-b-2 border-slate-300 pb-4 text-right">
              <div className="flex justify-between items-center mb-2">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500">الجمهورية اليمنية - وزارة التربية والتعليم</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">مجمع منارة اليمن التعليمي والتربوي</p>
                </div>
                <div className="text-left font-sans text-[10px] text-slate-400">
                  <p>نوع المستند: كشف الحضور والغياب اليومي للفصل</p>
                  <p className="font-mono">تاريخ الرصد: {selectedDate}</p>
                </div>
              </div>
              <div className="text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg flex justify-between items-center font-semibold text-slate-700 mt-3">
                <span>الصف الدراسي: {classrooms.find(c => c.id === selectedClassId)?.name || ''}</span>
                <span>العام الدراسي: {schoolDatabase.getSettings().currentAcademicYear}</span>
              </div>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-6">
              <div className="overflow-x-auto text-right">
                <table className="w-full text-sm text-slate-600 print:text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-750">
                    <tr>
                      <th className="py-3 px-4 text-xs font-bold text-slate-700">اسم الطالب الكامل</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-700">الرقم الوطني / الهوية</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-700 text-center">أخذ حالة الحضور</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-700">الحالة الطبية / ملاحظات المبرر</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-700">تراكمي غياب الفصل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeStudents.map((student) => {
                      const record = tempRecords[student.id] || { status: 'present', notes: '' };
                      const stats = getAbsenceStats(student.id);
                      
                      // Highlight if >= 3 absences
                      const hasWarning = stats.count >= 3;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {student.photo && (
                                <img src={student.photo} alt="Student" className="w-6 h-6 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                              )}
                              <span className="font-black text-slate-800 text-xs">{student.name}</span>
                              {student.registrationStatus === 'new' && (
                                <span className="text-[8px] bg-sky-100 text-sky-800 font-bold px-1 py-0.5 rounded">مستجد</span>
                              )}
                              {student.registrationStatus === 'transferred' && (
                                <span className="text-[8px] bg-purple-100 text-purple-800 font-bold px-1 py-0.5 rounded">منقول</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-medium">
                            {student.nationalId}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold gap-1">
                              <button 
                                type="button" 
                                onClick={() => handleStatusChange(student.id, 'present')}
                                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                                  record.status === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
                                }`}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>حاضر</span>
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleStatusChange(student.id, 'absent')}
                                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                                  record.status === 'absent' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>غائب</span>
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleStatusChange(student.id, 'late')}
                                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                                  record.status === 'late' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>متأخر</span>
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleStatusChange(student.id, 'excused')}
                                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                                  record.status === 'excused' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'
                                }`}
                              >
                                <Heart className="w-3.5 h-3.5" />
                                <span>بعذر</span>
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <input 
                              type="text" 
                              placeholder="مبررات الغياب/التأخير..."
                              className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs focus:outline-none w-full max-w-sm focus:border-indigo-500 text-slate-800"
                              value={record.notes}
                              onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            />
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-slate-550">
                            <div className="flex items-center gap-2">
                              <span>غ: <strong className="text-slate-800">{stats.count}</strong></span>
                              <span>بعذر: <strong className="text-slate-700">{stats.excusedCount}</strong></span>
                              {hasWarning && (
                                <span className="text-[9px] bg-red-50 text-red-700 border border-red-100 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                                  <AlertTriangle className="w-2.5 h-2.5 text-red-650" />
                                  إنذار!
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {activeStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 bg-slate-50/20 text-center text-slate-400 text-xs font-bold">
                          لم يتم قيد أي طلاب نشطين في هذا الصف التعليمي حتى الآن.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {activeStudents.length > 0 && (
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition hover:cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    حفظ وتأكيد كشف الحضور بـ SQLite
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY ATTENDANCE MATRIX LEDGER */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* Month selector controls bar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:max-w-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-bold shrink-0">السنة:</span>
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(Number(e.target.value))}
                >
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-bold shrink-0">الشهر المستهدف:</span>
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                >
                  {arabicMonths.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                type="button"
                onClick={handleExportMonthly}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                تصدير السجل الشهري للـ Excel
              </button>
              <button 
                type="button"
                onClick={handlePrintMonthly}
                className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-xl text-xs font-bold hover:cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                طباعة السجل الرسمي المعتمد
              </button>
            </div>
          </div>

          {/* Monthly Matrix view sheet */}
          <div ref={monthlyPrintRef} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden flex flex-col print:p-8">
            {/* Yemen Ministry Header */}
            <div className="border-b-2 border-slate-300 pb-4 mb-4 text-xs font-bold text-slate-700">
              <div className="flex justify-between items-center">
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">الجمهورية اليمنية - وزارة التربية والتعليم</p>
                  <p className="text-xs text-slate-800">مكتب التربية والتعليم بمجمع منارة اليمن التعليمي والنموذجي</p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-black text-slate-800">سجل رصد حضور وغياب الطلاب الشهري المرجعي</h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">شهر: {monthlyMonth} / {monthlyYear}</p>
                </div>
                <div className="text-left text-[10px] text-slate-500 font-sans">
                  <p>الصف: {classrooms.find(c => c.id === selectedClassId)?.name || ''}</p>
                  <p>العام الدراسي: {schoolDatabase.getSettings().currentAcademicYear}</p>
                </div>
              </div>
            </div>

            {/* Custom matrix grid */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-[10px] border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 font-semibold">
                    <th className="border border-slate-200 p-1.5 text-right font-bold w-48 shrink-0">اسم الطالب الكامل</th>
                    {daysArray.map(day => (
                      <th key={day} className="border border-slate-200 p-0.5 text-center font-mono w-6">{day}</th>
                    ))}
                    <th className="border border-slate-200 p-1 text-center font-bold font-sans text-rose-700 w-8">غ</th>
                    <th className="border border-slate-200 p-1 text-center font-bold font-sans text-blue-700 w-8">ع</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudents.map(std => {
                    let totalAbs = 0;
                    let totalExc = 0;

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/50">
                        <td className="border border-slate-200 p-1.5 text-right font-semibold text-slate-800 truncate" title={std.name}>
                          {std.name}
                        </td>
                        {daysArray.map(day => {
                          const dStr = `${monthlyYear}-${String(monthlyMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const record = attendance.find(a => a.studentId === std.id && a.date === dStr);
                          
                          let cellContent = '•';
                          let cellClass = 'text-slate-350';
                          if (record) {
                            if (record.status === 'present') {
                              cellContent = 'ح';
                              cellClass = 'text-emerald-600 font-bold';
                            } else if (record.status === 'absent') {
                              cellContent = 'غ';
                              cellClass = 'text-rose-600 font-extrabold bg-rose-50/40';
                              totalAbs++;
                            } else if (record.status === 'excused') {
                              cellContent = 'أ';
                              cellClass = 'text-blue-500 font-bold';
                              totalExc++;
                            } else if (record.status === 'late') {
                              cellContent = 'ت';
                              cellClass = 'text-amber-500 font-bold';
                            }
                          }
                          return (
                            <td key={day} className={`border border-slate-200 p-0 text-center font-mono font-bold ${cellClass}`}>
                              {cellContent}
                            </td>
                          );
                        })}
                        <td className="border border-slate-200 p-1 text-center font-bold text-rose-700 bg-rose-50/10">{totalAbs}</td>
                        <td className="border border-slate-200 p-1 text-center font-bold text-blue-700 bg-blue-50/10">{totalExc}</td>
                      </tr>
                    );
                  })}
                  {activeStudents.length === 0 && (
                    <tr>
                      <td colSpan={currentMonthDaysCount + 3} className="p-8 text-center text-xs text-slate-400 font-bold bg-slate-50/20">لم يتم قيد أي طلاب بهذا الفصل الدراسي لعرض كشف الغياب الشهري</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Explanatory legend terms */}
            <div className="flex flex-wrap items-center gap-6 text-[9px] text-slate-500 font-semibold border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm text-white text-[7px] flex items-center justify-center font-bold font-mono">ح</span> حضور يومي قائم</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm text-white text-[7px] flex items-center justify-center font-bold font-mono">غ</span> مظهر الغياب بدون عذر</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm text-white text-[7px] flex items-center justify-center font-bold font-mono">أ</span> غياب مبرر بوثيقة عذر إدارية</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm text-white text-[7px] flex items-center justify-center font-bold font-mono">ت</span> تأحر صباحي عن الطابور الرسمي</span>
            </div>

            {/* Formal signature lanes at bottom of monthly grid */}
            <div className="mt-8 grid grid-cols-4 gap-4 text-center text-[10px] font-bold text-slate-650 pt-5 border-t border-dashed border-slate-200 shrink-0 print:block print:space-x-4 print:space-x-reverse">
              <div className="space-y-4 print:inline-block print:w-1/5">
                <p>مربّي ورائد الصف:</p>
                <p className="text-slate-400">....................................</p>
                <p>التوقيع: ..........................</p>
              </div>
              <div className="space-y-4 print:inline-block print:w-1/5">
                <p>الأخصائي الاجتماعي بالمجمع:</p>
                <p className="text-slate-400">....................................</p>
                <p>التوقيع: ..........................</p>
              </div>
              <div className="space-y-4 print:inline-block print:w-1/5">
                <p>وكيل الكنترول شؤون الطلاب:</p>
                <p className="text-slate-400">أ. ....................................</p>
                <p>التوقيع: ..........................</p>
              </div>
              <div className="space-y-4 print:inline-block print:w-1/5">
                <p>مدير مجمع المنارة التربوي:</p>
                <p className="text-slate-800 font-bold">أ. محمد عبد الله الجائفي</p>
                <p>التوقيع والختم: ..........................</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WARNINGS / ABSENCE NOTICES GENERATOR */}
      {activeTab === 'warnings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">مولّد ومطبقة إشعار غياب الطلاب لأولياء الأمور</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">توليد وصياغة وتحضير خطابات الإنذار والمؤاخذة الرسمية الموقرة لولي الأمر لحضور المجمع التعليمي وتفادي اتخاذ قرار الفصل الفعلي.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">اختر الطالب المعني:</label>
                <select
                  required
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none"
                  value={selectedWarnStudentId}
                  onChange={(e) => setSelectedWarnStudentId(e.target.value)}
                >
                  <option value="" disabled>-- اختر طالب من الصف لإنشاء الإشعار --</option>
                  {activeStudents.map(s => {
                    const stats = getAbsenceStats(s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} (غائب {stats.count} مرّات)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">اختيار درجة ومستوى هذا الإشعار:</label>
                <select
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none"
                  value={warnType}
                  onChange={(e) => setWarnType(e.target.value as any)}
                >
                  <option value="warn1">الإشعار الأول لولي الأمر (الغياب تكرر)</option>
                  <option value="warn2">الإشعار الثاني الشديد (دعوة عاجلة للحضور)</option>
                  <option value="final">الإنذار النهائي النهائي بالفصل (آخر فرصة)</option>
                </select>
              </div>

              <div className="pt-5 text-left md:col-span-1">
                <button
                  type="button"
                  disabled={!selectedWarnStudentId}
                  onClick={handlePrintWarning}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-4 h-4 text-white" />
                  طباعة الإشعار والإنذار لولي الأمر
                </button>
              </div>
            </div>
          </div>

          {/* Printable Warning Card */}
          {selectedWarnStudentObj ? (
            <div ref={warningPrintRef} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-2xl mx-auto print:border-0 print:p-0">
              
              {/* official top banner decoration */}
              <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600 rounded-t-3xl print:hidden"></div>

              {/* Header Official letters of Yemen */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
                <div className="text-right text-[11px] font-bold text-slate-800 leading-relaxed space-y-1">
                  <p>الجمهورية اليمنية</p>
                  <p>وزارة التربية والتعليم</p>
                  <p>مكتب التربية بمحافظة: {selectedWarnStudentObj.governorate || 'الأمانة'}</p>
                  <p>مديرية: {selectedWarnStudentObj.district || 'السبعين'}</p>
                  <p className="font-extrabold text-slate-900 text-[11.5px]">مجمع المنارة التعليمي والنموذجي</p>
                </div>
                
                <div className="text-center font-sans">
                  <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-sm text-slate-800 mb-1 mx-auto leading-none">
                    🇾🇪
                  </div>
                  <span className="text-[9px] font-extrabold tracking-widest text-slate-400 block mt-1">الجمهورية اليمنية</span>
                </div>

                <div className="text-left text-[10px] text-slate-550 leading-relaxed font-sans space-y-0.5">
                  <p className="font-mono">التاريخ: {new Date().toLocaleDateString('ar-YE')}</p>
                  <p className="font-mono">رقم القيد: {selectedWarnStudentObj.studentNumber || '389/آلي'}</p>
                  <p className="font-mono">صفحة القيد: {selectedWarnStudentObj.id}</p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="text-right space-y-6">
                
                {/* Warning stamp header */}
                <div className="text-center py-2 bg-slate-900 text-white rounded-xl font-black text-xs relative max-w-xs mx-auto shadow-sm">
                  {warnType === 'warn1' && `⚠️ إشعار غياب روتيني أول لولي الأمر`}
                  {warnType === 'warn2' && `🔴 إنذار غياب عاجل ثاني (استدعاء رسمي)`}
                  {warnType === 'final' && `💀 إنذار نهائي شديد بالفصل والتوقيع على تعهد`}
                </div>

                {/* Salutation */}
                <p className="font-extrabold text-[#D4A017] text-xs underline decoration-[#D4A017]/30 decoration-2 underline-offset-4">
                  الأخ الفاضل الموقر ولي أمر الطالب: {selectedWarnStudentObj.name}
                </p>

                {/* Body depending on notice level */}
                <div className="text-xs text-slate-800 leading-bold space-y-4 font-sans font-medium hover:text-slate-950">
                  {warnType === 'warn1' && (
                    <p className="leading-relaxed">
                      نود إحاطتكم وتنبيهكم الكريم علماً بأن ابنكم الطالب المقيد لدينا بالصف (
                      <strong className="text-slate-950 font-black">{classrooms.find(c => c.id === selectedWarnStudentObj.classId)?.name || 'الصفوف القائمة'}</strong>
                      ) قد تكرر غيابه عن فصول الحضور الصباحية اليومية لعدد (
                      <strong className="text-indigo-805 font-black text-sm">{selectedWarnAbsences.count} أيام</strong>
                      ) بدون تقديم عذر طبي أو وثيقة رسمية تبرر هذا الانقطاع. وبما أن هذا يؤثر جذرياً على تحصيله العلمي، نرجو منكم متابعته فوراً وإلزام الحضور.
                    </p>
                  )}
                  {warnType === 'warn2' && (
                    <p className="leading-relaxed">
                      بموجب قوانين وزارة التربية والتعليم بالجمهورية اليمنية، فإننا نبعث إليكم هذا الإنذار الثاني الشديد لعدم تدارك الغياب السابق، حيث بلغ إجمالي أيام غياب الطالب بشكل متصل/منقطع (
                      <strong className="text-rose-700 font-black text-sm">{selectedWarnAbsences.count} أيام</strong>
                      ). نرجو منكم الحضور بأقرب وقت لمكتب وكيل شؤون الطلاب بالمجمع لمناقشة وضع الطالب وعودته تفادياً لتصعيد الحوكمة الإدارية.
                    </p>
                  )}
                  {warnType === 'final' && (
                    <div className="space-y-3">
                      <p className="leading-relaxed text-rose-700 font-extrabold">
                        تحذير هام ونهائي جداً: تنبيه قبل قرار الفصل النهائي المجمع!
                      </p>
                      <p className="leading-relaxed text-slate-800">
                        نحيطكم علماً بأن الطالب قد واصل كسر قواعد الانضباط وتغيب لعدد (
                        <strong className="text-rose-705 font-black text-sm">{selectedWarnAbsences.count} أيام</strong>
                        ) وبذلك استحق قرار الفصل الإداري في سجلات المجمع. ولم يتم إلغاء أو تفادي القرار الفعلي إلا في حال حضوركم شخصياً في موعد لا يتجاوز (48 ساعة) من تاريخه، للتوقيع على التزام وتعهد خطي رسمي لضمان الانتظام.
                      </p>
                    </div>
                  )}

                  <p className="pt-2 font-bold text-[11px] text-slate-900 border-t border-slate-100 italic">
                    «شاكرين لكم حسن تعاونكم وتفهمكم الواعي لدور التربية الرصينة في تنشئة جيل الغد اليمني الصاعد»
                  </p>
                </div>

                {/* Sub-sign stamp details for formal school alerts */}
                <div className="pt-8 grid grid-cols-3 text-center text-[10px] font-bold text-slate-700 gap-4 shrink-0 print:block print:space-x-3 print:space-x-reverse print:pt-6">
                  <div className="space-y-4 print:inline-block print:w-1/4">
                    <p>رائد الصف / المعلم:</p>
                    <p className="text-slate-400">.................................</p>
                    <p>التوقيع: .....................</p>
                  </div>
                  <div className="space-y-4 print:inline-block print:w-1/4">
                    <p>الأخصائي الاجتماعي المرشد:</p>
                    <p className="text-slate-400">.................................</p>
                    <p>التوقيع: .....................</p>
                  </div>
                  <div className="space-y-4 print:inline-block print:w-1/4">
                    <p>مدير مجمع المنارة التربوي:</p>
                    <p className="text-slate-800 font-extrabold">أ. محمد عبد الله الجائفي</p>
                    <p>الختم الرسمي للمجمع والتوقيع:</p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-50 text-slate-400 text-center text-xs font-bold rounded-2xl border border-dashed border-slate-200">
              يرجى اختيار الطالب المعني لعرض كشف وصياغة التحذير الخاص به.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BEHAVIOR AND REGULARITY EVALUATION CARD */}
      {activeTab === 'behavior' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: list of active indicators for grading (7 cols) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm xl:col-span-7">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">استمارة تقييم السلوك والمواظبة اليومية</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">رصد ٢٠ مؤشر رسمي لدرجات السلوك حسب تعليمات وزاة التربية اليمنية</p>
              </div>
              {evalNotification && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 animate-pulse">
                  {evalNotification}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveBehaviorEval} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">اختر الطالب:</label>
                  <select
                    required
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
                    value={selectedEvalStudentId}
                    onChange={(e) => setSelectedEvalStudentId(e.target.value)}
                  >
                    <option value="" disabled>-- اختر طالب للتقييم --</option>
                    {activeStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">الفصل الدراسي البنّاء:</label>
                  <select
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none font-bold"
                    value={evalSemester}
                    onChange={(e) => setEvalSemester(e.target.value as any)}
                  >
                    <option value="first">الفصل الدراسي الأول (تقييم فترات)</option>
                    <option value="second">الفصل الدراسي الثاني (الحصيلة النهائية)</option>
                    <option value="second_round">الملحق والكنترول الخاص</option>
                  </select>
                </div>
              </div>

              {/* Scrollable container of the 20 official questions */}
              <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                {YEMENI_BEHAVIOR_INDICATORS.map((ind, index) => {
                  const currentGrade = evalMarks[ind.id] || 5;
                  return (
                    <div key={ind.id} className="flex items-start justify-between gap-4 p-3 bg-slate-50/55 hover:bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-indigo-500 font-bold block">مؤشر رقم {index + 1}:</span>
                        <p className="text-slate-800 font-bold leading-relaxed">{ind.text}</p>
                      </div>
                      
                      <div className="shrink-0 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-bold max-sm:hidden">العلامة:</span>
                        <select
                          className="bg-white border border-slate-300 rounded-lg py-1 px-2 text-xs font-black text-indigo-600 focus:outline-none"
                          value={currentGrade}
                          onChange={(e) => handleMarkChange(ind.id, Number(e.target.value))}
                        >
                          <option value={5}>5 (ممتاز جداً)</option>
                          <option value={4}>4 (جيد جداً)</option>
                          <option value={3}>3 (متوسط)</option>
                          <option value={2}>2 (مقبول ضعيف)</option>
                          <option value={1}>1 (مخالف ومقصر)</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">مرئيات وتوصيات الأخصائي الاجتماعي المكتوبة:</label>
                <textarea
                  rows={2}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="ملاحظات توثيقية إضافية، مثل كسر الطالب للعزلة، التزامه المتنامي، حضور اجتماعات أولياء الأمور..."
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="text-right text-xs">
                  <span className="text-slate-500 block">حصيلة الدرجات المؤقتة:</span>
                  <span className="font-extrabold text-[#D4A017] text-sm font-mono">{calculatedEvalTotal} / 100</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">(التقدير اللفظي: {getCalculatedBehaviorGrade(calculatedEvalTotal)})</span>
                </div>
                
                <button
                  type="submit"
                  disabled={!selectedEvalStudentId}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:cursor-pointer transition disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  حفظ ورصد الاستمارة وتوقيع الكلاس
                </button>
              </div>
            </form>
          </div>

          {/* Right panel: Printable Card layout (5 cols) */}
          <div className="xl:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm shrink-0 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">معاينة ورقة بطاقة السلوك للطباعة:</span>
              <button
                type="button"
                disabled={!selectedEvalStudentId}
                onClick={handlePrintBehavior}
                className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                طباعة البطاقة الرسمية
              </button>
            </div>

            {selectedStudentObj ? (
              <div ref={behaviorPrintRef} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-right print:border-0 print:p-0 font-sans max-w-sm mx-auto">
                <div className="border border-slate-200 p-5 rounded-2xl relative space-y-4">
                  {/* Yemeni logo header line */}
                  <div className="text-center border-b-2 border-slate-900 pb-3 mb-3">
                    <div className="flex justify-between items-center text-[8px] font-bold text-slate-500">
                      <span>الجمهورية اليمنية</span>
                      <span>وزارة التربية والتعليم</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 mt-2">مجمع المنارة التعليمي والنموذجي الحائز للألقاب</h4>
                    <span className="text-[9px] text-[#D4A017] block font-semibold mt-1">بطاقة تقويم السلوك والمواظبة - الفصل {evalSemester === 'first' ? 'الأول' : 'الثاني'}</span>
                  </div>

                  {/* Student mini passport layout */}
                  <div className="flex gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="w-16 h-16 rounded-xl bg-slate-250 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                      {selectedStudentObj.photo || selectedStudentObj.avatar ? (
                        <img 
                          src={selectedStudentObj.photo || selectedStudentObj.avatar} 
                          alt="Student Avatar" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="text-[10px] space-y-0.5 text-slate-700 font-bold truncate">
                      <p className="font-extrabold text-slate-950 text-xs truncate" title={selectedStudentObj.name}>{selectedStudentObj.name}</p>
                      <p className="font-mono text-[9px] text-slate-450">الهوية: {selectedStudentObj.nationalId}</p>
                      <p>الصف: {classrooms.find(c => c.id === selectedStudentObj.classId)?.name || ''}</p>
                      <p>العام: {evalAcademicYear}</p>
                    </div>
                  </div>

                  {/* Marks breakdowns */}
                  <div className="space-y-2 text-[10px] py-1 border-t border-b border-dashed border-slate-200 text-slate-650 leading-relaxed font-semibold">
                    <div className="flex justify-between">
                      <span>إجمالي بنود السلوك والمواظبة (20 بند):</span>
                      <strong className="text-slate-900 font-mono">100 درجة</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>الدرجة الحاصل عليها الطالب فعلياً:</span>
                      <strong className="text-indigo-650 font-mono text-sm">{calculatedEvalTotal} / 100</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>التقدير العام المعتمد بوزارة التعليم:</span>
                      <strong className="text-emerald-600 font-bold">{getCalculatedBehaviorGrade(calculatedEvalTotal)}</strong>
                    </div>
                    {evalNotes && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="block text-[8px] text-slate-400">ملاحظة المرشد الطلابي:</span>
                        <p className="text-slate-755 leading-relaxed italic text-[9px]">« {evalNotes} »</p>
                      </div>
                    )}
                  </div>

                  {/* Stamp space */}
                  <div className="text-center pt-2 space-y-1 select-none">
                    <p className="text-[9px] text-slate-400">ختم الإدارة للمواظبة وضابط السلوك</p>
                    <div className="w-16 h-16 border-2 border-dashed border-indigo-400/40 rounded-full flex items-center justify-center mx-auto text-[8px] font-black text-indigo-400/50 rotate-12 bg-indigo-50/10">
                      مجمع المنارة
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-2 text-center text-[8px] font-extrabold text-slate-500 pt-3 border-t border-slate-150 shrink-0">
                    <div>
                      <p>الأخصائي الاجتماعي المرشد:</p>
                      <p className="text-slate-400 block text-[7px] mt-1">........................................</p>
                    </div>
                    <div>
                      <p>مدير مجمع المنارة التربوي:</p>
                      <p className="text-slate-800 font-extrabold text-[8.5px]">أ. محمد عبد الله الجائفي</p>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 text-slate-400 text-center text-xs font-bold rounded-2xl border border-dashed border-slate-200">
                يرجى رصد بطاقة الطالب لعرض معاينة البطاقة.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
