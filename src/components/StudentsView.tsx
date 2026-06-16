/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockDb } from '../db/mockDb';
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
  AlertCircle
} from 'lucide-react';

interface StudentsViewProps {
  currentUser: any;
}

export default function StudentsView({ currentUser }: StudentsViewProps) {
  const [students, setStudents] = useState<Student[]>(mockDb.getStudents());
  const [parents, setParents] = useState<Parent[]>(mockDb.getParents());
  const [classrooms, setClassrooms] = useState<Classroom[]>(mockDb.getClassrooms());
  const [searchQuery, setSearchQuery] = useState('');

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
  const [sAddress, setSAddress] = useState('');
  const [sMedical, setSMedical] = useState('سليم ولا توجد أمراض تذكر');
  const [sParentId, setSParentId] = useState('');
  const [sClassId, setSClassId] = useState('');
  const [sBloodGroup, setSBloodGroup] = useState('O+');
  const [sAvatar, setSAvatar] = useState('');
  const [sStatus, setSStatus] = useState<'active' | 'graduated' | 'transferred'>('active');

  const [validationError, setValidationError] = useState('');

  const refreshData = () => {
    setStudents(mockDb.getStudents());
    setParents(mockDb.getParents());
    setClassrooms(mockDb.getClassrooms());
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setSName('');
    setSGender('male');
    setSBirthDate('2015-05-01');
    setSNationalId('');
    setSAddress('');
    setSMedical('سليم ولا توجد أمراض تذكر');
    setSBloodGroup('O+');
    setSAvatar('');
    setSStatus('active');
    
    // Choose first parent and classroom as defaults
    setSParentId(parents[0]?.id || '');
    setSClassId(classrooms[0]?.id || '');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (std: Student) => {
    setEditingStudent(std);
    setSName(std.name);
    setSGender(std.gender);
    setSBirthDate(std.birthDate);
    setSNationalId(std.nationalId);
    setSAddress(std.address);
    setSMedical(std.medicalDetails);
    setSParentId(std.parentId);
    setSClassId(std.classId);
    setSBloodGroup(std.bloodGroup);
    setSAvatar(std.avatar);
    setSStatus(std.status);
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

      mockDb.addStudent({
        name: sName,
        gender: sGender,
        birthDate: sBirthDate,
        nationalId: sNationalId,
        address: sAddress,
        medicalDetails: sMedical,
        parentId: sParentId,
        classId: sClassId,
        bloodGroup: sBloodGroup,
        avatar: sAvatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
        status: sStatus
      }, currentUser.id, currentUser.username);
    } else {
      mockDb.updateStudent(editingStudent.id, {
        name: sName,
        gender: sGender,
        birthDate: sBirthDate,
        nationalId: sNationalId,
        address: sAddress,
        medicalDetails: sMedical,
        parentId: sParentId,
        classId: sClassId,
        bloodGroup: sBloodGroup,
        avatar: sAvatar,
        status: sStatus
      }, currentUser.id, currentUser.username);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب نهائياً من قاعدة البيانات المحلية؟')) {
      mockDb.deleteStudent(id, currentUser.id, currentUser.username);
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

    const newP = mockDb.addParent({
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
    let csvContent = "Id,Name,NationalId,Class,ParentName,Phone,Gender,Blood,Medical\n";
    students.forEach(s => {
      const clsName = classrooms.find(c => c.id === s.classId)?.name || 'غير مسكن';
      const prt = parents.find(p => p.id === s.parentId);
      csvContent += `"${s.id}","${s.name}","${s.nationalId}","${clsName}","${prt?.name || 'مجهول'}","${prt?.phone || 'مجهول'}","${s.gender === 'male' ? 'ذكر' : 'أنثى'}","${s.bloodGroup}","${s.medicalDetails.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "سجل_الطلاب_الكامل.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mockDb.addAuditLog(currentUser.id, currentUser.username, 'تصدير كشف الطلاب', 'تصدير ملف Excel/CSV للمقيدين بالمدرسة');
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
          mockDb.addStudent({
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

  const filteredStudents = students.filter(s => 
    s.name.includes(searchQuery) ||
    s.nationalId.includes(searchQuery) ||
    s.address.includes(searchQuery)
  );

  return (
    <div className="space-y-6" id="students-tab-view">
      
      {/* Upper Student List Box */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" />
              إدارة شؤون ملفات وقبول الطلاب
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">تسجيل وتعديل بيانات وبيطاقات الطلاب، والقدرة الاستيرادية والتصديرية للبيانات الأكاديمية</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setIsExcelOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              استيراد وتنزيل Excel
            </button>
            <button 
              onClick={handleExportStudents}
              className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              تصدير كشف الطلاب
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              قيد طالب جديد
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2.5 max-w-md border border-slate-100 mb-6 font-sans">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="البحث بالاسم، رقم السجل المدني، العنوان..."
            className="bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Regular list table */}
        <div className="overflow-x-auto text-right">
          <table className="w-full text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
              <tr>
                <th className="py-3 px-4 text-xs font-sans">الهوية</th>
                <th className="py-3 px-4 text-xs font-sans">اسم الطالب</th>
                <th className="py-3 px-4 text-xs font-sans">الفصل المقيد</th>
                <th className="py-3 px-4 text-xs font-sans">الجوال</th>
                <th className="py-3 px-4 text-xs font-sans">ولي الأمر</th>
                <th className="py-3 px-4 text-xs font-sans">الحالة الطبية</th>
                <th className="py-3 px-4 text-xs font-sans text-left">خصائص البطاقة والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredStudents.map((s) => {
                const cls = classrooms.find(c => c.id === s.classId);
                const parent = parents.find(p => p.id === s.parentId);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-800">{s.nationalId}</td>
                    <td className="py-3 px-4 font-medium flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden text-xs">
                        {s.avatar ? (
                          <img src={s.avatar} alt="stud" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          s.gender === 'male' ? '👨‍🎓' : '👩‍🎓'
                        )}
                      </div>
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 font-bold">
                      {cls ? cls.name : <span className="text-slate-400 text-xs">غير مسكن بعد</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{parent?.phone || 'مجهول'}</td>
                    <td className="py-3 px-4 text-xs">{parent?.name || 'مجهول'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 max-w-[150px] truncate text-xs bg-slate-50 border border-slate-100 rounded px-2 py-0.5 text-slate-600">
                        <Heart className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate">{s.medicalDetails}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-left">
                      <div className="inline-flex items-center gap-1.5">
                        <button 
                          onClick={() => setSelectedStudentForCard(s)}
                          title="طباعة بطاقة الهوية"
                          className="px-2 py-1 bg-violet-50 hover:bg-violet-100 border border-violet-100 text-violet-700 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>بطاقة الهوية</span>
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1 px-1.5 border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-600 hover:text-sky-700 transition rounded-lg text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(s.id)}
                          className="p-1 px-1.5 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition rounded-lg text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">لا يوجد طلاب متطابقون لفلتر البحث حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              <div id="school-id-card-element" className="w-[300px] h-[190px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4 relative shadow-md flex flex-col justify-between overflow-hidden border border-white/10 select-none">
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
                  window.print();
                  mockDb.addAuditLog(currentUser.id, currentUser.username, 'طباعة هوية طالب', `أمر طباعة لبطاقة تعريف الطالب: ${selectedStudentForCard.name}`);
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
                  <label className="text-xs font-bold text-slate-600 block">الاسم المدني الكامل لربط القيد</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. تركي بن خالد الغامدي"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رقم الهوية الوطنية / الإقامة</label>
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">الصورة الشخصية (رابط خياري)</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                  value={sAvatar}
                  onChange={(e) => setSAvatar(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">وضع ملف القيد</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                  value={sStatus}
                  onChange={(e) => setSStatus(e.target.value as 'active' | 'graduated' | 'transferred')}
                >
                  <option value="active">ثابت وقائم حالياً نشط</option>
                  <option value="graduated">خريج المدرسة الموقر</option>
                  <option value="transferred">منقول إلى مدرسة خارجية</option>
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
