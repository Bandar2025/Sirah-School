/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockDb } from '../db/mockDb';
import { Student, Grade, Attendance, Subject, Classroom } from '../types';
import { 
  Sparkles, 
  Brain, 
  ShieldAlert, 
  Send, 
  Bot, 
  User, 
  Award, 
  Activity, 
  CheckCircle, 
  Users, 
  TrendingDown, 
  AlertTriangle,
  Lightbulb,
  ArrowRightLeft,
  BookOpen,
  FileText,
  HelpCircle,
  TrendingUp,
  LineChart
} from 'lucide-react';

interface AIAssistantViewProps {
  currentUser: any;
  initialTab?: 'dropout' | 'recommend' | 'chatbot' | 'teacher';
}

export default function AIAssistantView({ currentUser, initialTab = 'dropout' }: AIAssistantViewProps) {
  const [students] = useState<Student[]>(mockDb.getStudents());
  const [grades] = useState<Grade[]>(mockDb.getGrades());
  const [attendances] = useState<Attendance[]>(mockDb.getAttendances());
  const [classrooms] = useState<Classroom[]>(mockDb.getClassrooms());
  const [subjects] = useState<Subject[]>(mockDb.getSubjects());

  const [activeTab, setActiveTab] = useState<'dropout' | 'recommend' | 'chatbot' | 'teacher'>(initialTab);

  // tab 1 states: dropout analytics
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // tab 2 states: academic recommendations
  const [recommendStudentId, setRecommendStudentId] = useState(students[0]?.id || '');
  const [isGeneratingRec, setIsGeneratingRec] = useState(false);
  const [recResult, setRecResult] = useState<any>(null);

  // tab 3 states: school chatbot
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    { sender: 'bot', text: 'مرحباً بك في مساعد المنارة الذكي للتعليم. أنا هنا للإجابة على جميع تساؤلاتك حول الطلاب، جداول المواد، الرسوم الدراسية، والسياسات التعليمية في الجمهورية اليمنية. كيف يمكنني مساعدتك اليوم؟', time: 'الآن' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // tab 4 states: teacher assistant notes
  const [noteSubjectId, setNoteSubjectId] = useState(subjects[0]?.id || '');
  const [noteStudentId, setNoteStudentId] = useState(students[0]?.id || '');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [noteResult, setNoteResult] = useState<any>(null);

  // Analysis Logic for Student Performance and Dropout Risk
  const runDropoutAnalysis = () => {
    if (!selectedStudentId) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      const student = students.find(s => s.id === selectedStudentId);
      if (!student) {
        setIsAnalyzing(false);
        return;
      }

      // 1. Calculate Attendance metrics
      const stdAttendances = attendances.filter(a => a.studentId === selectedStudentId);
      const absentCount = stdAttendances.filter(a => a.status === 'absent').length;
      const lateCount = stdAttendances.filter(a => a.status === 'late').length;
      const excuseCount = stdAttendances.filter(a => a.status === 'excused').length;
      const totalDays = stdAttendances.length || 1;
      const absentRate = (absentCount / totalDays) * 100;

      // 2. Calculate Academics metrics
      const stdGrades = grades.filter(g => g.studentId === selectedStudentId);
      const examScores = stdGrades.map(g => g.totalGrade);
      const averageScore = examScores.length > 0 
        ? Math.round(examScores.reduce((sum, s) => sum + s, 0) / examScores.length) 
        : 65; // default fallback if no grades

      const passedExams = stdGrades.filter(g => g.resultStatus === 'pass').length;
      const totalExams = stdGrades.length || 1;
      const failRate = ((totalExams - passedExams) / totalExams) * 100;

      // 3. Drop risk evaluation score (out of 100)
      // Attendance weight: 45%, Academic weight: 45%, Social/Medical details weight: 10%
      let riskScore = 0;
      
      // Attendance contribution
      riskScore += Math.min(absentRate * 2.5, 45); // up to 45 pts if absents are high
      
      // Academic contribution
      const scoreDefect = Math.max(0, 100 - averageScore);
      riskScore += Math.min(scoreDefect * 0.6, 45); // up to 45 pts if grades are poor
      
      // Medical/Address contribution
      if (student.medicalDetails && student.medicalDetails !== 'لا توجد - سليم' && student.medicalDetails !== 'لا توجد') {
        riskScore += 7;
      }
      if (student.address.includes('بعيد') || student.address.includes('شمال')) {
        riskScore += 3;
      }

      riskScore = Math.min(Math.round(riskScore), 100);

      // Determine Category
      let level: 'low' | 'medium' | 'high' = 'low';
      let levelLabel = 'ضئيل / آمن';
      let levelColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
      let levelBarColor = 'bg-emerald-500';

      if (riskScore > 30) {
        level = 'medium';
        levelLabel = 'متوسط / يحتاج متابعة';
        levelColor = 'text-amber-600 bg-amber-50 border-amber-100';
        levelBarColor = 'bg-amber-500';
      }
      if (riskScore > 65) {
        level = 'high';
        levelLabel = 'مرتفع جداً / خطر تسرب';
        levelColor = 'text-rose-600 bg-rose-50 border-rose-100';
        levelBarColor = 'bg-rose-500';
      }

      // Create recommendation bulletin
      const recommendations: string[] = [];
      if (level === 'high') {
        recommendations.push('توجيه استدعاء رسمي فوري لولي الأمر لبحث مبررات الغياب وتأخر التحصيل الأكاديمي.');
        recommendations.push('إدراج الطالب فوراً في فصول الدعم المدرسي الإضافية لتعويض المواد المصيرية.');
        recommendations.push('تكليف الأخصائي الاجتماعي بالمدرسة بفحص حالة الطالب النفسية والظروف المعيشية.');
      } else if (level === 'medium') {
        recommendations.push('إخطار ولي الأمر تلقائياً عبر رسالة لمتابعة تكرار أيام الغياب الأسبوعية.');
        recommendations.push('تمهيد خطة دعم خفيفة داخل الحصة عبر توفير اهتمام دقيق من معلمي اللغة والرياضيات.');
        recommendations.push('المراقبة المستمرة لمستوى الطالب في الاختبارات الدورية القادمة.');
      } else {
        recommendations.push('تقديم شهادة تقدير وتشجيع من مدير المدرسة للحفاظ على انتظام الحضور البارز.');
        recommendations.push('ترشيح الطالب للمشاركة في الأنشطة الطلابية والمنافسات العلمية على مستوى المديرية.');
      }

      setAnalysisResult({
        studentName: student.name,
        classroom: classrooms.find(c => c.id === student.classId)?.name || 'غير محدد',
        image: student.avatar,
        absentRate: Math.round(absentRate),
        absentCount,
        lateCount,
        averageScore,
        gradeCount: examScores.length,
        riskScore,
        level,
        levelLabel,
        levelColor,
        levelBarColor,
        recommendations,
        timestamp: new Date().toLocaleTimeString('ar-YE')
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  // Recommendations Logic based on detailed Subject breakdown
  const runAcademicRecommendations = () => {
    if (!recommendStudentId) return;
    setIsGeneratingRec(true);
    setRecResult(null);

    setTimeout(() => {
      const student = students.find(s => s.id === recommendStudentId);
      if (!student) {
        setIsGeneratingRec(false);
        return;
      }

      const parent = mockDb.getParents().find(p => p.id === student.parentId);
      const studentGrades = grades.filter(g => g.studentId === recommendStudentId);
      
      // Calculate weak subjects
      const weakSubjects: string[] = [];
      const strongSubjects: string[] = [];

      studentGrades.forEach(g => {
        const sub = subjects.find(s => s.id === g.subjectId);
        if (sub) {
          if (g.totalGrade < 65) {
            weakSubjects.push(sub.name);
          } else if (g.totalGrade >= 85) {
            strongSubjects.push(sub.name);
          }
        }
      });

      // Default rules just in case
      if (weakSubjects.length === 0) weakSubjects.push('العلوم العامة (تحتاج تركيز طفيف)');
      if (strongSubjects.length === 0) strongSubjects.push('اللغة العربية والإنشاء');

      setRecResult({
        studentName: student.name,
        parentName: parent?.name || 'ولي الأمر',
        parentPhone: parent?.phone || 'غير محدد',
        strongSubjects,
        weakSubjects,
        recommendations: [
          `تخصيص ساعة مراجعة مخصصة أسبوعية بالتعاون مع المعلمين في مادة: ${weakSubjects.join(' و ')}.`,
          `استغلال المهارات الاستثنائية للطالب في مادة ${strongSubjects[0]} لتعزيز ثقته عبر تكليفه بشرح أفكار مبسطة للزملاء.`,
          `تفعيل المتابعة الأسرية اليومية لتأكيد حل الواجبات المنزلية، والاتصال مع والد الطالب هاتفياً برقم (${parent?.phone || 'غير مدرج'}).`
        ]
      });
      setIsGeneratingRec(false);
    }, 1000);
  };

  // chatbot simulation answering based on actual db statistics
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const timeStr = new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
    
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = '';
      const prompt = userMsg.toLowerCase();

      if (prompt.includes('طالب') || prompt.includes('طلاب') || prompt.includes('طالبة')) {
        const count = students.length;
        const active = students.filter(s => s.status === 'active').length;
        botResponse = `لدينا حالياً عدد **${count}** طالباً مقيداً في قاعدة البيانات بالمدرسة، من بينهم **${active}** طلاب نشطين وفي القيد الصفي، والبقية موزعين بين طلاب منقولين وخريجين ومؤرشفين.`;
      } else if (prompt.includes('معلم') || prompt.includes('مدرس') || prompt.includes('معلمين') || prompt.includes('كادر')) {
        const count = mockDb.getTeachers().length;
        botResponse = `يبلغ كادر التدريس المسجل بالنظام حالياً **${count}** معلمين متخصصين بالمواد الأكاديمية للمراحل الدراسية المختلفة.`;
      } else if (prompt.includes('فصل') || prompt.includes('صفوف') || prompt.includes('مرحلة')) {
        const count = classrooms.length;
        botResponse = `النظام يدير حالياً **${count}** فصول دراسية مقسمة على مراحل التعليم المتوافقة مع هيكلة وزارة التربية والتعليم بالجمهورية اليمنية (ابتدائي، متوسط، ثانوي).`;
      } else if (prompt.includes('رسوم') || prompt.includes('مالية') || prompt.includes('فلوس') || prompt.includes('صندوق')) {
        const total = mockDb.getFeePayments().reduce((sum, p) => sum + p.amountPaid, 0);
        botResponse = `إجمالي الرسوم المدرسية المحصلة وتغذية الخزينة تبلغ **${total.toLocaleString()} ريال يمني** مع توفير إيصالات قبض كاملة معمدة باسم المدرسة لكافة أولياء الأمور.`;
      } else if (prompt.includes('جدول') || prompt.includes('حصة') || prompt.includes('حصص')) {
        const count = mockDb.getSchedules().length;
        botResponse = `تم إدراج وجدولة **${count}** حسم حصص دراسية وإسناد بالجدول المدرسي العام للفصول، مع حوكمة ذكية تمنع تعارض الحصص للمعلم أو الغرفة الصفيّة في نفس التوقيت!`;
      } else if (prompt.includes('اليمن') || prompt.includes('محافظة') || prompt.includes('وزارة')) {
        botResponse = `تم تخصيص وصقل نظام المنارة خصيصاً ليتناسب مع اشتراطات وزارة التربية والتعليم في اليمن، مع توفير دعم لأكثر من 19 محافظة يمنية في سجلات الطلاب وطباعة الاستمارات الرسمية المتوافقة تماماً.`;
      } else if (prompt.includes('سجل') || prompt.includes('أمان') || prompt.includes('sqlite')) {
        const logsCount = mockDb.getAuditLogs().length;
        botResponse = `النظام يتمتع بوحدة أمنية وحوكمة صارمة تسجل أدق العمليات؛ تم حصر **${logsCount}** إجراء تدقيق عمليات بالنظام لحفظ شفافية السجلات المحلية.`;
      } else {
        botResponse = 'شكراً لسؤالك! أنا مساعد ذكي متصل بقاعدة بيانات المنارة الأكاديمية الشاملة. يمكنني إفادتك بإحصاءات الطلاب، أعداد المعلمين، الرسوم المحصلة، تتبع جداول الحصص أو تحليل أية مدخلات بالمدرسة. هل ترغب في معرفة المزيد؟';
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse, time: timeStr }]);
    }, 700);
  };

  // generate teacher remarks
  const runTeacherRemarks = () => {
    setIsGeneratingNote(true);
    setNoteResult(null);

    setTimeout(() => {
      const student = students.find(s => s.id === noteStudentId);
      const subject = subjects.find(s => s.id === noteSubjectId);
      if (!student || !subject) {
        setIsGeneratingNote(false);
        return;
      }

      // calculate rating
      const studentGrades = grades.find(g => g.studentId === student.id && g.subjectId === subject.id);
      const score = studentGrades ? studentGrades.totalGrade : 75;

      let estimation = 'جيد';
      let textNote = '';
      if (score >= 90) {
        estimation = 'ممتاز (تفوق بارز)';
        textNote = `يُظهر الطالب ${student.name} تفوقاً استثنائياً وفهماً عميقاً لمقررات مادة ${subject.name}. لديه تفاعل رائع ونشط مع زملائه المعلمين، ونوصي بشدة بالاستمرار على هذا النهج لضمان مركزه بين أوائل طلاب الجمهورية.`;
      } else if (score >= 75) {
        estimation = 'جيد جداً (تحصيل جيد)';
        textNote = `يُبدي الطالب ${student.name} انضباطاً واهتماماً لافتاً في مادة ${subject.name}. يستوعب المفاهيم الأساسية بيسر، ونقترح عليه صقل مهاراته بشكل أدق في الواجبات المنزلية للحصول على التقدير النهائي الكامل.`;
      } else if (score >= 50) {
        estimation = 'مقبول (يحتاج صقل ومتابعة)';
        textNote = `أداء الطالب ${student.name} في مادة ${subject.name} يعتبر متوسطاً ويتجاوز عتبة النجاح بنوعٍ من الصعوبة. ننصح بجدولة حصص تقوية مكثفة وعقد مشاورات دورية مع معلم الصف لزيادة تركيزه وثباته.`;
      } else {
        estimation = 'ضعيف / راسب (مستوى حرج)';
        textNote = `مستوى الطالب ${student.name} في مادة ${subject.name} متأخر وحرج للغاية ويحتاج تدخلاً إنقاذياً عاجلاً بالاتصال بولي أمره فوراً لإبرام جدول مكثف لإعادة مراجعة الاختبارات.`;
      }

      setNoteResult({
        studentName: student.name,
        subjectName: subject.name,
        score,
        estimation,
        textNote,
        dateGenerated: new Date().toLocaleDateString('ar-YE')
      });
      setIsGeneratingNote(false);
    }, 900);
  };

  return (
    <div className="space-y-6" id="ai-assistant-main-view">
      
      {/* Upper header */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-lg bg-sky-500/20 text-sky-400 text-xs font-bold font-sans flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              ميزة الذكاء الاصطناعي الأكاديمية
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">بمحرك Gemini-3.5-Assistant</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1">مركز المساعد الذكي والتحليلات التنبؤية بالمنارة</h1>
          <p className="text-slate-400 text-xs font-sans">تحليل التحصيل الأكاديمي، كشف خطر التسرب المبكر وإرساء التوصيات وخطط المتابعة تلقائياً لمجلس الإدارة</p>
        </div>
        <Brain className="w-12 h-12 text-sky-500 shrink-0 select-none animate-pulse max-md:hidden" />
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        <button 
          onClick={() => setActiveTab('dropout')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'dropout' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-605 bg-white hover:bg-slate-100 border border-slate-150 text-slate-700'}`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          التنبؤ بالتسرب والتحليل الدراسي
        </button>
        <button 
          onClick={() => setActiveTab('recommend')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'recommend' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-605 bg-white hover:bg-slate-100 border border-slate-150 text-slate-700'}`}
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          مولد التوصيات وخطط الدعم لولي الأمر
        </button>
        <button 
          onClick={() => setActiveTab('teacher')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'teacher' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-605 bg-white hover:bg-slate-100 border border-slate-150 text-slate-700'}`}
        >
          <FileText className="w-4 h-4 text-sky-500" />
          مساعد المعلم (كتابة الملاحظات والتقدير)
        </button>
        <button 
          onClick={() => setActiveTab('chatbot')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'chatbot' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-605 bg-white hover:bg-slate-100 border border-slate-150 text-slate-700'}`}
        >
          <Bot className="w-4 h-4 text-emerald-500" />
          روبوت المحادثة والاستفسار الذكي عن المدرسة
        </button>
      </div>

      {/* Main body of tabs */}
      <div className="grid grid-cols-1 gap-6">

        {/* 1. Dropout Analysis */}
        {activeTab === 'dropout' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Control Panel selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Users className="w-4.5 h-4.5 text-blue-500" />
                تحديد ملف الطالب للفحص والتحليل
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">اختر طالباً مقيداً</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      setAnalysisResult(null);
                    }}
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.status === 'active' ? 'نشط' : 'غير نشط'})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={runDropoutAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {isAnalyzing ? 'جاري فحص قاعدة البيانات وحساب المقاييس...' : 'بدء تشغيل التحليل التنبئي'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-2">
                <p className="font-bold text-slate-700 flex items-center gap-1 text-xs">
                  <Brain className="w-3.5 h-3.5 text-sky-600" />
                  كيف يعمل محرك التنبؤ بالمنارة؟
                </p>
                <p>المحرك يقرأ نسبة الغیاب المتراكم للأسابيع الماضية، ويوزنها مع معدلات التحصيل الأكاديمي، بالإضافة لربطه بالحالات الصحية المتراكمة وتثبيته في نموذج تنبئي ذكي لتوليد معدلات الخطر بدقة تامة.</p>
              </div>
            </div>

            {/* Results Canvas */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
              {!analysisResult && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex-1">
                  <Brain className="w-12 h-12 text-slate-300 stroke-1 mb-3" />
                  <p className="text-xs font-bold text-slate-600">بانتظار مستخدم الإدارة لتشغيل التحليل</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">اختر الطالب من اللوحة الجانبية ثم اضغط "بدء تشغيل التحليل التنبئي" لقياس مدى مخاطر التسرب والتوازن الأكاديمي.</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center text-center py-24 flex-1">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-700 mt-4">جاري تحميل مصفوفة المقاييس وتفسير البيانات في Yemen School ERP...</p>
                  <p className="text-[10px] text-slate-400 mt-1">حساب نسب الغياب، مراجعة المتوسط الصفي، وفلترة مؤشرات الأخصائي الاجتماعي.</p>
                </div>
              )}

              {analysisResult && (
                <div className="space-y-6 flex-1">
                  
                  {/* Student Title Banner */}
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-lg shadow-sm border border-slate-250 select-none">
                        👤
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{analysisResult.studentName}</h4>
                        <span className="text-[11px] text-slate-400 block mt-0.5">الصف الدراسي: <span className="font-semibold text-slate-600">{analysisResult.classroom}</span></span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-450 bg-slate-200/50 px-2 py-1 rounded">تم التحليل: {analysisResult.timestamp}</span>
                  </div>

                  {/* Main Indicators Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Stat 1: Attendance Defect */}
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[11px] text-slate-500 block">نسبة الغياب المسجلة</span>
                      <span className="text-2xl font-black mt-1 block text-slate-800 font-mono">{analysisResult.absentRate}%</span>
                      <span className="text-[10px] text-slate-400 block mt-1">({analysisResult.absentCount} أيام غياب فعلية)</span>
                    </div>

                    {/* Stat 2: Academic average */}
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[11px] text-slate-500 block">المعدل الأكاديمي العام</span>
                      <span className={`text-2xl font-black mt-1 block font-mono ${analysisResult.averageScore >= 65 ? 'text-emerald-600' : 'text-rose-500'}`}>{analysisResult.averageScore}%</span>
                      <span className="text-[10px] text-slate-400 block mt-1">(رصد من واقع كشف الدرجات للعام)</span>
                    </div>

                    {/* Stat 3: Dropout Risk category */}
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[11px] text-slate-500 block">معدل الخطر وتهديد التسرب</span>
                      <span className="text-2xl font-black mt-1 block font-mono text-slate-800">{analysisResult.riskScore} <span className="text-xs">عقدة</span></span>
                      <span className="text-[10px] text-slate-400 block mt-1">وزن نسبي على مقياس مئوي</span>
                    </div>

                  </div>

                  {/* Progress bar scale */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-600">تصنيف الخطر المتوقع:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-bold ${analysisResult.levelColor}`}>
                        {analysisResult.levelLabel}
                      </span>
                    </div>
                    <div className="w-full bg-slate-150 h-3 rounded-full overflow-hidden">
                      <div className={`h-full ${analysisResult.levelBarColor}`} style={{ width: `${analysisResult.riskScore}%` }}></div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/20 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 leading-none">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      مذكرة وتوصيات محرك الذكاء الاصطناعي المقترحة:
                    </h5>
                    <ul className="text-xs text-slate-600 leading-relaxed font-sans list-inside list-disc space-y-1.5 pl-2 select-text">
                      {analysisResult.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="pr-1">{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Yemen Stamp notation */}
                  <div className="p-3 bg-blue-50/50 rounded-lg text-[10px] text-slate-500 font-sans border border-blue-100 flex items-center gap-2">
                    <span className="text-xs shrink-0 select-none">🇾🇪</span>
                    <span>معتمد رسمياً في استمارات المتابعة للطلاب المتأخرين دراسياً ومنسق مع الإدارة العامة لضمان الحد من انتشار الأمية والتسرب المدرسي بالمديريات في الجمهورية اليمنية.</span>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* 2. Academic Recommendations tab */}
        {activeTab === 'recommend' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-101 pb-2">
                <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
                توليد خطة التقوية الأكاديمية
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">اختر الطالب لإنشاء خطة الدعم</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    value={recommendStudentId}
                    onChange={(e) => {
                      setRecommendStudentId(e.target.value);
                      setRecResult(null);
                    }}
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={runAcademicRecommendations}
                  disabled={isGeneratingRec}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <Brain className="w-4 h-4 text-emerald-400" />
                  {isGeneratingRec ? 'جاري رسم الاستراتيجيات ومقارنة العلامات...' : 'توليد توصيات ولي الأمر والتقوية'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <p className="font-bold text-slate-700 block mb-1">💡 فكرة الأخصائي الأكاديمي:</p>
                يقوم النظام بالربط المباشر مع رصد العلامات والامتحانات في مادة معينة، ويعزل المواد الضعيفة التي تقل عن 65/100 لتعزيزها بإرشاد ولي الأمر، ويحدد مكاسب المواد المتميزة لتوظيفها بالتشجيع.
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
              {!recResult && !isGeneratingRec && (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex-1">
                  <Lightbulb className="w-12 h-12 text-slate-300 stroke-1 mb-3" />
                  <p className="text-xs font-bold text-slate-600">بانتظار الضغط على توليد التوصيات</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">سيقوم النظام بصياغة تقرير موجه لولي الأمر بصيغة احترافية ممتازة لكي يقوم الأخصائي بطباعته أو إرساله هاتفياً.</p>
                </div>
              )}

              {isGeneratingRec && (
                <div className="flex flex-col items-center justify-center text-center py-24 flex-1">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-751 mt-4">جاري الصياغة الأكاديمية بنظام المنارة...</p>
                  <p className="text-[10px] text-slate-400 mt-1">عزل نقاط الضعف، فرز درجات النجاح، وتوليد نصوص التشجيع لولي الأمر.</p>
                </div>
              )}

              {recResult && (
                <div className="space-y-6 flex-1">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">بيان تفصيلي مرسل لولي أمر الطالب: {recResult.studentName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">منسق تلقائياً مع الفلترة: <span className="font-semibold text-sky-600">الصف {classrooms.find(c => c.id === students.find(s=>s.id === recommendStudentId)?.classId)?.name}</span></p>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-800 border-emerald-100 border px-2 py-0.5 rounded-full font-bold">معتمد وجاهز للتواصل</span>
                  </div>

                  {/* Strength & weakness bento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-emerald-100 bg-emerald-50/20 p-4 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-emerald-800 block flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        نقاط التميز والقوة (معدل متفوق 85% فما فوق):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {recResult.strongSubjects.map((sub: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100">{sub}</span>
                        ))}
                      </div>
                    </div>

                    <div className="border border-rose-100 bg-rose-50/20 p-4 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-rose-800 block flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" />
                        المواد التي تحتاج إلى تحسين ودعم علاجي (تحت 65%):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {recResult.weakSubjects.map((sub: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded border border-rose-100">{sub}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generated report */}
                  <div className="border border-slate-150 rounded-xl p-5 bg-slate-50 text-xs text-slate-700 space-y-4">
                    <p className="font-semibold text-slate-800">العنوان: إفادة أكاديمية هامة وخطة تطويرية</p>
                    <p className="leading-relaxed">
                      الأخ الفاضل / <span className="font-bold">{recResult.parentName}</span> المحترم (ولي أمر الطالب {recResult.studentName})،
                    </p>
                    <p className="leading-relaxed">
                      السلام عليكم ورحمة الله وبركاته، تحية تربوية صادرة من إدارة مدرسة المنارة، وبعد:
                      حرصاً منا على تحسين التحصيل الأكاديمي والتحليلي لولدكم، يسرنا تزويدكم بالتقرير الذكي حول الخطة المنزلية المقترحة لحل تعقيدات الدراسة:
                    </p>
                    <ol className="list-inside list-decimal space-y-2 font-medium leading-relaxed pr-2">
                      {recResult.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ol>
                    <p className="leading-relaxed text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                      شكرًا لإنضباطكم الفعال في الشراكة التعليمية. هاتف التواصل المدرسي المباشر: {mockDb.getSettings().contactPhone}
                    </p>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* 3. Teacher Assistant Tab */}
        {activeTab === 'teacher' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-101 pb-2">
                <FileText className="w-4.5 h-4.5 text-sky-500" />
                توليد ملاحظات المعلم للشهادات
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">حدد الطالب المستهدف</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                    value={noteStudentId}
                    onChange={(e) => {
                      setNoteStudentId(e.target.value);
                      setNoteResult(null);
                    }}
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">حدد المادة الدراسية</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                    value={noteSubjectId}
                    onChange={(e) => {
                      setNoteSubjectId(e.target.value);
                      setNoteResult(null);
                    }}
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.stage === 'primary' ? 'الابتدائي' : s.stage === 'middle' ? 'المتوسط' : 'الثانوي'})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={runTeacherRemarks}
                  disabled={isGeneratingNote}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  {isGeneratingNote ? 'جاري الصياغة اللغوية والتأويل...' : 'توليد الملاحظة وصياغة الشهادة'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <p className="font-bold text-slate-700 block mb-1">✍️ مساعدة ممتازة في صياغة الشهادة:</p>
                هذه الميزة تجعل رصد المعلم للملاحظات سلساً وصادقًا؛ يقرأ تقدير الطالب الأكاديمي الفعلي في المادة، ثم يصيغ نص تربوي جذاب ليرفق تذييل الشهادة المدرسية.
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
              {!noteResult && !isGeneratingNote && (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex-1">
                  <FileText className="w-12 h-12 text-slate-300 stroke-1 mb-3" />
                  <p className="text-xs font-bold text-slate-600">بانتظار تفاعل المستخدم لبحث الملاحظات</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">اختر الطالب والمادة ثم اضغط توليد الملاحظة لصياغة شهادات معتمدة ونقد بناء وبليغ.</p>
                </div>
              )}

              {isGeneratingNote && (
                <div className="flex flex-col items-center justify-center text-center py-24 flex-1">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-721 mt-4">جاري توليد النقد والتقديم التربوي الصفي...</p>
                  <p className="text-[10px] text-slate-400 mt-1">قراءة الدرجة الكلية وتصميم المقاييس اللفظية.</p>
                </div>
              )}

              {noteResult && (
                <div className="space-y-6 flex-1">
                  
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">ملاحظات المعلم الصادرة لمادة: {noteResult.subjectName}</h4>
                      <p className="text-[10px] text-slate-400">الطالب المستفيد: <span className="font-semibold text-slate-600">{noteResult.studentName}</span></p>
                    </div>
                    <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-1 rounded-md font-bold border border-sky-100">{noteResult.dateGenerated}</span>
                  </div>

                  {/* Rating display */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                      {noteResult.score}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold leading-none">الدرجة الكلية والتقدير الفعلي بمحرك اليمن:</span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">{noteResult.estimation}</span>
                    </div>
                  </div>

                  {/* Remark box */}
                  <div className="border-l-4 border-slate-900 bg-slate-50 p-5 rounded-r-xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 block">ملاحظة المعلم المعتمدة لطباعة الشهادة:</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans pr-1 select-all hover:bg-slate-100 p-2 rounded transition cursor-pointer" title="انقر لتظليل ونسخ النص">
                      {noteResult.textNote}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="text-[10px] text-slate-400 font-sans leading-relaxed pt-2">
                    💡 يمكنك الضغط المزدوج على النص بالأعلى لتظليله ونسخه مباشرة، ثم إرفاقه في استمارات رصد العلامات والشهادات الأكاديمية بالملف الدراسي للطالب.
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* 4. Chatbot Tab */}
        {activeTab === 'chatbot' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[540px]">
            
            {/* Header of Chatbot */}
            <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Bot className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xs font-bold">مستشار المنارة الذكي (Al-Manara ERP Chatbot)</h3>
                  <p className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5 leading-none font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    متصل بقاعدة SQLite للمدرسة
                  </p>
                </div>
              </div>
              <HelpCircle className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => alert('يمكنك سؤالي حول الطلاب والمدرسين، جداول الحصص الأسبوعية، رسوم المحاسبة المدرسية، أو أمان السجل والبيانات المحلية.')} />
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 flex flex-col max-h-[400px]">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs shadow-sm ${msg.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm font-medium ${msg.sender === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                    <span className={`text-[9px] text-slate-400 font-mono block mt-1 ${msg.sender === 'user' ? 'text-left' : 'text-right'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 shrink-0 flex gap-2">
              <input 
                type="text" 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-slate-800 focus:bg-white"
                placeholder="اسألني عن: إجمالي الطلاب، المعلمين، صندوق المحاسبة، أمان السجلات أو التوزيع..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 px-4 rounded-xl flex items-center justify-center cursor-pointer transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </div>

    </div>
  );
}
