/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'supervisor' | 'director' | 'vice_director' | 'student_affairs' | 'teacher' | 'accountant' | 'parent';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Parent {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  email: string;
  work: string;
  address: string;
}

export interface Student {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  nationalId: string;
  seatNumber?: string;
  studentNumber?: string;
  address: string;
  medicalDetails: string;
  parentId: string; // foreign key
  classId: string; // foreign key
  avatar: string;
  bloodGroup: string;
  status: 'active' | 'graduated' | 'transferred' | 'repeating' | 'suspended';
  governorate?: string;
  district?: string;
  motherName?: string;
  nationality?: string;
  registrationStatus?: 'new' | 'transferred' | 'repeating' | 'baki';
  photo?: string;
}

export interface BehaviorEvaluation {
  id: string;
  studentId: string;
  academicYear: string;
  semester: 'first' | 'second' | 'second_round';
  marks: Record<string, number>; // keyed "1" to "20", value 0 to 5
  totalMark: number; // 0-100
  behaviorGrade: string; // ممتاز / جيد جدا / جيد / مقبول / ضعيف
  evaluatorId: string;
  date: string;
  notes?: string;
}

export interface Teacher {
  id: string;
  name: string;
  nationalId: string;
  qualification: string;
  experienceYears: number;
  email: string;
  phone: string;
  salary: number;
  specialty: string;
}

export type SchoolStage = 'primary' | 'middle' | 'high';

export interface Classroom {
  id: string;
  name: string;
  stage: SchoolStage;
  maxCapacity: number;
  roomNumber: string;
}

export interface Subject {
  id: string;
  name: string;
  minGrade: number;
  maxGrade: number;
  stage: SchoolStage;
}

export interface ClassSubjectTeacher {
  id: string;
  classroomId: string; // fk
  subjectId: string; // fk
  teacherId: string; // fk
}

export interface Schedule {
  id: string;
  classroomId: string; // fk
  teacherId: string; // fk
  subjectId: string; // fk
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday
  periodNumber: number; // 1, 2, 3, 4, 5, 6 (1-based period)
}

export interface Attendance {
  id: string;
  studentId: string; // fk
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'excused' | 'late';
  notes: string;
}

export interface Grade {
  id: string;
  studentId: string; // fk
  subjectId: string; // fk
  examName: string; // e.g., "نصف الفصل" or "الامتحان النهائي"
  examDate: string;
  courseworkGrade: number; // أعمال السنة
  finalExamGrade: number; // امتحان نهائي
  totalGrade: number; // sum
  resultStatus: 'pass' | 'fail' | 'pending';
}

export interface FeeType {
  id: string;
  name: string;
  amount: number;
  description: string;
}

export interface FeePayment {
  id: string;
  studentId: string; // fk
  feeTypeId: string; // fk
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  referenceNumber: string;
  academicYear: string;
  notes: string;
}

export interface SchoolSettings {
  schoolName: string;
  logoUrl: string;
  contactPhone: string;
  contactEmail: string;
  currentAcademicYear: string;
  address: string;
  bankAccount: string;
  schoolType: 'government' | 'private' | 'complex';
  governorate: string;
  district: string;
  principalName: string;
  vicePrincipalName: string;
  studentAffairsName: string;
  semester: 'first' | 'second' | 'second_round';
  // New release features
  isConfigured: boolean;
  version: string;
}
