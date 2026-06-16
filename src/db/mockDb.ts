/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  AuditLog,
  Parent,
  Student,
  Teacher,
  Classroom,
  Subject,
  Schedule,
  Attendance,
  Grade,
  FeeType,
  FeePayment,
  SchoolSettings
} from '../types';

// Default mock seed data
const DEFAULT_USERS: User[] = [
  { id: 'usr-1', username: 'admin', fullName: 'أ. عبد الرحمن الغامدي', role: 'admin', email: 'admin@school.edu.sa', phone: '0501112233', status: 'active', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-2', username: 'supervisor1', fullName: 'سلوى المطيري', role: 'supervisor', email: 'salwa@school.edu.sa', phone: '0502223344', status: 'active', createdAt: '2026-01-10T09:30:00Z' },
  { id: 'usr-3', username: 'teacher_khaled', fullName: 'خالد بن أحمد الشمري', role: 'teacher', email: 'khaled.t@school.edu.sa', phone: '0503334455', status: 'active', createdAt: '2026-02-01T10:00:00Z' },
  { id: 'usr-4', username: 'accountant_mohammed', fullName: 'محمد الحربي', role: 'accountant', email: 'mohammad.a@school.edu.sa', phone: '0504445566', status: 'active', createdAt: '2026-01-15T08:15:00Z' }
];

const DEFAULT_PARENTS: Parent[] = [
  { id: 'prt-1', name: 'أحمد بن علي العتيبي', nationalId: '1098765432', phone: '0555511223', email: 'ahmed.a@gmail.com', work: 'مهندس اتصالات', address: 'حي الملقا - الرياض' },
  { id: 'prt-2', name: 'سلطان بن فهد الدوسري', nationalId: '1023456789', phone: '0555533445', email: 'sultan.f@gmail.com', work: 'معلم حكومي', address: 'حي الياسمين - الرياض' },
  { id: 'prt-3', name: 'ياسر بن محمد القحطاني', nationalId: '1034567890', phone: '0555577889', email: 'yasser.q@gmail.com', work: 'رجل أعمال', address: 'حي النخيل - الرياض' }
];

const DEFAULT_CLASSROOMS: Classroom[] = [
  { id: 'class-1', name: 'الصف الأول الابتدائي - أ', stage: 'primary', maxCapacity: 25, roomNumber: 'A101' },
  { id: 'class-2', name: 'الصف الثاني المتوسط - ب', stage: 'middle', maxCapacity: 30, roomNumber: 'B203' },
  { id: 'class-3', name: 'الصف الثالث الثانوي - علمي أ', stage: 'high', maxCapacity: 28, roomNumber: 'C302' }
];

const DEFAULT_STUDENTS: Student[] = [
  { id: 'std-1', name: 'سعود بن أحمد العتيبي', gender: 'male', birthDate: '2019-04-12', nationalId: '1122334455', address: 'حي الملقا - الرياض', medicalDetails: 'لا توجد - سليم', parentId: 'prt-1', classId: 'class-1', avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150', bloodGroup: 'O+', status: 'active' },
  { id: 'std-2', name: 'ريناد بنت أحمد العتيبي', gender: 'female', birthDate: '2018-11-20', nationalId: '1133445566', address: 'حي الملقا - الرياض', medicalDetails: 'حساسية من البنسلين', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active' },
  { id: 'std-3', name: 'فيصل بن سلطان الدوسري', gender: 'male', birthDate: '2012-08-05', nationalId: '1155667788', address: 'حي الياسمين - الرياض', medicalDetails: 'ربو خفيف', parentId: 'prt-2', classId: 'class-2', avatar: '', bloodGroup: 'B-', status: 'active' },
  { id: 'std-4', name: 'عبد اللطيف بن ياسر القحطاني', gender: 'male', birthDate: '2008-01-30', nationalId: '1177889900', address: 'حي النخيل - الرياض', medicalDetails: 'لا توجد', parentId: 'prt-3', classId: 'class-3', avatar: '', bloodGroup: 'O-', status: 'active' }
];

const DEFAULT_TEACHERS: Teacher[] = [
  { id: 'tch-1', name: 'أ. خالد بن أحمد الشمري', nationalId: '1088776655', qualification: 'بكالوريوس فيزياء - جامعة الملك سعود', experienceYears: 12, email: 'khaled.t@school.edu.sa', phone: '0503334455', salary: 11500, specialty: 'الفيزياء والعلوم العامة' },
  { id: 'tch-2', name: 'أ. عمر بن سليم الحربي', nationalId: '1077665544', qualification: 'بكالوريوس لغة عربية - جامعة الإمام', experienceYears: 8, email: 'omar.h@school.edu.sa', phone: '0505556677', salary: 9800, specialty: 'لغتي واللغة العربية' },
  { id: 'tch-3', name: 'أ. نورة بنت عبد الله الرشيد', nationalId: '1066554433', qualification: 'ماجستير رياضيات - جامعة الملك سعود', experienceYears: 15, email: 'noura.r@school.edu.sa', phone: '0506667788', salary: 13200, specialty: 'الرياضيات المتقدمة' }
];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'لغتي الجميلة', minGrade: 50, maxGrade: 100, stage: 'primary' },
  { id: 'sub-2', name: 'الرياضيات العامة', minGrade: 50, maxGrade: 100, stage: 'primary' },
  { id: 'sub-3', name: 'العلوم العامة', minGrade: 50, maxGrade: 100, stage: 'middle' },
  { id: 'sub-4', name: 'اللغة الإنجليزية', minGrade: 50, maxGrade: 100, stage: 'middle' },
  { id: 'sub-5', name: 'الفيزياء الحديثة', minGrade: 50, maxGrade: 100, stage: 'high' },
  { id: 'sub-6', name: 'الرياضيات التطبيقية', minGrade: 50, maxGrade: 100, stage: 'high' }
];

const DEFAULT_SCHEDULES: Schedule[] = [
  // Class 1 (Primary 1-A): Sunday
  { id: 'sch-1', classroomId: 'class-1', teacherId: 'tch-2', subjectId: 'sub-1', dayOfWeek: 0, periodNumber: 1 },
  { id: 'sch-2', classroomId: 'class-1', teacherId: 'tch-3', subjectId: 'sub-2', dayOfWeek: 0, periodNumber: 2 },
  // Class 2 (Middle 2-B)
  { id: 'sch-3', classroomId: 'class-2', teacherId: 'tch-1', subjectId: 'sub-3', dayOfWeek: 1, periodNumber: 1 },
  // Class 3 (High 3-Scientific A)
  { id: 'sch-4', classroomId: 'class-3', teacherId: 'tch-1', subjectId: 'sub-5', dayOfWeek: 0, periodNumber: 1 },
  { id: 'sch-5', classroomId: 'class-3', teacherId: 'tch-3', subjectId: 'sub-6', dayOfWeek: 0, periodNumber: 2 }
];

const DEFAULT_ATTENDANCES: Attendance[] = [
  { id: 'att-1', studentId: 'std-1', date: '2026-06-14', status: 'present', notes: '' },
  { id: 'att-2', studentId: 'std-2', date: '2026-06-14', status: 'present', notes: '' },
  { id: 'att-3', studentId: 'std-3', date: '2026-06-14', status: 'absent', notes: 'وعكة صحية حادة ومع ولى أمره خبر' },
  { id: 'att-4', studentId: 'std-4', date: '2026-06-14', status: 'present', notes: '' },
  { id: 'att-5', studentId: 'std-1', date: '2026-06-15', status: 'present', notes: '' },
  { id: 'att-6', studentId: 'std-2', date: '2026-06-15', status: 'late', notes: 'تأخر بالوصول للباص 15 دقيقة' },
  { id: 'att-7', studentId: 'std-3', date: '2026-06-15', status: 'present', notes: '' },
  { id: 'att-8', studentId: 'std-4', date: '2026-06-15', status: 'absent', notes: 'غياب بدون عذر مقبول' }
];

const DEFAULT_GRADES: Grade[] = [
  { id: 'grd-1', studentId: 'std-1', subjectId: 'sub-1', examName: 'اختبار نصف الفصل الأول', examDate: '2026-03-10', courseworkGrade: 18, finalExamGrade: 19, totalGrade: 37, resultStatus: 'pass' },
  { id: 'grd-2', studentId: 'std-1', subjectId: 'sub-2', examName: 'اختبار نصف الفصل الأول', examDate: '2026-03-12', courseworkGrade: 15, finalExamGrade: 16, totalGrade: 31, resultStatus: 'pass' },
  { id: 'grd-3', studentId: 'std-3', subjectId: 'sub-3', examName: 'اختبار أعمال السنة', examDate: '2026-04-15', courseworkGrade: 27, finalExamGrade: 58, totalGrade: 85, resultStatus: 'pass' },
  { id: 'grd-4', studentId: 'std-4', subjectId: 'sub-5', examName: 'نهائي الفصل الأول', examDate: '2026-05-20', courseworkGrade: 38, finalExamGrade: 45, totalGrade: 83, resultStatus: 'pass' }
];

const DEFAULT_FEE_TYPES: FeeType[] = [
  { id: 'fee-1', name: 'الرسوم الدراسية الأساسية للفصل الأول', amount: 5000, description: 'رسوم التعليم والتدريس السنوية' },
  { id: 'fee-2', name: 'رسوم الكتب المدرسية والوسائل العلمية', amount: 450, description: 'الكتب والوسائط التفاعلية والملخصات المعمدة' },
  { id: 'fee-3', name: 'رسوم النقل المدرسي (الباص المسائي والصباحي)', amount: 1500, description: 'خدمات النقل المدرسي عبر باصات المدرسة الحديثة' }
];

const DEFAULT_FEE_PAYMENTS: FeePayment[] = [
  { id: 'pay-1', studentId: 'std-1', feeTypeId: 'fee-1', amountPaid: 5000, paymentDate: '2026-01-05', paymentMethod: 'bank_transfer', referenceNumber: 'TXN-998827', academicYear: '1447 - 1448هـ', notes: 'تم تحويلها من حساب الأب المباشر' },
  { id: 'pay-2', studentId: 'std-1', feeTypeId: 'fee-2', amountPaid: 450, paymentDate: '2026-01-05', paymentMethod: 'card', referenceNumber: 'TXN-554432', academicYear: '1447 - 1448هـ', notes: 'شبكة يدوية الصراف' },
  { id: 'pay-3', studentId: 'std-3', feeTypeId: 'fee-1', amountPaid: 2500, paymentDate: '2026-01-12', paymentMethod: 'bank_transfer', referenceNumber: 'TXN-102938', academicYear: '1447 - 1448هـ', notes: 'دفعة أولى من أقساط الفصول' }
];

const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'مدارس منارة التميز الأهلية النموذجية',
  logoUrl: '🎨',
  contactPhone: '920004561',
  contactEmail: 'info@manara.edu.sa',
  currentAcademicYear: '1447 - 1448هـ (2026 - 2027م)',
  address: 'شارع الملك فهد - حي النخيل - الرياض - المملكة العربية السعودية',
  bankAccount: 'SA8020000012345678901000'
};

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', userId: 'usr-1', username: 'admin', action: 'تهيئة النظام', details: 'تهيئة قاعدة بيانات المدرسة بنجاح وإعداد الجداول', timestamp: '2026-06-15T08:00:00.000Z' },
  { id: 'log-2', userId: 'usr-1', username: 'admin', action: 'تعديل الرسوم المدرسية', details: 'تحديث رسوم النقل والباص لتكون 1500 ريال', timestamp: '2026-06-15T09:12:00.000Z' }
];

