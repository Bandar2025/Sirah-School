/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockDb } from '../db/mockDb';
import { User, UserRole } from '../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Shield, 
  Clock, 
  Search, 
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface UsersViewProps {
  currentUser: any;
}

export default function UsersView({ currentUser }: UsersViewProps) {
  const [users, setUsers] = useState<User[]>(mockDb.getUsers());
  const [auditLogs, setAuditLogs] = useState(mockDb.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('supervisor');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const [validationError, setValidationError] = useState('');

  const refreshData = () => {
    setUsers(mockDb.getUsers());
    setAuditLogs(mockDb.getAuditLogs());
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormFullName('');
    setFormRole('supervisor');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('active');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormFullName(u.fullName);
    setFormRole(u.role);
    setFormEmail(u.email);
    setFormPhone(u.phone);
    setFormStatus(u.status);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername || !formFullName) {
      setValidationError('اسم المستخدم والاسم الكامل حقول مطلوبة!');
      return;
    }

    // Check unique username on additive mode
    if (!editingUser) {
      const exists = users.some(u => u.username.toLowerCase() === formUsername.toLowerCase());
      if (exists) {
        setValidationError('اسم المستخدم محجوز ومسجل مسبقاً لمستخدم آخر!');
        return;
      }

      mockDb.addUser({
        username: formUsername,
        fullName: formFullName,
        role: formRole,
        email: formEmail,
        phone: formPhone,
        status: formStatus
      }, currentUser.id, currentUser.username);
    } else {
      mockDb.updateUser(editingUser.id, {
        username: formUsername,
        fullName: formFullName,
        role: formRole,
        email: formEmail,
        phone: formPhone,
        status: formStatus
      }, currentUser.id, currentUser.username);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert('عذراً، لا يمكنك حذف حسابك الحالي الذي تستخدم تسجيل الدخول منه!');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم بشكل نهائي وإسقاط جميع صلاحياته؟')) {
      mockDb.deleteUser(id, currentUser.id, currentUser.username);
      refreshData();
    }
  };

  const handleToggleStatus = (u: User) => {
    if (u.id === currentUser.id) {
      alert('لا يمكنك تعطيل حسابك الشخصي!');
      return;
    }
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    mockDb.updateUser(u.id, { status: newStatus }, currentUser.id, currentUser.username);
    refreshData();
  };

  const filteredUsers = users.filter(u => 
    u.fullName.includes(searchQuery) || 
    u.username.includes(searchQuery) ||
    u.email.includes(searchQuery)
  );

  const filteredLogs = auditLogs.filter(l => 
    l.action.includes(logSearchQuery) || 
    l.details.includes(logSearchQuery) ||
    l.username.includes(logSearchQuery)
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="bg-rose-50 border border-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-semibold">مشرِف عام النظام</span>;
      case 'supervisor':
        return <span className="bg-sky-50 border border-sky-100 text-sky-800 px-2 py-1 rounded text-xs font-semibold">مراقب تربوي</span>;
      case 'teacher':
        return <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">أستاذ مقرر</span>;
      case 'accountant':
        return <span className="bg-amber-50 border border-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">محاسب مالي</span>;
      default:
        return <span className="bg-slate-50 border border-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-semibold">{role}</span>;
    }
  };

  return (
    <div className="space-y-8" id="users-tab-view">
      
      {/* Upper User Admin Management Tab */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" />
              إدارة المستخدمين والموظفين الإداريين
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">سجل الحسابات النشطة، صلاحية الدخول ومستويات المراقبة على النظام</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            <UserPlus className="w-4 h-4" />
            إضافة مستخدم جديد
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2.5 max-w-md border border-slate-100 mb-6">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="البحث عن موظف بالاسم أو بالبريد..."
            className="bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Users list table */}
        <div className="overflow-x-auto text-right">
          <table className="w-full text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
              <tr>
                <th className="py-3 px-4 text-xs font-sans">اسم المستخدم</th>
                <th className="py-3 px-4 text-xs font-sans">الاسم الكامل للإداري</th>
                <th className="py-3 px-4 text-xs font-sans">رتبة الصلاحية</th>
                <th className="py-3 px-4 text-xs font-sans">بيانات الاتصال</th>
                <th className="py-3 px-4 text-xs font-sans">حالة الحساب</th>
                <th className="py-3 px-4 text-xs font-sans text-left">التعديل والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-mono text-xs text-slate-800 font-bold">@{u.username}</td>
                  <td className="py-3 px-4 font-medium">{u.fullName}</td>
                  <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                  <td className="py-3 px-4 text-xs space-y-0.5 text-slate-500">
                    <p className="font-mono">{u.email}</p>
                    <p className="font-mono">{u.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-colors border ${
                        u.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-rose-50 text-rose-800 border-rose-100 hover:bg-rose-100'
                      }`}
                    >
                      {u.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>نشط ومصرح</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>معطل الدخول</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-left">
                    <div className="inline-flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1 px-2 border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-600 hover:text-sky-700 transition rounded-lg text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 px-2 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition rounded-lg text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">لا يوجد مستخدمون متطابقون لفلتر البحث حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log (سجل تدقيق عيني للمدرسة) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              سجل تدقيق وإثبات المراجعة الأمنية (Audit Trail)
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">تقييد آلي مع وسم زمني لكل العمليات الحساسة بقاعدة بيانات SQLite المحلية لمنع التلاعب</p>
          </div>
          <button 
            onClick={() => {
              mockDb.addAuditLog(currentUser.id, currentUser.username, 'تصدير أرشيف المراجعة', 'تم تصدير نسخة محلية من اللوج الأمني');
              refreshData();
            }}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            <Clock className="w-4 h-4" />
            إثبات تدقيق اللوج المحلي
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2.5 max-w-md border border-slate-100 mb-6">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="البحث بالعملية، التفاصيل، أو اسم الموظف..."
            className="bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full"
            value={logSearchQuery}
            onChange={(e) => setLogSearchQuery(e.target.value)}
          />
        </div>

        {/* Audit trail feed */}
        <div className="overflow-x-auto text-right">
          <table className="w-full text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
              <tr>
                <th className="py-2.5 px-4 text-xs font-sans">التاريخ والساعة</th>
                <th className="py-2.5 px-4 text-xs font-sans">الموظف المسؤول</th>
                <th className="py-2.5 px-4 text-xs font-sans">صنف العملية</th>
                <th className="py-2.5 px-4 text-xs font-sans">تفاصيل التدقيق في SQLite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-4 font-mono text-slate-400 text-rtl">
                    {new Date(log.timestamp).toLocaleDateString('ar-SA')} - {new Date(log.timestamp).toLocaleTimeString('ar-SA')}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">@{log.username}</td>
                  <td className="py-2.5 px-4">
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-sans">{log.details}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">لا يوجد سجلات متطابقة لفلتر البحث حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Add/Edit modal dialog box */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden text-right leading-relaxed flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingUser ? 'تعديل بيانات الحساب' : 'إضافة حساب وطاقات إدارية'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">اسم المستخدم الفريد (Username)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs font-semibold">@</span>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. administrator"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono pl-6"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.replace(/\s+/g, ''))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">الاسم الكامل للموظف</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. أ. عبد الله الشمري"
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">رتبة الصلاحية على النظام</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-sans font-medium"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                >
                  <option value="supervisor">مراقب تربوي وإداري (Supervisor)</option>
                  <option value="teacher">هيئة التدريس الكادر التعليمي (Teacher)</option>
                  <option value="accountant">محاسب المدرسة والرسوم (Accountant)</option>
                  <option value="admin">مشرف النظام العام بكافة الصلاحيات (Admin)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    placeholder="e.g. custom@manara.edu.sa"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رقم الاتصال (الجوال)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 0500112233"
                    className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">حالة الدخول</label>
                <select 
                  className="w-full bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                >
                  <option value="active">مفعل / مصرح له الدخول</option>
                  <option value="inactive">معطل / معلق الصلاحيات</option>
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
                  حفظ البيانات والترقية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
