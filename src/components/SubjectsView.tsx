/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockDb } from '../db/mockDb';
import { Subject, SchoolStage } from '../types';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Award,
  BookMarked,
  Search,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SubjectsViewProps {
  currentUser: any;
}

export default function SubjectsView({ currentUser }: SubjectsViewProps) {
  const [subjects, setSubjects] = useState<Subject[]>(mockDb.getSubjects());
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [sName, setSName] = useState('');
  const [sMinGrade, setSMinGrade] = useState<number>(50);
  const [sMaxGrade, setSMaxGrade] = useState<number>(100);
  const [sStage, setSStage] = useState<SchoolStage>('primary');

  const [validationError, setValidationError] = useState('');

  const refreshData = () => {
    setSubjects(mockDb.getSubjects());
  };

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setSName('');
    setSMinGrade(50);
    setSMaxGrade(100);
    setSStage('primary');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Subject) => {
    setEditingSubject(s);
    setSName(s.name);
    setSMinGrade(s.minGrade);
    setSMaxGrade(s.maxGrade);
    setSStage(s.stage);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName) {
      setValidationError('اسم المقرر التدريسي حقل مطلوب!');
      return;
    }

    if (Number(sMinGrade) >= Number(sMaxGrade)) {
      setValidationError('درجة النجاح يجب أن تكون أصغر من الدرجة العظمى للمقرر!');
      return;
    }

    if (!editingSubject) {
      mockDb.addSubject({
        name: sName,
        minGrade: Number(sMinGrade),
        maxGrade: Number(sMaxGrade),
        stage: sStage
      }, currentUser.id, currentUser.username);
    } else {
      mockDb.updateSubject(editingSubject.id, {
        name: sName,
        minGrade: Number(sMinGrade),
        maxGrade: Number(sMaxGrade),
        stage: sStage
      }, currentUser.id, currentUser.username);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('هل تريد بالتأكيد حذف هذه المادة؟ حذف المقررات يلغي درجات الامتحانات والجدول المرتبط بها.')) {
      mockDb.deleteSubject(id, currentUser.id, currentUser.username);
      refreshData();
    }
  };

  const filtered = subjects.filter(s => s.name.includes(searchQuery));

  const getStageBadge = (stage: SchoolStage) => {
    switch (stage) {
      case 'primary':
        return <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-bold">ابتدائي</span>;
      case 'middle':
        return <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">متوسط</span>;
      case 'high':
        return <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">ثانوي</span>;
    }
  };

  return (
    <div className="space-y-6" id="subjects-tab-view">
      
      {/* Upper header controls */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-500" />
              إدارة المقررات الدراسية والمناهج المعتمدة
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">تسجيل المواد الدراسية، تحديد معايير النجاح والرسوب، وتوزيع الدرجات الأكاديمية</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            إضافة مادة دراسية جديدة
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2.5 max-w-md border border-slate-100 mb-6 font-sans">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="البحث عن مقرر بالاسم التدريسي..."
            className="bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Subjects List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-sm hover:border-slate-200 transition relative flex flex-col justify-between h-[200px]">
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center rounded-lg text-lg">
                    📚
                  </div>
                  {getStageBadge(s.stage)}
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{s.name}</h3>
                  <p className="text-[10px] text-slate-400">مقرر إلزامي معتمد علمياً</p>
                </div>
              </div>

              {/* Min/Max grade tags */}
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-600">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-slate-400">الحد الأقصى</p>
                  <p className="font-mono font-bold text-slate-800">{s.maxGrade} درجة</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] text-slate-400">نصاب النجاح</p>
                  <p className="font-mono font-bold text-emerald-600">{s.minGrade} درجة</p>
                </div>
                <div className="inline-flex gap-1 shrink-0">
                  <button onClick={() => handleOpenEditModal(s)} className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteSubject(s.id)} className="p-1.5 hover:bg-slate-50 text-rose-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-slate-400 text-xs">لا توجد مواد مسجلة مطابقة للبحث!</p>
          )}
        </div>
      </div>

      {/* Subject adding / editing generic dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 text-slate-700">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingSubject ? 'تعديل تفاصيل المادة والدورات' : 'إضافة منهج تدريسي معتمد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-1.5 font-bold">
                  <span>⚠️ {validationError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">اسم المادة والمقرر بالعربية</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. التفسير والحديث، الكيمياء العضوية"
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">المرحلة الدراسية المخصصة</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none font-medium"
                  value={sStage}
                  onChange={(e) => setSStage(e.target.value as SchoolStage)}
                >
                  <option value="primary">المرحلة الابتدائية</option>
                  <option value="middle">المرحلة المتوسطة</option>
                  <option value="high">المرحلة الثانوية العامة</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">الدرجة العظمى</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none font-mono"
                    value={sMaxGrade}
                    onChange={(e) => setSMaxGrade(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">درجة النجاح (الصغرى)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none font-mono"
                    value={sMinGrade}
                    onChange={(e) => setSMinGrade(Number(e.target.value))}
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
                  حفظ وتوثيق الحقيبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
