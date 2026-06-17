/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { schoolDatabase } from '../db/database';
import { Classroom, SchoolStage } from '../types';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  ArrowLeftRight,
  Sparkles,
  Award
} from 'lucide-react';

interface ClassesViewProps {
  currentUser: any;
}

export default function ClassesView({ currentUser }: ClassesViewProps) {
  const [classes, setClasses] = useState<Classroom[]>(schoolDatabase.getClassrooms());
  const [students, setStudents] = useState(schoolDatabase.getStudents());

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  
  const [cName, setCName] = useState('');
  const [cStage, setCStage] = useState<SchoolStage>('primary');
  const [cCapacity, setCCapacity] = useState<number>(30);
  const [cRoomNumber, setCRoomNumber] = useState('');

  // End of Year promotion States
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoFromClass, setPromoFromClass] = useState('');
  const [promoToClass, setPromoToClass] = useState('');
  const [promoStatusText, setPromoStatusText] = useState('');

  const [validationError, setValidationError] = useState('');

  const refreshData = () => {
    setClasses(schoolDatabase.getClassrooms());
    setStudents(schoolDatabase.getStudents());
  };

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setCName('');
    setCStage('primary');
    setCCapacity(30);
    setCRoomNumber('');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Classroom) => {
    setEditingClass(c);
    setCName(c.name);
    setCStage(c.stage);
    setCCapacity(c.maxCapacity);
    setCRoomNumber(c.roomNumber);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cRoomNumber) {
      setValidationError('اسم الفصل الدراسي وقسم الغرفة حقول إلزامية!');
      return;
    }

    if (!editingClass) {
      schoolDatabase.addClassroom({
        name: cName,
        stage: cStage,
        maxCapacity: Number(cCapacity),
        roomNumber: cRoomNumber
      }, currentUser.id, currentUser.username);
    } else {
      schoolDatabase.updateClassroom(editingClass.id, {
        name: cName,
        stage: cStage,
        maxCapacity: Number(cCapacity),
        roomNumber: cRoomNumber
      }, currentUser.id, currentUser.username);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteClass = (id: string) => {
    const occupantCount = students.filter(s => s.classId === id && s.status === 'active').length;
    if (occupantCount > 0) {
      alert(`عذراً، هذا الفصل مأهول ومسجل به عدد ${occupantCount} طلاب! يجب نقلهم أولاً قبل أرشفة أو إزالة الفصل لضمان اتساق البيانات.`);
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا الفصل من الهيكلية المدرسية؟')) {
      schoolDatabase.deleteClassroom(id, currentUser.id, currentUser.username);
      refreshData();
    }
  };

  // Automatic graduation / Promotion handler
  const handleExecutePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoFromClass || !promoToClass) {
      setPromoStatusText('يرجى اختيار فصل المصدر وفصل الوجهة للترفيع!');
      return;
    }

    if (promoFromClass === promoToClass) {
      setPromoStatusText('عذراً، لا يمكن نقل ترفيع الطلاب إلى نفس الفصل الدراسي!');
      return;
    }

    const targetStudents = students.filter(s => s.classId === promoFromClass && s.status === 'active');
    if (targetStudents.length === 0) {
      setPromoStatusText('الفصل الدراسي المختار كمصدر فارغ حالياً من أي طلاب نشطين!');
      return;
    }

    // Check capacity of target
    const targetClass = classes.find(c => c.id === promoToClass);
    const existingTargetStudents = students.filter(s => s.classId === promoToClass && s.status === 'active').length;
    if (targetClass && (existingTargetStudents + targetStudents.length > targetClass.maxCapacity)) {
      if (!window.confirm(`تنبيه السعة القصوى: الفصل المستهدف طاقته الاستيعابية ${targetClass.maxCapacity} طالب، وسيصبح به ${existingTargetStudents + targetStudents.length} طلاب. هل تريد المتابعة وتجاوز الحد الأقصى للمقاعد؟`)) {
        return;
      }
    }

    // Execute
    const promotedCount = schoolDatabase.promoteStudents(promoFromClass, promoToClass, currentUser.id, currentUser.username);
    setPromoStatusText(`نجح نقل وترفيع عدد ${promotedCount} طلاب بالنمط التلقائي وإثبات الترحيل بقاعدة البيانات!`);
    refreshData();
  };

  return (
    <div className="space-y-6" id="classes-tab-view">
      
      {/* Upper overview stats */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-500" />
            الهيكلية الإدارية والمراحل الدراسية
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 font-sans">توزيع المراحل الدراسية الثلاث (الابتدائي، المتوسط، الثانوي) وحوكمة ترفيع الطلاب</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => setIsPromoOpen(true)}
            className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 px-4 py-2 rounded-xl text-xs font-semibold max-sm:w-full justify-center transition"
          >
            <ArrowLeftRight className="w-4 h-4" />
            معالج الترفيع ونهاية العام التلقائي
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm max-sm:w-full justify-center transition"
          >
            <Plus className="w-4 h-4" />
            إضافة فصل دراسي جديد
          </button>
        </div>
      </div>

      {/* Grid of Stages with actual class slots inside */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        
        {/* Stage 1: Primary */}
        <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center text-sm">
            <span>المرحلة الابتدائية</span>
            <span className="bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded text-[10px]">6 فصول رئيسية</span>
          </h3>

          <div className="space-y-3">
            {classes.filter(c => c.stage === 'primary').map(c => {
              const count = students.filter(s => s.classId === c.id && s.status === 'active').length;
              const isOver = count > c.maxCapacity;
              return (
                <div key={c.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{c.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">غرفة الدرس: {c.roomNumber}</p>
                    </div>
                    <div className="inline-flex gap-1 shrink-0">
                      <button onClick={() => handleOpenEditModal(c)} className="p-1 hover:bg-slate-50 text-slate-500 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteClass(c.id)} className="p-1 hover:bg-slate-50 text-rose-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{count} / {c.maxCapacity} طالب مقيد</span>
                    </span>
                    {isOver ? (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Over
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">مستقر</span>
                    )}
                  </div>
                </div>
              );
            })}
            {classes.filter(c => c.stage === 'primary').length === 0 && (
              <p className="text-center py-6 text-slate-400 text-xs">لم يتم إضافة فصول للمرحلة هذه بعد.</p>
            )}
          </div>
        </div>

        {/* Stage 2: Middle */}
        <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center text-sm">
            <span>المرحلة المتوسطة</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">3 فصول متوسطة</span>
          </h3>

          <div className="space-y-3">
            {classes.filter(c => c.stage === 'middle').map(c => {
              const count = students.filter(s => s.classId === c.id && s.status === 'active').length;
              return (
                <div key={c.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{c.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">غرفة الدرس: {c.roomNumber}</p>
                    </div>
                    <div className="inline-flex gap-1 shrink-0">
                      <button onClick={() => handleOpenEditModal(c)} className="p-1 hover:bg-slate-50 text-slate-500 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteClass(c.id)} className="p-1 hover:bg-slate-50 text-rose-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{count} / {c.maxCapacity} طالب مقيد</span>
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">مستقر</span>
                  </div>
                </div>
              );
            })}
            {classes.filter(c => c.stage === 'middle').length === 0 && (
              <p className="text-center py-6 text-slate-400 text-xs">لم يتم إضافة فصول للمرحلة هذه بعد.</p>
            )}
          </div>
        </div>

        {/* Stage 3: High */}
        <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center text-sm">
            <span>المرحلة الثانوية</span>
            <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">3 فصول ثانوية</span>
          </h3>

          <div className="space-y-3">
            {classes.filter(c => c.stage === 'high').map(c => {
              const count = students.filter(s => s.classId === c.id && s.status === 'active').length;
              return (
                <div key={c.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{c.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">غرفة الدرس: {c.roomNumber}</p>
                    </div>
                    <div className="inline-flex gap-1 shrink-0">
                      <button onClick={() => handleOpenEditModal(c)} className="p-1 hover:bg-slate-50 text-slate-500 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteClass(c.id)} className="p-1 hover:bg-slate-50 text-rose-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{count} / {c.maxCapacity} طالب مقيد</span>
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">مستقر</span>
                  </div>
                </div>
              );
            })}
            {classes.filter(c => c.stage === 'high').length === 0 && (
              <p className="text-center py-6 text-slate-400 text-xs">لم يتم إضافة فصول للمرحلة هذه بعد.</p>
            )}
          </div>
        </div>

      </div>

      {/* Automatic promotion Wizard Dialog Box */}
      {isPromoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 text-slate-700">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-sm text-white">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                معالج ترحيل الطلاب ونهاية العام الدراسي
              </h3>
              <button onClick={() => { setIsPromoOpen(false); setPromoStatusText(''); }} className="text-white hover:text-slate-300 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleExecutePromotion} className="p-6 space-y-4">
              <div className="bg-amber-50 text-amber-800 border border-amber-100 p-4 rounded-xl text-xs space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  تحذير السجلات المترابطة بقاعدة البيانات:
                </span>
                <p>هذا الإجراء يقوم بتجميع كافة طلاب فصل المصدر دفعة واحدة وتحديث حقل الروية للمفتاح الأجنبي (ClassId) في جدول الطلاب لتسكينهم بفصل الوجهة الأعلى بضغطة زر واحدة.</p>
              </div>

              {promoStatusText && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold">
                  {promoStatusText}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">فصل المصدر (الفصل الدراسي الحالي)</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={promoFromClass}
                  onChange={(e) => setPromoFromClass(e.target.value)}
                >
                  <option value="">-- يرجى اختيار فصل المصدر --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({students.filter(s => s.classId === c.id && s.status === 'active').length} طلاب)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">فصل الوجهة (المستوى الأعلى للتسفير والترفيع)</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={promoToClass}
                  onChange={(e) => setPromoToClass(e.target.value)}
                >
                  <option value="">-- يرجى اختيار الصف المستهدف --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({students.filter(s => s.classId === c.id && s.status === 'active').length} طلاب مقيم)</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs font-semibold">
                <button 
                  type="button" 
                  onClick={() => { setIsPromoOpen(false); setPromoStatusText(''); }} 
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  إلغاء وإغلاق
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  ترحيل وترفيع الطلاب فورا
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class adding / editing generic dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 text-slate-700">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingClass ? 'تعديل غرف الفصول والحد الأقصى' : 'تأسيس فصل دراسي جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSaveClass} className="p-6 space-y-4">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">اسم الفصل المعرف</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. الصف الأول الابتدائي - أ"
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">المرحلة التعليمية</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                  value={cStage}
                  onChange={(e) => setCStage(e.target.value as SchoolStage)}
                >
                  <option value="primary">المرحلة الابتدائية (Primary)</option>
                  <option value="middle">المرحلة المتوسطة (Middle)</option>
                  <option value="high">المرحلة الثانوية (High School)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رقم وتسمية الغرفة</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. A203"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={cRoomNumber}
                    onChange={(e) => setCRoomNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">السعة والاستيعاب الأقصى</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={cCapacity}
                    onChange={(e) => setCCapacity(Number(e.target.value))}
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
                  إنشاء وتفعيل الفصل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple alert inline element
function AlertCircle(props: { className?: string }) {
  return <span className={props.className}>⚠️</span>;
}
