/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useCustomPrint } from '../hooks/useCustomPrint';
import { useStickyPreferences } from '../hooks/useStickyPreferences';
import { schoolDatabase } from '../db/database';
import { Student, Parent, Classroom } from '../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Printer, 
  Download, 
  Upload, 
  Key, 
  Search, 
  ChevronLeft, 
  Compass, 
  Heart, 
  CheckCircle,
  FileSpreadsheet,
  Plus,
  AlertCircle,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ArrowUpDown,
  Check
} from 'lucide-react';

interface StudentsViewProps {
  currentUser: any;
  initialAction?: string | null;
  initialStatusFilter?: string | null;
}

export default function StudentsView({ currentUser, initialAction = null, initialStatusFilter = null }: StudentsViewProps) {
  const [students, setStudents] = useState<Student[]>(schoolDatabase.getStudents());
  const [parents, setParents] = useState<Parent[]>(schoolDatabase.getParents());
  const [classrooms, setClassrooms] = useState<Classroom[]>(schoolDatabase.getClassrooms());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'all');

  // Persistent user preferences for displaying columns and sorting rows in Students table
  const [prefVisibleColumns, setPrefVisibleColumns] = useStickyPreferences<Record<string, boolean>>(
    'students_columns_v2',
    {
      nationalId: true,
      studentNumber: true,
      seatNumber: true,
      name: true,
      classId: true,
      phone: true,
      parent: true,
      bloodGroup: false,
      gender: false,
      medical: false,
      status: true,
      actions: true
    }
  );

  const [prefSortKey, setPrefSortKey] = useStickyPreferences<string>('students_sort_key_v2', 'name');
  const [prefSortOrder, setPrefSortOrder] = useStickyPreferences<'asc' | 'desc'>('students_sort_order_v2', 'asc');
  const [showPreferencesPanel, setShowPreferencesPanel] = useState(false);

  const idCardPrintRef = useRef<HTMLDivElement>(null);
  const handlePrintIdCard = useCustomPrint(idCardPrintRef);

  // Modals status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);
  
  // Excel Simulator state
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  // Parent modal state (for quick adding parents inside student form)
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);

  // Parent form state
  const [pName, setPName] = useState('');
  const [pNationalId, setPNationalId] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pWork, setPWork] = useState('');
  const [pAddress, setPAddress] = useState('');

  // Student form state
  const [sName, setSName] = useState('');
  const [sGender, setSGender] = useState<'male' | 'female'>('male');
  const [sBirthDate, setSBirthDate] = useState('2015-05-01');
  const [sNationalId, setSNationalId] = useState('');
  const [sSeatNumber, setSSeatNumber] = useState('');
  const [sStudentNumber, setSStudentNumber] = useState('');
  const [sGovernorate, setSGovernorate] = useState('صنعاء');
  const [sDistrict, setSDistrict] = useState('السبعين');
  const [sAddress, setSAddress] = useState('');
  const [sMedical, setSMedical] = useState('سليم ولا توجد أمراض تذكر');
  const [sParentId, setSParentId] = useState('');
  const [sClassId, setSClassId] = useState('');
  const [sBloodGroup, setSBloodGroup] = useState('O+');
  const [sAvatar, setSAvatar] = useState('');
  const [sStatus, setSStatus] = useState<'active' | 'graduated' | 'transferred' | 'repeating' | 'suspended'>('active');
  const [sMotherName, setSMotherName] = useState('');
  const [sNationality, setSNationality] = useState('يمنية');
  const [sRegistrationStatus, setSRegistrationStatus] = useState<'new' | 'transferred' | 'repeating' | 'baki'>('new');
  const [sPhoto, setSPhoto] = useState('');

  const [validationError, setValidationError] = useState('');

  const refreshData = () => {
    setStudents(schoolDatabase.getStudents());
    setParents(schoolDatabase.getParents());
    setClassrooms(schoolDatabase.getClassrooms());
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setSName('');
    setSGender('male');
    setSBirthDate('2015-05-01');
    setSNationalId('');
    setSSeatNumber('');
    setSStudentNumber('');
    setSGovernorate('صنعاء');
    setSDistrict('السبعين');
    setSAddress('');
    setSMedical('سليم ولا توجد أمراض تذكر');
    setSBloodGroup('O+');
    setSAvatar('');
    setSStatus('active');
    setSMotherName('');
    setSNationality('يمنية');
    setSRegistrationStatus('new');
    setSPhoto('');
    
    // Choose first parent and classroom as defaults
    setSParentId(parents[0]?.id || '');
    setSClassId(classrooms[0]?.id || '');
    setValidationError('');
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (initialAction === 'register') {
      handleOpenAddModal();
    }
  }, [initialAction, parents, classrooms]);

  React.useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  const handleOpenEditModal = (std: Student) => {
    setEditingStudent(std);
    setSName(std.name);
    setSGender(std.gender);
    setSBirthDate(std.birthDate);
    setSNationalId(std.nationalId);
    setSSeatNumber(std.seatNumber || '');
    setSStudentNumber(std.studentNumber || '');
    setSGovernorate(std.governorate || 'صنعاء');
    setSDistrict(std.district || 'السبعين');
    setSAddress(std.address);
    setSMedical(std.medicalDetails);
    setSParentId(std.parentId);
    setSClassId(std.classId);
    setSBloodGroup(std.bloodGroup);
    setSAvatar(std.avatar);
    setSStatus(std.status);
    setSMotherName(std.motherName || '');
    setSNationality(std.nationality || 'يمنية');
    setSRegistrationStatus(std.registrationStatus || 'new');
    setSPhoto(std.photo || '');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName || !sNationalId) {
      setValidationError('اسم الطالب ورقم الهوية حقول إلزامية للتوثيق!');
      return;
    }

    if (!editingStudent) {
      // Check for uniqueness
      const exists = students.some(s => s.nationalId === sNationalId);
      if (exists) {
        setValidationError('الطالب بموجب رقم الهوية الوطنية هذا مقيد ومسجل مسبقاً!');
        return;
      }

      schoolDatabase.addStudent({
        name: sName,
        gender: sGender,
        birthDate: sBirthDate,
        nationalId: sNationalId,
        seatNumber: sSeatNumber || undefined,
        studentNumber: sStudentNumber || undefined,
        governorate: sGovernorate || undefined,
        district: sDistrict || undefined,
        address: sAddress,
        medicalDetails: sMedical,
        parentId: sParentId,
        classId: sClassId,
        bloodGroup: sBloodGroup,
        avatar: sAvatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
        status: sStatus,
        motherName: sMotherName || undefined,
        nationality: sNationality || undefined,
        registrationStatus: sRegistrationStatus || undefined,
        photo: sPhoto || undefined
      }, currentUser.id, currentUser.username);
    } else {
      schoolDatabase.updateStudent(editingStudent.id, {
        name: sName,
        gender: sGender,
        birthDate: sBirthDate,
        nationalId: sNationalId,
        seatNumber: sSeatNumber || undefined,
        studentNumber: sStudentNumber || undefined,
        governorate: sGovernorate || undefined,
        district: sDistrict || undefined,
        address: sAddress,
        medicalDetails: sMedical,
        parentId: sParentId,
        classId: sClassId,
        bloodGroup: sBloodGroup,
        avatar: sAvatar,
        status: sStatus,
        motherName: sMotherName || undefined,
        nationality: sNationality || undefined,
        registrationStatus: sRegistrationStatus || undefined,
        photo: sPhoto || undefined
      }, currentUser.id, currentUser.username);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب نهائياً من قاعدة البيانات المحلية؟')) {
      schoolDatabase.deleteStudent(id, currentUser.id, currentUser.username);
      refreshData();
    }
  };

  // Quick Parent adding handler
  const handleAddNewParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pNationalId || !pPhone) {
      alert('الرجاء تعبئة اسم الأب، الجوال، والسل المالي (رقم الهوية)!');
      return;
    }

    const newP = schoolDatabase.addParent({
      name: pName,
      nationalId: pNationalId,
      phone: pPhone,
      email: pEmail,
      work: pWork,
      address: pAddress
    }, currentUser.id, currentUser.username);

    alert(`تم بنجاح تسجيل ولي الأمر: ${newP.name}`);
    refreshData();
    setSParentId(newP.id);
    setIsParentModalOpen(false);
    
    // reset parent forms
    setPName('');
    setPNationalId('');
    setPPhone('');
    setPEmail('');
    setPWork('');
    setPAddress('');
  };

  // Simulated Excel Exporter (Generate dynamic CSV and download directly)
  const handleExportStudents = () => {
    let csvContent = "Id,Name,NationalId,Class,ParentName,Phone,Gender,Blood,Medical,Status\n";
    filteredStudents.forEach(s => {
      const clsName = classrooms.find(c => c.id === s.classId)?.name || 'غير مسكن';
      const prt = parents.find(p => p.id === s.parentId);
      const statusLabel = s.status === 'active' ? 'نشط' :
                          s.status === 'graduated' ? 'خريج' :
                          s.status === 'transferred' ? 'منقول' :
                          s.status === 'repeating' ? 'معيد' : 'معلق';
      csvContent += `"${s.id}","${s.name}","${s.nationalId}","${clsName}","${prt?.name || 'مجهول'}","${prt?.phone || 'مجهول'}","${s.gender === 'male' ? 'ذكر' : 'أنثى'}","${s.bloodGroup}","${s.medicalDetails.replace(/"/g, '""')}","${statusLabel}"\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `كشف_الطلاب_${statusFilter}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    schoolDatabase.addAuditLog(currentUser.id, currentUser.username, 'تصدير كشف الطلاب', `تصدير ملف Excel/CSV للطلاب المعروضين (فلترة: ${statusFilter})`);
  };

  // Simulated Import Excel Parser
  const handleExcelImport = () => {
    if (!importText) {
      setImportStatus('يرجى لصق بيانات الطلاب كأعمدة أو تعبئتها من ملف عيوني!');
      return;
    }

    // Split text into lines
    const lines = importText.split('\n').filter(l => l.trim().length > 0);
    let successfullyImported = 0;

    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const stdName = parts[0]?.trim();
        const stdIdNum = parts[1]?.trim();
        const stdGenderVal = parts[2]?.trim() === 'أنثى' ? 'female' : 'male';
        
        // Only insert if valid and not redundant
        if (stdName && stdIdNum && !students.some(s => s.nationalId === stdIdNum)) {
          schoolDatabase.addStudent({
            name: stdName,
            gender: stdGenderVal,
            birthDate: '2016-01-01',
            nationalId: stdIdNum,
            address: 'حي مستورد تلقائي',
            medicalDetails: 'سليم ومستورد من Excel',
            parentId: parents[0]?.id || 'prt-1',
            classId: classrooms[0]?.id || 'class-1',
            avatar: '',
            bloodGroup: 'O+',
            status: 'active'
          }, currentUser.id, currentUser.username);
          successfullyImported++;
        }
      }
    });

    if (successfullyImported > 0) {
      setImportStatus(`نجح استيراد وقيد عدد ${successfullyImported} طالباً جديداً بنجاح في SQLite!`);
      setImportText('');
      refreshData();
    } else {
      setImportStatus('فشل قيد السجلات. تأكد من أن الأرقام الوطنية ليست مكررة!');
    }
  };

  const [activeStudentProfileId, setActiveStudentProfileId] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<'personal' | 'parent' | 'attendance' | 'grades' | 'fees' | 'documents' | 'history'>('personal');

  const filteredStudents = React.useMemo(() => {
    const list = students.filter(s => {
      const matchesSearch = s.name.includes(searchQuery) ||
        s.nationalId.includes(searchQuery) ||
        s.address.includes(searchQuery);
      if (statusFilter === 'all') return matchesSearch;
      return matchesSearch && s.status === statusFilter;
    });

    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (prefSortKey === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (prefSortKey === 'nationalId') {
        valA = a.nationalId || '';
        valB = b.nationalId || '';
      } else if (prefSortKey === 'studentNumber') {
        valA = a.studentNumber || '';
        valB = b.studentNumber || '';
      } else if (prefSortKey === 'seatNumber') {
        const numA = parseInt(a.seatNumber || '0', 10);
        const numB = parseInt(b.seatNumber || '0', 10);
        if (!isNaN(numA) && !isNaN(numB) && numA !== 0 && numB !== 0) {
          return prefSortOrder === 'asc' ? numA - numB : numB - numA;
        }
        valA = a.seatNumber || '';
        valB = b.seatNumber || '';
      } else if (prefSortKey === 'classId') {
        valA = classrooms.find(c => c.id === a.classId)?.name || '';
        valB = classrooms.find(c => c.id === b.classId)?.name || '';
      } else if (prefSortKey === 'parentId') {
        valA = parents.find(p => p.id === a.parentId)?.name || '';
        valB = parents.find(p => p.id === b.parentId)?.name || '';
      }

      const strA = String(valA || '');
      const strB = String(valB || '');
      return prefSortOrder === 'asc'
        ? strA.localeCompare(strB, 'ar-YE')
        : strB.localeCompare(strA, 'ar-YE');
    });

    return list;
  }, [students, searchQuery, statusFilter, prefSortKey, prefSortOrder, classrooms, parents]);

  // Render the tabbed profile view for a selected student
  const renderStudentProfile = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    const parent = parents.find(p => p.id === student.parentId);
    const cls = classrooms.find(c => c.id === student.classId);
    
    // Compute student logs / metrics dynamically
    const studentAttendances = schoolDatabase.getAttendances().filter(a => a.studentId === student.id);
    const studentGrades = schoolDatabase.getGrades().filter(g => g.studentId === student.id);
    const studentPayments = schoolDatabase.getFeePayments().filter(p => p.studentId === student.id);
    
    // Computed states
    const presentCount = studentAttendances.filter(a => a.status === 'present').length;
    const absentCount = studentAttendances.filter(a => a.status === 'absent').length;
    const lateCount = studentAttendances.filter(a => a.status === 'late').length;
    const totalAttendance = studentAttendances.length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

    return (
      <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 shadow-md space-y-6" id="student-professional-profile">
        
        {/* Profile Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6 shrink-0">
          <div className="flex items-center gap-4.5">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 text-3xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {student.avatar ? (
                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                student.gender === 'male' ? '👨‍🎓' : '👩‍🎓'
              )}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-tight block">{student.name}</h3>
              <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-slate-500 mt-1.5">
                <span className="bg-primary/10 text-primary-dark font-extrabold px-2.5 py-0.5 rounded-full border border-primary/20">
                  كود القيد: <span className="font-mono">{student.studentNumber || 'سجل جديد'}</span>
                </span>
                {student.seatNumber && (
                  <span className="bg-amber-50 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                    رقم الجلوس: <span className="font-mono">{student.seatNumber}</span>
                  </span>
                )}
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                  student.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  student.status === 'repeating' ? 'bg-orange-50 text-orange-850 border-orange-200' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {student.status === 'active' ? 'نشط ومقيد بالدراسة' :
                   student.status === 'repeating' ? 'معيد مكرر للسنة' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveStudentProfileId(null)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-slate-200"
          >
            &larr; عودة لقائمة الرصد
          </button>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-150 pb-2">
          {[
            { id: 'personal', label: 'البيانات الشخصية والمدنية' },
            { id: 'parent', label: 'معلومات ولي الأمر والاتصال' },
            { id: 'attendance', label: `سجل الغياب كشف اليومي (${attendanceRate}%)` },
            { id: 'grades', label: `حصيلة درجات الكنترول (${studentGrades.length})` },
            { id: 'fees', label: 'المساهمات والوضع المالي' },
            { id: 'documents', label: 'المستندات المدنية المحفوظة' },
            { id: 'history', label: 'المسيرة والسجل الإداري' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setProfileTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-lg transition-all ${
                profileTab === tab.id 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Details Content Screen */}
        <div className="pt-2 min-h-64">
          
          {/* TAB 1: Personal Info */}
          {profileTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-primary border-r-4 border-primary/70 pr-2 mb-4">تفاصيل القيد الوطني والديمغرافي</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold leading-relaxed text-slate-600">
                  <div>
                    <span className="block text-slate-400 text-[10px]">الاسم الكامل رباعياً:</span>
                    <span className="text-slate-900 block font-bold text-[13px]">{student.name}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">الرقم الوطني للهوية:</span>
                    <span className="text-slate-900 block font-mono font-bold text-[13px]">{student.nationalId}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">الجنس:</span>
                    <span className="text-slate-900 block">{student.gender === 'male' ? 'ذكر - طالب قيد' : 'أنثى - طالبة قيد'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">تاريخ ولادة الطالب:</span>
                    <span className="text-slate-900 block font-mono">{student.birthDate}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">فصيلة الدم الموثقة:</span>
                    <span className="text-slate-900 block font-mono font-bold text-rose-600">{student.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">الفصل المسكن المقر:</span>
                    <span className="text-slate-900 block font-bold text-secondary">{cls ? cls.name : 'لم يسكن'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-primary border-r-4 border-primary/70 pr-2 mb-4">الموقع الجغرافي والملف الإكلينيكي</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold leading-relaxed text-slate-600">
                  <div>
                    <span className="block text-slate-400 text-[10px]">المحافظة الإدارية:</span>
                    <span className="text-slate-900 block">{student.governorate || 'صنعاء'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">المديرية:</span>
                    <span className="text-slate-900 block">{student.district || 'مديرية السبعين'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-400 text-[10px]">العنوان الجغرافي السكني بالتفصيل:</span>
                    <span className="text-slate-900 block">{student.address || 'حي حدة الرئاسي، صنعاء'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-rose-500 font-bold text-[10px]">الحالة الطبية وتحذيرات الطوارئ:</span>
                    <span className="bg-rose-50/50 text-rose-900 border border-rose-100 p-2.5 rounded-xl block font-bold mt-1 text-[11px]">
                      ❤️ {student.medicalDetails || 'سليم وجاهز للنشاط الرياضي والبدني'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Parent Info */}
          {profileTab === 'parent' && (
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              {parent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-primary border-r-4 border-primary/70 pr-2">سجل ولي أمر الطالب (المسؤول القانوني)</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 leading-normal">
                      <div>
                        <span className="block text-slate-400 text-[10px]">اسم ولي الأمر بالكامل:</span>
                        <span className="text-slate-900 block font-bold">{parent.name}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">رقم الهوية المدنية:</span>
                        <span className="text-slate-900 block font-mono font-bold">{parent.nationalId}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">رقم هاتف الاتصال:</span>
                        <span className="text-slate-900 block font-mono font-extrabold text-blue-700">{parent.phone}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">جهة الوظيفة والمهنة:</span>
                        <span className="text-slate-900 block">{parent.work || 'موقع حكومي/قطاع خاص'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-primary border-r-4 border-primary/70 pr-2">العناوين ووسائل الاتصال البديلة</h4>
                    <div className="text-xs font-semibold space-y-3 text-slate-600">
                      <div>
                        <span className="block text-slate-400 text-[10px]">المراسلات والبريد الإلكتروني المالي:</span>
                        <span className="text-slate-900 block font-mono">{parent.email || 'father.invoice@manara.school.ye'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">مسكن المراسلات والإقامة الدائمة:</span>
                        <span className="text-slate-900 block leading-relaxed">{parent.address || 'غير محدد بشكل منفصل'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-500 font-bold">⚠️ لم يتم ربط الطالب بحساب ولي أمر معتمد بعد. يرجى تعديله لتخصيص كفيله المالي!</p>
              )}
            </div>
          )}

          {/* TAB 3: Attendance Details */}
          {profileTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-center font-sans">
                <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-xl">
                  <span className="text-[10px] text-sky-800 font-bold block">معدل الحضور السنوي</span>
                  <span className="text-lg font-black text-sky-950 font-mono mt-1 block">{attendanceRate}%</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">
                  <span className="text-[10px] text-emerald-800 font-bold block">إجمالي أيام الحضور</span>
                  <span className="text-lg font-black text-emerald-950 font-mono mt-1 block">{presentCount}</span>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl">
                  <span className="text-[10px] text-rose-800 font-bold block">إجمالي الغيابات</span>
                  <span className="text-lg font-black text-rose-500 font-mono mt-1 block">{absentCount}</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl">
                  <span className="text-[10px] text-amber-800 font-bold block">أيام تأخر الطلاب</span>
                  <span className="text-lg font-black text-amber-900 font-mono mt-1 block">{lateCount}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-150 overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-150">
                    <tr>
                      <th className="py-2.5 px-4 font-sans">تاريخ الغياب</th>
                      <th className="py-2.5 px-4 font-sans">الحالة</th>
                      <th className="py-2.5 px-4 font-sans">الملاحظات والمبرر التربوي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {studentAttendances.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono text-slate-800 font-bold">{a.date}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] inline-block ${
                            a.status === 'present' ? 'bg-emerald-50 text-emerald-700' :
                            a.status === 'absent' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {a.status === 'present' ? 'حاضر' :
                             a.status === 'absent' ? 'غائب بدون عذر' :
                             a.status === 'late' ? 'متأخر باص' : 'غياب مبرر'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">{a.notes || 'لا يوجد ملاحظات مدونة'}</td>
                      </tr>
                    ))}
                    {studentAttendances.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400 font-bold">لم يسجل أي غياب أو حضور للطالب في الكشوف النشطة اليومية.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Grades / Control */}
          {profileTab === 'grades' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-150 overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-150">
                    <tr>
                      <th className="py-2.5 px-4 font-sans">المادة الدراسية</th>
                      <th className="py-2.5 px-4 font-sans">الامتحان والمرحلة</th>
                      <th className="py-2.5 px-4 font-sans text-center">أعمال السنة</th>
                      <th className="py-2.5 px-4 text-center font-sans">الاختبار النهائي</th>
                      <th className="py-2.5 px-4 text-center font-sans">المجموع الإجمالي</th>
                      <th className="py-2.5 px-4 text-left font-sans">النتيجة والكنترول</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                    {studentGrades.map(g => {
                      const sub = schoolDatabase.getSubjects().find(s => s.id === g.subjectId);
                      return (
                        <tr key={g.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-900 font-bold">{sub ? sub.name : 'مقرر رصد مدرسي'}</td>
                          <td className="py-3 px-4 font-medium text-slate-500">{g.examName}</td>
                          <td className="py-3 px-4 text-center font-mono">{g.courseworkGrade}</td>
                          <td className="py-3 px-4 text-center font-mono">{g.finalExamGrade}</td>
                          <td className="py-3 px-4 text-center font-mono text-primary text-[13px]">{g.totalGrade}</td>
                          <td className="py-3 px-4 text-left">
                            <span className={`px-2 py-0.5 rounded font-black text-[10px] inline-block ${
                              g.resultStatus === 'pass' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {g.resultStatus === 'pass' ? '✓ ناجح متميز' : '⚠️ راسب بحاجة لتقوية'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {studentGrades.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">لا يوجد درجات أو اختبارات عامة مرصودة بالكنترول للطالب بعد.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Fees */}
          {profileTab === 'fees' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between text-slate-800 text-xs">
                <div>
                  <span className="block text-slate-400 text-[10px]">إجمالي التوريدات والمساهمات المسددة للمدرسة:</span>
                  <span className="block text-base font-black text-secondary font-mono mt-1">
                    {studentPayments.reduce((sum, p) => sum + p.amountPaid, 0).toLocaleString()} ريال يمني
                  </span>
                </div>
                <div className="text-left font-bold text-slate-500 text-[10px]">
                  العام المالي النشط: {schoolDatabase.getSettings().currentAcademicYear}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-150 overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-150">
                    <tr>
                      <th className="py-2.5 px-4 font-sans">بند الرسم / الصندوق</th>
                      <th className="py-2.5 px-4 font-sans">قيمة المبلغ المورد</th>
                      <th className="py-2.5 px-4 font-sans">تاريخ السند</th>
                      <th className="py-2.5 px-4 font-sans">طريقة التحصيل</th>
                      <th className="py-2.5 px-4 text-left font-sans">رقم السند المالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {studentPayments.map(p => {
                      const fType = schoolDatabase.getFeeTypes().find(ft => ft.id === p.feeTypeId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-extrabold text-slate-800">{fType ? fType.name : 'مساهمة مجتمعية عامة'}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{p.amountPaid.toLocaleString()} ريال</td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">{p.paymentDate}</td>
                          <td className="py-2.5 px-4 text-xs font-bold text-slate-600">{p.paymentMethod === 'cash' ? 'نقدي (كاش)' : 'تحويل شبكة'}</td>
                          <td className="py-2.5 px-4 text-left font-mono font-semibold text-slate-500">{p.referenceNumber}</td>
                        </tr>
                      );
                    })}
                    {studentPayments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">لم تورد أي مساهمات للنشاط أو بند الرسوم لصالح ملف هذا الطالب.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: Civilians Documents / Archival */}
          {profileTab === 'documents' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-sans">
              {[
                { name: 'شهادة الميلاد الوطنية الموثقة والمترجمة', file: 'Birth_Certificate_YEM_Verified.pdf', size: '2.4 MB', exists: true },
                { name: 'استمارة تفصيلات النجاح الوزارية (تاسع / ثانوي)', file: 'Academic_Form_Ministerial_Pass.pdf', size: '4.1 MB', exists: student.seatNumber ? true : false },
                { name: 'سجل الكشف الطبي المدرسي المعتمد', file: 'Medical_Safety_Report_School.pdf', size: '1.2 MB', exists: true },
                { name: 'صورة وثيقة الهوية وبطاقة العمل للأب', file: 'Parent_Identity_National_Copy.jpg', size: '3.0 MB', exists: parent ? true : false }
              ].map((doc, idx) => (
                <div key={idx} className="bg-white border border-slate-200 hover:border-primary/45 rounded-xl p-4 flex flex-col justify-between space-y-3 transition group">
                  <div className="space-y-1">
                    <span className="text-[24px] block">📄</span>
                    <h5 className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight">{doc.name}</h5>
                    <span className="text-[9px] text-slate-400 block font-mono">{doc.file} ({doc.size})</span>
                  </div>

                  {doc.exists ? (
                    <button 
                      onClick={() => alert(`محاكاة حفظ الملف: ${doc.file} متاح للتحميل من الذاكرة المشفرة`)}
                      className="w-full py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-[10px] font-bold border border-sky-100 transition"
                    >
                      تحميل وطباعة المستند
                    </button>
                  ) : (
                    <span className="block text-center text-[10px] bg-rose-50 text-rose-700 py-1.5 rounded-lg border border-rose-100 font-bold">
                      ⚠️ يحتاج لرفع وتكميل المعاملة
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: Logs and Audit History */}
          {profileTab === 'history' && (
            <div className="relative border-r border-slate-200 pr-5 space-y-5 py-2 font-sans">
              <div className="absolute right-0 top-0 h-full w-0.5 bg-slate-200"></div>
              {[
                { title: 'تقييد وقبول الطالب بالمجمع', date: '2026-01-01', desc: `تم إدراج الطالب وتسجيل الرقم الأكاديمي الموحد ${student.studentNumber || 'REG-2026-' + student.id} وتوليد ملف السجلات.` },
                { title: 'تسكين وتوزيع الفصل الدراسي', date: '2026-01-05', desc: `تلقى الطالب مواصفات الدراسة بالفصل المسكن وتوجيهه للشعبة: ${cls ? cls.name : 'عامة'}.` },
                { title: 'ربط السند المالي وحساب الكفيل', date: '2026-01-07', desc: `تم التحقق والدورية المالية لحساب ولي الأمر المربوط ${parent ? parent.name : 'افتراضي'} للتواصل الدائم.` },
                { title: 'جلسة تدقيق حوكمة المنارة', date: '2026-06-15', desc: 'تحديث القياسات، ومراجعة سجل المستندات الشخصية والتكامل مع حوكمة SQLite الذاتية.' }
              ].map((ev, idx) => (
                <div key={idx} className="relative text-xs leading-relaxed font-semibold text-slate-600">
                  <span className="absolute -right-[23.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white ring-2 ring-primary/20"></span>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono block">{ev.date}</span>
                    <h5 className="font-extrabold text-slate-800 text-[12px]">{ev.title}</h5>
                    <p className="text-slate-500 font-medium text-[11px] mt-0.5 leading-relaxed">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    );
  };

  const handleRowClick = (studentId: string) => {
    setActiveStudentProfileId(studentId);
    setProfileTab('personal');
  };

  return (
    <div className="space-y-6" id="students-tab-view">
      
      {activeStudentProfileId ? (
        renderStudentProfile(activeStudentProfileId)
      ) : (
        <>
            {/* Upper Student List Box */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  إدارة شؤون ملفات وقبول الطلاب
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">تسجيل وتعديل بيانات وبطاقات الطلاب، والبحث في أرشيف السجلات، بموجب الهوية والجلوس</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={handleExportStudents}
                  className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  تصدير كشف الطلاب
                </button>
                {['admin', 'director', 'student_affairs'].includes(currentUser.role) && (
                  <button 
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-white" />
                    قيد طالَب جديد
                  </button>
                )}
              </div>
            </div>

            {/* Status Tabs Filter */}
            <div className="flex flex-wrap items-center gap-1.5 mb-6 border-b border-slate-100 pb-3" id="students-status-filters">
              {[
                { id: 'all', label: 'كافة الطلاب المقيدين' },
                { id: 'active', label: 'الطلاب النشطين ديمغرافياً' },
                { id: 'graduated', label: 'شعبة الخريجين والأرشيف' },
                { id: 'transferred', label: 'الطلاب المنقولين لمدارس يمنية أخرى' },
                { id: 'repeating', label: 'الطلاب المعيدين للسنة' },
              ].map(tab => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-[#0F4C81] text-white border border-[#0F4C81]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter, Search & Sticky Preferences Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2.5 w-full md:max-w-md border border-slate-100 font-sans">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <input 
                  type="text" 
                  placeholder="البحث بالاسم، رقم السجل المدني، العنوان..."
                  className="bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setShowPreferencesPanel(!showPreferencesPanel)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                    showPreferencesPanel 
                      ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-205'
                  }`}
                  title="تخصيص ترتيب العرض وأعمدة الجدول محلياً في المتصفح"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <span>تخصيص الأعمدة والفرز</span>
                  <span className="bg-slate-100 text-slate-700 rounded-full px-2 py-0.5 text-[10px] font-mono">
                    {Object.values(prefVisibleColumns).filter(Boolean).length} عمود
                  </span>
                </button>
              </div>
            </div>

            {/* Sticky Preferences Panel */}
            {showPreferencesPanel && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 mb-6 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" />
                    تفضيلات الجدول والترتيب المحلي (محفوظة بالمتصفح)
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPrefVisibleColumns({
                        nationalId: true,
                        studentNumber: true,
                        seatNumber: true,
                        name: true,
                        classId: true,
                        phone: true,
                        parent: true,
                        bloodGroup: false,
                        gender: false,
                        medical: false,
                        status: true,
                        actions: true
                      });
                      setPrefSortKey('name');
                      setPrefSortOrder('asc');
                    }}
                    className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                  >
                    إعادة ضبط التفضيلات الافتراضية
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
                  {/* Sorting Preferences */}
                  <div className="space-y-3">
                    <span className="block text-xs font-extrabold text-slate-600">ترتيب صفوف الطلاب حسب:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'name', label: 'اسم الطالب أبجدياً' },
                        { key: 'nationalId', label: 'رقم السجل المدني' },
                        { key: 'studentNumber', label: 'رقم القيد الأكاديمي' },
                        { key: 'seatNumber', label: 'رقم مقعد الكنترول' },
                        { key: 'classId', label: 'اسم الصف والشعبة' },
                        { key: 'parentId', label: 'اسم ولي الأمر المعتمد' }
                      ].map(sortOpt => (
                        <button
                          type="button"
                          key={sortOpt.key}
                          onClick={() => setPrefSortKey(sortOpt.key)}
                          className={`px-3 py-1.5 rounded-lg text-right font-medium text-[11px] transition flex items-center justify-between cursor-pointer ${
                            prefSortKey === sortOpt.key 
                              ? 'bg-[#0F4C81] text-white font-bold border border-[#0F4C81]' 
                              : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{sortOpt.label}</span>
                          {prefSortKey === sortOpt.key && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[11px] text-slate-500 font-medium font-sans">اتجاه الفرز:</span>
                      <button
                        type="button"
                        onClick={() => setPrefSortOrder('asc')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                          prefSortOrder === 'asc' ? 'bg-sky-50 text-sky-700 border border-sky-300' : 'bg-white border border-slate-200 text-slate-500'
                        }`}
                      >
                        تصاعدي (أ-ي، 0-9)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrefSortOrder('desc')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                          prefSortOrder === 'desc' ? 'bg-sky-50 text-sky-700 border border-sky-300' : 'bg-white border border-slate-200 text-slate-500'
                        }`}
                      >
                        تنازلي (ي-أ، 9-0)
                      </button>
                    </div>
                  </div>

                  {/* Toggle Columns Preferences */}
                  <div className="space-y-3">
                    <span className="block text-xs font-extrabold text-slate-600">أعمدة العرض في الجدول (تعديل مباشر):</span>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {[
                        { key: 'nationalId', label: 'الرقم الوطني' },
                        { key: 'studentNumber', label: 'رقم القيد' },
                        { key: 'seatNumber', label: 'رقم المقعد' },
                        { key: 'name', label: 'اسم الطالب' },
                        { key: 'classId', label: 'الصف المسجل' },
                        { key: 'phone', label: 'جوال الأب' },
                        { key: 'parent', label: 'ولي الأمر' },
                        { key: 'bloodGroup', label: 'فصيلة الدم' },
                        { key: 'gender', label: 'الجنس' },
                        { key: 'medical', label: 'الحالة الصحية' },
                        { key: 'status', label: 'حالة القيد' },
                        { key: 'actions', label: 'التحكم الهوية' }
                      ].map(col => {
                        const isVisible = prefVisibleColumns[col.key];
                        return (
                          <button
                            type="button"
                            key={col.key}
                            onClick={() => setPrefVisibleColumns({
                              ...prefVisibleColumns,
                              [col.key]: !isVisible
                            })}
                            className={`px-2 py-1.5 rounded-lg text-right text-[10.5px] transition flex items-center justify-between border cursor-pointer ${
                              isVisible 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                                : 'bg-white text-slate-400 border-slate-150 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                          >
                            <span className="truncate">{col.label}</span>
                            {isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" /> : <EyeOff className="w-3.5 h-3.5 text-slate-300 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regular list table */}
            <div className="overflow-x-auto text-right">
              <table className="w-full text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
                  <tr>
                    {prefVisibleColumns.nationalId && <th className="py-3 px-4 text-xs font-sans">الهوية</th>}
                    {prefVisibleColumns.studentNumber && <th className="py-3 px-4 text-xs font-sans">رقم القيد</th>}
                    {prefVisibleColumns.seatNumber && <th className="py-3 px-4 text-xs font-sans">رقم المقعد</th>}
                    {prefVisibleColumns.name && <th className="py-3 px-4 text-xs font-sans">اسم الطالب (الملف وبطاقة الهوية)</th>}
                    {prefVisibleColumns.classId && <th className="py-3 px-4 text-xs font-sans">الفصل والمحل الموقعي</th>}
                    {prefVisibleColumns.phone && <th className="py-3 px-4 text-xs font-sans">حالة الجوال</th>}
                    {prefVisibleColumns.parent && <th className="py-3 px-4 text-xs font-sans">ولي الأمر</th>}
                    {prefVisibleColumns.bloodGroup && <th className="py-3 px-4 text-xs font-sans">فصيلة الدم</th>}
                    {prefVisibleColumns.gender && <th className="py-3 px-4 text-xs font-sans">الجنس</th>}
                    {prefVisibleColumns.medical && <th className="py-3 px-4 text-xs font-sans">البيان الصحي</th>}
                    {prefVisibleColumns.status && <th className="py-3 px-4 text-xs font-sans">حالة القيد</th>}
                    {prefVisibleColumns.actions && <th className="py-3 px-4 text-xs font-sans text-left">خصائص التحكم الكلي</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredStudents.map((s) => {
                    const cls = classrooms.find(c => c.id === s.classId);
                    const parent = parents.find(p => p.id === s.parentId);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => handleRowClick(s.id)}>
                        {prefVisibleColumns.nationalId && (
                          <td className="py-3 px-4 font-mono text-xs font-bold text-slate-800" onClick={(e) => e.stopPropagation()}>{s.nationalId}</td>
                        )}
                        {prefVisibleColumns.studentNumber && (
                          <td className="py-3 px-4 font-mono text-xs" onClick={(e) => e.stopPropagation()}>{s.studentNumber || '-'}</td>
                        )}
                        {prefVisibleColumns.seatNumber && (
                          <td className="py-3 px-4 font-mono text-xs" onClick={(e) => e.stopPropagation()}>{s.seatNumber || '-'}</td>
                        )}
                        {prefVisibleColumns.name && (
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden text-xs shrink-0 shadow-xs">
                                {s.avatar ? (
                                  <img src={s.avatar} alt="stud" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  s.gender === 'male' ? '👨‍🎓' : '👩‍🎓'
                                )}
                              </div>
                              <div className="space-y-0.5 text-right">
                                <span className="block text-primary hover:underline font-extrabold text-[13px]">{s.name}</span>
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px]" onClick={(e) => e.stopPropagation()}>
                                  {s.studentNumber && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-medium">{s.studentNumber}</span>}
                                  {s.seatNumber && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-mono font-medium">جلوس: {s.seatNumber}</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        {prefVisibleColumns.classId && (
                          <td className="py-3 px-4 text-xs font-sans" onClick={(e) => e.stopPropagation()}>
                            <span className="block text-slate-700 font-bold text-[12px]">{cls ? cls.name : 'غير مسكن بعد'}</span>
                            {s.governorate && <span className="block text-[10px] text-slate-400 mt-0.5">{s.governorate} • {s.district || 'الموقع الإداري'}</span>}
                          </td>
                        )}
                        {prefVisibleColumns.phone && (
                          <td className="py-3 px-4 font-mono text-xs" onClick={(e) => e.stopPropagation()}>{parent?.phone || 'مجهول'}</td>
                        )}
                        {prefVisibleColumns.parent && (
                          <td className="py-3 px-4 text-xs" onClick={(e) => e.stopPropagation()}>{parent?.name || 'مجهول'}</td>
                        )}
                        {prefVisibleColumns.bloodGroup && (
                          <td className="py-3 px-4 font-mono text-xs font-bold text-red-600" onClick={(e) => e.stopPropagation()}>{s.bloodGroup || 'O+'}</td>
                        )}
                        {prefVisibleColumns.gender && (
                          <td className="py-3 px-4 text-xs" onClick={(e) => e.stopPropagation()}>{s.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                        )}
                        {prefVisibleColumns.medical && (
                          <td className="py-3 px-4 text-xs text-slate-500 max-w-[150px] truncate" title={s.medicalDetails} onClick={(e) => e.stopPropagation()}>{s.medicalDetails}</td>
                        )}
                        {prefVisibleColumns.status && (
                          <td className="py-3 px-4 text-xs" onClick={(e) => e.stopPropagation()}>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              s.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                              s.status === 'repeating' ? 'bg-orange-50 text-orange-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {s.status === 'active' ? 'نشط قائم' :
                               s.status === 'repeating' ? 'معيد للسنة' : 'غير نشط'}
                            </span>
                          </td>
                        )}
                        {prefVisibleColumns.actions && (
                          <td className="py-3 px-4 text-left" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1.5">
                              <button 
                                onClick={() => setSelectedStudentForCard(s)}
                                title="طباعة بطاقة الهوية"
                                className="px-2 py-1 bg-violet-50 hover:bg-violet-100 border border-violet-100 text-violet-700 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>الهوية</span>
                              </button>
                              {['admin', 'director', 'student_affairs'].includes(currentUser.role) && (
                                <>
                                  <button 
                                    onClick={() => handleOpenEditModal(s)}
                                    type="button"
                                    className="p-1 px-1.5 border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-600 hover:text-sky-700 transition rounded-lg text-xs cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteStudent(s.id)}
                                    type="button"
                                    className="p-1 px-1.5 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition rounded-lg text-xs cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={Object.values(prefVisibleColumns).filter(Boolean).length} className="py-10 text-center text-slate-400 text-xs">
                        لا يوجد طلاب متطابقون لفلتر البحث حالياً بموجب تهيئة الأعمدة النشطة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Printable ID Card mockup preview */}
      {selectedStudentForCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-xl overflow-hidden text-right text-slate-700">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-800">بطاقة الطالب لتعليمات التوزيع الفعلي</span>
              <button onClick={() => setSelectedStudentForCard(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            {/* ID CARD GRAPHIC DESIGN SCREEN */}
            <div className="p-6 flex justify-center bg-slate-100">
              <div ref={idCardPrintRef} id="school-id-card-element" className="w-[300px] h-[190px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4 relative shadow-md flex flex-col justify-between overflow-hidden border border-white/10 select-none">
                {/* Upper School details */}
                <div className="flex justify-between items-start border-b border-white/10 pb-1.5">
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold tracking-tight text-white font-sans">مدارس منارة التميز الأهلية</h4>
                    <p className="text-[8px] text-slate-400">بطاقة تعريفية للطالب</p>
                  </div>
                  <span className="text-base text-yellow-400 font-bold font-sans">🎨</span>
                </div>

                {/* Main Card body */}
                <div className="flex gap-3 my-2 items-center">
                  <div className="w-16 h-20 rounded-lg bg-slate-700 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-3xl">
                    {selectedStudentForCard.avatar ? (
                      <img src={selectedStudentForCard.avatar} alt="std avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      selectedStudentForCard.gender === 'male' ? '👨‍🎓' : '👩‍🎓'
                    )}
                  </div>
                  
                  <div className="space-y-1 text-right flex-1">
                    <h3 className="text-xs font-bold text-white font-sans">{selectedStudentForCard.name}</h3>
                    <p className="text-[9px] text-slate-300">السجل المدني: <span className="font-mono">{selectedStudentForCard.nationalId}</span></p>
                    <p className="text-[9px] text-slate-300">
                      الفصل: <span className="font-bold text-amber-400">{classrooms.find(c => c.id === selectedStudentForCard.classId)?.name || 'غير مسكن'}</span>
                    </p>
                    <p className="text-[9px] text-slate-300">
                      فصيلة الدم: <span className="font-bold text-indigo-400 font-mono">{selectedStudentForCard.bloodGroup}</span>
                    </p>
                  </div>
                </div>

                {/* Footer and dynamic barcode */}
                <div className="flex justify-between items-end border-t border-white/10 pt-1.5 text-[8px] text-slate-400">
                  <span>العام الدراسي: 1447هـ</span>
                  {/* Barecode simulation */}
                  <div className="flex flex-col items-end">
                    <div className="h-4 w-20 bg-white p-0.5 rounded-xs flex items-center justify-center gap-0.5">
                      <div className="w-1 h-full bg-black"></div>
                      <div className="w-0.5 h-full bg-black"></div>
                      <div className="w-1 h-full bg-black"></div>
                      <div className="w-0.5 h-full bg-black"></div>
                      <div className="w-1 h-full bg-black"></div>
                      <div className="w-0.5 h-full bg-black"></div>
                      <div className="w-0.5 h-full bg-black"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-2.5">
              <button 
                onClick={() => setSelectedStudentForCard(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold transition"
              >
                إغلاق النافذة
              </button>
              <button 
                onClick={() => {
                  handlePrintIdCard();
                  schoolDatabase.addAuditLog(currentUser.id, currentUser.username, 'طباعة هوية طالب', `أمر طباعة لبطاقة تعريف الطالب: ${selectedStudentForCard.name}`);
                }}
                className="px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                تصدير أمر الطباعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV/Excel Simulator Dialog */}
      {isExcelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-100 overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                استيراد الطلاب السريع من ملفات Excel/CSV
              </h3>
              <button onClick={() => { setIsExcelOpen(false); setImportStatus(''); }} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs border border-emerald-100/60 leading-relaxed space-y-2">
                <span className="font-bold block text-sm">📌 طريقة العمل والتوثيق للمدراء:</span>
                <p>قم بلصق صفوف الطلاب من أي شيت إكسيل بحيث تكون البيانات مفصولة بفاصلة <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">,</code > كما يلي:</p>
                <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono leading-normal text-ltr text-left">
                  أحمد الحربي, 1122558832, ذكر
                  رغد القحطاني, 1144778891, أنثى
                  فيصل الوهيبي, 1133556611, ذكر
                </pre>
              </div>

              {importStatus && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold">
                  {importStatus}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">لصق بيانات الطلاب هنا:</label>
                <textarea 
                  rows={4}
                  placeholder="الاسم, رقم الهوية, الجنس (ذكر/أنثى)"
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <button 
                  onClick={() => {
                    const sample = "محمد العلي,1209384756,ذكر\nسارة محمد,1209384755,أنثى";
                    setImportText(sample);
                  }}
                  className="text-xs text-sky-600 hover:underline font-semibold"
                >
                  تحميل بيانات تجريبية عينة باللصق
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setIsExcelOpen(false); setImportStatus(''); }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                  >
                    أغلق النافذة
                  </button>
                  <button 
                    onClick={handleExcelImport}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                  >
                    قيد وإدخال فوري للبيانات
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Add/Edit modal dialog box */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-100 overflow-hidden text-right leading-relaxed flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800">{editingStudent ? 'تعديل السجل الأكاديمي والمدني' : 'قيد وتسجيل ملف طالب'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 overflow-y-auto flex-1">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">اسم الطالب الثلاثي أو الرباعي المكتمل</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. عادل عبد اللطيف الشيباني"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رقم الهوية الوطنية / رقم سجل القيد الآلي</label>
                  <input 
                    type="text" 
                    required
                    maxLength={10}
                    placeholder="e.g. 1029384756"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={sNationalId}
                    onChange={(e) => setSNationalId(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رقم القيد المدرسي التسلسلي للطالب</label>
                  <input 
                    type="text" 
                    placeholder="e.g. YEM-2026-0044"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={sStudentNumber}
                    onChange={(e) => setSStudentNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رقم المقعد (رقم الجلوس للامتحانات الوزارية)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 540921"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={sSeatNumber}
                    onChange={(e) => setSSeatNumber(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">المحافظة (الجمهورية اليمنية)</label>
                  <select 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-sans"
                    value={sGovernorate}
                    onChange={(e) => setSGovernorate(e.target.value)}
                  >
                    <option value="صنعاء">صنعاء (الأمانة)</option>
                    <option value="تعز">تعز</option>
                    <option value="عدن">عدن</option>
                    <option value="إب">إب</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="حضرموت">حضرموت</option>
                    <option value="مأرب">مأرب</option>
                    <option value="ذمار">ذمار</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">المديرية التابع لها</label>
                  <input 
                    type="text" 
                    placeholder="e.g. السبعين / المشنة"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-sans"
                    value={sDistrict}
                    onChange={(e) => setSDistrict(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">الجنس</label>
                  <select 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                    value={sGender}
                    onChange={(e) => setSGender(e.target.value as 'male' | 'female')}
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">تاريخ الميلاد</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={sBirthDate}
                    onChange={(e) => setSBirthDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">فصيلة الدم</label>
                  <select 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono font-medium"
                    value={sBloodGroup}
                    onChange={(e) => setSBloodGroup(e.target.value)}
                  >
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="A-">A-</option>
                    <option value="O-">O-</option>
                    <option value="B-">B-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">تسكين الفصل الدراسي</label>
                  <select 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                    value={sClassId}
                    onChange={(e) => setSClassId(e.target.value)}
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-xs font-bold text-slate-600 block">ربط ولي الأمر</label>
                    <button 
                      type="button" 
                      onClick={() => setIsParentModalOpen(true)}
                      className="text-[10px] font-bold text-sky-600 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      إضافة أب جديد
                    </button>
                  </div>
                  <select 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                    value={sParentId}
                    onChange={(e) => setSParentId(e.target.value)}
                  >
                    {parents.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - (جوال {p.phone})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">العنوان الجغرافي السكني بالتفصيل</label>
                <input 
                  type="text" 
                  placeholder="الرياض - حي الياسمين ..."
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                  value={sAddress}
                  onChange={(e) => setSAddress(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">سجل معلن الحالة الطبية للطوارئ</label>
                <textarea 
                  rows={2}
                  placeholder="حساسية، ربو، الخ. اكتب (سليم ولا توجد أمراض تذكر) إن لم يكن هناك شيء"
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                  value={sMedical}
                  onChange={(e) => setSMedical(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">اسم الأم بالكامل للتوثيق</label>
                  <input 
                    type="text" 
                    placeholder="e.g. بلقيس علي أحمد الصنعاني"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-sans"
                    value={sMotherName}
                    onChange={(e) => setSMotherName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">جنسية الطالب</label>
                  <input 
                    type="text" 
                    placeholder="e.g. يمنية"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-sans"
                    value={sNationality}
                    onChange={(e) => setSNationality(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">نوع القيد المدرسي الرسمي</label>
                  <select 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium font-sans"
                    value={sRegistrationStatus}
                    onChange={(e) => setSRegistrationStatus(e.target.value as any)}
                  >
                    <option value="new">مستجد (سنة أولى - قيد جديد في المدرسة)</option>
                    <option value="transferred">منقول (من مدرسة أخرى بموجب وثيقة الانتقال)</option>
                    <option value="repeating">معيد مكرر (بسبب رسوب بالعام الماضي)</option>
                    <option value="baki">باقي للإعادة (غياب أو أسباب صحية معتمدة)</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">تحميل صورة الطالب الشخصية 📸</label>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setSPhoto(reader.result);
                              setSAvatar(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-slate-50 rounded-xl border border-dashed border-slate-200 px-3 py-1 text-slate-500 focus:outline-none text-[11px] cursor-pointer"
                    />
                    {(sAvatar || sPhoto) && (
                      <img 
                        src={sAvatar || sPhoto} 
                        referrerPolicy="no-referrer"
                        alt="Preview" 
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">أو رابط الصورة الشخصية (خياري)</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                  value={sAvatar}
                  onChange={(e) => {
                    setSAvatar(e.target.value);
                    setSPhoto(e.target.value);
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">وضع ملف القيد</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                  value={sStatus}
                  onChange={(e) => setSStatus(e.target.value as 'active' | 'graduated' | 'transferred' | 'repeating' | 'suspended')}
                >
                  <option value="active">ثابت وقائم حالياً نشط</option>
                  <option value="graduated">خريج المدرسة الموقر</option>
                  <option value="transferred">منقول إلى مدرسة خارجية</option>
                  <option value="repeating">معيد مكرر للسنة الدراسية</option>
                  <option value="suspended">موقَف مؤقتاً لأسباب إدارية</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                >
                  إلغاء التعديل
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold"
                >
                  حفظ السجلات وقسم القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PARENT CREATOR MODAL WINDOW (nested popup) */}
      {isParentModalOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-xl overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center">
              <span className="font-bold text-sm">تسجيل حساب ولي أمر جديد</span>
              <button onClick={() => setIsParentModalOpen(false)} className="text-white hover:text-slate-300 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddNewParent} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">الاسم لولي الأمر بالعربية</label>
                <input 
                  type="text" 
                  required
                  placeholder="أب الطالب"
                  className="w-full bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-xs"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">رقم السجل المدني لولي الأمر</label>
                <input 
                  type="text" 
                  required
                  maxLength={10}
                  placeholder="10987..."
                  className="w-full bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-xs font-mono"
                  value={pNationalId}
                  onChange={(e) => setPNationalId(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">رقم جوال الاتصال العاجل</label>
                <input 
                  type="text" 
                  required
                  placeholder="05..."
                  className="w-full bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-xs font-mono"
                  value={pPhone}
                  onChange={(e) => setPPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">البريد المالي للتنبيه الفواتيري</label>
                <input 
                  type="email" 
                  placeholder="father@gmail.com"
                  className="w-full bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-xs font-mono"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">الوظيفة / جهة العمل</label>
                <input 
                  type="text" 
                  placeholder="موظف حكومي، قطاع خاص"
                  className="w-full bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-xs"
                  value={pWork}
                  onChange={(e) => setPWork(e.target.value)}
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs font-semibold">
                <button type="button" onClick={() => setIsParentModalOpen(false)} className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg">تراجع</button>
                <button type="submit" className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg">إدخال وحفظ بـ SQLite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
