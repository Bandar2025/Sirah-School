import React, { useState } from 'react';
import { mockDb } from '../db/mockDb';
import { Parent, Student, FeePayment } from '../types';
import { 
  Users, 
  Search, 
  PlusCircle, 
  Edit3, 
  Phone, 
  MapPin, 
  Briefcase, 
  User, 
  ArrowLeftRight, 
  CreditCard, 
  CheckCircle, 
  GraduationCap,
  Download
} from 'lucide-react';

interface ParentsViewProps {
  currentUser: any;
}

export default function ParentsView({ currentUser }: ParentsViewProps) {
  const [parents, setParents] = useState<Parent[]>(mockDb.getParents());
  const [students, setStudents] = useState<Student[]>(mockDb.getStudents());
  const [payments, setPayments] = useState<FeePayment[]>(mockDb.getFeePayments());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [work, setWork] = useState('');
  const [address, setAddress] = useState('');

  const refreshData = () => {
    setParents(mockDb.getParents());
    setStudents(mockDb.getStudents());
    setPayments(mockDb.getFeePayments());
  };

  const handleOpenAddModal = () => {
    setEditingParent(null);
    setName('');
    setNationalId('');
    setPhone('');
    setEmail('');
    setWork('');
    setAddress('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Parent) => {
    setEditingParent(p);
    setName(p.name);
    setNationalId(p.nationalId);
    setPhone(p.phone);
    setEmail(p.email || '');
    setWork(p.work || '');
    setAddress(p.address || '');
    setIsModalOpen(true);
  };

  const handleSaveParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nationalId || !phone) {
      alert('اسم الأب، رقم الهوية والجوال حقول إلزامية للتوثيق!');
      return;
    }

    if (!editingParent) {
      // Create new
      mockDb.addParent({
        name,
        nationalId,
        phone,
        email,
        work,
        address
      }, currentUser.id, currentUser.username);
    } else {
      // Edit existing
      mockDb.updateParent(editingParent.id, {
        name,
        nationalId,
        phone,
        email,
        work,
        address
      }, currentUser.id, currentUser.username);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const filteredParents = parents.filter(p => 
    p.name.includes(searchQuery) ||
    p.nationalId.includes(searchQuery) ||
    p.phone.includes(searchQuery)
  );

  const handleExportParents = () => {
    let csvContent = `المعرف,الاسم الكامل,الهوية الوطنية,الجوال,البريد الإلكتروني,التوظيف,السكن\n`;
    filteredParents.forEach(p => {
      csvContent += `"${p.id}","${p.name}","${p.nationalId}","${p.phone}","${p.email || ''}","${p.work || ''}","${p.address || ''}"\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `سجل_أولياء_الأمور_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mockDb.addAuditLog(
      currentUser.id,
      currentUser.username,
      'تصدير كشف أولياء الأمور',
      `تصدير ملف Excel/CSV لأولياء الأمور المسجلين المصفى لعدد (${filteredParents.length}) شخص`
    );
  };

  return (
    <div className="space-y-6" id="parents-tab-view">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-primary" />
            بوابة ودليل أولياء الأمور المعتمد
          </h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            محور شؤون أولياء أمور الطلاب لتسجيل الهويات، بيانات الاتصال، الوظائف، والاطلاع الفوري على الطلاب المكفولين في فصول مجمع المنارة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            type="button"
            onClick={handleExportParents}
            className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition hover:cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>تصدير كشف أولياء الأمور</span>
          </button>
          {['admin', 'director', 'student_affairs'].includes(currentUser.role) && (
            <button 
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>تسجيل ولي أمر جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and search Bar */}
      <div className="flex items-center bg-white rounded-xl px-4 py-3 max-w-md border border-slate-250 font-sans shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="البحث باسم ولي الأمر، الجوال، رقم الهوية الوطنية..."
          className="bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Parents bento-grid / list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParents.map(parent => {
          // get children list
          const children = students.filter(s => s.parentId === parent.id);
          // calculate paid fees vs overall
          const parentPayments = payments.filter(p => children.some(c => c.id === p.studentId));
          const totalPaid = parentPayments.reduce((sum, p) => sum + p.amountPaid, 0);

          return (
            <div key={parent.id} className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4 hover:border-primary/40 transition">
              
              {/* Card Top */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                    👤
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-[14px] leading-tight">{parent.name}</h3>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">الهوية: <span className="font-mono font-bold">{parent.nationalId}</span></span>
                  </div>
                </div>

                {['admin', 'director', 'student_affairs'].includes(currentUser.role) && (
                  <button 
                    onClick={() => handleOpenEditModal(parent)}
                    className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-primary transition rounded-lg"
                    title="تعديل بيانات ولي الأمر"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Informational Details */}
              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>الجوال المعتمد:</span>
                  <span className="font-mono text-slate-800 font-bold mr-auto">{parent.phone || 'غير مدرج'}</span>
                </div>

                {parent.work && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>المهنة / المشغل:</span>
                    <span className="text-slate-800 mr-auto truncate max-w-[150px]">{parent.work}</span>
                  </div>
                )}

                {parent.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>العنوان السكني:</span>
                    <span className="text-slate-800 mr-auto truncate max-w-[150px]" title={parent.address}>{parent.address}</span>
                  </div>
                )}
              </div>

              {/* Associated Students Section */}
              <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-2">
                <span className="text-[10px] text-slate-400 block font-bold">الطلاب المكفولين في المجمع ({children.length}):</span>
                {children.length > 0 ? (
                  <div className="space-y-1.5">
                    {children.map(student => (
                      <div key={student.id} className="flex items-center justify-between text-xs bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <GraduationCap className="w-3 text-primary" />
                          {student.name}
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          {student.status === 'active' ? 'قائم' : 'معيد'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-rose-500 font-bold block bg-rose-50 px-2 py-1 rounded">
                    ⚠️ لم يتم تسكين أو ربط أي طلاب بملف ولي الأمر هذا حالياً!
                  </span>
                )}
              </div>

              {/* Financial Metrics Widget */}
              <div className="flex items-center justify-between text-[11px] bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-emerald-800">
                <span className="font-bold flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  مدفوعات صندوق الصيانة المدرسية:
                </span>
                <span className="font-mono font-bold text-slate-800">{totalPaid.toLocaleString()} ريال</span>
              </div>

            </div>
          );
        })}

        {filteredParents.length === 0 && (
          <div className="col-span-full py-16 bg-white border border-slate-150 rounded-2xl text-center text-slate-400 text-sm">
            لا توجد سجلات مطابقة لأولياء الأمور حالياً.
          </div>
        )}
      </div>

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right" dir="rtl">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-sm">
                {editingParent ? 'تعديل سجل ولي الأمر' : 'تسجيل ولي أمر جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <form onSubmit={handleSaveParent} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-600 block">اسم ولي الأمر رباعياً</label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: يحيى علي أحمد الهمداني"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 block">رقم السجل الوطني (الهوية)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="10 خانات"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary font-mono"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 block">جوال الاتصال النشط</label>
                  <input 
                    type="text" 
                    required
                    placeholder="77xxxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary font-mono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">البريد الإلكتروني لشحن الإشعارات</label>
                <input 
                  type="email" 
                  placeholder="parent@school.edu.ye"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary font-mono"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">الوظيفة أو جهة العمل الرسمية</label>
                <input 
                  type="text" 
                  placeholder="وظيفة أو قطاع أعمال ولي الأمر"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 block">العنوان الجغرافي السكني بالتفصيل</label>
                <input 
                  type="text" 
                  placeholder="صنعاء - مديرية السبعين - شارع الخمسين"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-primary"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
                >
                  إلغاء المعاملة
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg transition"
                >
                  حفظ في الدليل
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
