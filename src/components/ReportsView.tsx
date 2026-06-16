/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { mockDb } from '../db/mockDb';
import { useCustomPrint } from '../hooks/useCustomPrint';
import { 
  Student, 
  Classroom, 
  Subject, 
  Grade, 
  Attendance, 
  FeeType, 
  FeePayment, 
  SchoolSettings 
} from '../types';
import { 
  FileText, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  Users, 
  CheckCircle, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  PieChart, 
  ShieldAlert,
  Coins,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

interface ReportsViewProps {
  currentUser: any;
  initialReportType?: ReportType;
  key?: any;
}

type ReportType = 'academic' | 'attendance' | 'financial' | 'unified';

export default function ReportsView({ currentUser, initialReportType = 'unified' }: ReportsViewProps) {
  // DB States
  const [students, setStudents] = useState<Student[]>(mockDb.getStudents());
  const [classrooms, setClassrooms] = useState<Classroom[]>(mockDb.getClassrooms());
  const [subjects, setSubjects] = useState<Subject[]>(mockDb.getSubjects());
  const [grades, setGrades] = useState<Grade[]>(mockDb.getGrades());
  const [attendances, setAttendances] = useState<Attendance[]>(mockDb.getAttendances());
  const [feeTypes, setFeeTypes] = useState<FeeType[]>(mockDb.getFeeTypes());
  const [payments, setPayments] = useState<FeePayment[]>(mockDb.getFeePayments());
  const [settings, setSettings] = useState<SchoolSettings>(mockDb.getSettings());

  // Component States
  const [reportType, setReportType] = useState<ReportType>(initialReportType);

  React.useEffect(() => {
    if (initialReportType) {
      setReportType(initialReportType);
    }
  }, [initialReportType]);

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  
  // Printing ref and hook
  const reportPrintRef = useRef<HTMLDivElement>(null);
  const handlePrint = useCustomPrint(reportPrintRef);

  const handleExportOfficialPDF = () => {
    const element = reportPrintRef.current;
    if (!element) return;
    
    // Apply official layout class before printing
    element.classList.add('pdf-official-mode');
    
    // Trigger print
    handlePrint();
    
    // Remove the class after print execution begins
    setTimeout(() => {
      element.classList.remove('pdf-official-mode');
    }, 1000);
  };

  // Recalculate / refresh mock data from SQLite mockup
  const handleRefreshData = () => {
    setStudents(mockDb.getStudents());
    setClassrooms(mockDb.getClassrooms());
    setSubjects(mockDb.getSubjects());
    setGrades(mockDb.getGrades());
    setAttendances(mockDb.getAttendances());
    setFeeTypes(mockDb.getFeeTypes());
    setPayments(mockDb.getFeePayments());
    setSettings(mockDb.getSettings());
  };

  const handleExportToExcel = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM so Excel opens it with Arabic text correctly
    
    // Add document headers
    csvContent += `نظام منارة لإدارة المدارس - تقرير إحصائي رسمي\r\n`;
    csvContent += `عنوان التقرير: ;${
      reportType === 'unified' ? 'التقرير الإداري الإحصائي الموحد للمدرسة' :
      reportType === 'academic' ? 'تقرير التحصيل العلمي والأداء الأكاديمي الشامل' :
      reportType === 'attendance' ? 'تقرير الحضور والإنضباط المدرسي الشامل' :
      'التقرير المالي وعوائد الرسوم الدراسية'
    }\r\n`;
    csvContent += `تاريخ التصدير: ;${formattedToday}\r\n`;
    csvContent += `العام الإحصائي الدراسي: ;${settings.currentAcademicYear}\r\n`;
    csvContent += `الموقع الجغرافي: ;اليمن - محافظة ${settings.governorate} - مديرية ${settings.district}\r\n\r\n`;

    if (reportType === 'unified') {
      // Headers
      csvContent += `اسم الفصل الدراسي;المرحلة التعليمية;عدد المقيدين بالفصل;متوسط التحصيل العلمي;نسبة النجاح %;معدل الانضباط اليومي %;المبالغ المحصلة (ر.ي);المبالغ المتبقية كذمم جارية (ر.ي)\r\n`;
      classroomSummaries.forEach(cs => {
        csvContent += `"${cs.name}";"${cs.stage === 'elementary' ? 'أساسي (ابتدائي)' : 'ثانوي'}";"${cs.studentCount}";"${cs.averageGrade}";"${cs.passRate}%";"${cs.attendanceRate}%";"${cs.collectedFees.toLocaleString()}";"${cs.remainingFees.toLocaleString()}"\r\n`;
      });
      csvContent += `\r\nإجمالي الطلاب المقيدين: ;${filteredStudents.length} طالب\r\n`;
      csvContent += `متوسط التحصيل العلمي العام: ;${academicMetrics.passRate}%\r\n`;
      csvContent += `معدل الانضباط اليومي العام: ;${attendanceMetrics.attendanceRate}%\r\n`;
      csvContent += `نسبة الاستحقاق المالي العام: ;${financialMetrics.collectionRate}%\r\n`;

    } else if (reportType === 'academic') {
      csvContent += `أولاً: أداء المواد والمقررات المنهجية\r\n`;
      csvContent += `اسم المقرر الدراسي;المرحلة والدرجة الموجهة;إجمالي المختبرين;متوسط درجات المادة (من 100);نسبة النجاح النهائي;حالة وفترة تقييم المادة\r\n`;
      subjectBreakdown.forEach(sub => {
        const quality = sub.passRate >= 90 ? 'ممتاز (نموذجي)' : sub.passRate >= 70 ? 'جيد جدا (متزن)' : 'يتطلب خطة علاجية';
        csvContent += `"${sub.name}";"${sub.stage === 'elementary' ? 'أساسي' : 'ثانوي'}";"${sub.totalGraded}";"${sub.avgGrade}";"${sub.passRate}%";"${quality}"\r\n`;
      });

      csvContent += `\r\nثانياً: قائمة أوائل الطلاب والأداء المتميز\r\n`;
      csvContent += `الترتيب;اسم الطالب المتفوق;رقم المقعد;الفصل الدراسي;عدد المواد المقيدة;معدل الامتياز النهائي\r\n`;
      topStudents.forEach((st, idx) => {
        csvContent += `"${idx + 1}";"${st.name}";"${st.seatNumber}";"${st.className}";"${st.subjectsCount}";"${st.average}%"\r\n`;
      });

      if (strugglingStudents.length > 0) {
        csvContent += `\r\nثالثاً: الطلاب المتعثرون دراسياً (يتطلب خطة تقويم وعلاج ومتابعة)\r\n`;
        csvContent += `اسم الطالب المتعثر;الصف الدراسي;المادة والمقرر المتأثر;نوع ودرجة الاختبار دلالياً;الدرجة المحققة / 100;الإجراء الوقائي الموصى به\r\n`;
        strugglingStudents.forEach(st => {
          csvContent += `"${st.studentName}";"${st.className}";"${st.subjectName}";"${st.examName}";"${st.gradeValue}";"تخصيص جلسات علاجية للتقويم المستمر"\r\n`;
        });
      }

    } else if (reportType === 'attendance') {
      csvContent += `أولاً: المقارنة العددية والانتظام اليومي للفصول الدراسية\r\n`;
      csvContent += `اسم الصف الدراسي والشعبة;إجمالي الطلاب المقيدين;نسبة الالتزام والانتظام الفئوي %;مؤشر تقييم لجنة الانضباط المدرسية\r\n`;
      classroomSummaries.forEach(cs => {
        const indicator = cs.attendanceRate >= 95 ? 'منضبط جداً (نموذجي)' : cs.attendanceRate >= 85 ? 'متوسط الانضباط' : 'يتطلب استدعاء خطي عاجل';
        csvContent += `"${cs.name}";"${cs.studentCount} طلاب";"${cs.attendanceRate}%";"${indicator}"\r\n`;
      });

      csvContent += `\r\nثانياً: رصد كشف الغياب المتكرر والطلاب المتعثرين بالانتظام\r\n`;
      csvContent += `اسم الطالب المتغيب;الصف المسجل;أيام الغياب المرصودة;تأخر صباحي مسجل;هاتف ولي الأمر للمتابعة والاشعار;الإجراء الإرشادي المتخذ\r\n`;
      frequentAbsentees.forEach(ab => {
        csvContent += `"${ab.name}";"${ab.className}";"${ab.absentCount} أيام";"${ab.lateCount} مرات";" ${ab.parentPhone}";"إنذار أول خطي رسمي وتحويل للتوجيه"\r\n`;
      });

    } else if (reportType === 'financial') {
      csvContent += `أولاً: الموقف المالي وحالة جباية الرسوم في الفصول والصفوف الدراسية\r\n`;
      csvContent += `اسم الفصل الدراسي;عدد المقيدين النشطين;المقبوضات المحصلة (ر.ي);الذمم المدينة المتبقية (ر.ي);نسبة الإنجاز %;التقييم وسرعة السداد\r\n`;
      classroomSummaries.forEach(cs => {
        const totalExpected = cs.collectedFees + cs.remainingFees;
        const cRate = totalExpected > 0 ? Math.round((cs.collectedFees / totalExpected) * 100) : 100;
        const speed = cRate >= 90 ? 'ملتزم بالكامل' : cRate >= 50 ? 'سداد مستمر متوسط' : 'متعثر السداد - يجب المتابعة';
        csvContent += `"${cs.name}";"${cs.studentCount} طلاب";"${cs.collectedFees.toLocaleString()}";"${cs.remainingFees.toLocaleString()}";"${cRate}%";"${speed}"\r\n`;
      });

      csvContent += `\r\nثانياً: أحدث سندات المقبوضات وصندوق المجمع المعتمدة للترحيل\r\n`;
      csvContent += `رقم المرجع للسند;اسم الطالب المسدد لعقود الرسوم;طريقة وتصنيف السداد بالنظام;تاريخ الدفعة المعززة;المبلغ المقبوض الفردي بالريال اليمني\r\n`;
      payments.slice(0, 30).forEach(pay => {
        const studentObj = students.find(s => s.id === pay.studentId);
        const method = pay.paymentMethod === 'cash' ? 'نقدي بالصندوق كاش' : pay.paymentMethod === 'card' ? 'شبكة الدفع الآلي' : 'تحويل بنكي رسمي معتمد';
        csvContent += `"${pay.referenceNumber}";"${studentObj?.name || 'مجهول القيد'}";"${method}";"${pay.paymentDate}";"${pay.amountPaid.toLocaleString()} ر.ي"\r\n`;
      });
    }

    // Trigger Native Download in Desktop Context
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_منارة_${reportType === 'unified' ? 'الموحد' : reportType === 'academic' ? 'الأكاديمي' : reportType === 'attendance' ? 'الانضباط' : 'المالي'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter computations
  const filteredStudents = useMemo(() => {
    if (selectedClassId === 'all') return students;
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const filteredGrades = useMemo(() => {
    return grades.filter(g => {
      const student = students.find(s => s.id === g.studentId);
      if (!student) return false;
      const matchClass = selectedClassId === 'all' || student.classId === selectedClassId;
      const matchSubject = selectedSubjectId === 'all' || g.subjectId === selectedSubjectId;
      return matchClass && matchSubject;
    });
  }, [grades, students, selectedClassId, selectedSubjectId]);

  // ACADEMIC STATS
  const academicMetrics = useMemo(() => {
    if (filteredGrades.length === 0) return { avgGrade: 0, passCount: 0, failCount: 0, passRate: 0, totalCount: 0 };
    
    let totalScore = 0;
    let pass = 0;
    let fail = 0;

    filteredGrades.forEach(g => {
      totalScore += g.totalGrade;
      // standard passing grade is generally 50%
      if (g.resultStatus === 'pass' || g.totalGrade >= 50) {
        pass++;
      } else {
        fail++;
      }
    });

    const totalCount = filteredGrades.length;
    const avgGrade = totalScore / totalCount;
    const passRate = (pass / totalCount) * 100;

    return {
      avgGrade: Math.round(avgGrade * 10) / 10,
      passCount: pass,
      failCount: fail,
      passRate: Math.round(passRate * 10) / 10,
      totalCount
    };
  }, [filteredGrades]);

  // Top Performing Students (by average grade across all their recorded subjects)
  const topStudents = useMemo(() => {
    const studentGradesGroup: Record<string, { total: number, count: number }> = {};
    
    filteredGrades.forEach(g => {
      if (!studentGradesGroup[g.studentId]) {
        studentGradesGroup[g.studentId] = { total: 0, count: 0 };
      }
      studentGradesGroup[g.studentId].total += g.totalGrade;
      studentGradesGroup[g.studentId].count += 1;
    });

    const parsedList = Object.keys(studentGradesGroup).map(sid => {
      const studentObj = students.find(s => s.id === sid);
      const groupObj = studentGradesGroup[sid];
      const cls = classrooms.find(c => c.id === studentObj?.classId);
      return {
        id: sid,
        name: studentObj?.name || 'طالب مجهول',
        seatNumber: studentObj?.seatNumber || 'بلا',
        studentNumber: studentObj?.studentNumber || 'بلا',
        className: cls?.name || 'غير محدد',
        average: Math.round((groupObj.total / groupObj.count) * 10) / 10,
        subjectsCount: groupObj.count
      };
    });

    return parsedList.sort((a, b) => b.average - a.average).slice(0, 5);
  }, [filteredGrades, students, classrooms]);

  // Failed / Struggling students (who scored below 50 in any exams)
  const strugglingStudents = useMemo(() => {
    const struggling = filteredGrades.filter(g => g.totalGrade < 50 || g.resultStatus === 'fail');
    return struggling.map(g => {
      const studentObj = students.find(s => s.id === g.studentId);
      const sub = subjects.find(su => su.id === g.subjectId);
      const cls = classrooms.find(c => c.id === studentObj?.classId);
      return {
        studentName: studentObj?.name || 'مجهول',
        studentNumber: studentObj?.studentNumber || 'غير محدد',
        className: cls?.name || 'غير محدد',
        subjectName: sub?.name || 'مادة مجهولة',
        gradeValue: g.totalGrade,
        examName: g.examName
      };
    }).slice(0, 5);
  }, [filteredGrades, students, subjects, classrooms]);

  // ATTENDANCE STATS
  const attendanceMetrics = useMemo(() => {
    const studentIds = new Set(filteredStudents.map(s => s.id));
    const relevantAttendance = attendances.filter(a => studentIds.has(a.studentId));

    if (relevantAttendance.length === 0) return { attendanceRate: 100, present: 0, absent: 0, excused: 0, late: 0, total: 0 };

    let pr = 0;
    let ab = 0;
    let ex = 0;
    let lt = 0;

    relevantAttendance.forEach(a => {
      if (a.status === 'present') pr++;
      else if (a.status === 'absent') ab++;
      else if (a.status === 'excused') ex++;
      else if (a.status === 'late') lt++;
    });

    const total = relevantAttendance.length;
    // Late & Present count as attending
    const presentRate = ((pr + lt) / total) * 100;

    return {
      attendanceRate: Math.round(presentRate * 10) / 10,
      present: pr,
      absent: ab,
      excused: ex,
      late: lt,
      total
    };
  }, [filteredStudents, attendances]);

  // Frequent Absentees (absent more than 2 times or excused frequently)
  const frequentAbsentees = useMemo(() => {
    const absenceCounts: Record<string, { absent: number, late: number, excused: number }> = {};
    const studentIds = new Set(filteredStudents.map(s => s.id));
    
    attendances.filter(a => studentIds.has(a.studentId)).forEach(a => {
      if (!absenceCounts[a.studentId]) {
        absenceCounts[a.studentId] = { absent: 0, late: 0, excused: 0 };
      }
      if (a.status === 'absent') absenceCounts[a.studentId].absent += 1;
      else if (a.status === 'late') absenceCounts[a.studentId].late += 1;
      else if (a.status === 'excused') absenceCounts[a.studentId].excused += 1;
    });

    return Object.keys(absenceCounts)
      .map(sid => {
        const studentObj = students.find(s => s.id === sid);
        const parent = mockDb.getParents().find(p => p.id === studentObj?.parentId);
        const cls = classrooms.find(c => c.id === studentObj?.classId);
        const counts = absenceCounts[sid];
        return {
          name: studentObj?.name || 'مجهول',
          className: cls?.name || 'غير محدد',
          absentCount: counts.absent,
          lateCount: counts.late,
          excusedCount: counts.excused,
          parentPhone: parent?.phone || 'مجهول'
        };
      })
      .filter(x => x.absentCount > 0)
      .sort((a, b) => b.absentCount - a.absentCount)
      .slice(0, 5);
  }, [filteredStudents, attendances, students, classrooms]);

  // FINANCIAL STATS
  const financialMetrics = useMemo(() => {
    // Collect students in selected classroom
    const currentClassroomStudents = filteredStudents;
    const currentStudentIds = new Set(currentClassroomStudents.map(s => s.id));

    // Get payments for these students
    const relevantPayments = payments.filter(p => currentStudentIds.has(p.studentId));

    // Let's compute expected amount
    // In our school model, every student is allocated fees based on their classroom level or generic types.
    // Let's calculate expected = total expected tuition across feeTypes per active student
    // Sum of all active fee types multiplied by active student count
    const activeStudentsCount = currentClassroomStudents.filter(s => s.status === 'active').length;
    const sumFeeTypes = feeTypes.reduce((sum, ft) => sum + ft.amount, 0);
    const totalExpected = sumFeeTypes * activeStudentsCount;

    // Actual revenue collected
    const totalCollected = relevantPayments.reduce((sum, p) => sum + p.amountPaid, 0);

    const remainingBalance = Math.max(0, totalExpected - totalCollected);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 100;

    // Compute payment methods
    let cash = 0;
    let card = 0;
    let bank = 0;
    relevantPayments.forEach(p => {
      if (p.paymentMethod === 'cash') cash += p.amountPaid;
      else if (p.paymentMethod === 'card') card += p.amountPaid;
      else if (p.paymentMethod === 'bank_transfer') bank += p.amountPaid;
    });

    return {
      totalExpected,
      totalCollected,
      remainingBalance,
      collectionRate: Math.round(collectionRate * 10) / 10,
      cash,
      card,
      bank,
      paymentsCount: relevantPayments.length
    };
  }, [filteredStudents, payments, feeTypes]);

  // Class-by-Class Table Summary for Unified Display
  const classroomSummaries = useMemo(() => {
    return classrooms.map(cls => {
      const clsStudents = students.filter(s => s.classId === cls.id);
      const studentIds = new Set(clsStudents.map(s => s.id));

      // Performance
      const clsGrades = grades.filter(g => studentIds.has(g.studentId));
      let clsAvg = 0;
      let clsPassRate = 100;
      if (clsGrades.length > 0) {
        const sum = clsGrades.reduce((s, g) => s + g.totalGrade, 0);
        const pass = clsGrades.filter(g => g.totalGrade >= 50 || g.resultStatus === 'pass').length;
        clsAvg = Math.round((sum / clsGrades.length) * 10) / 10;
        clsPassRate = Math.round((pass / clsGrades.length) * 100);
      }

      // Attendance
      const clsAttendance = attendances.filter(a => studentIds.has(a.studentId));
      let clsAttRate = 100;
      if (clsAttendance.length > 0) {
        const present = clsAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
        clsAttRate = Math.round((present / clsAttendance.length) * 100);
      }

      // Finances
      const clsPayments = payments.filter(p => studentIds.has(p.studentId));
      const clsCollected = clsPayments.reduce((s, p) => s + p.amountPaid, 0);
      const classExpected = feeTypes.reduce((s, ft) => s + ft.amount, 0) * clsStudents.filter(s => s.status === 'active').length;
      const classBalance = Math.max(0, classExpected - clsCollected);

      return {
        id: cls.id,
        name: cls.name,
        stage: cls.stage,
        studentCount: clsStudents.length,
        averageGrade: clsAvg,
        passRate: clsPassRate,
        attendanceRate: clsAttRate,
        collectedFees: clsCollected,
        remainingFees: classBalance
      };
    });
  }, [classrooms, students, grades, attendances, payments, feeTypes]);

  // Subject performance breakdown
  const subjectBreakdown = useMemo(() => {
    return subjects.map(sub => {
      const subGrades = grades.filter(g => g.subjectId === sub.id);
      const studentIdsInGrades = subGrades.map(g => g.studentId);
      const filteredStudentsInSub = students.filter(s => studentIdsInGrades.includes(s.id));
      
      let avg = 0;
      let passRate = 100;
      if (subGrades.length > 0) {
        const sum = subGrades.reduce((s, g) => s + g.totalGrade, 0);
        const pass = subGrades.filter(g => g.totalGrade >= 50).length;
        avg = Math.round((sum / subGrades.length) * 10) / 10;
        passRate = Math.round((pass / subGrades.length) * 100);
      }

      return {
        id: sub.id,
        name: sub.name,
        stage: sub.stage,
        avgGrade: avg,
        passRate,
        totalGraded: subGrades.length
      };
    });
  }, [subjects, grades, students]);

  // Charts helper data
  const academicChartData = useMemo(() => {
    return subjectBreakdown.map(s => ({
      name: s.name,
      'متوسط الدرجات': s.avgGrade,
      'نسبة النجاح %': s.passRate
    }));
  }, [subjectBreakdown]);

  const financialChartData = useMemo(() => {
    return [
      { name: 'نقدي (كاش)', value: financialMetrics.cash },
      { name: 'بطاقات دفع', value: financialMetrics.card },
      { name: 'حوالات بنكية', value: financialMetrics.bank }
    ].filter(x => x.value > 0);
  }, [financialMetrics]);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  const attendanceChartData = useMemo(() => {
    return [
      { name: 'حاضر', value: attendanceMetrics.present },
      { name: 'متأخر', value: attendanceMetrics.late },
      { name: 'مستأذن', value: attendanceMetrics.excused },
      { name: 'غائب', value: attendanceMetrics.absent }
    ].filter(x => x.value > 0);
  }, [attendanceMetrics]);

  // Format Date & Time in Arabic Arabic
  const formattedToday = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('ar-YE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="space-y-6" id="reports-view-root">
      
      {/* Upper stats widgets / Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="reports-widgets-grid">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-450 block font-bold">إجمالي السجلات المفحوصة</span>
            <span className="text-xl font-extrabold text-slate-800 font-mono">
              {students.length + grades.length + attendances.length + payments.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-650 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-450 block font-bold">متوسط التحصيل العلمي العام</span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono">
              {academicMetrics.passRate}% <span className="text-xs text-slate-400 font-normal">نجاح</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-650 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-450 block font-bold">معدل الانضباط اليومي العام</span>
            <span className="text-xl font-extrabold text-amber-700 font-mono">
              {attendanceMetrics.attendanceRate}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-650 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-450 block font-bold">تحصيل الاستحقاق المالي</span>
            <span className="text-xl font-extrabold text-sky-700 font-mono">
              {financialMetrics.collectionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Settings / Controls Column bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4" id="reports-filters-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">نظام التقارير الأكاديمية والمالية الشامل</h3>
            <p className="text-[11px] text-slate-450 mt-1">أنشئ تقارير رسمية جاهزة للطباعة وحفظ المستندات الموقعة والختم بصيغة PDF مباشرة.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleRefreshData}
              type="button"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 cursor-pointer"
              title="تحديث البيانات من المستودع"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث البيانات</span>
            </button>
            <button 
              onClick={handlePrint}
              type="button"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="معاينة وطباعة المستند الحالي"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>طباعة مستند التقرير</span>
            </button>
            <button 
              onClick={handleExportOfficialPDF}
              type="button"
              className="px-4 py-1.5 bg-sky-700 hover:bg-sky-850 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer font-sans"
              title="تنسيق الجداول تلقائياً وتصديرها بصيغة PDF للطباعة الرسمية"
              id="btn-export-reports-pdf"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>تصدير PDF (رسمي ومنسق)</span>
            </button>
            <button 
              onClick={handleExportToExcel}
              type="button"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="تصدير  التقرير النشط في جدول إكسل مرتب"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>تصدير إكسل</span>
            </button>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Dynamic Filters form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-slate-600 block text-[11px]">تصنيف المستند (نوع التقرير)</label>
            <select 
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium font-sans"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
            >
              <option value="unified">التقرير الإداري الإحصائي الموحد للمدرسة</option>
              <option value="academic">تقرير التحصيل العلمي والأداء الأكاديمي الشامل</option>
              <option value="attendance">تقرير الحضور والإنضباط المدرسي الشامل</option>
              <option value="financial">التقرير المالي وعوائد الرسوم الدراسية</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 block text-[11px]">الفصل الدراسي والمرحلة</label>
            <select 
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium font-sans"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="all">كافة الفصول والمراحل (الحصيلة العامة)</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.roomNumber})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 block text-[11px]">المقرر الدراسي (المنهج الفردي)</label>
            <select 
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium font-sans"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={reportType !== 'academic'}
            >
              <option value="all">كافة المناهج الدراسية</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.stage === 'elementary' ? 'ابتدائي' : 'ثانوي'})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 block text-[11px]">الفترة / الفصل الدراسي الفرعي</label>
            <select 
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium font-sans"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="all">العام الإحصائي الموحد (الكامل)</option>
              <option value="first">الفصل الدراسي الأول</option>
              <option value="second">الفصل الدراسي الثاني</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Analytics Tab Charts in the UI Dashboard */}
      {reportType !== 'unified' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs" id="reports-dashboard-charts">
          <h4 className="text-xs font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-indigo-500" />
            <span>لوحة التحليلات البيانية الفورية (رسم بياني توضيحي لإدارة النظام)</span>
          </h4>
          <div className="h-64 w-full">
            {reportType === 'academic' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={academicChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip wrapperStyle={{ fontFamily: 'sans-serif', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="متوسط الدرجات" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="نسبة النجاح %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {reportType === 'attendance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold text-slate-500 mb-2">توزيع حضور وغياب الطلاب</span>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={attendanceChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {attendanceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-2 text-xs font-semibold px-4 text-right">
                  <div className="flex items-center justify-between text-slate-800 p-2 bg-slate-50 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>سجل حضور تام (Present):</span>
                    </span>
                    <span className="font-mono text-slate-900">{attendanceMetrics.present}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 p-2 bg-slate-50 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>تأخير مسجل (Late):</span>
                    </span>
                    <span className="font-mono text-slate-900">{attendanceMetrics.late}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 p-2 bg-slate-50 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span>غياب بعذر مقبول (Excused):</span>
                    </span>
                    <span className="font-mono text-slate-900">{attendanceMetrics.excused}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 p-2 bg-slate-50 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span>غياب بدون عذر غير مبرر (Absent):</span>
                    </span>
                    <span className="font-mono text-slate-900">{attendanceMetrics.absent}</span>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'financial' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold text-slate-500 mb-2">توزيع عوائد الصندوق والقبض حسب الطريقة</span>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={financialChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {financialChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} ريال`} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-2 text-xs font-semibold px-4 text-right">
                  <div className="flex items-center justify-between text-slate-800 p-2 bg-slate-50 rounded-lg">
                    <span>مجموع الرسوم المستلمة نقدياً:</span>
                    <span className="font-mono text-emerald-700">{financialMetrics.cash.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 p-2 bg-slate-50 rounded-lg">
                    <span>مجموع الرسوم من نقاط الدفع والشبكات:</span>
                    <span className="font-mono text-indigo-700">{financialMetrics.card.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 p-2 bg-slate-50 rounded-lg">
                    <span>مجموع الرسوم عبر الحوالات البنكية المعتمدة:</span>
                    <span className="font-mono text-amber-700">{financialMetrics.bank.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 p-2 bg-emerald-50 rounded-lg text-emerald-800 font-extrabold">
                    <span>مجموع المبالغ المحصلة المودعة:</span>
                    <span className="font-mono">{financialMetrics.totalCollected.toLocaleString()} ر.ي</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable page workspace simulation */}
      <div className="bg-slate-200/50 p-6 md:p-10 rounded-3xl border border-slate-300 relative overflow-x-auto min-w-[320px]" id="printable-preview-canvas">
        <div className="text-center mb-4 select-none">
          <span className="bg-slate-800 text-slate-300 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
            👁️ معاينة المستند المطبوع (A4 Live Print Sheet Simulation)
          </span>
        </div>

        {/* Start A4 Document Sheet paper */}
        <div 
          ref={reportPrintRef}
          id="official-report-certificate"
          className="bg-white text-slate-900 mx-auto px-10 py-12 rounded-lg shadow-2xl border-4 double border-slate-800 text-right font-sans relative"
          style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm', direction: 'rtl' }}
        >
          {/* Official Ministry Header */}
          <div className="grid grid-cols-3 gap-2 border-b-2 border-slate-800 pb-5 text-[11px] text-slate-800 font-bold leading-normal">
            <div className="space-y-1">
              <p>الجمهورية اليمنية</p>
              <p>وزارة التربية والتعليم</p>
              <p>مكتب التربية بمحافظة: {settings.governorate}</p>
              <p>مدرية: {settings.district}</p>
              <p className="text-indigo-900 font-extrabold">مدرسة {settings.schoolName}</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-1.5">
              {/* Emblem emblem - Golden Eagle of Saladin */}
              <div className="w-14 h-14 rounded-full border border-[#D4A017] bg-amber-50/20 flex flex-col items-center justify-center shadow-xs shrink-0 select-none relative p-1">
                <svg viewBox="0 0 100 100" className="w-10 h-10 text-amber-700 fill-current">
                  <path d="M50 15c-1.5 0-3 1-3.5 2.5l-3 7.5c-4.5 2-8.5 5-11.5 9-1.5 2-3 4-4.5 6.5s-2.5 5-3 7.5L23 54c-.5 1 .5 2 1.5 1.5l6-3.5c1-1 2.5-1.5 4-1 .5 0 1 .5 1.5.5s1-.5 1-1c1-4 3-7.5 6-10.5l4-3.5c.5-.5 1-.5 1-.5s0 1-.5 1.5l-6 6.5c-2.5 2.5-4.5 6-5 9.5 0 1 1 1.5 1.5.5l5.5-5.5c2-2 4.5-3.5 7.5-4 .5 0 .5.5 0 .5l-4.5 4c-2 2-3.5 4.5-4 7.5 0 .5.5 1 1 .5l4.5-4.5c2.5-2.5 5.5-4 9-4.5.5 0 .5.5 0 1l-3 3c-2 2-3 4.5-3.5 7.5 0 .5.5 1 1 .5l3.5-3.5c2.5-2.5 6-4 9.5-4 .5 0 .5.5 0 .5l-2.5 2.5c-2.5 2.5-4 5.5-4.5 9 0 .5.5 1 1 .5l3.5-3.5c3-3 6.5-5 10.5-6h1c.5 0 .5.5 0 1l-1.5 1.5c-2 2-3.5 4.5-4 7.5 0 .5.5 1 1 .5l3-3c3-3 6.5-5 11-5.5.5 0 .5.5 0 1L73 66c-2 2-3.5 5-4.5 8 0 .5.5 1 1 .5l2.5-2.5c3.5-3.5 8-5.5 13-5.5 1 0 1.5 1 1 1.5l-3.5 3.5c-3 3-5 7-6 11 0 .5.5 1 1 .5l2-2c4.5-4.5 10.5-7 16.5-7 1 0 1.5 1.5.5 2l-7 4.5c-4 2.5-7 6-9 10.5l-1 2c-.5 1 .5 2 1.5 1.5l7.5-3c2.5-1 5-2.5 7.5-4s4.5-3.5 6.5-5.5L96 79c1-.5 1.5.5 1 1.5l-3 7.5c-.5 1.5-2 2.5-3.5 2.5m-83 0h74m-37-33l3-7.5c.5-1.5-1-3-2.5-2.5l-7.5 3c-1.5.5-2.5 2-2.5 3.5v1c0 1.5 1 3 2.5 3.5l7.5 1c1.5 0 2.5-1 2.5-2.5z" />
                </svg>
              </div>
              <div className="flex flex-col h-2.5 w-10 rounded-sm overflow-hidden border border-slate-300 shadow-inner">
                <div className="h-1/3 bg-[#CE1126]"></div>
                <div className="h-1/3 bg-white"></div>
                <div className="h-1/3 bg-black"></div>
              </div>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">شعار الجمهورية</p>
            </div>
            <div className="space-y-1 text-left leading-normal">
              <p>تاريخ الإصدار: {formattedToday}</p>
              <p>العام الإحصائي: {settings.currentAcademicYear}</p>
              <p>الفصل المقيد: {selectedSemester === 'all' ? (settings.semester === 'first' ? 'الأول' : 'الثاني') : (selectedSemester === 'first' ? 'الأول' : 'الثاني')}</p>
              <p className="font-mono text-[9px] text-slate-400">كود التحليل الرقمي: MANARA-{new Date().getFullYear()}</p>
            </div>
          </div>

          {/* Title of the Document Report */}
          <div className="text-center my-6 space-y-1.5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight underline decoration-indigo-650 decoration-2 underline-offset-8">
              {reportType === 'unified' && 'التقرير الإداري الإحصائي الموحد للحالة المدرسية العامة'}
              {reportType === 'academic' && 'تقرير التحصيل العلمي والأداء الأكاديمي السنوي الشامل'}
              {reportType === 'attendance' && 'تقرير الانضباط المدرسي وكشوف الغياب والالتزام'}
              {reportType === 'financial' && 'الحصيلة المالية وإيرادات الصندوق وسندات المقبوضات'}
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              {selectedClassId === 'all' ? 'لكافة الفصول والمراحل التعليمية المسكنة بالمدرسة' : `تقرير خاص ومخصص لطلاب: ${classrooms.find(c => c.id === selectedClassId)?.name || ''}`}
            </p>
          </div>

          <p className="text-[11px] text-slate-600 mb-4 font-semibold italic">
            ملاحظة إدارية: يعبر هذا التقرير الإحصائي الصادر عن نظام منارة الموحد عن البيانات المدخلة والموثقة حتى اللحظة لمديرية {settings.district} باليمن للأمين المالي والكادر الإداري لمدير المدرسة.
          </p>

          {/* REPORT SPECIFIC CONTENT BOX 1: UNIFIED STATISTICAL REPORT */}
          {reportType === 'unified' && (
            <div className="space-y-6">
              {/* 1. Statistics grids */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-indigo-600 pr-2 mb-3 bg-slate-50 py-1.5 rounded-r">
                  أولاً: ملخص المؤشرات الإجرائية والعددية العامة
                </h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="border border-slate-200 p-2 rounded-xl bg-slate-50">
                    <span className="block text-[9px] text-slate-500 font-bold">إجمالي الطلاب المقيدين</span>
                    <span className="block text-base font-extrabold text-slate-800 font-mono">{filteredStudents.length} طالب</span>
                  </div>
                  <div className="border border-slate-200 p-2 rounded-xl bg-slate-50">
                    <span className="block text-[9px] text-slate-500 font-bold">نسبة النجاح الأكاديمي العام</span>
                    <span className="block text-base font-extrabold text-emerald-700 font-mono">{academicMetrics.passRate}%</span>
                  </div>
                  <div className="border border-slate-200 p-2 rounded-xl bg-slate-50">
                    <span className="block text-[9px] text-slate-500 font-bold">نسبة الحضور والالتزام</span>
                    <span className="block text-base font-extrabold text-amber-700 font-mono">{attendanceMetrics.attendanceRate}%</span>
                  </div>
                  <div className="border border-slate-200 p-2 rounded-xl bg-slate-50">
                    <span className="block text-[9px] text-slate-500 font-bold">نسبة التحصيل المالي للفصول</span>
                    <span className="block text-base font-extrabold text-blue-700 font-mono">{financialMetrics.collectionRate}%</span>
                  </div>
                </div>
              </div>

              {/* 2. Classrooms distribution table */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-indigo-600 pr-2 mb-2 bg-slate-50 py-1.5 rounded-r">
                  ثانياً: الحالة العددية والإحصائية التفصيلية للفصول والمراحل
                </h3>
                <table className="w-full text-[10px] text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold">
                      <th className="border border-slate-300 p-2 text-right">رقم الفصل الدراسي</th>
                      <th className="border border-slate-300 p-2 text-center">المرحلة</th>
                      <th className="border border-slate-300 p-2 text-center">عدد المقيدين</th>
                      <th className="border border-slate-300 p-2 text-center">متوسط التحصيل العلمي</th>
                      <th className="border border-slate-300 p-2 text-center">معدل الانضباط %</th>
                      <th className="border border-slate-300 p-2 text-left">المحصل المالي (ر.ي)</th>
                      <th className="border border-slate-300 p-2 text-left">المتبقي الذمم (ر.ي)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classroomSummaries.map((cs) => (
                      <tr key={cs.id} className="hover:bg-slate-50 font-medium">
                        <td className="border border-slate-300 p-2">{cs.name}</td>
                        <td className="border border-slate-300 p-2 text-center">
                          {cs.stage === 'elementary' ? 'أساسي (ابتدائي)' : 'ثانوي'}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{cs.studentCount}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono font-bold text-indigo-700">
                          {cs.averageGrade > 0 ? `${cs.averageGrade} (%${cs.passRate})` : 'بلا اختبارات'}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono text-amber-700 font-bold">{cs.attendanceRate}%</td>
                        <td className="border border-slate-300 p-2 text-left font-mono">{cs.collectedFees.toLocaleString()}</td>
                        <td className="border border-slate-300 p-2 text-left font-mono text-rose-700 font-bold">{cs.remainingFees.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 3. Operational overview remarks */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-indigo-600 pr-2 mb-2 bg-slate-50 py-1.5 rounded-r">
                  ثالثاً: ملخص تحليل التوازن المالي ومكامن الاستدامة
                </h3>
                <div className="grid grid-cols-2 gap-4 text-[10px] leading-relaxed text-slate-800 font-medium">
                  <div className="p-3 border border-slate-200 rounded-xl space-y-1 bg-emerald-50/20">
                    <p className="font-extrabold text-emerald-800">📊 الإيرادات والسيولة الكلية بالنقدية المودعة:</p>
                    <p>• إجمالي الميزانية المتوقعة من قسط الرسوم المدرسية: <span className="font-mono text-slate-900 font-bold">{financialMetrics.totalExpected.toLocaleString()} ر.ي</span></p>
                    <p>• المبالغ المودعة بخزينة المحاسبة الفعلية: <span className="font-mono text-emerald-700 font-bold">{financialMetrics.totalCollected.toLocaleString()} ر.ي</span></p>
                    <p>• نسبة التحصيل وإنجاز تحصيل الاستحقاق: <span className="font-semibold text-emerald-800">{financialMetrics.collectionRate}% من المستهدف</span></p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-xl space-y-1 bg-amber-50/20">
                    <p className="font-extrabold text-amber-800">⚠️ التقييم العام للمخاطر وتوصيات اللجان الإدارية:</p>
                    <p>• مؤشر الانضباط العالي يدل على انتظام الكادر وتوزيع الحصص على أمثل وجه.</p>
                    <p>• يوجد عجز مالي قيد المتابعة بقيمة <span className="font-mono text-rose-700 font-bold">{financialMetrics.remainingBalance.toLocaleString()} ر.ي</span> لدى ذمم أولياء الأمور المتأخرة، ينصح بتوجيه إشعارات سداد رقمية.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT SPECIFIC CONTENT BOX 2: ACADEMIC DETAILS */}
          {reportType === 'academic' && (
            <div className="space-y-5">
              {/* Stats overview boxes */}
              <div className="grid grid-cols-3 gap-3 text-center text-[10px] font-bold">
                <div className="border border-slate-200 p-2.5 rounded-xl bg-slate-50/60">
                  <span className="block text-slate-500 mb-0.5">عدد التقييمات العلمية المرصودة</span>
                  <span className="block text-base font-extrabold text-slate-900 font-mono">{academicMetrics.totalCount} اختبار</span>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-xl bg-emerald-50/50">
                  <span className="block text-emerald-805 mb-0.5">الدرجة العامة للنجاح (%)</span>
                  <span className="block text-base font-extrabold text-emerald-700 font-mono">{academicMetrics.passRate}%</span>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-xl bg-indigo-50/50">
                  <span className="block text-indigo-805 mb-0.5">المعدل الحسابي للدرجات</span>
                  <span className="block text-base font-extrabold text-indigo-700 font-mono">{academicMetrics.avgGrade} / 100</span>
                </div>
              </div>

              {/* Subject averages */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-indigo-650 pr-2 mb-2 bg-slate-50 py-1.5 rounded-r">
                  نتائج الأداء للمواد والمقررات المنهجية
                </h3>
                <table className="w-full text-[10px] text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold">
                      <th className="border border-slate-300 p-2">اسم المقرر الدراسي</th>
                      <th className="border border-slate-300 p-2 text-center">المرحلة الموجهة</th>
                      <th className="border border-slate-300 p-2 text-center">إجمالي المختبرين المقيدين</th>
                      <th className="border border-slate-300 p-2 text-center">متوسط درجات المادة</th>
                      <th className="border border-slate-300 p-2 text-center">نسبة النجاح النهائي</th>
                      <th className="border border-slate-300 p-2 text-center">حالة الجودة والتقييم المعياري</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectBreakdown.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50 font-medium">
                        <td className="border border-slate-300 p-2">{sub.name}</td>
                        <td className="border border-slate-300 p-2 text-center">
                          {sub.stage === 'elementary' ? 'أساسي' : 'ثانوي'}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{sub.totalGraded}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono font-bold text-indigo-700">{sub.avgGrade}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700 font-bold">{sub.passRate}%</td>
                        <td className="border border-slate-300 p-2 text-center font-semibold">
                          {sub.passRate >= 90 ? (
                            <span className="text-emerald-700">ممتاز (نموذجي)</span>
                          ) : sub.passRate >= 70 ? (
                            <span className="text-indigo-700">جيد جداً (متزن)</span>
                          ) : (
                            <span className="text-rose-600">يتطلب خطة علاجية</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Honors list */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-indigo-650 pr-2 mb-2 bg-emerald-50 py-1.5 rounded-r flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>قائمة الشرف والامتياز - أوائل الطلاب المقيدين برسم التقرير</span>
                </h3>
                <table className="w-full text-[10px] text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-900 font-extrabold">
                      <th className="border border-slate-300 p-2">اسم الطالب المتفوق</th>
                      <th className="border border-slate-300 p-2 text-center">رقم المقعد</th>
                      <th className="border border-slate-300 p-2 text-center">الفصل الدراسي</th>
                      <th className="border border-slate-300 p-2 text-center">عدد المواد المفحوصة</th>
                      <th className="border border-slate-300 p-2 text-center">معدل الامتياز النهائي</th>
                      <th className="border border-slate-300 p-2 text-center">درجة الاستحقاق والتكريم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 font-medium">
                        <td className="border border-slate-300 p-2 flex items-center gap-2 font-bold text-slate-900">
                          <span className="w-4 h-4 bg-emerald-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{st.name}</span>
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{st.seatNumber}</td>
                        <td className="border border-slate-300 p-2 text-center">{st.className}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{st.subjectsCount}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono text-emerald-700 font-extrabold">{st.average}%</td>
                        <td className="border border-slate-300 p-2 text-center text-emerald-750 font-bold">لوحة الشرف المدرسي الأولى</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Struggling list */}
              {strugglingStudents.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-rose-600 pr-2 mb-2 bg-rose-50 py-1.5 rounded-r flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>قائمة الرصد والإنذار بالضعف الأكاديمي (الطلاب المتعثرون علمياً)</span>
                  </h3>
                  <table className="w-full text-[10px] text-right border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-rose-50 text-rose-900 font-extrabold">
                        <th className="border border-slate-300 p-2">اسم الطالب الموقوف إحصائياً</th>
                        <th className="border border-slate-300 p-2 text-center">الصف الدراسي</th>
                        <th className="border border-slate-300 p-2 text-center">المقرر المتأثر</th>
                        <th className="border border-slate-300 p-2 text-center">الامتحان الدلالي</th>
                        <th className="border border-slate-300 p-2 text-center text-rose-700">الدرجة المحققة / 100</th>
                        <th className="border border-slate-300 p-2 text-center">الإجراء الموصى به</th>
                      </tr>
                    </thead>
                    <tbody>
                      {strugglingStudents.map((st, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 font-medium">
                          <td className="border border-slate-300 p-2 font-bold text-slate-800">{st.studentName}</td>
                          <td className="border border-slate-300 p-2 text-center">{st.className}</td>
                          <td className="border border-slate-300 p-2 text-center font-semibold text-rose-800">{st.subjectName}</td>
                          <td className="border border-slate-300 p-2 text-center">{st.examName}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono text-rose-700 font-bold">{st.gradeValue}</td>
                          <td className="border border-slate-300 p-2 text-center text-amber-700 font-semibold">تخصيص حصص دافعة علاجية</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REPORT SPECIFIC CONTENT BOX 3: ATTENDANCE DETAILS */}
          {reportType === 'attendance' && (
            <div className="space-y-4">
              {/* Main metrics */}
              <div className="grid grid-cols-4 gap-3 text-center text-[10px] font-bold">
                <div className="border border-slate-200 p-2 rounded-xl bg-slate-50">
                  <span className="block text-slate-500 mb-0.5">الحصيلة الإجمالية للحضور</span>
                  <span className="block text-base font-extrabold text-slate-900 font-mono">{attendanceMetrics.total} حصة</span>
                </div>
                <div className="border border-slate-200 p-2 rounded-xl bg-emerald-50">
                  <span className="block text-emerald-805 mb-0.5">الحضور التام / المتأخر</span>
                  <span className="block text-base font-extrabold text-emerald-700 font-mono">{attendanceMetrics.present + attendanceMetrics.late} حصة</span>
                </div>
                <div className="border border-slate-200 p-2 rounded-xl bg-rose-50">
                  <span className="block text-rose-805 mb-0.5">الغياب بدون إجازة رسمية</span>
                  <span className="block text-base font-extrabold text-rose-700 font-mono">{attendanceMetrics.absent} غيابات</span>
                </div>
                <div className="border border-slate-200 p-2 rounded-xl bg-indigo-50">
                  <span className="block text-indigo-805 mb-0.5">النسبة المئوية العامة</span>
                  <span className="block text-base font-extrabold text-indigo-700 font-mono">{attendanceMetrics.attendanceRate}%</span>
                </div>
              </div>

              {/* Attendance by Class table */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-indigo-650 pr-2 mb-2 bg-slate-50 py-1.5 rounded-r">
                  المقارنة الإحصائية لحضور الفصول الدراسية
                </h3>
                <table className="w-full text-[10px] text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold">
                      <th className="border border-slate-300 p-2">اسم الفئة والفصل كود القيد</th>
                      <th className="border border-slate-300 p-2 text-center">عدد المقيدين بالفصل</th>
                      <th className="border border-slate-300 p-2 text-center">نسبة الالتزام والانتظام الفئوي (%)</th>
                      <th className="border border-slate-300 p-2 text-center">الحالة والمؤشر العام</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classroomSummaries.map((cs) => (
                      <tr key={cs.id} className="hover:bg-slate-50 font-medium">
                        <td className="border border-slate-300 p-2">{cs.name}</td>
                        <td className="border border-slate-300 p-2 text-center font-sans font-bold">{cs.studentCount} طلاب</td>
                        <td className="border border-slate-300 p-2 text-center font-mono font-extrabold text-indigo-700">{cs.attendanceRate}%</td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {cs.attendanceRate >= 95 ? (
                            <span className="text-emerald-700">منضبط جداً (متميز)</span>
                          ) : cs.attendanceRate >= 85 ? (
                            <span className="text-slate-700">متوسط الانضباط</span>
                          ) : (
                            <span className="text-amber-700 underline">يتطلب استدعاء خطي</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Urgent Warning list - frequent absentees */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-rose-650 pr-2 mb-2 bg-rose-50 py-1.5 rounded-r flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>شؤون الانضباط الموقفة والطلاب ذوي الغيابات المتكررة</span>
                </h3>
                <table className="w-full text-[10px] text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-rose-50 text-rose-900 font-extrabold">
                      <th className="border border-slate-300 p-2">اسم الطالب بالكامل</th>
                      <th className="border border-slate-300 p-2 text-center">الصف المسكن به</th>
                      <th className="border border-slate-300 p-2 text-center text-rose-700">أيام الغياب المرصودة</th>
                      <th className="border border-slate-300 p-2 text-center text-amber-700">التأخير المسجل (صباياً)</th>
                      <th className="border border-slate-300 p-2 text-center">هاتف ولي الأمر للمتابعة</th>
                      <th className="border border-slate-300 p-2 text-center">الإجراء الإداري اللازم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {frequentAbsentees.map((ab, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 font-medium">
                        <td className="border border-slate-300 p-2 font-bold text-slate-800">{ab.name}</td>
                        <td className="border border-slate-300 p-2 text-center">{ab.className}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono font-bold text-rose-750">{ab.absentCount} أيام</td>
                        <td className="border border-slate-300 p-2 text-center font-mono text-amber-700">{ab.lateCount} مرات</td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{ab.parentPhone}</td>
                        <td className="border border-slate-300 p-2 text-center text-rose-750 font-bold">إنذار أول إداري خطي</td>
                      </tr>
                    ))}
                    {frequentAbsentees.length === 0 && (
                      <tr>
                        <td colSpan={6} className="border border-slate-300 p-3 text-center text-slate-400 font-semibold">
                          لا يوجد حالياً متغيبون بشكل متكرر، مؤشر الانضباط العام ممتاز!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT SPECIFIC CONTENT BOX 4: FINANCIAL DETAILS */}
          {reportType === 'financial' && (
            <div className="space-y-4">
              {/* Financial stats card highlights */}
              <div className="grid grid-cols-3 gap-3 text-center text-[10px] font-bold">
                <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/60">
                  <span className="block text-slate-550 mb-0.5">القيمة المقدرة للرسوم الكلية</span>
                  <span className="block text-base font-extrabold text-indigo-900 font-mono">{financialMetrics.totalExpected.toLocaleString()} ر.ي</span>
                </div>
                <div className="border border-slate-200 p-3 rounded-xl bg-emerald-50/50">
                  <span className="block text-emerald-750 mb-0.5">مجموع المتحصل الفعلي</span>
                  <span className="block text-base font-extrabold text-emerald-700 font-mono">{financialMetrics.totalCollected.toLocaleString()} ر.ي</span>
                </div>
                <div className="border border-slate-200 p-3 rounded-xl bg-rose-50/50">
                  <span className="block text-rose-750 mb-0.5">الذمم الجارية المدنية المتبقية</span>
                  <span className="block text-base font-extrabold text-rose-700 font-mono">{financialMetrics.remainingBalance.toLocaleString()} ر.ي</span>
                </div>
              </div>

              {/* Class-by-Class Table financial collection */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-indigo-650 pr-2 mb-2 bg-slate-50 py-1.5 rounded-r">
                  الموقف المالي ومستويات السداد في الفصول
                </h3>
                <table className="w-full text-[10px] text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold">
                      <th className="border border-slate-300 p-2">اسم الصف الدراسي</th>
                      <th className="border border-slate-300 p-2 text-center">عدد المقيدين النشطين</th>
                      <th className="border border-slate-300 p-2 text-left">المقبوضات المحصلة للحقيبة (ر.ي)</th>
                      <th className="border border-slate-300 p-2 text-left">الذمم المدينة المتأخرة بالريال</th>
                      <th className="border border-slate-300 p-2 text-center">مستوى الإنجاز التحصيلي</th>
                      <th className="border border-slate-300 p-2 text-center">التقييم وسرعة السداد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classroomSummaries.map((cs) => {
                      const totalExpected = cs.collectedFees + cs.remainingFees;
                      const cRate = totalExpected > 0 ? Math.round((cs.collectedFees / totalExpected) * 100) : 100;
                      return (
                        <tr key={cs.id} className="hover:bg-slate-50 font-medium">
                          <td className="border border-slate-300 p-2">{cs.name}</td>
                          <td className="border border-slate-300 p-2 text-center font-sans">{cs.studentCount} طالب</td>
                          <td className="border border-slate-300 p-2 text-left font-mono font-bold text-emerald-800">{cs.collectedFees.toLocaleString()}</td>
                          <td className="border border-slate-300 p-2 text-left font-mono text-rose-700">{cs.remainingFees.toLocaleString()}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono font-extrabold text-indigo-700">{cRate}%</td>
                          <td className="border border-slate-300 p-2 text-center">
                            {cRate >= 90 ? (
                              <span className="text-emerald-700 font-bold">ملتزم بالكامل 🌟</span>
                            ) : cRate >= 50 ? (
                              <span className="text-amber-700 font-semibold">سداد متوسط مستمر</span>
                            ) : (
                              <span className="text-rose-600 font-extrabold">متعثر السداد</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Transactions details ledger excerpt */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 border-r-4 border-indigo-650 pr-2 mb-2 bg-slate-50 py-1.5 rounded-r">
                  أحدث سندات المقبوضات المسجلة بالصندوق المركزي للمنارة
                </h3>
                <table className="w-full text-[10px] text-right border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold">
                      <th className="border border-slate-300 p-2">رقم المرجع للسند</th>
                      <th className="border border-slate-300 p-2 text-right">اسم الطالب المسدد لعهدتة</th>
                      <th className="border border-slate-300 p-2 text-center">طريقة وتصنيف السداد</th>
                      <th className="border border-slate-300 p-2 text-center">تاريخ السداد المقيد</th>
                      <th className="border border-slate-300 p-2 text-left">المبلغ المودع المقبوض بكشف الحساب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 5).map(pay => {
                      const studentObj = students.find(s => s.id === pay.studentId);
                      return (
                        <tr key={pay.id} className="hover:bg-slate-50 font-medium">
                          <td className="border border-slate-300 p-2 font-mono font-semibold">{pay.referenceNumber}</td>
                          <td className="border border-slate-300 p-2">{studentObj?.name || 'مجهول القيد'}</td>
                          <td className="border border-slate-300 p-2 text-center">
                            {pay.paymentMethod === 'cash' ? '💵 نقدي بالصندوق كاش' :
                             pay.paymentMethod === 'card' ? '💳 شبكة الدفع الآلي' :
                             '🏦 تحويل بنكي رسمي'}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{pay.paymentDate}</td>
                          <td className="border border-slate-300 p-2 text-left font-mono font-bold text-emerald-800">{pay.amountPaid.toLocaleString()} ر.ي</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Space separator */}
          <div className="h-6"></div>

          {/* Official Verification Signatures of Yemen School Certification */}
          <div className="border-t-2 border-slate-800 mt-10 pt-6 text-[10px] text-slate-800">
            <div className="grid grid-cols-3 gap-4 text-center leading-relaxed">
              <div className="space-y-4">
                <p className="font-extrabold">المسؤول والمختص المالي</p>
                <div className="h-10"></div>
                <p className="text-slate-500 font-mono text-[9px]">أ. {settings.principalName ? 'رياض العلفي' : 'المحاسب المعتمد'}</p>
                <p className="border-t border-dashed border-slate-300 pt-1 text-[8px] text-slate-400">التوقيع والتحقق</p>
              </div>
              <div className="space-y-4">
                <p className="font-extrabold">وكيل شؤون الطلاب والامتحانات</p>
                <div className="h-10"></div>
                <p className="text-slate-500 font-semibold">{settings.studentAffairsName || 'مسؤول شؤون الامتحانات والمراقبة'}</p>
                <p className="border-t border-dashed border-slate-300 pt-1 text-[8px] text-slate-400">الاعتماد والمطابقة</p>
              </div>
              <div className="space-y-4">
                <p className="font-extrabold">مدير المدرسة والختم الرسمي للمؤسسة</p>
                <div className="w-20 h-20 rounded-full border border-dashed border-sky-400 p-0.5 mx-auto bg-sky-50 text-sky-800/80 font-bold flex items-center justify-center text-[7px] text-center rotate-6 leading-tight select-none">
                  مدرسة {settings.schoolName}<br />
                  مختتم رسمياً<br />
                  تحت إشراف وزارة التربية والتعليم
                </div>
                <p className="text-slate-500 font-bold">أ. {settings.principalName || 'عبد السلام الجابري'}</p>
                <p className="border-t border-dashed border-slate-300 pt-1 text-[8px] text-slate-400">مدير المدرسة والمشرف العام</p>
              </div>
            </div>

            {/* Print Footer notice */}
            <div className="text-center mt-8 text-[8px] text-slate-400 flex items-center justify-between font-semibold">
              <span>طبُع بواسطة: نظام منارة الأكاديمي لإدارة المدارس مبرمج بـ React/TypeScript</span>
              <span>مستند آمن برمز تشفير آلي: {crypto.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase() : 'MAN-B2B2026'}</span>
              <span>مرجعية الأمان: SQLite المدمج</span>
            </div>
          </div>

        </div>
        {/* End A4 Document Sheet paper */}

      </div>

    </div>
  );
}