// In-Memory Database Engine holding State
class LocalSQLiteEngine {
  private users: User[] = [];
  private auditLogs: AuditLog[] = [];
  private parents: Parent[] = [];
  private students: Student[] = [];
  private teachers: Teacher[] = [];
  private classrooms: Classroom[] = [];
  private subjects: Subject[] = [];
  private schedules: Schedule[] = [];
  private attendances: Attendance[] = [];
  private grades: Grade[] = [];
  private feeTypes: FeeType[] = [];
  private feePayments: FeePayment[] = [];
  private settings: SchoolSettings = DEFAULT_SETTINGS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const getOrSeed = <T>(key: string, defaultVal: T): T => {
        const stored = localStorage.getItem(`manara_db_${key}`);
        if (stored) {
          return JSON.parse(stored);
        } else {
          localStorage.setItem(`manara_db_${key}`, JSON.stringify(defaultVal));
          return defaultVal;
        }
      };

      this.users = getOrSeed('users', DEFAULT_USERS);
      this.auditLogs = getOrSeed('audit_logs', DEFAULT_AUDIT_LOGS);
      this.parents = getOrSeed('parents', DEFAULT_PARENTS);
      this.classrooms = getOrSeed('classrooms', DEFAULT_CLASSROOMS);
      this.students = getOrSeed('students', DEFAULT_STUDENTS);
      this.teachers = getOrSeed('teachers', DEFAULT_TEACHERS);
      this.subjects = getOrSeed('subjects', DEFAULT_SUBJECTS);
      this.schedules = getOrSeed('schedules', DEFAULT_SCHEDULES);
      this.attendances = getOrSeed('attendances', DEFAULT_ATTENDANCES);
      this.grades = getOrSeed('grades', DEFAULT_GRADES);
      this.feeTypes = getOrSeed('fee_types', DEFAULT_FEE_TYPES);
      this.feePayments = getOrSeed('fee_payments', DEFAULT_FEE_PAYMENTS);
      this.settings = getOrSeed('settings', DEFAULT_SETTINGS);

    } catch (e) {
      console.error('Error initializing LocalStorage Database engine, resorting to absolute memory:', e);
      this.resetToDefaults();
    }
  }

  private saveToStorage(key: string, data: any) {
    try {
      localStorage.setItem(`manara_db_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save key ${key} to disk storage:`, e);
    }
  }

  private saveAll() {
    this.saveToStorage('users', this.users);
    this.saveToStorage('audit_logs', this.auditLogs);
    this.saveToStorage('parents', this.parents);
    this.saveToStorage('students', this.students);
    this.saveToStorage('teachers', this.teachers);
    this.saveToStorage('classrooms', this.classrooms);
    this.saveToStorage('subjects', this.subjects);
    this.saveToStorage('schedules', this.schedules);
    this.saveToStorage('attendances', this.attendances);
    this.saveToStorage('grades', this.grades);
    this.saveToStorage('fee_types', this.feeTypes);
    this.saveToStorage('fee_payments', this.feePayments);
    this.saveToStorage('settings', this.settings);
  }

  public resetToDefaults() {
    this.users = [...DEFAULT_USERS];
    this.auditLogs = [...DEFAULT_AUDIT_LOGS];
    this.parents = [...DEFAULT_PARENTS];
    this.classrooms = [...DEFAULT_CLASSROOMS];
    this.students = [...DEFAULT_STUDENTS];
    this.teachers = [...DEFAULT_TEACHERS];
    this.subjects = [...DEFAULT_SUBJECTS];
    this.schedules = [...DEFAULT_SCHEDULES];
    this.attendances = [...DEFAULT_ATTENDANCES];
    this.grades = [...DEFAULT_GRADES];
    this.feeTypes = [...DEFAULT_FEE_TYPES];
    this.feePayments = [...DEFAULT_FEE_PAYMENTS];
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveAll();
    this.addAuditLog('usr-1', 'admin', 'إعادة ضبط قاعدة البيانات', 'تم استعادة تهيئة المصنع وجميع البيانات العينية التجريبية');
  }

  // SESSION CONTROL
  public authenticate(usernameParam: string, pass: string): User | null {
    if (usernameParam === 'admin' && pass === 'admin123') {
      const u = this.users.find(x => x.username === 'admin') || this.users[0];
      localStorage.setItem('manara_active_session', JSON.stringify(u));
      this.addAuditLog(u.id, u.username, 'تسجيل دخول ناجح', 'انعقاد جلسة عمل لمدير النظام بقاعدة البيانات');
      return u;
    }
    if (usernameParam === 'staff' && pass === 'staff123') {
      const u = this.users.find(x => x.username === 'supervisor1') || this.users[1];
      // Adapt the role to 'supervisor' so it switches according to standard routing
      const adapted: User = { ...u, role: 'supervisor' };
      localStorage.setItem('manara_active_session', JSON.stringify(adapted));
      this.addAuditLog(u.id, u.username, 'تسجيل دخول ناجح', 'انعقاد جلسة عمل لمشرف إداري بقاعدة البيانات');
      return adapted;
    }
    return null;
  }

  public getCurrentSession(): User | null {
    const s = localStorage.getItem('manara_active_session');
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  public clearSession() {
    localStorage.removeItem('manara_active_session');
  }

  // AUDIT LOG
  public addAuditLog(userId: string, username: string, action: string, details: string) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      username,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    this.saveToStorage('audit_logs', this.auditLogs);
    return newLog;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // USERS
  public getUsers(): User[] { return this.users; }
  public addUser(user: Omit<User, 'id' | 'createdAt'>, activeUser: string, activeUsername: string): User {
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.saveToStorage('users', this.users);
    this.addAuditLog(activeUser, activeUsername, 'إضافة مستخدم جديد', `تفعيل حساب مستخدم: ${newUser.username} بصلاحية ${newUser.role}`);
    return newUser;
  }
  public updateUser(id: string, updated: Partial<User>, activeUser: string, activeUsername: string): User {
    this.users = this.users.map(u => u.id === id ? { ...u, ...updated } : u);
    this.saveToStorage('users', this.users);
    const user = this.users.find(u => u.id === id)!;
    this.addAuditLog(activeUser, activeUsername, 'تعديل معلومات مستخدم', `تحديث بيانات حساب مستخدم: ${user?.username}`);
    return user;
  }
  public deleteUser(id: string, activeUser: string, activeUsername: string) {
    const target = this.users.find(u => u.id === id);
    this.users = this.users.filter(u => u.id !== id);
    this.saveToStorage('users', this.users);
    if (target) {
      this.addAuditLog(activeUser, activeUsername, 'حذف مستخدم', `إزالة مستخدم نهائياً من الصلاحيات: ${target.username}`);
    }
  }

  // PARENTS
  public getParents(): Parent[] { return this.parents; }
  public addParent(parent: Omit<Parent, 'id'>, activeUser: string, activeUsername: string): Parent {
    const newParent: Parent = {
      ...parent,
      id: `prt-${Date.now()}`
    };
    this.parents.push(newParent);
    this.saveToStorage('parents', this.parents);
    this.addAuditLog(activeUser, activeUsername, 'تسجيل ولي أمر', `إضافة ولي الأمر: ${newParent.name} برقم هوية ${newParent.nationalId}`);
    return newParent;
  }
  public updateParent(id: string, updated: Partial<Parent>, activeUser: string, activeUsername: string): Parent {
    this.parents = this.parents.map(p => p.id === id ? { ...p, ...updated } : p);
    this.saveToStorage('parents', this.parents);
    const parent = this.parents.find(p => p.id === id)!;
    this.addAuditLog(activeUser, activeUsername, 'تعديل ولي أمر', `تعديل بيانات ولي الأمر: ${parent?.name}`);
    return parent;
  }

  // STUDENTS
  public getStudents(): Student[] { return this.students; }
  public addStudent(student: Omit<Student, 'id'>, activeUser: string, activeUsername: string): Student {
    const newStudent: Student = {
      ...student,
      id: `std-${Date.now()}`
    };
    this.students.push(newStudent);
    this.saveToStorage('students', this.students);
    this.addAuditLog(activeUser, activeUsername, 'تسجيل طالب جديد', `قبول وقيد الطالب: ${newStudent.name} وتسكينه بالفصل`);
    return newStudent;
  }
  public updateStudent(id: string, updated: Partial<Student>, activeUser: string, activeUsername: string): Student {
    this.students = this.students.map(s => s.id === id ? { ...s, ...updated } : s);
    this.saveToStorage('students', this.students);
    const student = this.students.find(s => s.id === id)!;
    this.addAuditLog(activeUser, activeUsername, 'تعديل بيانات طالب', `تحديث السجل الإداري والأكاديمي للطالب: ${student?.name}`);
    return student;
  }
  public deleteStudent(id: string, activeUser: string, activeUsername: string) {
    const student = this.students.find(s => s.id === id);
    this.students = this.students.filter(s => s.id !== id);
    this.saveToStorage('students', this.students);
    if (student) {
      this.addAuditLog(activeUser, activeUsername, 'شطب وإزالة طالب', `إسقاط قيد الطالب نهائياً: ${student.name}`);
    }
  }

  // KIDS TRANSFERS (END OF YEAR WIZARD)
  public promoteStudents(fromClassId: string, toClassId: string, activeUser: string, activeUsername: string): number {
    let count = 0;
    this.students = this.students.map(s => {
      if (s.classId === fromClassId && s.status === 'active') {
        count++;
        return { ...s, classId: toClassId };
      }
      return s;
    });
    this.saveToStorage('students', this.students);
    const fromCls = this.classrooms.find(c => c.id === fromClassId)?.name || fromClassId;
    const toCls = this.classrooms.find(c => c.id === toClassId)?.name || toClassId;
    this.addAuditLog(activeUser, activeUsername, 'ترقية الطلاب لصف دراسي أعلى', `ترفيع عدد ${count} طالباً بنجاح من فصل (${fromCls}) إلى فصل (${toCls})`);
    return count;
  }

  // TEACHERS
  public getTeachers(): Teacher[] { return this.teachers; }
  public addTeacher(teacher: Omit<Teacher, 'id'>, activeUser: string, activeUsername: string): Teacher {
    const newTeacher: Teacher = {
      ...teacher,
      id: `tch-${Date.now()}`
    };
    this.teachers.push(newTeacher);
    this.saveToStorage('teachers', this.teachers);
    this.addAuditLog(activeUser, activeUsername, 'إضافة معلم وكادر', `التعاقد مع المعلم: ${newTeacher.name} بتخصص ${newTeacher.specialty}`);
    return newTeacher;
  }
  public updateTeacher(id: string, updated: Partial<Teacher>, activeUser: string, activeUsername: string): Teacher {
    this.teachers = this.teachers.map(t => t.id === id ? { ...t, ...updated } : t);
    this.saveToStorage('teachers', this.teachers);
    const teacher = this.teachers.find(t => t.id === id)!;
    this.addAuditLog(activeUser, activeUsername, 'تعديل بيانات معلم', `تعديل ملف المعلم: ${teacher?.name}`);
    return teacher;
  }
  public deleteTeacher(id: string, activeUser: string, activeUsername: string) {
    const tch = this.teachers.find(t => t.id === id);
    this.teachers = this.teachers.filter(t => t.id !== id);
    this.saveToStorage('teachers', this.teachers);
    if (tch) {
      this.addAuditLog(activeUser, activeUsername, 'إنهاء عقد معلم', `فصل أو حذف المعلم من سجلات المدرسة: ${tch.name}`);
    }
  }

  // CLASSROOMS
  public getClassrooms(): Classroom[] { return this.classrooms; }
  public addClassroom(cls: Omit<Classroom, 'id'>, activeUser: string, activeUsername: string): Classroom {
    const newCls: Classroom = {
      ...cls,
      id: `class-${Date.now()}`
    };
    this.classrooms.push(newCls);
    this.saveToStorage('classrooms', this.classrooms);
    this.addAuditLog(activeUser, activeUsername, 'إضافة فصل دراسي', `تأسيس الفصل الدراسي الجديد: ${newCls.name} بغرفة رقم ${newCls.roomNumber}`);
    return newCls;
  }
  public updateClassroom(id: string, updated: Partial<Classroom>, activeUser: string, activeUsername: string): Classroom {
    this.classrooms = this.classrooms.map(c => c.id === id ? { ...c, ...updated } : c);
    this.saveToStorage('classrooms', this.classrooms);
    const cl = this.classrooms.find(c => c.id === id)!;
    this.addAuditLog(activeUser, activeUsername, 'تعديل فصل دراسي', `تحديث بيانات غرف وبث صفوف الفصل: ${cl?.name}`);
    return cl;
  }
  public deleteClassroom(id: string, activeUser: string, activeUsername: string) {
    const cl = this.classrooms.find(c => c.id === id);
    this.classrooms = this.classrooms.filter(c => c.id !== id);
    this.saveToStorage('classrooms', this.classrooms);
    if (cl) {
      this.addAuditLog(activeUser, activeUsername, 'أرشفة وحذف فصل', `إزالة الفصل الدراسي من الخدمة النشطة: ${cl.name}`);
    }
  }

  // SUBJECTS
  public getSubjects(): Subject[] { return this.subjects; }
  public addSubject(sub: Omit<Subject, 'id'>, activeUser: string, activeUsername: string): Subject {
    const newSub: Subject = {
      ...sub,
      id: `sub-${Date.now()}`
    };
    this.subjects.push(newSub);
    this.saveToStorage('subjects', this.subjects);
    this.addAuditLog(activeUser, activeUsername, 'إضافة مادة دراسية', `إدراج المقرر التدريسي الجديد: ${newSub.name} بنصاب أدنى للنجاح ${newSub.minGrade}`);
    return newSub;
  }
  public updateSubject(id: string, updated: Partial<Subject>, activeUser: string, activeUsername: string): Subject {
    this.subjects = this.subjects.map(s => s.id === id ? { ...s, ...updated } : s);
    this.saveToStorage('subjects', this.subjects);
    const sub = this.subjects.find(s => s.id === id)!;
    this.addAuditLog(activeUser, activeUsername, 'تعديل مادة دراسية', `تحديث تفاصيل درجات مادة: ${sub?.name}`);
    return sub;
  }
  public deleteSubject(id: string, activeUser: string, activeUsername: string) {
    const sub = this.subjects.find(s => s.id === id);
    this.subjects = this.subjects.filter(s => s.id !== id);
    this.saveToStorage('subjects', this.subjects);
    if (sub) {
      this.addAuditLog(activeUser, activeUsername, 'حذف مادة دراسية', `إسقاط مادة التدريس: ${sub.name}`);
    }
  }

  // SCHEDULES (TIMETABLE WITH CONFLICT CHECKS)
  public getSchedules(): Schedule[] { return this.schedules; }
  public checkScheduleConflict(classroomOrTeacher: { classroomId?: string; teacherId?: string }, dayOfWeek: number, periodNumber: number): { hasConflict: boolean; message: string } {
    const conflicts = this.schedules.filter(s => s.dayOfWeek === dayOfWeek && s.periodNumber === periodNumber);
    
    if (classroomOrTeacher.classroomId) {
      const classConflict = conflicts.find(s => s.classroomId === classroomOrTeacher.classroomId);
      if (classConflict) {
        const clsName = this.classrooms.find(c => c.id === classConflict.classroomId)?.name || '';
        const subName = this.subjects.find(s => s.id === classConflict.subjectId)?.name || '';
        return { hasConflict: true, message: `تعارض فصلي: ${clsName} لديه مادة ${subName} في هذا الوقت بالفعل!` };
      }
    }

    if (classroomOrTeacher.teacherId) {
      const teacherConflict = conflicts.find(s => s.teacherId === classroomOrTeacher.teacherId);
      if (teacherConflict) {
        const tchName = this.teachers.find(t => t.id === teacherConflict.teacherId)?.name || '';
        const clsName = this.classrooms.find(c => c.id === teacherConflict.classroomId)?.name || '';
        return { hasConflict: true, message: `تعارض المعلم: ${tchName} مشغول بالتدريس في ${clsName} في هذه الحصة!` };
      }
    }

    return { hasConflict: false, message: '' };
  }

  public addSchedule(sch: Omit<Schedule, 'id'>, activeUser: string, activeUsername: string): { success: boolean; data?: Schedule; error?: string } {
    // Audit conflicts
    const classConflictCheck = this.checkScheduleConflict({ classroomId: sch.classroomId }, sch.dayOfWeek, sch.periodNumber);
    if (classConflictCheck.hasConflict) {
      return { success: false, error: classConflictCheck.message };
    }

    const teacherConflictCheck = this.checkScheduleConflict({ teacherId: sch.teacherId }, sch.dayOfWeek, sch.periodNumber);
    if (teacherConflictCheck.hasConflict) {
      return { success: false, error: teacherConflictCheck.message };
    }

    const newSch: Schedule = {
      ...sch,
      id: `sch-${Date.now()}`
    };
    this.schedules.push(newSch);
    this.saveToStorage('schedules', this.schedules);

    const clsName = this.classrooms.find(c => c.id === sch.classroomId)?.name || '';
    const subName = this.subjects.find(s => s.id === sch.subjectId)?.name || '';
    const tchName = this.teachers.find(t => t.id === sch.teacherId)?.name || '';
    this.addAuditLog(activeUser, activeUsername, 'إسناد حصة جدول', `جدولة مادة ${subName} للصف ${clsName} للمدرس ${tchName} للحصة ${sch.periodNumber}`);

    return { success: true, data: newSch };
  }

  public deleteSchedule(id: string, activeUser: string, activeUsername: string) {
    this.schedules = this.schedules.filter(s => s.id !== id);
    this.saveToStorage('schedules', this.schedules);
    this.addAuditLog(activeUser, activeUsername, 'إلغاء حصة بالجدول', 'تم شطب الحصة الدراسية من الجدول العام للفصل');
  }

  // ATTENDANCE
  public getAttendances(): Attendance[] { return this.attendances; }
  public saveAttendanceBatch(records: Omit<Attendance, 'id'>[], activeUser: string, activeUsername: string) {
    records.forEach(rec => {
      // Find existing attendance for same student on same date
      const idx = this.attendances.findIndex(a => a.studentId === rec.studentId && a.date === rec.date);
      if (idx !== -1) {
        this.attendances[idx] = { ...this.attendances[idx], ...rec };
      } else {
        this.attendances.push({
          ...rec,
          id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        });
      }
    });
    this.saveToStorage('attendances', this.attendances);
    this.addAuditLog(activeUser, activeUsername, 'رصد الحضور اليومي', `تسجيل حضور وغياب لعدد ${records.length} طلاب بتأريخ الكشف`);
  }

  // GRADES & EXAMS
  public getGrades(): Grade[] { return this.grades; }
  public addOrUpdateGrade(rec: Omit<Grade, 'id' | 'totalGrade' | 'resultStatus'>, activeUser: string, activeUsername: string): Grade {
    const total = Number(rec.courseworkGrade) + Number(rec.finalExamGrade);
    const subject = this.subjects.find(s => s.id === rec.subjectId);
    const passLimit = subject ? subject.minGrade : 50;
    const resultStatus = total >= passLimit ? 'pass' : 'fail';
    
    const prepared: Grade = {
      id: '',
      studentId: rec.studentId,
      subjectId: rec.subjectId,
      examName: rec.examName,
      examDate: rec.examDate,
      courseworkGrade: Number(rec.courseworkGrade),
      finalExamGrade: Number(rec.finalExamGrade),
      totalGrade: total,
      resultStatus
    };

    const exIdx = this.grades.findIndex(g => g.studentId === rec.studentId && g.subjectId === rec.subjectId && g.examName === rec.examName);
    if (exIdx !== -1) {
      prepared.id = this.grades[exIdx].id;
      this.grades[exIdx] = prepared;
    } else {
      prepared.id = `grd-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      this.grades.push(prepared);
    }

    this.saveToStorage('grades', this.grades);
    const stdName = this.students.find(s => s.id === rec.studentId)?.name || '';
    const subName = subject ? subject.name : '';
    this.addAuditLog(activeUser, activeUsername, 'رصد درجة طالب', `إثبات وحساب درجات مادة ${subName} للطالب: ${stdName} بتقدير إجمالي ${total}`);
    return prepared;
  }

  // FINANCIALS / FEE TYPES
  public getFeeTypes(): FeeType[] { return this.feeTypes; }
  public addFeeType(fee: Omit<FeeType, 'id'>, activeUser: string, activeUsername: string): FeeType {
    const newFee: FeeType = {
      ...fee,
      id: `fee-${Date.now()}`
    };
    this.feeTypes.push(newFee);
    this.saveToStorage('fee_types', this.feeTypes);
    this.addAuditLog(activeUser, activeUsername, 'إضافة رسم مالي', `استحداث بند مالي (${newFee.name}) بقيمة ${newFee.amount} ريال`);
    return newFee;
  }
  public updateFeeType(id: string, updated: Partial<FeeType>, activeUser: string, activeUsername: string): FeeType {
    this.feeTypes = this.feeTypes.map(f => f.id === id ? { ...f, ...updated } : f);
    this.saveToStorage('fee_types', this.feeTypes);
    const f = this.feeTypes.find(f => f.id === id)!;
    this.addAuditLog(activeUser, activeUsername, 'تعديل ثمن بند مالي', `تغيير قيمة بند الرسم المالي: ${f?.name}`);
    return f;
  }

  // FINANCIALS / PAYMENTS
  public getFeePayments(): FeePayment[] { return this.feePayments; }
  public addFeePayment(pay: Omit<FeePayment, 'id'>, activeUser: string, activeUsername: string): FeePayment {
    const newPay: FeePayment = {
      ...pay,
      id: `pay-${Date.now()}`
    };
    this.feePayments.push(newPay);
    this.saveToStorage('fee_payments', this.feePayments);
    const stdName = this.students.find(s => s.id === pay.studentId)?.name || '';
    const feeName = this.feeTypes.find(f => f.id === pay.feeTypeId)?.name || '';
    this.addAuditLog(activeUser, activeUsername, 'تحصيل وإيصال نقدي', `إصدار سند دفع بقيمة ${pay.amountPaid} ريال للطالب: ${stdName} بخصوص ${feeName}`);
    return newPay;
  }

  // GENERAL CONFIG
  public getSettings(): SchoolSettings { return this.settings; }
  public updateSettings(upd: Partial<SchoolSettings>, activeUser: string, activeUsername: string): SchoolSettings {
    this.settings = { ...this.settings, ...upd };
    this.saveToStorage('settings', this.settings);
    this.addAuditLog(activeUser, activeUsername, 'تغيير إعدادات المدرسة', 'تعديل البيانات العامة وشعار التقارير الرسمية');
    return this.settings;
  }

  // DYNAMIC BACKUP/RESTORE FOR THE OFFLINE-FIRST MANARA APP
  public importBackupJSON(jsonStr: string, activeUser: string, activeUsername: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.brand !== 'manara-school-database' && !parsed.settings) {
        throw new Error('الملف ليس قاعدة بيانات خاصة بنظام المنارة!');
      }

      const getSafeArr = (arr: any) => Array.isArray(arr) ? arr : [];

      this.users = getSafeArr(parsed.users);
      this.auditLogs = getSafeArr(parsed.auditLogs);
      this.parents = getSafeArr(parsed.parents);
      this.students = getSafeArr(parsed.students);
      this.teachers = getSafeArr(parsed.teachers);
      this.classrooms = getSafeArr(parsed.classrooms);
      this.subjects = getSafeArr(parsed.subjects);
      this.schedules = getSafeArr(parsed.schedules);
      this.attendances = getSafeArr(parsed.attendances);
      this.grades = getSafeArr(parsed.grades);
      this.feeTypes = getSafeArr(parsed.feeTypes);
      this.feePayments = getSafeArr(parsed.feePayments);
      this.settings = parsed.settings || DEFAULT_SETTINGS;

      this.saveAll();
      this.addAuditLog(activeUser, activeUsername, 'استعادة نسخة احتياطية', 'تم استعادة كامل جداول SQLite بنجاح من ملف خارجي');
      return true;
    } catch (e) {
      console.error('Error importing JSON database back:', e);
      return false;
    }
  }

  public exportBackupJSON(): string {
    const payload = {
      brand: 'manara-school-database',
      exportedAt: new Date().toISOString(),
      users: this.users,
      auditLogs: this.auditLogs,
      parents: this.parents,
      students: this.students,
      teachers: this.teachers,
      classrooms: this.classrooms,
      subjects: this.subjects,
      schedules: this.schedules,
      attendances: this.attendances,
      grades: this.grades,
      feeTypes: this.feeTypes,
      feePayments: this.feePayments,
      settings: this.settings
    };
    return JSON.stringify(payload, null, 2);
  }

  // EXPORT THE SCHEMAS AS SQLite DDL + DML STATEMENTS (.SQL file download format)
  // Highly attractive for school admins/DBAs
  public exportSQLBackup(): string {
    let sql = `-- ========================================== \n`;
    sql += `-- قاعدة بيانات نظام المنارة لإدارة المدارس (SQLite Backup) \n`;
    sql += `-- تم التصدير بتاريخ: ${new Date().toLocaleString('ar-SA')} \n`;
    sql += `-- وضع التشغيل: مستقل دون اتصال بالإنترنت (RTL Normalized Offline SQLite) \n`;
    sql += `-- ========================================== \n\n`;

    sql += `PRAGMA foreign_keys = ON;\n\n`;

    // 1. USERS
    sql += `-- جدول المستخدمين والصلاحيات \n`;
    sql += `CREATE TABLE IF NOT EXISTS users (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  username TEXT NOT NULL UNIQUE,\n`;
    sql += `  fullName TEXT NOT NULL,\n`;
    sql += `  role TEXT CHECK(role IN ('admin', 'supervisor', 'teacher', 'accountant', 'parent')),\n`;
    sql += `  email TEXT,\n`;
    sql += `  phone TEXT,\n`;
    sql += `  status TEXT CHECK(status IN ('active', 'inactive')),\n`;
    sql += `  createdAt TEXT\n`;
    sql += `);\n\n`;

    this.users.forEach(u => {
      sql += `INSERT INTO users VALUES ('${u.id}', '${u.username}', '${u.fullName}', '${u.role}', '${u.email}', '${u.phone}', '${u.status}', '${u.createdAt}');\n`;
    });
    sql += `\n`;

    // 2. PARENTS
    sql += `-- جدول أولياء الأمور \n`;
    sql += `CREATE TABLE IF NOT EXISTS parents (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  nationalId TEXT UNIQUE NOT NULL,\n`;
    sql += `  phone TEXT,\n`;
    sql += `  email TEXT,\n`;
    sql += `  work TEXT,\n`;
    sql += `  address TEXT\n`;
    sql += `);\n\n`;

    this.parents.forEach(p => {
      sql += `INSERT INTO parents VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.nationalId}', '${p.phone}', '${p.email}', '${p.work.replace(/'/g, "''")}', '${p.address.replace(/'/g, "''")}');\n`;
    });
    sql += `\n`;

    // 3. CLASSROOMS
    sql += `-- جدول الفصول الدراسية \n`;
    sql += `CREATE TABLE IF NOT EXISTS classrooms (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  stage TEXT CHECK(stage IN ('primary', 'middle', 'high')),\n`;
    sql += `  maxCapacity INTEGER,\n`;
    sql += `  roomNumber TEXT\n`;
    sql += `);\n\n`;

    this.classrooms.forEach(c => {
      sql += `INSERT INTO classrooms VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.stage}', ${c.maxCapacity}, '${c.roomNumber}');\n`;
    });
    sql += `\n`;

    // 4. STUDENTS
    sql += `-- جدول الطلاب \n`;
    sql += `CREATE TABLE IF NOT EXISTS students (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  gender TEXT CHECK(gender IN ('male', 'female')),\n`;
    sql += `  birthDate TEXT,\n`;
    sql += `  nationalId TEXT UNIQUE NOT NULL,\n`;
    sql += `  address TEXT,\n`;
    sql += `  medicalDetails TEXT,\n`;
    sql += `  parentId TEXT FOREIGN KEY REFERENCES parents(id) ON DELETE CASCADE,\n`;
    sql += `  classId TEXT FOREIGN KEY REFERENCES classrooms(id) ON DELETE SET NULL,\n`;
    sql += `  bloodGroup TEXT,\n`;
    sql += `  status TEXT CHECK(status IN ('active', 'graduated', 'transferred'))\n`;
    sql += `);\n\n`;

    this.students.forEach(s => {
      sql += `INSERT INTO students VALUES ('${s.id}', '${s.name.replace(/'/g, "''")}', '${s.gender}', '${s.birthDate}', '${s.nationalId}', '${s.address.replace(/'/g, "''")}', '${s.medicalDetails.replace(/'/g, "''")}', '${s.parentId}', '${s.classId}', '${s.bloodGroup}', '${s.status}');\n`;
    });
    sql += `\n`;

    // 5. TEACHERS
    sql += `-- جدول الكادر التعليمي \n`;
    sql += `CREATE TABLE IF NOT EXISTS teachers (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  nationalId TEXT UNIQUE NOT NULL,\n`;
    sql += `  qualification TEXT,\n`;
    sql += `  experienceYears INTEGER,\n`;
    sql += `  email TEXT,\n`;
    sql += `  phone TEXT,\n`;
    sql += `  salary REAL,\n`;
    sql += `  specialty TEXT\n`;
    sql += `);\n\n`;

    this.teachers.forEach(t => {
      sql += `INSERT INTO teachers VALUES ('${t.id}', '${t.name.replace(/'/g, "''")}', '${t.nationalId}', '${t.qualification.replace(/'/g, "''")}', ${t.experienceYears}, '${t.email}', '${t.phone}', ${t.salary}, '${t.specialty.replace(/'/g, "''")}');\n`;
    });
    sql += `\n`;

    // 6. SUBJECTS
    sql += `-- جدول المواد الدراسية والمناهج \n`;
    sql += `CREATE TABLE IF NOT EXISTS subjects (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  minGrade INTEGER NOT NULL,\n`;
    sql += `  maxGrade INTEGER NOT NULL,\n`;
    sql += `  stage TEXT CHECK(stage IN ('primary', 'middle', 'high'))\n`;
    sql += `);\n\n`;

    this.subjects.forEach(s => {
      sql += `INSERT INTO subjects VALUES ('${s.id}', '${s.name.replace(/'/g, "''")}', ${s.minGrade}, ${s.maxGrade}, '${s.stage}');\n`;
    });
    sql += `\n`;

    // 7. TIMETABLES (SCHEDULE)
    sql += `-- جدول حصص الجدول المدرسي \n`;
    sql += `CREATE TABLE IF NOT EXISTS schedules (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  classroomId TEXT NOT NULL FOREIGN KEY REFERENCES classrooms(id) ON DELETE CASCADE,\n`;
    sql += `  teacherId TEXT NOT NULL FOREIGN KEY REFERENCES teachers(id) ON DELETE CASCADE,\n`;
    sql += `  subjectId TEXT NOT NULL FOREIGN KEY REFERENCES subjects(id) ON DELETE CASCADE,\n`;
    sql += `  dayOfWeek INTEGER NOT NULL CHECK(dayOfWeek BETWEEN 0 AND 4),\n`;
    sql += `  periodNumber INTEGER NOT NULL CHECK(periodNumber BETWEEN 1 AND 6),\n`;
    sql += `  UNIQUE(classroomId, dayOfWeek, periodNumber),\n`;
    sql += `  UNIQUE(teacherId, dayOfWeek, periodNumber)\n`;
    sql += `);\n\n`;

    this.schedules.forEach(s => {
      sql += `INSERT INTO schedules VALUES ('${s.id}', '${s.classroomId}', '${s.teacherId}', '${s.subjectId}', ${s.dayOfWeek}, ${s.periodNumber});\n`;
    });
    sql += `\n`;

    // 8. ATTENDANCE
    sql += `-- جدول الحضور والغياب للطلاب \n`;
    sql += `CREATE TABLE IF NOT EXISTS attendance (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  studentId TEXT NOT NULL FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,\n`;
    sql += `  date TEXT NOT NULL,\n`;
    sql += `  status TEXT CHECK(status IN ('present', 'absent', 'excused', 'late')),\n`;
    sql += `  notes TEXT\n`;
    sql += `);\n\n`;

    this.attendances.forEach(a => {
      sql += `INSERT INTO attendance VALUES ('${a.id}', '${a.studentId}', '${a.date}', '${a.status}', '${a.notes.replace(/'/g, "''")}');\n`;
    });
    sql += `\n`;

    // 9. GRADES
    sql += `-- جدول الدرجات والامتحانات \n`;
    sql += `CREATE TABLE IF NOT EXISTS grades (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  studentId TEXT NOT NULL FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,\n`;
    sql += `  subjectId TEXT NOT NULL FOREIGN KEY REFERENCES subjects(id) ON DELETE CASCADE,\n`;
    sql += `  examName TEXT NOT NULL,\n`;
    sql += `  examDate TEXT,\n`;
    sql += `  courseworkGrade REAL,\n`;
    sql += `  finalExamGrade REAL,\n`;
    sql += `  totalGrade REAL,\n`;
    sql += `  resultStatus TEXT CHECK(resultStatus IN ('pass', 'fail', 'pending'))\n`;
    sql += `);\n\n`;

    this.grades.forEach(g => {
      sql += `INSERT INTO grades VALUES ('${g.id}', '${g.studentId}', '${g.subjectId}', '${g.examName.replace(/'/g, "''")}', '${g.examDate}', ${g.courseworkGrade}, ${g.finalExamGrade}, ${g.totalGrade}, '${g.resultStatus}');\n`;
    });
    sql += `\n`;

    // 10. AUDIT LOGS
    sql += `-- سجل مراجعة العمليات الأمنية والتدقيق \n`;
    sql += `CREATE TABLE IF NOT EXISTS audit_logs (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  userId TEXT NOT NULL,\n`;
    sql += `  username TEXT NOT NULL,\n`;
    sql += `  action TEXT NOT NULL,\n`;
    sql += `  details TEXT,\n`;
    sql += `  timestamp TEXT\n`;
    sql += `);\n\n`;

    this.auditLogs.slice(0, 100).forEach(al => {
      sql += `INSERT INTO audit_logs VALUES ('${al.id}', '${al.userId}', '${al.username}', '${al.action.replace(/'/g, "''")}', '${al.details.replace(/'/g, "''")}', '${al.timestamp}');\n`;
    });

    return sql;
  }
}

export const mockDb = new LocalSQLiteEngine();
