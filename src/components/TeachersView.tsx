/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockDb } from '../db/mockDb';
import { Teacher } from '../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Search, 
  Award, 
  DollarSign, 
  PhoneCall, 
  Bookmark,
  Briefcase,
  AlertCircle,
  Download
} from 'lucide-react';

interface TeachersViewProps {
  currentUser: any;
}

export default function TeachersView({ currentUser }: TeachersViewProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(mockDb.getTeachers());
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [tName, setTName] = useState('');
  const [tNationalId, setTNationalId] = useState('');
  const [tQualification, setTQualification] = useState('');
  const [tExperience, setTExperience] = useState<number>(5);
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tSalary, setTSalary] = useState<number>(8000);
  const [tSpecialty, setTSpecialty] = useState('');

  const [validationError, setValidationError] = useState('');

  const refreshData = () => {
    setTeachers(mockDb.getTeachers());
  };

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setTName('');
    setTNationalId('');
    setTQualification('');
    setTExperience(5);
    setTEmail('');
    setTPhone('');
    setTSalary(8000);
    setTSpecialty('');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setTName(t.name);
    setTNationalId(t.nationalId);
    setTQualification(t.qualification);
    setTExperience(t.experienceYears);
    setTEmail(t.email);
    setTPhone(t.phone);
    setTSalary(t.salary);
    setTSpecialty(t.specialty);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tNationalId || !tSpecialty) {
      setValidationError('اسم المعلم، رقم الهوية والتخصص حقول إجبارية!');
      return;
    }

    if (!editingTeacher) {
      const exists = teachers.some(t => t.nationalId === tNationalId);
      if (exists) {
        setValidationError('رقم السجل المدني للتعاقد مكرر لشخص آخر!');
        return;
      }
      mockDb.addTeacher({
        name: tName,
        nationalId: tNationalId,
        qualification: tQualification,
        experienceYears: Number(tExperience),
        email: tEmail,
        phone: tPhone,
        salary: Number(tSalary),
        specialty: tSpecialty
      }, currentUser.id, currentUser.username);
    } else {
      mockDb.updateTeacher(editingTeacher.id, {
        name: tName,
        nationalId: tNationalId,
        qualification: tQualification,
        experienceYears: Number(tExperience),
        email: tEmail,
        phone: tPhone,
        salary: Number(tSalary),
        specialty: tSpecialty
      }, currentUser.id, currentUser.username);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteTeacher = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المعلم؟ جميع حصص الجدول المسندة إليه سيتم إلغائها لضمان سلامة مفاصل قاعدة البيانات.')) {
      mockDb.deleteTeacher(id, currentUser.id, currentUser.username);
      refreshData();
    }
  };

  const filtered = teachers.filter(t => 
    t.name.includes(searchQuery) || 
    t.specialty.includes(searchQuery) ||
    t.qualification.includes(searchQuery)
  );

  const handleExportTeachers = () => {
    let csvContent = "Id,Name,NationalId,Qualification,ExperienceYears,Email,Phone,Salary,Specialty\n";
    filtered.forEach(t => {
      csvContent += `"${t.id}","${t.name}","${t.nationalId}","${t.qualification}","${t.experienceYears}","${t.email}","${t.phone}","${t.salary}","${t.specialty}"\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `سجل_المعلمين_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mockDb.addAuditLog(currentUser.id, currentUser.username, 'تصدير كشف المعلمين', `تصدير ملف Excel/CSV للمتعاقدين بالهيئة التدريسية المصفاة لعدد (${filtered.length}) معلم`);
  };

  return (
    <div className="space-y-6" id="teachers-tab-view">
      
      {/* Upper info panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-sky-500" />
              إدارة الكادر المعلم والوظائف التدريسية
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">تنظيم سجل الهيئة التدريسية، المؤهلات الأكاديمية والقدرات، الرواتب والاتصال</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleExportTeachers}
              className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition hover:cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              تصدير الكشف للـ Excel
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              التعاقد مع معلم جديد
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2.5 max-w-md border border-slate-100 mb-6">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="البحث عن معلم بالاسم، التخصص، أو الجامعة..."
            className="bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Teachers List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition relative flex flex-col justify-between">
              
              {/* Card Header information */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-bold flex items-center justify-center text-lg">
                      👨‍🏫
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{t.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold">معرف الهوية: {t.nationalId}</p>
                    </div>
                  </div>
                  <span className="bg-slate-50 border border-slate-100 text-[10px] px-2 py-0.5 rounded-full text-slate-600 font-semibold">{t.specialty}</span>
                </div>

                {/* Additional Info specs */}
                <div className="mt-4 space-y-2 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate" title={t.qualification}>{t.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>سنوات الخبرة التعليمية: {t.experienceYears} سنوات</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t.email}</span>
                  </div>
                </div>
              </div>

              {/* Bottom control & actions */}
              <div className="mt-5 border-t border-slate-50 pt-3 flex items-center justify-between">
                <div className="flex items-center text-emerald-600 font-mono text-xs font-bold">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>الراتب الأساسي: {t.salary.toLocaleString()} ريال</span>
                </div>
                <div className="inline-flex gap-1">
                  <button 
                    onClick={() => handleOpenEditModal(t)}
                    className="p-1 px-2 border border-slate-100 hover:border-sky-200 hover:bg-sky-50 text-slate-600 hover:text-sky-700 rounded-lg text-xs font-semibold transition"
                  >
                    تعديل الملف
                  </button>
                  <button 
                    onClick={() => handleDeleteTeacher(t.id)}
                    className="p-1 px-2 border border-slate-100 hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-lg text-xs"
                  >
                    إنهاء التعاقد
                  </button>
                </div>
              </div>

            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-400 text-xs">لا يوجد معلمون متطابقون لفلتر البحث حالياً.</div>
          )}
        </div>
      </div>

      {/* Teacher Add/Edit modal dialog box */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 text-slate-700">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-110 overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingTeacher ? 'تعديل السجل التعاقدي للمدرس' : 'تسجيل تعاقد كادر معلم جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">الاسم الكامل للمدرس</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. أ. عبد الله الشمري"
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رقم السجل المدني / الهوية</label>
                  <input 
                    type="text" 
                    required
                    maxLength={10}
                    placeholder="e.g. 1044..."
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={tNationalId}
                    onChange={(e) => setTNationalId(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">التخصص العلمي العام</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. رياضيات، لغة عربية"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                    value={tSpecialty}
                    onChange={(e) => setTSpecialty(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">المؤهل الأكاديمي والجامعة</label>
                <input 
                  type="text" 
                  placeholder="بكالوريوس أصول لغة - جامعة الملك سعود"
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                  value={tQualification}
                  onChange={(e) => setTQualification(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">سنوات الخبرة العملية</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={tExperience}
                    onChange={(e) => setTExperience(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">الراتب الأساسي المستحق</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={tSalary}
                    onChange={(e) => setTSalary(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">البريد الإلكتروني للاتصال</label>
                  <input 
                    type="email" 
                    placeholder="teacher@manara.edu.sa"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={tEmail}
                    onChange={(e) => setTEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رقم الجوال الشخصي</label>
                  <input 
                    type="text" 
                    placeholder="0500..."
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={tPhone}
                    onChange={(e) => setTPhone(e.target.value)}
                  />
                </div>
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
                  حفظ وتأكيد العقد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
