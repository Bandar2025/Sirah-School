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
  SchoolSettings,
  BehaviorEvaluation
} from '../types';

// Default mock seed data
const DEFAULT_USERS: User[] = [
  { id: 'usr-1', username: 'admin', fullName: 'أ. عادل عبد الله الصنعاني', role: 'admin', email: 'adel.admin@school.edu.ye', phone: '771122334', status: 'active', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-2', username: 'director', fullName: 'أ. محمد عبد الله الجائفي', role: 'director', email: 'director.g@school.edu.ye', phone: '772233445', status: 'active', createdAt: '2026-01-02T09:00:00Z' },
  { id: 'usr-3', username: 'vicedirector', fullName: 'أ. عبد الكريم حميد الارياني', role: 'vice_director', email: 'vice.iri@school.edu.ye', phone: '773344556', status: 'active', createdAt: '2026-01-05T09:30:00Z' },
  { id: 'usr-4', username: 'studentaffairs', fullName: 'أ. سلوى عبدالله الهمداني', role: 'student_affairs', email: 'salwa.h@school.edu.ye', phone: '774455667', status: 'active', createdAt: '2026-01-10T10:00:00Z' },
  { id: 'usr-5', username: 'teacher', fullName: 'أ. خالد محمد الحيمي', role: 'teacher', email: 'khaled.h@school.edu.ye', phone: '775566778', status: 'active', createdAt: '2026-01-15T08:15:00Z' },
  { id: 'usr-6', username: 'accountant', fullName: 'أ. محمد عبده الحرازي', role: 'accountant', email: 'harazi.a@school.edu.ye', phone: '776677889', status: 'active', createdAt: '2026-01-12T08:00:00Z' },
  { id: 'usr-7', username: 'parent', fullName: 'الشيخ عبد الله بن حسين السريحي', role: 'parent', email: 'parent.yem@gmail.com', phone: '777112233', status: 'active', createdAt: '2026-01-20T09:00:00Z' }
];

const DEFAULT_PARENTS: Parent[] = [
  { id: 'prt-1', name: 'الشيخ عبد الله بن حسين السريحي', nationalId: '1002345889', phone: '777112233', email: 'parent.yem@gmail.com', work: 'تاجر ومستورد', address: 'شارع الخمسين - صنعاء' },
  { id: 'prt-2', name: 'أ. علوان يحيى عياش', nationalId: '1098234511', phone: '773456789', email: 'alwan.a@yemen.ye', work: 'أستاذ مشارك - جامعة صنعاء', address: 'حي السنينة - صنعاء' },
  { id: 'prt-3', name: 'م. عبد اللطيف عبد الملك شرف', nationalId: '1034567812', phone: '771239988', email: 'latif.sh@yahoo.com', work: 'مهندس اتصالات مستقل', address: 'شارع حدة - صنعاء' }
];

const DEFAULT_CLASSROOMS: Classroom[] = [
  { id: 'class-1', name: 'الصف الأول الأساسي', stage: 'primary', maxCapacity: 55, roomNumber: 'وزاري-11' },
  { id: 'class-2', name: 'الصف الثاني الأساسي', stage: 'primary', maxCapacity: 45, roomNumber: 'وزاري-12' },
  { id: 'class-3', name: 'الصف الثالث الأساسي', stage: 'primary', maxCapacity: 45, roomNumber: 'وزاري-13' },
  { id: 'class-4', name: 'الصف الرابع الأساسي', stage: 'primary', maxCapacity: 45, roomNumber: 'وزاري-14' },
  { id: 'class-5', name: 'الصف الخامس الأساسي', stage: 'primary', maxCapacity: 45, roomNumber: 'وزاري-15' },
  { id: 'class-6', name: 'الصف السادس الأساسي', stage: 'primary', maxCapacity: 45, roomNumber: 'وزاري-16' },
  { id: 'class-7', name: 'الصف السابع الأساسي', stage: 'middle', maxCapacity: 45, roomNumber: 'وزاري-27' },
  { id: 'class-8', name: 'الصف الثامن الأساسي', stage: 'middle', maxCapacity: 45, roomNumber: 'وزاري-28' }
];

const DEFAULT_STUDENTS: Student[] = [
  // Class 1 (Grade 1 Basic) - 50 Students from Yemeni Ledger
  { id: 'std-1-1', name: 'ابراهيم إسماعيل محمد سعيد الحداد', gender: 'male', birthDate: '2019-02-12', nationalId: '2019183741', seatNumber: '322101', studentNumber: 'STU-1447-001', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-1-2', name: 'احمد رمزي عبدالله حميد التاج', gender: 'male', birthDate: '2019-05-15', nationalId: '2019183742', seatNumber: '322102', studentNumber: 'STU-1447-002', address: 'صنعاء - الحصبة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-1-3', name: 'احمد محمد احمد سعيد مرشد', gender: 'male', birthDate: '2019-04-10', nationalId: '2019183743', seatNumber: '322103', studentNumber: 'STU-1447-003', address: 'صنعاء - الستين', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-4', name: 'احمد محمد احمد سيف علي الصبيحي', gender: 'male', birthDate: '2019-03-24', nationalId: '2019183744', seatNumber: '322104', studentNumber: 'STU-1447-004', address: 'صنعاء - المطار', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'O-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية بني الحارث' },
  { id: 'std-1-5', name: 'احمد منصور محمد احمد علي', gender: 'male', birthDate: '2019-08-30', nationalId: '2019183745', seatNumber: '322105', studentNumber: 'STU-1447-005', address: 'صنعاء - حدة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-1-6', name: 'اركان صادق عبدالله منصور قائد ديوان', gender: 'male', birthDate: '2019-01-20', nationalId: '2019183746', seatNumber: '322106', studentNumber: 'STU-1447-006', address: 'صنعاء - الروضة', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'AB+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية بني الحارث' },
  { id: 'std-1-7', name: 'اسامة محمد امين عبدالله', gender: 'male', birthDate: '2019-10-18', nationalId: '2019183747', seatNumber: '322107', studentNumber: 'STU-1447-007', address: 'صنعاء - شيرتون', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'B-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-8', name: 'اسد محمد عبدالملك محمد احمد ناصر', gender: 'male', birthDate: '2019-06-05', nationalId: '2019183748', seatNumber: '322108', studentNumber: 'STU-1447-008', address: 'صنعاء - عصر', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-9', name: 'اسماعيل عبدالحكيم هزاع علي العبيدي', gender: 'male', birthDate: '2019-11-29', nationalId: '2019183749', seatNumber: '322109', studentNumber: 'STU-1447-009', address: 'صنعاء - باب اليمن', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'A-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية صنعاء القديمة' },
  { id: 'std-1-10', name: 'المجد مجيد قائد علي', gender: 'male', birthDate: '2019-07-15', nationalId: '2019183750', seatNumber: '322110', studentNumber: 'STU-1447-010', address: 'صنعاء - نقم', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-11', name: 'الياس بسام احمد علي قائد الأشول', gender: 'male', birthDate: '2019-04-02', nationalId: '2019183751', seatNumber: '322111', studentNumber: 'STU-1447-011', address: 'صنعاء - حي التضامن', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-1-12', name: 'امير فيصل محمد حسن ناجي الشرعبي', gender: 'male', birthDate: '2019-09-19', nationalId: '2019183752', seatNumber: '322112', studentNumber: 'STU-1447-012', address: 'صنعاء - السنينة', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-13', name: 'انس فؤاد علي قائد عثمان المحمودي', gender: 'male', birthDate: '2019-05-22', nationalId: '2019183753', seatNumber: '322113', studentNumber: 'STU-1447-013', address: 'صنعاء - التحرير', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الوحدة' },
  { id: 'std-1-14', name: 'ايمن عبدالملك علي محمد الجنيد', gender: 'male', birthDate: '2019-03-01', nationalId: '2019183754', seatNumber: '322114', studentNumber: 'STU-1447-014', address: 'صنعاء - حدة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'O-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-1-15', name: 'بشار مسعود علي سعيد قاسم', gender: 'male', birthDate: '2019-12-04', nationalId: '2019183755', seatNumber: '322115', studentNumber: 'STU-1447-015', address: 'صنعاء - مسيك', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-16', name: 'جبران خليل جبران ناجي قاسم الودودي', gender: 'male', birthDate: '2019-02-28', nationalId: '2019183756', seatNumber: '322116', studentNumber: 'STU-1447-016', address: 'صنعاء - الحصبة', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'B-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-1-17', name: 'جود محمد نجيب احمد قائد السحلة', gender: 'male', birthDate: '2019-06-18', nationalId: '2019183757', seatNumber: '322117', studentNumber: 'STU-1447-017', address: 'صنعاء - الصافية', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-1-18', name: 'حذيفة عارف سعيد هزاع علي الخزاعي', gender: 'male', birthDate: '2019-08-11', nationalId: '2019183758', seatNumber: '322118', studentNumber: 'STU-1447-018', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'AB+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-1-19', name: 'حسام صالح علي عبدالله قائد الفقيه', gender: 'male', birthDate: '2019-07-26', nationalId: '2019183759', seatNumber: '322119', studentNumber: 'STU-1447-019', address: 'صنعاء - حي الجامعة', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-20', name: 'حسين مسعود علي سعيد قاسم', gender: 'male', birthDate: '2019-12-05', nationalId: '2019183760', seatNumber: '322120', studentNumber: 'STU-1447-020', address: 'صنعاء - مسيك', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-21', name: 'حمزة عقيل عبده مسعد محمد', gender: 'male', birthDate: '2019-05-14', nationalId: '2019183761', seatNumber: '322121', studentNumber: 'STU-1447-021', address: 'صنعاء - هبرة', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-22', name: 'خالد محمد محمد مصلح محمد', gender: 'male', birthDate: '2019-03-30', nationalId: '2019183762', seatNumber: '322122', studentNumber: 'STU-1447-022', address: 'صنعاء - المطار', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية بني الحارث' },
  { id: 'std-1-23', name: 'رأفت صالح عبدالله علي محمد نصر', gender: 'male', birthDate: '2019-01-14', nationalId: '2019183763', seatNumber: '322123', studentNumber: 'STU-1447-023', address: 'صنعاء - حدة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'AB-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-1-24', name: 'رياض عبدالباسط عبدالملك عبدالباري', gender: 'male', birthDate: '2019-04-20', nationalId: '2019183764', seatNumber: '322124', studentNumber: 'STU-1447-024', address: 'صنعاء - حي الوحدة', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الوحدة' },
  { id: 'std-1-25', name: 'ريدان محمد سلطان مسعد عثمان الحديلي', gender: 'male', birthDate: '2019-10-10', nationalId: '2019183765', seatNumber: '322125', studentNumber: 'STU-1447-025', address: 'صنعاء - عصر', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-26', name: 'زياد محمد مهيوب احمد محمد عثمان', gender: 'male', birthDate: '2019-06-25', nationalId: '2019183766', seatNumber: '322126', studentNumber: 'STU-1447-026', address: 'صنعاء - السنينة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'B-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-27', name: 'زياد نبيل فضل احمد قائد', gender: 'male', birthDate: '2019-08-01', nationalId: '2019183767', seatNumber: '322127', studentNumber: 'STU-1447-027', address: 'صنعاء - الحصبة', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'O-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-1-28', name: 'سرحان وليد سرحان هزاع علي الجحيفي', gender: 'male', birthDate: '2019-07-02', nationalId: '2019183768', seatNumber: '322128', studentNumber: 'STU-1447-028', address: 'صنعاء - نقم', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'A-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-29', name: 'سعيد هائل سعيد عبدالله عبده الحديلي', gender: 'male', birthDate: '2019-02-15', nationalId: '2019183769', seatNumber: '322129', studentNumber: 'STU-1447-029', address: 'صنعاء - باب اليمن', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية صنعاء القديمة' },
  { id: 'std-1-30', name: 'سليمان عمار محمد احمد سرحان دهمش', gender: 'male', birthDate: '2019-03-12', nationalId: '2019183770', seatNumber: '322130', studentNumber: 'STU-1447-030', address: 'صنعاء - هبرة', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'AB+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-31', name: 'سليمان فائز مهيوب احمد سعيد', gender: 'male', birthDate: '2019-11-05', nationalId: '2019183771', seatNumber: '322131', studentNumber: 'STU-1447-031', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-1-32', name: 'صهيب عبدالملك عبدالجبار بجاش مسعد الحديلي', gender: 'male', birthDate: '2019-05-18', nationalId: '2019183772', seatNumber: '322132', studentNumber: 'STU-1447-032', address: 'صنعاء - عصر', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-33', name: 'صهيب عمرو علي احمد احمد العلواني', gender: 'male', birthDate: '2019-04-14', nationalId: '2019183773', seatNumber: '322133', studentNumber: 'STU-1447-033', address: 'صنعاء - الصافية', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-1-34', name: 'عابد فهد عبدالعزيز سرحان مهيوب العلواني', gender: 'male', birthDate: '2019-09-08', nationalId: '2019183774', seatNumber: '322134', studentNumber: 'STU-1447-034', address: 'صنعاء - الروضة', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'O-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية بني الحارث' },
  { id: 'std-1-35', name: 'عادل امين علي احمد حسن', gender: 'male', birthDate: '2019-02-23', nationalId: '2019183775', seatNumber: '322135', studentNumber: 'STU-1447-035', address: 'صنعاء - شيرتون', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-36', name: 'عامر فهد محمد محمد حفيظ', gender: 'male', birthDate: '2019-08-16', nationalId: '2019183776', seatNumber: '322136', studentNumber: 'STU-1447-036', address: 'صنعاء - شيرتون', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-37', name: 'عبدالرحمن رشاد عبده مارش مغلس', gender: 'male', birthDate: '2019-06-21', nationalId: '2019183777', seatNumber: '322137', studentNumber: 'STU-1447-037', address: 'صنعاء - عصر', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-38', name: 'عبدالرحمن عبدالرحيم علي عبدالله قائد الفقيه', gender: 'male', birthDate: '2019-10-09', nationalId: '2019183778', seatNumber: '322138', studentNumber: 'STU-1447-038', address: 'صنعاء - الستين', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'A-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-39', name: 'عبدالعزيز هيثم عبدالعزيز سرحان مهيوب العلواني', gender: 'male', birthDate: '2019-11-20', nationalId: '2019183779', seatNumber: '322139', studentNumber: 'STU-1447-039', address: 'صنعاء - الصافية', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-1-40', name: 'عبدالكريم محمد عبده احمد علي عباد', gender: 'male', birthDate: '2019-05-30', nationalId: '2019183780', seatNumber: '322140', studentNumber: 'STU-1447-040', address: 'صنعاء - باب اليمن', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية صنعاء القديمة' },
  { id: 'std-1-41', name: 'عبدالكريم محمد هزاع محمد محمد الودودي', gender: 'male', birthDate: '2019-01-29', nationalId: '2019183781', seatNumber: '322141', studentNumber: 'STU-1447-041', address: 'صنعاء - الحصبة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'O-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-1-42', name: 'عبدالله فيصل علي قائد', gender: 'male', birthDate: '2019-04-11', nationalId: '2019183782', seatNumber: '322142', studentNumber: 'STU-1447-042', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-1-43', name: 'عبدمجيد عبدالله محمد سعيد قائد الحداد', gender: 'male', birthDate: '2019-07-22', nationalId: '2019183783', seatNumber: '322143', studentNumber: 'STU-1447-043', address: 'صنعاء - الستين', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'B-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-44', name: 'عبدالملك محمد سرحان محمد محمد العلواني', gender: 'male', birthDate: '2019-08-30', nationalId: '2019183784', seatNumber: '322144', studentNumber: 'STU-1447-044', address: 'صنعاء - حدة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'AB+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-1-45', name: 'عبده بشير عبدالله علي', gender: 'male', birthDate: '2019-03-27', nationalId: '2019183785', seatNumber: '322145', studentNumber: 'STU-1447-045', address: 'صنعاء - الصافية', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-1-46', name: 'عدي رائد عبده هزاع عامر', gender: 'male', birthDate: '2019-10-02', nationalId: '2019183786', seatNumber: '322146', studentNumber: 'STU-1447-046', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'A-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-1-47', name: 'عزالدين عادل عبدالله سعيد قائد رحيمان', gender: 'male', birthDate: '2019-11-19', nationalId: '2019183787', seatNumber: '322147', studentNumber: 'STU-1447-047', address: 'صنعاء - الروضة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية بني الحارث' },
  { id: 'std-1-48', name: 'عزام فوزي محمد هزاع الصوفي', gender: 'male', birthDate: '2019-09-24', nationalId: '2019183788', seatNumber: '322148', studentNumber: 'STU-1447-048', address: 'صنعاء - شيرتون', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-1', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-1-49', name: 'عزام فيصل محمد حسن ناجي الشرعبي', gender: 'male', birthDate: '2019-04-12', nationalId: '2019183789', seatNumber: '322149', studentNumber: 'STU-1447-049', address: 'صنعاء - السنينة', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-1', avatar: '', bloodGroup: 'O-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-1-50', name: 'عزام محمد سالم سعيد', gender: 'male', birthDate: '2019-06-30', nationalId: '2019183790', seatNumber: '322150', studentNumber: 'STU-1447-050', address: 'صنعاء - عصر', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-1', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },

  // Class 2 (Grade 2 Basic)
  { id: 'std-2-1', name: 'ابراهيم احمد سعيد ناجي الطالبي', gender: 'male', birthDate: '2018-03-12', nationalId: '2018183701', seatNumber: '498101', studentNumber: 'STU-1447-201', address: 'صنعاء - حدة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-2', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-2-2', name: 'ابراهيم بندر احمد عبده المنصوري', gender: 'male', birthDate: '2018-05-18', nationalId: '2018183702', seatNumber: '566102', studentNumber: 'STU-1447-202', address: 'صنعاء - الستين', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-2', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-2-3', name: 'ابراهيم محمد عبده قائد النجار', gender: 'male', birthDate: '2018-02-14', nationalId: '2018183703', seatNumber: '369103', studentNumber: 'STU-1447-203', address: 'صنعاء - عصر', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-2', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-2-4', name: 'ابراهيم منصور ناجي قاسم الودودي', gender: 'male', birthDate: '2018-11-05', nationalId: '2018183704', seatNumber: '509104', studentNumber: 'STU-1447-204', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-2', avatar: '', bloodGroup: 'AB+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-2-5', name: 'احمد عبدالسالم امين دحان العامري', gender: 'male', birthDate: '2018-08-30', nationalId: '2018183705', seatNumber: '330105', studentNumber: 'STU-1447-205', address: 'صنعاء - نقم', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-2', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },

  // Class 3 (Grade 3 Basic)
  { id: 'std-3-1', name: 'احمد عبدالحكيم علي محمد الجنيد', gender: 'male', birthDate: '2017-04-20', nationalId: '2017183701', seatNumber: '527101', studentNumber: 'STU-1447-301', address: 'صنعاء - نقم', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-3', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-3-2', name: 'احمد منصور ناجي قاسم صالح الودوي', gender: 'male', birthDate: '2017-07-22', nationalId: '2017183702', seatNumber: '389102', studentNumber: 'STU-1447-302', address: 'صنعاء - الحصبة', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-3', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-3-3', name: 'ادهم امين ناجي قائد المحمودي', gender: 'male', birthDate: '2017-09-12', nationalId: '2017183703', seatNumber: '470103', studentNumber: 'STU-1447-303', address: 'صنعاء - المطار', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-3', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية بني الحارث' },
  { id: 'std-3-4', name: 'الياس عبدالله عبده غانم سعيد', gender: 'male', birthDate: '2017-01-30', nationalId: '2017183704', seatNumber: '421104', studentNumber: 'STU-1447-304', address: 'صنعاء - حدة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-3', avatar: '', bloodGroup: 'AB-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-3-5', name: 'انس مالك دبوان محمد علي الشرعبي', gender: 'male', birthDate: '2017-10-14', nationalId: '2017183705', seatNumber: '465105', studentNumber: 'STU-1447-305', address: 'صنعاء - الستين', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-3', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },

  // Class 4 (Grade 4 Basic)
  { id: 'std-4-1', name: 'احمد عبدالخالق حميد احمد التاج', gender: 'male', birthDate: '2016-03-24', nationalId: '2016183701', seatNumber: '416101', studentNumber: 'STU-1447-401', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-4', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-4-2', name: 'احمد عبدالرقيب احمد علي العلواني', gender: 'male', birthDate: '2016-08-30', nationalId: '2016183702', seatNumber: '560102', studentNumber: 'STU-1447-402', address: 'صنعاء - شيرتون', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-4', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية شعوب' },
  { id: 'std-4-3', name: 'احمد محمد حسن سالم', gender: 'male', birthDate: '2016-07-15', nationalId: '2016183703', seatNumber: '513103', studentNumber: 'STU-1447-403', address: 'صنعاء - الصافية', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-4', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-4-4', name: 'اسامة بسام محمد عثمان البرحي', gender: 'male', birthDate: '2016-11-20', nationalId: '2016183704', seatNumber: '432104', studentNumber: 'STU-1447-404', address: 'صنعاء - الروضة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-4', avatar: '', bloodGroup: 'O-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية بني الحارث' },
  { id: 'std-4-5', name: 'انور طلال عبده علي سيف', gender: 'male', birthDate: '2016-05-14', nationalId: '2016183705', seatNumber: '411105', studentNumber: 'STU-1447-405', address: 'صنعاء - السنينة', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-4', avatar: '', bloodGroup: 'AB+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },

  // Class 5 (Grade 5 Basic)
  { id: 'std-5-1', name: 'ابراهيم منير محمد الحاج قائد', gender: 'male', birthDate: '2015-02-12', nationalId: '2015183701', seatNumber: '392101', studentNumber: 'STU-1447-501', address: 'صنعاء - الستين', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-5', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-5-2', name: 'احمد سعيد هزاع سيف الصبيحي', gender: 'male', birthDate: '2015-05-15', nationalId: '2015183702', seatNumber: '418102', studentNumber: 'STU-1447-502', address: 'صنعاء - المطار', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-5', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية بني الحارث' },
  { id: 'std-5-3', name: 'احمد عبدالله محمد سعيد العمري', gender: 'male', birthDate: '2015-04-10', nationalId: '2015183703', seatNumber: '480103', studentNumber: 'STU-1447-503', address: 'صنعاء - عصر', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-5', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-5-4', name: 'ادهم عبدالواسع محمد قاسم حنش', gender: 'male', birthDate: '2015-10-18', nationalId: '2015183704', seatNumber: '566104', studentNumber: 'STU-1447-504', address: 'صنعاء - حدة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-5', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-5-5', name: 'اسامه عبدالحكيم هزاع علي العبيدي', gender: 'male', birthDate: '2015-01-20', nationalId: '2015183705', seatNumber: '362105', studentNumber: 'STU-1447-505', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-5', avatar: '', bloodGroup: 'AB-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },

  // Class 6 (Grade 6 Basic)
  { id: 'std-6-1', name: 'محمود امين عبدالوهاب سلام العريقي', gender: 'male', birthDate: '2014-03-12', nationalId: '2014183701', seatNumber: '310101', studentNumber: 'STU-1447-601', address: 'صنعاء - حي الرباط', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-6', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-6-2', name: 'أكرم رمزي محمد أحمد القدسي', gender: 'male', birthDate: '2014-06-15', nationalId: '2014183702', seatNumber: '310102', studentNumber: 'STU-1447-602', address: 'صنعاء - الرقاص', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-6', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' },
  { id: 'std-6-3', name: 'حازم غازي عبدالرحمن عقلان', gender: 'male', birthDate: '2014-09-22', nationalId: '2014183703', seatNumber: '310103', studentNumber: 'STU-1447-603', address: 'صنعاء - حدة السكنية', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-6', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية السبعين' },
  { id: 'std-6-4', name: 'شرف الدين عادل عبدالسلام الصبري', gender: 'male', birthDate: '2014-11-20', nationalId: '2014183704', seatNumber: '310104', studentNumber: 'STU-1447-604', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-6', avatar: '', bloodGroup: 'AB+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-6-5', name: 'مصطفى نجيب عبده اليوسفي', gender: 'male', birthDate: '2014-01-18', nationalId: '2014183705', seatNumber: '310105', studentNumber: 'STU-1447-605', address: 'صنعاء - التحرير', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-6', avatar: '', bloodGroup: 'O-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية التحرير' },

  // Class 7 (Grade 7 Basic)
  { id: 'std-7-1', name: 'عبدالكريم طه يحيى عياش المنهي', gender: 'male', birthDate: '2013-02-14', nationalId: '2013183701', seatNumber: '420101', studentNumber: 'STU-1447-701', address: 'تعز - المسبح', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-7', avatar: '', bloodGroup: 'B+', status: 'active', governorate: 'تعز', district: 'مديرية القاهرة' },
  { id: 'std-7-2', name: 'وضاح جلال منصور الصلوي', gender: 'male', birthDate: '2013-05-30', nationalId: '2013183702', seatNumber: '420102', studentNumber: 'STU-1447-702', address: 'تعز - الحوبان', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-7', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'تعز', district: 'مديرية التعزية' },
  { id: 'std-7-3', name: 'عدنان مالك علي قاسم الشيباني', gender: 'male', birthDate: '2013-08-11', nationalId: '2013183703', seatNumber: '420103', studentNumber: 'STU-1447-703', address: 'تعز - النسيرية', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-7', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'تعز', district: 'مديرية القاهرة' },
  { id: 'std-7-4', name: 'عمران بسام صادق المذحجي', gender: 'male', birthDate: '2013-10-09', nationalId: '2013183704', seatNumber: '420104', studentNumber: 'STU-1447-704', address: 'تعز - الجحملية', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-7', avatar: '', bloodGroup: 'AB-', status: 'active', governorate: 'تعز', district: 'مديرية صالة' },
  { id: 'std-7-5', name: 'حمزة فضل صالح البركاني', gender: 'male', birthDate: '2013-12-04', nationalId: '2013183705', seatNumber: '420105', studentNumber: 'STU-1447-705', address: 'تعز - بير باشا', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-7', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'تعز', district: 'مديرية المظفر' },

  // Class 8 (Grade 8 Basic)
  { id: 'std-8-1', name: 'سعيد مصلح سعيد عبدالله المخلافي', gender: 'male', birthDate: '2012-04-12', nationalId: '2012183701', seatNumber: '530101', studentNumber: 'STU-1447-801', address: 'تعز - عصيفرة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-8', avatar: '', bloodGroup: 'A+', status: 'active', governorate: 'تعز', district: 'مديرية القاهرة' },
  { id: 'std-8-2', name: 'قحطان توفيق أمين دحان العامري', gender: 'male', birthDate: '2012-07-26', nationalId: '2012183702', seatNumber: '530102', studentNumber: 'STU-1447-802', address: 'تعز - الحوبان', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-8', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'تعز', district: 'مديرية التعزية' },
  { id: 'std-8-3', name: 'شادي منصور ناجي قاسم الودودي', gender: 'male', birthDate: '2012-09-19', nationalId: '2012183703', seatNumber: '530103', studentNumber: 'STU-1447-803', address: 'صنعاء - الجراف', medicalDetails: 'سليم', parentId: 'prt-3', classId: 'class-8', avatar: '', bloodGroup: 'B-', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-8-4', name: 'منتصر نبيل فضل الأشول', gender: 'male', birthDate: '2012-10-10', nationalId: '2012183704', seatNumber: '530104', studentNumber: 'STU-1447-804', address: 'صنعاء - الحصبة', medicalDetails: 'سليم', parentId: 'prt-1', classId: 'class-8', avatar: '', bloodGroup: 'AB+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية الثورة' },
  { id: 'std-8-5', name: 'غسان هائل سعيد العلواني', gender: 'male', birthDate: '2012-11-29', nationalId: '2012183705', seatNumber: '530105', studentNumber: 'STU-1447-805', address: 'صنعاء - عصر', medicalDetails: 'سليم', parentId: 'prt-2', classId: 'class-8', avatar: '', bloodGroup: 'O+', status: 'active', governorate: 'أمانة العاصمة', district: 'مديرية معين' }
];

const DEFAULT_TEACHERS: Teacher[] = [
  { id: 'tch-1', name: 'أ. جلال منصور الصلوي', nationalId: '1044231201', qualification: 'بكالوريوس علوم متميز - جامعة صنعاء', experienceYears: 14, email: 'galal.s@school.edu.ye', phone: '775566778', salary: 180000, specialty: 'القرآن والتربية الإسلامية' },
  { id: 'tch-2', name: 'أ. نجيب عبده اليوسفي', nationalId: '1055312302', qualification: 'ليسانس لغة عربية - جامعة تعز', experienceYears: 11, email: 'najeeb.y@school.edu.ye', phone: '771122331', salary: 150000, specialty: 'اللغة العربية والاجتماعيات' },
  { id: 'tch-3', name: 'أ. بلقيس علي الهمداني', nationalId: '1066412303', qualification: 'ماجستير رياضيات تطبيقية - جامعة ذمار', experienceYears: 16, email: 'balqis.h@school.edu.ye', phone: '772233442', salary: 210000, specialty: 'الرياضيات والعلوم للمرحلة الأساسية' }
];

const DEFAULT_SUBJECTS: Subject[] = [
  // Primary basic subjects (Classes 1 - 6)
  { id: 'sub-1', name: 'القرآن الكريم وعلومه', minGrade: 50, maxGrade: 100, stage: 'primary' },
  { id: 'sub-2', name: 'التربية الإسلامية', minGrade: 50, maxGrade: 100, stage: 'primary' },
  { id: 'sub-3', name: 'اللغة العربية الأساسية', minGrade: 50, maxGrade: 100, stage: 'primary' },
  { id: 'sub-4', name: 'الرياضيات التطبيقية', minGrade: 50, maxGrade: 100, stage: 'primary' },
  { id: 'sub-5', name: 'العلوم العامة', minGrade: 50, maxGrade: 100, stage: 'primary' },
  { id: 'sub-6', name: 'السلوك والمواظبة', minGrade: 50, maxGrade: 100, stage: 'primary' },

  // Middle basic subjects (Classes 7 - 8)
  { id: 'sub-1-m', name: 'القرآن الكريم والتجويد', minGrade: 50, maxGrade: 100, stage: 'middle' },
  { id: 'sub-2-m', name: 'التربية الإسلامية وفقهها', minGrade: 50, maxGrade: 100, stage: 'middle' },
  { id: 'sub-3-m', name: 'اللغة العربية وفنونها', minGrade: 50, maxGrade: 100, stage: 'middle' },
  { id: 'sub-4-m', name: 'الرياضيات العامة والفيزياء', minGrade: 50, maxGrade: 100, stage: 'middle' },
  { id: 'sub-5-m', name: 'العلوم الطبيعية والكيمياء', minGrade: 50, maxGrade: 100, stage: 'middle' },
  { id: 'sub-7-m', name: 'اللغة الإنجليزية المعاصرة', minGrade: 50, maxGrade: 100, stage: 'middle' },
  { id: 'sub-8-m', name: 'المواد الاجتماعية والوطنية', minGrade: 50, maxGrade: 100, stage: 'middle' },
  { id: 'sub-6-m', name: 'السلوك والمواظبة', minGrade: 50, maxGrade: 100, stage: 'middle' }
];

const DEFAULT_SCHEDULES: Schedule[] = [
  { id: 'sch-1', classroomId: 'class-1', teacherId: 'tch-1', subjectId: 'sub-1', dayOfWeek: 0, periodNumber: 1 },
  { id: 'sch-2', classroomId: 'class-1', teacherId: 'tch-2', subjectId: 'sub-3', dayOfWeek: 0, periodNumber: 2 },
  { id: 'sch-3', classroomId: 'class-2', teacherId: 'tch-3', subjectId: 'sub-4', dayOfWeek: 1, periodNumber: 1 },
  { id: 'sch-4', classroomId: 'class-7', teacherId: 'tch-2', subjectId: 'sub-3-m', dayOfWeek: 0, periodNumber: 1 },
  { id: 'sch-5', classroomId: 'class-7', teacherId: 'tch-3', subjectId: 'sub-4-m', dayOfWeek: 0, periodNumber: 2 }
];

const DEFAULT_ATTENDANCES: Attendance[] = [
  { id: 'att-1', studentId: 'std-1-1', date: '2026-06-14', status: 'present', notes: '' },
  { id: 'att-2', studentId: 'std-1-2', date: '2026-06-14', status: 'present', notes: '' },
  { id: 'att-3', studentId: 'std-1-3', date: '2026-06-14', status: 'present', notes: '' },
  { id: 'att-4', studentId: 'std-1-4', date: '2026-06-14', status: 'present', notes: '' },
  { id: 'att-5', studentId: 'std-1-5', date: '2026-06-14', status: 'present', notes: '' }
];

const DEFAULT_GRADES: Grade[] = []; // Will be dynamically generated on load if empty to support real ledger entries beautifully

const DEFAULT_FEE_TYPES: FeeType[] = [
  { id: 'fee-1', name: 'المساهمة المجتمعية السنوية ورسم التشغيل', amount: 35000, description: 'رسوم تنظيمية معتمدة من الوزارة للمجمعات التعليمية لليمن' },
  { id: 'fee-2', name: 'الكتب والوسائط والملاخصات الوزارية', amount: 8000, description: 'رسوم توفير وتطوير الكتب والمناهج الدورية' },
  { id: 'fee-3', name: 'رسوم التقوية ودعم المدرسين والمستندات', amount: 15000, description: 'رسوم تشغيلية إضافية مخصصة للكادر المشرف' }
];

const DEFAULT_FEE_PAYMENTS: FeePayment[] = [
  { id: 'pay-1', studentId: 'std-1-1', feeTypeId: 'fee-1', amountPaid: 35000, paymentDate: '2026-01-05', paymentMethod: 'cash', referenceNumber: 'TXN-998827', academicYear: '1447 - 1448هـ', notes: 'نقداً بالصندوق المالي للتسجيل' },
  { id: 'pay-2', studentId: 'std-1-2', feeTypeId: 'fee-1', amountPaid: 35000, paymentDate: '2026-01-08', paymentMethod: 'cash', referenceNumber: 'TXN-554432', academicYear: '1447 - 1448هـ', notes: 'سداد كامل ومقيد بسند الاستلام' }
];

const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'مدرسة مجمع عقبة بن نافع بالحليمة العليا الحكومي الشامل',
  logoUrl: '🇾🇪',
  contactPhone: '+967-4-244322',
  contactEmail: 'info@oqbah.edu.ye',
  currentAcademicYear: '1447هـ (2025 - 2026م)',
  address: 'الجمهورية اليمنية - مجمع عقبة بن نافع - محافظة تعز - مديرية التعزية - الحليمة العليا',
  bankAccount: 'YE3020000018873299102911 (البنك المركزي اليمني - تعز)',
  schoolType: 'government',
  governorate: 'تعز',
  district: 'التعزية',
  principalName: 'أ. طه بن يحيى عياش المنهي',
  vicePrincipalName: 'أ. عبد السلام امين هزاع',
  studentAffairsName: 'أ. سلوى عبدالله عبد اللطيف الشيباني',
  semester: 'first'
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
  private behaviorEvaluations: BehaviorEvaluation[] = [];
  private settings: SchoolSettings = DEFAULT_SETTINGS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      // Sync XMLHttpRequest to obtain real database contents from backend Express SQLite server!
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/db/get', false); // true synchronicity perfectly preserving 15+ React modules
      xhr.send(null);
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        if (res.success && res.data) {
          const d = res.data;
          this.users = d.users || [];
          this.auditLogs = d.audit_logs || [];
          this.parents = d.parents || [];
          this.students = d.students || [];
          this.teachers = d.teachers || [];
          this.classrooms = d.classrooms || [];
          this.subjects = d.subjects || [];
          this.schedules = d.schedules || [];
          this.attendances = d.attendance || [];
          this.grades = d.grades || [];
          this.feeTypes = d.fee_types || [];
          this.feePayments = d.fee_payments || [];
          this.behaviorEvaluations = d.behavior_evaluations || [];
          this.settings = d.settings || DEFAULT_SETTINGS;
          console.log('[DEBUG] Real SQLite data cache successfully initialized in client memory!');
          return;
        }
      }
    } catch (e) {
      console.error('[SQLITE CLIENT ERROR] Failed to fetch SQLITE data. Falling back to in-memory/local:', e);
    }

    // fallback in case of connection absence / offline preview testing before start
    this.users = [...DEFAULT_USERS];
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
    this.behaviorEvaluations = [];
    this.settings = { ...DEFAULT_SETTINGS };
  }

  private saveToStorage(key: string, data: any) {
    // 1. Maintain local in-memory representation so UI does not stutter
    localStorage.setItem(`manara_db_${key}`, JSON.stringify(data));

    // 2. Map standard frontend key names into SQLite table names
    let sqlTable = key;
    if (key === 'attendances') sqlTable = 'attendance';
    if (key === 'fee_types') sqlTable = 'fee_types';
    if (key === 'fee_payments') sqlTable = 'fee_payments';
    if (key === 'behavior_evaluations') sqlTable = 'behavior_evaluations';
    if (key === 'audit_logs') sqlTable = 'audit_logs';

    // 3. Replicate instantly to back-end server.ts SQLite database 
    if (key === 'settings') {
      fetch('/api/db/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: data })
      }).catch(err => console.error('[SQLITE PERSISTENCE ERROR] Settings replication failed:', err));
    } else {
      fetch('/api/db/save-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: sqlTable, rows: data })
      }).catch(err => console.error(`[SQLITE PERSISTENCE ERROR] Table ${sqlTable} replication failed:`, err));
    }
  }

  private saveAll() {
    this.saveToStorage('users', this.users);
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
    this.saveToStorage('behavior_evaluations', this.behaviorEvaluations);
    this.saveToStorage('settings', this.settings);
    this.saveToStorage('audit_logs', this.auditLogs);
  }

  public resetToDefaults() {
    fetch('/api/db/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonDump: {
        users: DEFAULT_USERS,
        parents: DEFAULT_PARENTS,
        classrooms: DEFAULT_CLASSROOMS,
        students: DEFAULT_STUDENTS,
        teachers: DEFAULT_TEACHERS,
        subjects: DEFAULT_SUBJECTS,
        schedules: DEFAULT_SCHEDULES,
        attendance: DEFAULT_ATTENDANCES,
        grades: DEFAULT_GRADES,
        fee_types: DEFAULT_FEE_TYPES,
        fee_payments: DEFAULT_FEE_PAYMENTS,
        behavior_evaluations: [],
        settings: DEFAULT_SETTINGS,
        audit_logs: DEFAULT_AUDIT_LOGS
      }})
    }).then(() => {
      this.loadFromStorage();
      location.reload();
    }).catch(err => {
      console.error('Failed to reset to defaults on backend:', err);
      this.users = [...DEFAULT_USERS];
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
      this.behaviorEvaluations = [];
      this.settings = { ...DEFAULT_SETTINGS };
      this.saveAll();
    });
  }

  // SESSION CONTROL
  public authenticate(usernameParam: string, pass: string): User | null {
    const validCredentials: Record<string, string> = {
      'admin': 'admin123',
      'director': 'director123',
      'vicedirector': 'vice123',
      'studentaffairs': 'stud123',
      'teacher': 'teacher123',
      'accountant': 'acc123',
      'parent': 'parent123'
    };

    if (validCredentials[usernameParam] && validCredentials[usernameParam] === pass) {
      const u = this.users.find(x => x.username === usernameParam) || this.users[0];
      localStorage.setItem('manara_active_session', JSON.stringify(u));
      this.addAuditLog(u.id, u.username, 'تسجيل دخول ناجح', `انعقاد جلسة عمل للمستخدم (${u.fullName}) بصلاحية: ${u.role}`);
      return u;
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

  // BEHAVIOR EVALUATIONS
  public getBehaviorEvaluations(): BehaviorEvaluation[] {
    return this.behaviorEvaluations;
  }

  public saveBehaviorEvaluation(evalData: Omit<BehaviorEvaluation, 'id'>, activeUser: string, activeUsername: string): BehaviorEvaluation {
    const existingIdx = this.behaviorEvaluations.findIndex(
      e => e.studentId === evalData.studentId &&
           e.academicYear === evalData.academicYear &&
           e.semester === evalData.semester
    );

    const prepared: BehaviorEvaluation = {
      ...evalData,
      id: existingIdx !== -1 ? this.behaviorEvaluations[existingIdx].id : `be-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    if (existingIdx !== -1) {
      this.behaviorEvaluations[existingIdx] = prepared;
    } else {
      this.behaviorEvaluations.push(prepared);
    }

    this.saveToStorage('behavior_evaluations', this.behaviorEvaluations);
    
    const stdName = this.students.find(s => s.id === evalData.studentId)?.name || '';
    this.addAuditLog(
      activeUser,
      activeUsername,
      'رصد استمارة سلوك ومواظبة',
      `تم رصد استمارة السلوك والمواظبة للطالب (${stdName}) للعام الدراسي ${evalData.academicYear} - الفصل ${evalData.semester === 'first' ? 'الأول' : 'الثاني'} بمجموع (${evalData.totalMark}/100)`
    );

    return prepared;
  }
}

export const mockDb = new LocalSQLiteEngine();
