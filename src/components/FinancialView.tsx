/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockDb } from '../db/mockDb';
import { Student, FeeType, FeePayment } from '../types';
import { 
  DollarSign, 
  Plus, 
  Printer, 
  Search, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  Users,
  CreditCard,
  Building,
  AlertCircle
} from 'lucide-react';

interface FinancialViewProps {
  currentUser: any;
}

export default function FinancialView({ currentUser }: FinancialViewProps) {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>(mockDb.getFeeTypes());
  const [payments, setPayments] = useState<FeePayment[]>(mockDb.getFeePayments());
  const [students] = useState<Student[]>(mockDb.getStudents());
  const [searchQuery, setSearchQuery] = useState('');

  // Modals status
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isFeeTypeOpen, setIsFeeTypeOpen] = useState(false);
  
  // Custom Receipt printer modal
  const [printedPayment, setPrintedPayment] = useState<FeePayment | null>(null);

  // New Fee Type Form
  const [fName, setFName] = useState('');
  const [fAmount, setFAmount] = useState<number>(1000);
  const [fDesc, setFDesc] = useState('');

  // New Payment Form
  const [pStudentId, setPStudentId] = useState(students[0]?.id || '');
  const [pFeeTypeId, setPFeeTypeId] = useState(feeTypes[0]?.id || '');
  const [pAmountPaid, setPAmountPaid] = useState<number>(1000);
  const [pMethod, setPMethod] = useState<'cash' | 'card' | 'bank_transfer'>('card');
  const [pNotes, setPNotes] = useState('');

  const [validationError, setValidationError] = useState('');

  const refreshData = () => {
    setFeeTypes(mockDb.getFeeTypes());
    setPayments(mockDb.getFeePayments());
  };

  const handleCreateFeeType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName || fAmount <= 0) {
      alert('الرجاء التأكد من صحة تسمية الرسم والمبلغ النقدي!');
      return;
    }

    mockDb.addFeeType({
      name: fName,
      amount: Number(fAmount),
      description: fDesc
    }, currentUser.id, currentUser.username);

    setIsFeeTypeOpen(false);
    refreshData();

    // Reset forms
    setFName('');
    setFAmount(1000);
    setFDesc('');
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pStudentId || !pFeeTypeId || pAmountPaid <= 0) {
      setValidationError('يرجى اختيار مسمى الطالب، بند الرسم المدرسي، والمبلغ الفعلي بالريال!');
      return;
    }

    // Reference number generator
    const ref = `TXN-${Math.floor(Math.random() * 900000) + 100000}`;

    mockDb.addFeePayment({
      studentId: pStudentId,
      feeTypeId: pFeeTypeId,
      amountPaid: Number(pAmountPaid),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: pMethod,
      referenceNumber: ref,
      academicYear: mockDb.getSettings().currentAcademicYear,
      notes: pNotes
    }, currentUser.id, currentUser.username);

    setIsReceiptOpen(false);
    refreshData();

    // Reset forms
    setPNotes('');
    setValidationError('');
  };

  // Calculations for financial center dashboard
  const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalInvoicesIssued = feeTypes.reduce((sum, f) => sum + f.amount, 0) * students.length; // rough estimate
  const outstandingRevenues = Math.max(0, totalInvoicesIssued - totalRevenue);

  const filteredPayments = payments.filter(p => {
    const std = students.find(s => s.id === p.studentId);
    return std?.name.includes(searchQuery) || p.referenceNumber.includes(searchQuery);
  });

  return (
    <div className="space-y-6" id="financial-tab-view">
      
      {/* Visual financial cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-white/80 text-xs font-bold block">إجمالي المقبوضات المحصلة (أوفلاين)</span>
            <h3 className="text-3xl font-extrabold font-sans tracking-tight">{totalRevenue.toLocaleString()} ريال</h3>
            <p className="text-[10px] text-white/60">كافة الحوالات، المبالغ النقدية والمخرجات المسجلة</p>
          </div>
          <p className="absolute left-4 bottom-4 text-4xl opacity-10">💵</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold block">إجمالي رسوم الاستحقاق العام</span>
            <h3 className="text-2xl font-black text-slate-800 font-sans tracking-tight">{(35000).toLocaleString()} ريال</h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">مجموع تقدير رسوم المدرسة بناءً على عدد القيد الفعلي</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-amber-600 text-xs font-semibold block">الذمم وباقي المستحقات المقسطة</span>
            <h3 className="text-2xl font-black text-amber-700 font-sans tracking-tight">{(35000 - totalRevenue).toLocaleString()} ريال</h3>
          </div>
          <p className="text-[10px] text-amber-500 mt-2">الأقساط المتبقية تحت التوريد من أولياء الأمور</p>
        </div>
      </div>

      {/* Main operation boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right side: Payments receipts lists */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                سندات التحصيل وحوالات الاستلام
              </h2>
              <p className="text-slate-500 text-xs mt-0.5 font-sans">تتبع الإيصالات المسددة من أولياء الأمور وحفظ الإثباتات الدفترية بلائحة SQLite</p>
            </div>
            <button 
              onClick={() => {
                if(students.length===0){
                  alert("الرجاء تسجيل الطلاب مسبقا!");
                  return;
                }
                setIsReceiptOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              تحصيل سند قبض جديد
            </button>
          </div>

          {/* Search ledger */}
          <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2.5 max-w-sm border border-slate-100 mb-6 font-sans">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input 
              type="text" 
              placeholder="البحث باسم الطالب أو رقم مرجع السند..."
              className="bg-transparent border-none text-xs text-slate-700 focus:outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table display */}
          <div className="overflow-x-auto text-rtl text-right">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 text-xs font-sans">مرجع السند</th>
                  <th className="py-2.5 px-4 text-xs font-sans">اسم الطالب</th>
                  <th className="py-2.5 px-4 text-xs font-sans">المبلغ المدفوع</th>
                  <th className="py-2.5 px-4 text-xs font-sans">التاريخ</th>
                  <th className="py-2.5 px-4 text-xs font-sans text-left">طباعة السند</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 text-xs font-medium">
                {filteredPayments.map((p) => {
                  const std = students.find(s => s.id === p.studentId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.referenceNumber}</td>
                      <td className="py-3 px-4">{std?.name || 'طالب مجهول'}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 font-mono">{p.amountPaid.toLocaleString()} ريال</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{p.paymentDate}</td>
                      <td className="py-3 px-4 text-left">
                        <button 
                          onClick={() => setPrintedPayment(p)}
                          className="p-1 px-2.5 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition rounded-lg text-[10px] inline-flex items-center gap-1.5"
                        >
                          <Printer className="w-3 h-3" />
                          <span>إيصال الاستلام</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-450 text-slate-400">لا يوجد أي حوالات تذكر مطابقة للبحث.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Left side: Fee types catalog pricing */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">بيان وبنود الفواتير المقررة</h2>
              <p className="text-slate-450 text-[11px] text-slate-400 font-sans">قائمة الخدمات والمبالغ المستهدفة للتعليم العام</p>
            </div>
            <button 
              onClick={() => setIsFeeTypeOpen(true)}
              className="p-1 hover:bg-slate-100 text-sky-600 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> بند جديد
            </button>
          </div>

          <div className="space-y-4">
            {feeTypes.map((ft) => (
              <div key={ft.id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{ft.name}</h4>
                  <span className="font-mono text-xs font-black text-emerald-700 shrink-0">{ft.amount} ريال</span>
                </div>
                <p className="text-[10px] text-slate-400">{ft.description || 'لا يوجد وصف مضاف'}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* New Fee type form dialog */}
      {isFeeTypeOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 text-slate-700">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-110 shadow-xl overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
              <span className="font-bold">استحداث بند مالي جديد</span>
              <button onClick={() => setIsFeeTypeOpen(false)} className="text-slate-400 text-xl hover:text-slate-600 font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateFeeType} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">اسم البند المالي المالي</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. رسوم شراء زي مدرسي إضافي"
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">المبلغ الإجمالي المستحق بالريال</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none font-mono font-bold text-emerald-700"
                  value={fAmount}
                  onChange={(e) => setFAmount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">وصف الخدمة أو تبرير الرسم</label>
                <textarea 
                  rows={2}
                  placeholder="وصف إيضاحي للمديرين والمحاسبة..."
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={fDesc}
                  onChange={(e) => setFDesc(e.target.value)}
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs font-semibold">
                <button type="button" onClick={() => setIsFeeTypeOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl">تراجع</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm">حفظ البند المالي</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Receipt sand-qabd Issuing form dialog */}
      {isReceiptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 text-slate-700 font-sans max-h-[100vh]">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">تحصيل مالي وإشهار إيصال دفع</h3>
              <button onClick={() => setIsReceiptOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block font-sans">اسم الطالب المستحق</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={pStudentId}
                  onChange={(e) => setPStudentId(e.target.value)}
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - ({s.nationalId})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">بند الرسم المدرسي المخصص المسدد عنه</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={pFeeTypeId}
                  onChange={(e) => {
                    setPFeeTypeId(e.target.value);
                    const cost = feeTypes.find(f => f.id === e.target.value)?.amount || 1000;
                    setPAmountPaid(cost);
                  }}
                >
                  {feeTypes.map(f => (
                    <option key={f.id} value={f.id}>{f.name} (التكلفة: {f.amount} ريال)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">المبلغ المدفوع حقيقةً بالريال</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none font-mono font-bold text-emerald-800"
                    value={pAmountPaid}
                    onChange={(e) => setPAmountPaid(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">طريقة الاستلام والدفع</label>
                  <select 
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                    value={pMethod}
                    onChange={(e) => setPMethod(e.target.value as any)}
                  >
                    <option value="card">نظام شبكة صرافة مادا (Card)</option>
                    <option value="bank_transfer">تحويل رسمي بنكي مباشر</option>
                    <option value="cash">استلام نقدي عيني بالخزينة (Cash)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">ملاحظات مكملة أو تفاصيل البنك</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. تم رصد الدفع بالكامل من حساب الوالد في البنك الأهلي..."
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none"
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5 text-xs font-semibold">
                <button type="button" onClick={() => setIsReceiptOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl">تراجع</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm">تثبيت دفع المبلغ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Certificate document dialog box */}
      {printedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 text-slate-700">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-xl overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
              <span className="font-bold text-xs text-slate-800">إيصال تحصيل وسند قبض نقدي رسمي</span>
              <button onClick={() => setPrintedPayment(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <div className="p-6 bg-white space-y-4 text-slate-800 border-b border-slate-100" id="official-money-receipt">
              {/* Header branding */}
              <div className="text-center pb-3 border-b-2 border-slate-200">
                <h3 className="text-xs font-bold font-sans">مدارس منارة التميز الأهلية</h3>
                <p className="text-[10px] text-slate-400">سند قبض مالي معتمد</p>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">الرقم المرجعي: {printedPayment.referenceNumber}</p>
              </div>

              {/* Data body list */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-400">تاريخ الاستلام:</span>
                  <span className="font-mono text-slate-700 font-bold">{printedPayment.paymentDate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-400">اسم الطالب:</span>
                  <span className="text-slate-800 font-bold">{students.find(s => s.id === printedPayment.studentId)?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-400">الوصف المستحق:</span>
                  <span className="text-slate-700">{feeTypes.find(f => f.id === printedPayment.feeTypeId)?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-400">طريقة الدفع في الماكينة:</span>
                  <span className="text-slate-800 font-bold">
                    {printedPayment.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                     printedPayment.paymentMethod === 'card' ? 'شبكة صرافة' : 'نقداً عيناً بالصندوق'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2 pt-2 text-sm">
                  <span className="text-slate-800 font-bold">المبلغ المقبوض:</span>
                  <span className="font-mono font-black text-emerald-600">{printedPayment.amountPaid.toLocaleString()} ريال سعودي</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 bg-slate-50 rounded p-2 text-xs italic">
                  * ملاحظات الدفتر المالي: {printedPayment.notes || 'سدد على مسمى الطالب لقيد الاستقرار.'}
                </p>
              </div>

              {/* Signature stamp mock */}
              <div className="flex justify-between pt-6 text-[10px] text-slate-400">
                <div className="text-center">
                  <span>أمين الخزينة</span>
                  <p className="font-serif text-slate-300">موقع إلكترونياً</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center text-[8px] text-emerald-400 font-bold rotate-6">
                     سُدّد
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-2 text-xs font-semibold">
              <button onClick={() => setPrintedPayment(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300">إلغاء</button>
              <button 
                onClick={() => {
                  window.print();
                  mockDb.addAuditLog(currentUser.id, currentUser.username, 'طباعة سند قبض مالي', `طباعة وإشهار السند رقم ${printedPayment.referenceNumber}`);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                طباعة السند الورقي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
