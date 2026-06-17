import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { schoolDatabase } from '../db/database';
import { Student, Teacher, Grade, Attendance, FeePayment } from '../types';
import { 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Database, 
  Users, 
  GraduationCap, 
  Calculator, 
  ClipboardList, 
  DollarSign, 
  RefreshCw, 
  X,
  FileText,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';

interface ImportCenterViewProps {
  currentUser: any;
  onImportComplete?: () => void;
}

type ImportType = 'students' | 'teachers' | 'grades' | 'attendance' | 'fees' | 'yemeni_grades';

export default function ImportCenterView({ currentUser, onImportComplete }: ImportCenterViewProps) {
  const [importType, setImportType] = useState<ImportType>('students');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Array<{ row: number; details: string; type: 'error' | 'warning' }>>([]);
  const [importSummary, setImportSummary] = useState<{ total: number; success: number; skipped: number; updated: number } | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Map & Validate, 3: Completed or Errors Review
  const [isProcessing, setIsProcessing] = useState(false);

  // States for Yemeni Ministry Grade Sheets Parser (Wide Matrix)
  const [wideRawRows, setWideRawRows] = useState<any[][]>([]);
  const [wideHeaderRowIndex, setWideHeaderRowIndex] = useState<number>(7);
  const [wideNameColIndex, setWideNameColIndex] = useState<number>(2);
  const [wideSeatColIndex, setWideSeatColIndex] = useState<number>(1);
  const [wideSubjectMappings, setWideSubjectMappings] = useState<Record<string, { courseworkCol: number; finalCol: number }>>({});
  const [wideClassroomId, setWideClassroomId] = useState<string>('');
  const [wideExamName, setWideExamName] = useState<string>('اختبار نصف الفصل الدراسي الثاني');
  const [wideColHeaders, setWideColHeaders] = useState<Array<{ index: number; letter: string; label: string }>>([]);

  // Helper to convert number to Excel letter
  const getExcelColumnName = (colIdx: number): string => {
    let letter = '';
    let temp = colIdx;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  const autoDetectWideSheet = (rows: any[][]) => {
    let nameIdx = -1;
    let seatIdx = -1;
    let headerIdx = 0;

    // Scan the first 30 rows of the sheet
    for (let r = 0; r < Math.min(rows.length, 30); r++) {
      const row = rows[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || '').trim();
        if (
          val.includes('اسم الطالب') || 
          val.includes('الطالبة رباعياً') || 
          val.includes('الاسم الكامل') || 
          val.includes('اسم الطالب/الطالبة') ||
          val.includes('الاسم رباعياً') || 
          val.includes('اسماء الطلاب') ||
          val.includes('اسم الطالب /')
        ) {
          nameIdx = c;
          headerIdx = r;
          break;
        }
      }
      if (nameIdx !== -1) {
        // Look in the same row or adjacent rows for seat number
        const row = rows[headerIdx];
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim();
          if (val.includes('جلوس') || val.includes('رقم الجلوس') || val.includes('الجلوس')) {
            seatIdx = c;
            break;
          }
        }
        if (seatIdx === -1) {
          for (let c = 0; c < row.length; c++) {
            const val = String(row[c] || '').trim();
            if (val.includes('سري') || val.includes('رقم') || val.includes('مسلسل')) {
              seatIdx = c;
            }
          }
        }
        break;
      }
    }

    if (nameIdx !== -1) {
      setWideHeaderRowIndex(headerIdx);
      setWideNameColIndex(nameIdx);
      setWideSeatColIndex(seatIdx !== -1 ? seatIdx : 0);

      // Now, let's auto-detect columns for school subjects!
      const initialMappings: Record<string, { courseworkCol: number; finalCol: number }> = {};
      const schoolSubjects = schoolDatabase.getSubjects();

      schoolSubjects.forEach(subject => {
        let foundSubjectCol = -1;
        const scanRows = [headerIdx, Math.max(0, headerIdx - 1), Math.max(0, headerIdx - 2), Math.min(rows.length - 1, headerIdx + 1)];
        for (const rIdx of scanRows) {
          const rowObj = rows[rIdx];
          if (!rowObj) continue;
          for (let c = 0; c < rowObj.length; c++) {
            const val = String(rowObj[c] || '').trim();
            if (val.includes(subject.name) || subject.name.includes(val) || 
                (subject.name.includes('قرآن') && val.includes('قرآن')) ||
                (subject.name.includes('إسلامية') && val.includes('إسلام')) ||
                (subject.name.includes('عربية') && (val.includes('عربي') || val.includes('العربية'))) ||
                (subject.name.includes('رياضيات') && val.includes('رياضي')) ||
                (subject.name.includes('علوم') && val.includes('علوم')) ||
                (subject.name.includes('سلوك') && val.includes('سلوك')) ||
                (subject.name.includes('اجتماعيات') && val.includes('اجتماعيات'))
               ) {
              foundSubjectCol = c;
              break;
            }
          }
          if (foundSubjectCol !== -1) break;
        }

        let courseworkCol = -1;
        let finalCol = -1;

        if (foundSubjectCol !== -1) {
          const columnsToScan = [foundSubjectCol, foundSubjectCol + 1, foundSubjectCol + 2, foundSubjectCol + 3, foundSubjectCol + 4, foundSubjectCol - 1, foundSubjectCol - 2];
          
          columnsToScan.forEach(cIdx => {
            if (cIdx < 0 || cIdx >= rows[0].length) return;
            for (let rOffset = -2; rOffset <= 3; rOffset++) {
              const rIdx = headerIdx + rOffset;
              if (rIdx < 0 || rIdx >= rows.length) continue;
              const val = String(rows[rIdx][cIdx] || '').trim();
              
              if (courseworkCol === -1 && (
                val.includes('أعمال') || 
                val.includes('اعمال') || 
                val.includes('مواظبة') || 
                val.includes('سنة') || 
                val.includes('مستمر') || 
                val.includes('فصل أول') || 
                val.includes('ف1')
              )) {
                courseworkCol = cIdx;
              }
              if (finalCol === -1 && (
                val.includes('اختبار') || 
                val.includes('امتحان') || 
                val.includes('تحريري') || 
                val.includes('نهائي') || 
                val.includes('فصل ثان') || 
                val.includes('ف2')
              )) {
                finalCol = cIdx;
              }
            }
          });
        }

        initialMappings[subject.id] = {
          courseworkCol: courseworkCol !== -1 ? courseworkCol : -1,
          finalCol: finalCol !== -1 ? finalCol : -1
        };
      });

      setWideSubjectMappings(initialMappings);
    } else {
      setWideHeaderRowIndex(7);
      setWideNameColIndex(2);
      setWideSeatColIndex(1);
    }
  };

  React.useEffect(() => {
    const list = schoolDatabase.getClassrooms();
    if (list.length > 0) {
      setWideClassroomId(list[0].id);
    }
  }, []);

  // Field configurations for auto-mapping
  const TARGET_FIELDS: Record<ImportType, Array<{ key: string; label: string; altTerms: string[]; required: boolean }>> = {
    students: [
      { key: 'name', label: 'اسم الطالب رباعياً', altTerms: ['اسم الطالب', 'الاسم', 'Full Name', 'Name', 'Student Name', 'الاسم الكامل'], required: true },
      { key: 'nationalId', label: 'الرقم الوطني / الهوية الدورية', altTerms: ['الرقم الوطني', 'رقم الهوية', 'National ID', 'ID Number', 'هوية', 'رقم السجل المدني'], required: true },
      { key: 'seatNumber', label: 'رقم الجلوس الوزاري', altTerms: ['رقم الجلوس', 'رقم جلوس', 'Seat Number', 'Seat No'], required: false },
      { key: 'studentNumber', label: 'الرقم الأكاديمي الموحد', altTerms: ['الرقم الأكاديمي', 'رقم الطالب', 'Student ID', 'Student Number'], required: false },
      { key: 'gender', label: 'الجنس (ذكر / أنثى)', altTerms: ['الجنس', 'النوع', 'Gender', 'Sex'], required: false },
      { key: 'birthDate', label: 'تاريخ الميلاد', altTerms: ['تاريخ الميلاد', 'تاريخ ولادة', 'Birth Date', 'DOB'], required: false },
      { key: 'address', label: 'العنوان السكني الحالي (صنعاء حدة الخ)', altTerms: ['العنوان', 'العنوان الحالي', 'Address'], required: false },
      { key: 'medicalDetails', label: 'الحالة الطبية أو الملاحظات', altTerms: ['الحالة الصحية', 'الملف الطبي', 'Medical', 'Medical Details', 'ملاحظات طبية'], required: false },
      { key: 'bloodGroup', label: 'فصيلة الدم', altTerms: ['فصيلة الدم', 'فصيلة دم', 'Blood Group', 'Blood Type'], required: false }
    ],
    teachers: [
      { key: 'name', label: 'اسم المعلم كاملاً', altTerms: ['اسم المعلم', 'المعلم', 'الاسم', 'Full Name', 'Teacher Name', 'Name'], required: true },
      { key: 'nationalId', label: 'رقم الهوية الوطنية', altTerms: ['الرقم الوطني', 'رقم الهوية', 'National ID', 'national_id'], required: true },
      { key: 'specialty', label: 'التخصص التدريسي الرئيسي', altTerms: ['التخصص', 'تخصص المعلم', 'Specialty', 'Subject Specialty'], required: true },
      { key: 'qualification', label: 'المؤهلات والشھادات العامة', altTerms: ['المؤهل العلمي', 'الشهادة', 'Qualification', 'Degrees'], required: false },
      { key: 'experienceYears', label: 'سنوات الخبرة التعليمية', altTerms: ['سنوات الخبرة', 'الخبرة', 'Experience Years', 'Experience'], required: false },
      { key: 'phone', label: 'رقم هاتف المعلم', altTerms: ['الجوال', 'رقم الجوال', 'هاتف', 'Phone', 'Mobile'], required: false },
      { key: 'email', label: 'البريد الإلكتروني المعتمد', altTerms: ['البريد الرقمي', 'البريد الإلكتروني', 'Email'], required: false },
      { key: 'salary', label: 'الراتب المعتمد بالريال', altTerms: ['الراتب', 'المرتب شهرياً', 'Salary', 'Monthly Salary'], required: false }
    ],
    grades: [
      { key: 'studentKey', label: 'اسم الطالب أو رقم جلوسه أو الرقم الأكاديمي', altTerms: ['اسم الطالب', 'رقم الجلوس', 'الرقم الأكاديمي', 'رقم الجلوس الوزاري', 'Student', 'Seat No', 'Student Name'], required: true },
      { key: 'subjectName', label: 'اسم المادة الدراسية', altTerms: ['المادة', 'اسم المادة', 'المقرر', 'Subject', 'Subject Name'], required: true },
      { key: 'examName', label: 'اسم ومرحلة الامتحان (نصف العام الخ)', altTerms: ['الامتحان', 'نوع الاختبار', 'فترة الامتحان', 'Exam Name', 'Exam'], required: true },
      { key: 'courseworkGrade', label: 'درجة أعمال السنة والمشاركة', altTerms: ['أعمال السنة', 'المشاركة والأنشطة', 'درجة الأعمال', 'Coursework', 'Coursework Grade'], required: true },
      { key: 'finalExamGrade', label: 'درجة ورقة مخرجات الاختبار النهائي', altTerms: ['الاختبار النهائي', 'الامتحان النهائي', 'درجة الامتحان', 'Final Grade', 'Final Exam'], required: true }
    ],
    attendance: [
      { key: 'studentKey', label: 'بحث الطالب (اسم، رقم جلوس، الخ)', altTerms: ['اسم الطالب', 'رقم الجلوس', 'الرقم الأكاديمي', 'Student', 'Seat No'], required: true },
      { key: 'date', label: 'تاريخ كشف الغياب (YYYY-MM-DD)', altTerms: ['التاريخ', 'تاريخ الكشف', 'تاريخ الغياب', 'Date'], required: true },
      { key: 'status', label: 'حالة الحضور (حاضر/غائب/متأخر)', altTerms: ['الحالة', 'حالة الحضور', 'غياب أم حضور', 'Status'], required: true },
      { key: 'notes', label: 'المبررات أو الأعذار الرسمية المقبولة', altTerms: ['ملاحظات', 'ملاحظة', 'العذر', 'Notes', 'Remarks'], required: false }
    ],
    fees: [
      { key: 'studentKey', label: 'مستهدف الطالب (رقم السجل، جلوس، الخ)', altTerms: ['اسم الطالب', 'رقم الجلوس', 'الرقم الأكاديمي', 'Student', 'Seat No'], required: true },
      { key: 'feeName', label: 'عنوان بند المساهمة أو الرسم', altTerms: ['البند المالي', 'نوع الرسم', 'البند', 'Fee Type', 'Fee Name'], required: true },
      { key: 'amountPaid', label: 'المبلغ المدفوع المقبَض (ريال يمني)', altTerms: ['المبلغ المدفوع', 'مبلغ السند', 'المبلغ', 'Amount Paid', 'Amount'], required: true },
      { key: 'paymentMethod', label: 'طريقة الدفع (كاش/تحويل/شبكة)', altTerms: ['طريقة الدفع', 'نوع الدفع', 'وسيلة التحصيل', 'Payment Method'], required: false },
      { key: 'referenceNumber', label: 'رقم السند المالي أو رقم العملية البنكية', altTerms: ['رقم السند', 'رقم العملية', 'رقم الحوالة', 'Reference', 'Reference Number', 'Receipt No'], required: false },
      { key: 'notes', label: 'بيانات السند الإضافية والتحقق', altTerms: ['ملاحظات', 'Notes'], required: false }
    ],
    yemeni_grades: []
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("تعذر قراءة بيانات الملف المحددة");

        let workbook: XLSX.WorkBook;
        if (selectedFile.name.endsWith('.csv')) {
          // Parse CSV
          const text = new TextDecoder('utf-8').decode(data as ArrayBuffer);
          workbook = XLSX.read(text, { type: 'string' });
        } else {
          // Parse XLSX
          workbook = XLSX.read(data, { type: 'array' });
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to 2D array representing rows
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
        
        if (rawRows.length === 0) {
          alert('الملف المرفوع فارغ تماماً!');
          setIsProcessing(false);
          return;
        }

        if (importType === 'yemeni_grades') {
          setWideRawRows(rawRows);
          autoDetectWideSheet(rawRows);
          
          const maxCols = Math.max(...rawRows.map(r => r.length));
          const colLetters: Array<{ index: number; letter: string; label: string }> = [];
          
          for (let i = 0; i < maxCols; i++) {
            const letter = getExcelColumnName(i);
            let labelText = '';
            for (let r = 0; r < Math.min(rawRows.length, 12); r++) {
              const cellVal = String(rawRows[r]?.[i] || '').trim();
              if (cellVal && cellVal.length > 1 && cellVal.length < 45 && 
                  !cellVal.includes('الجمهورية') && !cellVal.includes('وزارية') && !cellVal.includes('كشف رصد')) {
                labelText += (labelText ? ' / ' : '') + cellVal;
              }
            }
            colLetters.push({
              index: i,
              letter,
              label: `${letter} (${labelText.substring(0, 45) || 'عمود فارغ'})`
            });
          }
          
          setWideColHeaders(colLetters);
          setStep(2);
          setIsProcessing(false);
          return;
        }

        const fileHeaders = (rawRows[0] as string[]).map(h => String(h).trim());
        setHeaders(fileHeaders);

        // Map data rows to objects
        const dataRows = rawRows.slice(1).map(row => {
          const rowObj: Record<string, any> = {};
          fileHeaders.forEach((header, index) => {
            rowObj[header] = row[index] !== undefined ? String(row[index]).trim() : '';
          });
          return rowObj;
        }).filter(obj => Object.values(obj).some(val => val !== '')); // skip completely empty rows

        setParsedData(dataRows);
        autoMapColumns(fileHeaders);
        setStep(2);
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء معالجة وقراءة بنية ملف Excel المرفوع. الرجاء التحقق من سلامة ترميزه.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Automatically maps uploaded columns to system keys based on semantic similarities
  const autoMapColumns = (fileHeaders: string[]) => {
    const defaultMappings: Record<string, string> = {};
    const config = TARGET_FIELDS[importType];

    config.forEach(target => {
      // Find matching header
      const match = fileHeaders.find(header => {
        const normalizedHeader = header.toLowerCase().replace(/[\s_\-()]/g, '');
        return target.altTerms.some(term => {
          const normalizedTerm = term.toLowerCase().replace(/[\s_\-()]/g, '');
          return normalizedHeader === normalizedTerm || normalizedHeader.includes(normalizedTerm) || normalizedTerm.includes(normalizedHeader);
        });
      });

      if (match) {
        defaultMappings[target.key] = match;
      } else {
        // Fallback exact key matching
        const exactMatch = fileHeaders.find(h => h.toLowerCase() === target.key.toLowerCase());
        if (exactMatch) {
          defaultMappings[target.key] = exactMatch;
        } else {
          defaultMappings[target.key] = ''; // unmapped
        }
      }
    });

    setColumnMapping(defaultMappings);
    runValidation(parsedData, defaultMappings);
  };

  // Runs system validations for mapped columns
  const runValidation = (data: any[], mapping: Record<string, string>) => {
    const errors: Array<{ row: number; details: string; type: 'error' | 'warning' }> = [];
    const config = TARGET_FIELDS[importType];

    if (data.length === 0) {
      errors.push({ row: 0, details: "لا توجد سجلات بيانات صالحة للاستيراد داخل الملف المرفوع.", type: 'error' });
      setValidationErrors(errors);
      return;
    }

    // Check required mapped columns
    config.forEach(field => {
      if (field.required && !mapping[field.key]) {
        errors.push({ row: 0, details: `العمود المطلوب [${field.label}] لم يتم ربطه بأي عمود في الملف المرفوع!`, type: 'error' });
      }
    });

    // Check duplicates and values row by row
    const existingStudents = schoolDatabase.getStudents();
    const existingTeachers = schoolDatabase.getTeachers();

    data.forEach((rowObj, index) => {
      const rowNum = index + 2; // offset for 1-based indexing of data rows in Excel (header of 1 + row 0-indexed)

      if (importType === 'students') {
        const nameVal = rowObj[mapping['name']];
        const idVal = rowObj[mapping['nationalId']];
        const seatNo = rowObj[mapping['seatNumber']];

        if (!nameVal) {
          errors.push({ row: rowNum, details: "حقل اسم الطالب فارغ!", type: 'error' });
        }
        if (!idVal) {
          errors.push({ row: rowNum, details: "حقل الرقم الوطني/الهوية للدور التعريفي فارغ!", type: 'error' });
        } else {
          // Check for local file duplicate national IDs
          const duplicateInFile = data.some((r, idx) => r[mapping['nationalId']] === idVal && idx !== index);
          if (duplicateInFile) {
            errors.push({ row: rowNum, details: `الرقم الوطني (${idVal}) مكرر لأكثر من سطر داخل السند المرفوع!`, type: 'error' });
          }

          // Check for existing database duplicate
          const duplicateInDb = existingStudents.some(s => s.nationalId === idVal);
          if (duplicateInDb) {
            errors.push({ row: rowNum, details: `اسم الطالب الوطني المربوط بالهوية (${idVal}) مستخدم مسبقاً ومقيد بالمكتبة المدرسية!`, type: 'warning' });
          }
        }
      }

      if (importType === 'teachers') {
        const nameVal = rowObj[mapping['name']];
        const idVal = rowObj[mapping['nationalId']];

        if (!nameVal) {
          errors.push({ row: rowNum, details: "حقل اسم المعلم فارغ!", type: 'error' });
        }
        if (!idVal) {
          errors.push({ row: rowNum, details: "حقل رقم هوية المعلم فارغ للتحقق!", type: 'error' });
        } else {
          if (existingTeachers.some(t => t.nationalId === idVal)) {
            errors.push({ row: rowNum, details: `كادر المعلم المالك للهوية (${idVal}) مسجل ومقيد سلفاً بالوظيفة الحالية!`, type: 'warning' });
          }
        }
      }

      if (importType === 'grades') {
        const studentKey = rowObj[mapping['studentKey']];
        const subjectName = rowObj[mapping['subjectName']];
        const examName = rowObj[mapping['examName']];
        const coursework = parseFloat(rowObj[mapping['courseworkGrade']]);
        const finalExam = parseFloat(rowObj[mapping['finalExamGrade']]);

        if (!studentKey) {
          errors.push({ row: rowNum, details: "حقل تحديد الطالب فارغ (اسم/رقم جلوس)!", type: 'error' });
        } else {
          // Match student
          const matched = existingStudents.find(s => 
            s.name === studentKey || 
            s.seatNumber === studentKey || 
            s.studentNumber === studentKey
          );
          if (!matched) {
            errors.push({ row: rowNum, details: `تعذر مطابقة الطالب المسمى [${studentKey}]. سيتم إهمال رصده أو تخطيه.`, type: 'warning' });
          }
        }

        if (!subjectName) {
          errors.push({ row: rowNum, details: "حقل اسم المادة الدراسية فارغ!", type: 'error' });
        } else {
          const matchedSub = schoolDatabase.getSubjects().find(s => s.name.includes(subjectName) || subjectName.includes(s.name));
          if (!matchedSub) {
            errors.push({ row: rowNum, details: `المادة الدراسية [${subjectName}] غير مقيدة ببرنامج الحصص المدرسي بالمدرسة مسبقاً!`, type: 'error' });
          }
        }

        if (isNaN(coursework) || coursework < 0 || coursework > 100) {
          errors.push({ row: rowNum, details: `درجة الأعمال المقيدة غير صحيحة أو خارج النطاق الطبيعي: ${rowObj[mapping['courseworkGrade']]}`, type: 'error' });
        }
        if (isNaN(finalExam) || finalExam < 0 || finalExam > 100) {
          errors.push({ row: rowNum, details: `درجة ورقة الامتحان غير صحيحة أو خارج النطاق الطبيعي: ${rowObj[mapping['finalExamGrade']]}`, type: 'error' });
        }
      }
    });

    setValidationErrors(errors);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleMappingChange = (key: string, value: string) => {
    const updated = { ...columnMapping, [key]: value };
    setColumnMapping(updated);
    runValidation(parsedData, updated);
  };

  // Executes the real database insertions / updates
  const executeImport = () => {
    if (importType === 'yemeni_grades') {
      setIsProcessing(true);
      let success = 0;
      let skipped = 0;
      let updated = 0;

      const existingStudents = schoolDatabase.getStudents();
      const schoolSubjects = schoolDatabase.getSubjects();

      const startIdx = wideHeaderRowIndex;
      
      for (let r = startIdx; r < wideRawRows.length; r++) {
        const row = wideRawRows[r];
        if (!row) continue;

        const studentName = String(row[wideNameColIndex] || '').trim();
        if (!studentName || studentName.length < 5 || 
            studentName.includes('مجموع') || 
            studentName.includes('المعبر') || 
            studentName.includes('المعدل') || 
            studentName.includes('النتيجة') || 
            studentName.includes('كشف') || 
            studentName.includes('رصد') || 
            studentName.includes('أعمال') || 
            studentName.includes('امتحان') || 
            studentName.includes('التقدير') ||
            studentName.includes('وزارة') ||
            studentName.includes('جمهورية') ||
            studentName.includes('مدرسة')
        ) {
          skipped++;
          continue;
        }

        const seatNumber = String(row[wideSeatColIndex] || '').trim();

        let student = existingStudents.find(s => 
          s.name === studentName || 
          (seatNumber && s.seatNumber === seatNumber)
        );

        if (!student) {
          const parentName = `والد الطالب ${studentName}`;
          const parentNationalId = `11${Math.floor(100000000 + Math.random() * 900000000)}`;
          const parent = schoolDatabase.addParent({
            name: parentName,
            nationalId: parentNationalId,
            phone: '770000000',
            email: 'parent.auto@school.ye',
            work: 'أعمال حرة',
            address: 'صنعاء، اليمن'
          }, currentUser.id, currentUser.username);

          const studentNationalId = `21${Math.floor(100000000 + Math.random() * 900000000)}`;
          const studentNumber = `REG-YEM-${Math.floor(10000 + Math.random() * 90000)}`;
          
          student = schoolDatabase.addStudent({
            name: studentName,
            gender: 'male',
            birthDate: '2015-01-01',
            nationalId: studentNationalId,
            seatNumber: seatNumber || '',
            studentNumber: studentNumber,
            address: 'صنعاء، اليمن',
            medicalDetails: 'سليم',
            parentId: parent.id,
            classId: wideClassroomId,
            bloodGroup: 'O+',
            avatar: '',
            status: 'active',
            governorate: 'صنعاء',
            district: 'مديرية كحلان الشرف'
          }, currentUser.id, currentUser.username);

          success++;
        }

        let hasGradeForThisRow = false;
        schoolSubjects.forEach(subject => {
          const mapping = wideSubjectMappings[subject.id];
          if (!mapping) return;

          const courseworkVal = row[mapping.courseworkCol];
          const finalExamVal = row[mapping.finalCol];

          const cw = courseworkVal !== undefined && courseworkVal !== '' ? parseFloat(String(courseworkVal)) : NaN;
          const fn = finalExamVal !== undefined && finalExamVal !== '' ? parseFloat(String(finalExamVal)) : NaN;

          if (!isNaN(cw) || !isNaN(fn)) {
            schoolDatabase.addOrUpdateGrade({
              studentId: student!.id,
              subjectId: subject.id,
              examName: wideExamName,
              examDate: new Date().toISOString().split('T')[0],
              courseworkGrade: !isNaN(cw) ? cw : 0,
              finalExamGrade: !isNaN(fn) ? fn : 0
            }, currentUser.id, currentUser.username);
            hasGradeForThisRow = true;
          }
        });

        if (hasGradeForThisRow) {
          updated++;
        }
      }

      setImportSummary({
        total: wideRawRows.length - startIdx,
        success,
        skipped,
        updated
      });

      schoolDatabase.addAuditLog(
        currentUser.id, 
        currentUser.username, 
        'استيراد كشف درجات الوزارة', 
        `تم استيراد كشف درجات الوزارة لصف (${schoolDatabase.getClassrooms().find(c => c.id === wideClassroomId)?.name || wideClassroomId}) بنجاح`
      );

      setStep(3);
      setIsProcessing(false);
      if (onImportComplete) onImportComplete();
      return;
    }

    const errorsOnly = validationErrors.filter(e => e.type === 'error');
    if (errorsOnly.length > 0) {
      alert('يوجد أخطاء حرجة تمنع إجراء الاستيراد الكلي حالياً! يرجى إصلاح البيانات وإعادة الرفع.');
      return;
    }

    setIsProcessing(true);
    let success = 0;
    let skipped = 0;
    let updated = 0;

    const existingStudents = schoolDatabase.getStudents();
    const existingParents = schoolDatabase.getParents();
    const existingClassrooms = schoolDatabase.getClassrooms();
    const existingSubjects = schoolDatabase.getSubjects();

    parsedData.forEach(rowObj => {
      try {
        if (importType === 'students') {
          const nameVal = rowObj[columnMapping['name']];
          const idVal = rowObj[columnMapping['nationalId']];
          const seatNo = rowObj[columnMapping['seatNumber']] || '';
          const stdNo = rowObj[columnMapping['studentNumber']] || `REG-YEM-${Math.floor(1000 + Math.random() * 9000)}`;
          const genderVal = rowObj[columnMapping['gender']] === 'أنثى' ? 'female' : 'male';
          const dob = rowObj[columnMapping['birthDate']] || '2015-01-01';
          const addr = rowObj[columnMapping['address']] || 'صنعاء، اليمن';
          const med = rowObj[columnMapping['medicalDetails']] || 'سليم';
          const blood = rowObj[columnMapping['bloodGroup']] || 'O+';

          // Skip if duplicate exists in DB
          if (existingStudents.some(s => s.nationalId === idVal)) {
            skipped++;
            return;
          }

          // Target default parent or auto-create a parent record cleanly
          let parentToUse = existingParents[0]?.id || 'prt-1';
          
          // Auto-create a parent record for bulk imports
          const parentName = `والد الطالب ${nameVal}`;
          const newParent = schoolDatabase.addParent({
            name: parentName,
            nationalId: `11${idVal.substring(2, 10) || '0000000'}`,
            phone: '777000000',
            email: 'parent.auto@school.ye',
            work: 'أعمال حرة',
            address: addr
          }, currentUser.id, currentUser.username);
          parentToUse = newParent.id;

          schoolDatabase.addStudent({
            name: nameVal,
            gender: genderVal,
            birthDate: dob,
            nationalId: idVal,
            seatNumber: seatNo,
            studentNumber: stdNo,
            address: addr,
            medicalDetails: med,
            parentId: parentToUse,
            classId: existingClassrooms[0]?.id || 'class-1',
            bloodGroup: blood,
            avatar: '',
            status: 'active',
            governorate: 'صنعاء',
            district: 'مديرية معين'
          }, currentUser.id, currentUser.username);

          success++;
        }

        if (importType === 'teachers') {
          const nameVal = rowObj[columnMapping['name']];
          const idVal = rowObj[columnMapping['nationalId']];
          const spec = rowObj[columnMapping['specialty']] || 'العلوم العامة';
          const qual = rowObj[columnMapping['qualification']] || 'بكالوريوس تربية';
          const exp = parseInt(rowObj[columnMapping['experienceYears']]) || 5;
          const phone = rowObj[columnMapping['phone']] || '770000000';
          const email = rowObj[columnMapping['email']] || 'teacher@school.ye';
          const salary = parseFloat(rowObj[columnMapping['salary']]) || 100000;

          if (schoolDatabase.getTeachers().some(t => t.nationalId === idVal)) {
            skipped++;
            return;
          }

          schoolDatabase.addTeacher({
            name: nameVal,
            nationalId: idVal,
            qualification: qual,
            experienceYears: exp,
            email: email,
            phone: phone,
            salary: salary,
            specialty: spec
          }, currentUser.id, currentUser.username);

          success++;
        }

        if (importType === 'grades') {
          const stKey = rowObj[columnMapping['studentKey']];
          const subName = rowObj[columnMapping['subjectName']];
          const exName = rowObj[columnMapping['examName']];
          const coursework = parseFloat(rowObj[columnMapping['courseworkGrade']]);
          const finalExam = parseFloat(rowObj[columnMapping['finalExamGrade']]);

          const matchedStud = existingStudents.find(s => 
            s.name === stKey || s.seatNumber === stKey || s.studentNumber === stKey
          );
          const matchedSub = existingSubjects.find(s => s.name.includes(subName) || subName.includes(s.name));

          if (!matchedStud || !matchedSub) {
            skipped++;
            return;
          }

          // Check if already present, updates existing or inserts if missing
          const existingGrades = schoolDatabase.getGrades();
          const alreadyHas = existingGrades.some(g => g.studentId === matchedStud.id && g.subjectId === matchedSub.id && g.examName === exName);

          schoolDatabase.addOrUpdateGrade({
            studentId: matchedStud.id,
            subjectId: matchedSub.id,
            examName: exName,
            examDate: new Date().toISOString().split('T')[0],
            courseworkGrade: coursework,
            finalExamGrade: finalExam
          }, currentUser.id, currentUser.username);

          if (alreadyHas) {
            updated++;
          } else {
            success++;
          }
        }

        if (importType === 'attendance') {
          const stKey = rowObj[columnMapping['studentKey']];
          const attDate = rowObj[columnMapping['date']] || new Date().toISOString().split('T')[0];
          const rawStatus = rowObj[columnMapping['status']] || 'حاضر';
          const notes = rowObj[columnMapping['notes']] || '';

          const matchedStud = existingStudents.find(s => 
            s.name === stKey || s.seatNumber === stKey || s.studentNumber === stKey
          );

          if (!matchedStud) {
            skipped++;
            return;
          }

          let formattedStatus: 'present' | 'absent' | 'late' | 'excused' = 'present';
          if (rawStatus.includes('غائب') || rawStatus.includes('absent')) formattedStatus = 'absent';
          else if (rawStatus.includes('متأخر') || rawStatus.includes('late')) formattedStatus = 'late';
          else if (rawStatus.includes('مستأذن') || rawStatus.includes('excused')) formattedStatus = 'excused';

          schoolDatabase.saveAttendanceBatch([{
            studentId: matchedStud.id,
            date: attDate,
            status: formattedStatus,
            notes: notes
          }], currentUser.id, currentUser.username);

          success++;
        }

        if (importType === 'fees') {
          const stKey = rowObj[columnMapping['studentKey']];
          const feeName = rowObj[columnMapping['feeName']];
          const rawAmount = parseFloat(rowObj[columnMapping['amountPaid']]);
          const method = rowObj[columnMapping['paymentMethod']] || 'cash';
          const refNo = rowObj[columnMapping['referenceNumber']] || `REC-${Date.now()}`;
          const notes = rowObj[columnMapping['notes']] || '';

          const matchedStud = existingStudents.find(s => 
            s.name === stKey || s.seatNumber === stKey || s.studentNumber === stKey
          );
          const matchedFee = schoolDatabase.getFeeTypes().find(f => f.name.includes(feeName) || feeName.includes(f.name)) || schoolDatabase.getFeeTypes()[0];

          if (!matchedStud) {
            skipped++;
            return;
          }

          schoolDatabase.addFeePayment({
            studentId: matchedStud.id,
            feeTypeId: matchedFee.id,
            amountPaid: rawAmount,
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: method === 'كاش' || method === 'نقدي' ? 'cash' : 'bank_transfer',
            referenceNumber: refNo,
            academicYear: schoolDatabase.getSettings().currentAcademicYear,
            notes: notes
          }, currentUser.id, currentUser.username);

          success++;
        }
      } catch (err) {
        console.error("Row import breakdown:", err);
        skipped++;
      }
    });

    setImportSummary({
      total: parsedData.length,
      success,
      skipped,
      updated
    });

    schoolDatabase.addAuditLog(
      currentUser.id, 
      currentUser.username, 
      'معالجة استيراد دفعات', 
      `التنفيذ البرمجي لاستيراد كشف Excel لعدد ${parsedData.length} سطر بنجاح وتسكينه بأمان`
    );

    setStep(3);
    setIsProcessing(false);
    if (onImportComplete) onImportComplete();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-md md:p-8" id="xlsx-import-center">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-emerald-50 text-emerald-800 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border border-emerald-100 inline-block mb-2">
            مركز الدمج ومعالجة السجلات الذكية (Import Center)
          </span>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Database className="w-5.5 h-5.5 text-primary" />
            مركز استيراد المکونات المدرسية من ملفات Excel و CSV
          </h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            محرك ذكاء رقمي لمطابقة أعمدة السجلات (المدرسین والطلاب والدرجات والغياب اليومي) ليتكامَل فورياً مع كشوف نظام المنارة وحفظها مباشرة بقاعدة بيانات المدرسة الآمنة.
          </p>
        </div>
        
        {step > 1 && (
          <button 
            onClick={() => {
              setStep(1);
              setFile(null);
              setParsedData([]);
              setValidationErrors([]);
              setImportSummary(null);
            }}
            className="px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl font-semibold flex items-center gap-1 transition"
          >
            <X className="w-4 h-4" />
            <span>إلغاء والمعاودة</span>
          </button>
        )}
      </div>

      {/* Step 1: Selector of Import Type and File Upload */}
      {step === 1 && (
        <div className="space-y-6">
          
          {/* Goal Selector Grid Layout */}
          <div>
            <label className="block text-slate-700 font-bold text-xs mb-3">1. حدد باقة السجلات التي تنوي استيرادها الآن:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { id: 'students', label: 'كشوف تسجيل الطلاب', icon: GraduationCap, color: 'text-primary bg-sky-50 border-sky-100' },
                { id: 'teachers', label: 'كشوف معلمين المدرسة', icon: Users, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                { id: 'grades', label: 'رصد درجات اختبارات', icon: Calculator, color: 'text-amber-700 bg-amber-50 border-amber-100' },
                { id: 'attendance', label: 'كشوف الحضور والغياب', icon: ClipboardList, color: 'text-rose-700 bg-rose-50 border-rose-100' },
                { id: 'fees', label: 'سجلات سندات المحاسبة', icon: DollarSign, color: 'text-violet-700 bg-violet-50 border-violet-100' },
                { id: 'yemeni_grades', label: 'شيت الوزارة الشامل (الدرجات والأسماء)', icon: FileSpreadsheet, color: 'text-rose-700 bg-rose-50 border-rose-100' },
              ].map(item => {
                const Icon = item.icon;
                const isSelected = importType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setImportType(item.id as ImportType)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-primary scale-102 font-bold shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5.5 h-5.5 mb-2 shrink-0 text-[#D4A017]" />
                    <span className="text-[11px] block leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop File Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragOver 
                ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="file-upload-input"
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload-input" className="cursor-pointer block space-y-3">
              <div className="w-14 h-14 bg-white border border-slate-200 text-primary flex items-center justify-center rounded-2xl mx-auto shadow-sm">
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <Upload className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm">
                  اسحب ملف كشف الدرجات أو الطلاب وأفلته هنا أو اضغط للاختيار يدوياً
                </p>
                <p className="text-[11px] text-slate-500">
                  يدعم صيغ Excel (.xlsx / .xls) أو ملفات القيم المفصولة بفواصل (.csv)
                </p>
              </div>
              
              <div className="inline-block bg-slate-100 text-slate-600 rounded-lg px-3 py-1 font-mono text-[10px] border border-slate-200">
                العمود المعرف للطالب: رقم الجلوس أو الرقم الأكاديمي أو الاسم الوطني الثلاثي
              </div>
            </label>
          </div>

          <div className="bg-yellow-50 text-slate-700 p-4 rounded-xl border border-yellow-100 text-[11px] flex gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-extrabold text-yellow-800">تنويه إرشادي حوكمي يمني:</span> برمجيات الاستيراد في مجمع المنارة مطابقة تماماً للمواصفات القياسية لوزارة التربية اليمنية. من الأفضل تزويد الشيت دائماً بـ 
              <span className="font-bold"> [رقم الجلوس الوزاري] </span> للطلاب في الثانوية والتاسع لتفادي تشابه الأسماء الثلاثية وضمان دمج الدرجات بدقة منقطعة النظير.
            </div>
          </div>

        </div>
      )}

      {/* Step 2: Intelligent Columns Mapping Grid & Validation Results */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-600 font-bold flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-primary" />
              {importType === 'yemeni_grades' ? (
                <span>تم تحميل كشف درجات الوزارة العريض بنجاح: <span className="font-mono text-primary font-extrabold">{file?.name}</span> • يحوي <span className="text-secondary font-extrabold">{wideRawRows.length} سطر للطلاب</span> جاهز للمطابقة والتحميل.</span>
              ) : (
                <span>تم تحميل ملف البيانات بنجاح: <span className="font-mono text-primary font-extrabold">{file?.name}</span> • يحوي <span className="text-secondary font-extrabold">{parsedData.length} سجل</span> جاهز للدمج.</span>
              )}
            </p>
          </div>

          {importType === 'yemeni_grades' ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Database className="w-5 h-5 text-emerald-600 animate-bounce" />
                    معالج كشوفات رصد درجات وزارة التربية والتعليم اليمنية الشامل
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    هذا المعالج يحاكي تماماً شكل وصيغة كشوفات الوزارة الرسمية. يقوم المحرك تلقائياً بمطابقة أسماء الطلاب كصفوف، والمواد الدراسية (القرآن، العربية، إلخ) كأعمدة عريضة تحتوي على درجات أعمال السنة والاختبارات تمهيداً لحفظها دفعة واحدة.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">الامتحان والتقرير المستهدف:</label>
                    <select
                      value={wideExamName}
                      onChange={(e) => setWideExamName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-1.5 md:p-2 outline-none font-bold text-primary"
                    >
                      <option value="اختبار نصف الفصل الدراسي الثاني">اختبار نصف الفصل الدراسي الثاني</option>
                      <option value="الامتحان النهائي - الفصل الثاني">الامتحان النهائي - الفصل الثاني</option>
                      <option value="اختبار نصف الفصل الدراسي الأول">اختبار نصف الفصل الدراسي الأول</option>
                      <option value="الامتحان النهائي - الفصل الأول">الامتحان النهائي - الفصل الأول</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">الصف/الشعبة المدرسية للتسكين:</label>
                    <select
                      value={wideClassroomId}
                      onChange={(e) => setWideClassroomId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-1.5 md:p-2 outline-none font-bold text-primary cursor-pointer"
                    >
                      {schoolDatabase.getClassrooms().map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.stage === 'primary' ? 'أساسي' : 'ثانوي'})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Rows and Column Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-50/20 p-4 rounded-xl border border-indigo-100">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">سطر بداية أسماء الطلاب (أول تلميذ):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={wideHeaderRowIndex + 1}
                    onChange={(e) => setWideHeaderRowIndex(Math.max(0, parseInt(e.target.value) - 1))}
                    className="bg-white border border-slate-200 rounded-lg text-xs p-2 outline-none font-bold text-indigo-900"
                    placeholder="مثال: 11"
                  />
                  <p className="text-[9px] text-slate-400">السطر الفعلي لاسم أول طالب في ملف الـ Excel.</p>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">عمود اسم الطالب:</label>
                  <select
                    value={wideNameColIndex}
                    onChange={(e) => setWideNameColIndex(parseInt(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg text-xs p-2 outline-none font-bold text-slate-700"
                  >
                    <option value="-1">-- اختر العمود --</option>
                    {wideColHeaders.map(col => (
                      <option key={col.index} value={col.index}>{col.label}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400">العمود المشتمل على أسماء الطلاب الثلاثية والرباعية.</p>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">عمود رقم جلوس الطالب:</label>
                  <select
                    value={wideSeatColIndex}
                    onChange={(e) => setWideSeatColIndex(parseInt(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg text-xs p-2 outline-none font-bold text-slate-700"
                  >
                    <option value="-1">-- اختر العمود أو تغافله --</option>
                    {wideColHeaders.map(col => (
                      <option key={col.index} value={col.index}>{col.label}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400">العمود المكتوب فيه رقم جلوس الطالب الوزاري.</p>
                </div>
              </div>

              {/* Dynamic Subject Column Allocation Grid */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                  <p className="text-xs font-black text-slate-850">ربط وتوزيع أعمدة المواد الدراسية ودرجاتها (الأعمال والامتحانات):</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolDatabase.getSubjects().map(subject => {
                    const mapping = wideSubjectMappings[subject.id] || { courseworkCol: -1, finalCol: -1 };
                    return (
                      <div key={subject.id} className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 space-y-2">
                        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                          <BookOpen className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-xs font-black text-slate-800">{subject.name}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 block">أعمال السنة والمستمر:</label>
                            <select
                              value={mapping.courseworkCol}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setWideSubjectMappings(prev => ({
                                  ...prev,
                                  [subject.id]: { ...prev[subject.id], courseworkCol: val }
                                }));
                              }}
                              className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-slate-700 text-[10px]"
                            >
                              <option value="-1">بلا/تخطى</option>
                              {wideColHeaders.map(col => (
                                <option key={col.index} value={col.index}>{col.letter} - {col.label.split('(')[1]?.replace(')', '') || ''}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 block">الامتحان النهائي:</label>
                            <select
                              value={mapping.finalCol}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setWideSubjectMappings(prev => ({
                                  ...prev,
                                  [subject.id]: { ...prev[subject.id], finalCol: val }
                                }));
                              }}
                              className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-slate-700 text-[10px]"
                            >
                              <option value="-1">بلا/تخطى</option>
                              {wideColHeaders.map(col => (
                                <option key={col.index} value={col.index}>{col.letter} - {col.label.split('(')[1]?.replace(')', '') || ''}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Preview Checklist */}
              <div className="border border-amber-200 bg-amber-50/25 p-4 rounded-xl space-y-3">
                <span className="text-[10.5px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
                  👁️ فحص وقراءة عينة حية ومعاينة استباقية (أول 5 طلاب مكتشفين):
                </span>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-[10px] font-medium border-collapse">
                    <thead>
                      <tr className="border-b border-amber-200/50 pb-1 text-slate-700 uppercase">
                        <th className="p-1 font-black">رقم جلوس الطالب</th>
                        <th className="p-1 font-black">اسم الطالب المكتشف</th>
                        {schoolDatabase.getSubjects().map(sub => (
                          <th key={sub.id} className="p-1 font-black">{sub.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {wideRawRows.slice(wideHeaderRowIndex)
                        .filter(row => String(row[wideNameColIndex] || '').trim().length > 4)
                        .slice(0, 5)
                        .map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-100/40">
                            <td className="p-1.5 font-mono text-slate-500 font-bold">{String(row[wideSeatColIndex] || '')}</td>
                            <td className="p-1.5 font-bold text-indigo-950">{String(row[wideNameColIndex] || '')}</td>
                            {schoolDatabase.getSubjects().map(sub => {
                              const cb = wideSubjectMappings[sub.id];
                              const courseworkVal = cb ? row[cb.courseworkCol] : '';
                              const finalExamVal = cb ? row[cb.finalCol] : '';
                              return (
                                <td key={sub.id} className="p-1.5 text-slate-600">
                                  {courseworkVal !== undefined && courseworkVal !== '' ? `أعمال: ${courseworkVal}` : ''}
                                  {finalExamVal !== undefined && finalExamVal !== '' ? ` • اختبار: ${finalExamVal}` : ''}
                                  {(!courseworkVal && !finalExamVal) && '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Columns Mapper Form Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  مرحلة المطابقة الذكية لأعمدة شيت السجل المقروء:
                </h3>
                
                <p className="text-[11px] text-slate-500 leading-normal">
                  يتعرف محرك مطابقة المنارة الاستباقي على مسميات الأعمدة المرفقة ويصنفها للسرعة. يرجى تصفح الحقول أدناه للتأكيد أو تصويب المطابقة اليدوية في حال الاختلاف:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {TARGET_FIELDS[importType].map(target => {
                    const mappedColumn = columnMapping[target.key] || '';
                    return (
                      <div key={target.key} className="flex flex-col space-y-1.5 border border-slate-100 hover:border-slate-200 p-3 rounded-lg bg-slate-50/30 transition">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            {target.label}
                            {target.required && <span className="text-rose-500 font-black">*</span>}
                          </label>
                          
                          {mappedColumn ? (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 flex items-center gap-0.5">
                              ✓ تم الربط الذكي
                            </span>
                          ) : target.required ? (
                            <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                              ⚠️ مطلوب دمجها يدوياً
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">اختياري</span>
                          )}
                        </div>

                        <select
                          value={mappedColumn}
                          onChange={(e) => handleMappingChange(target.key, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-none focus:border-primary/60 outline-none"
                        >
                          <option value="">-- تغافل هذا الحقل وعدم ربطه --</option>
                          {headers.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Validation & Error Checker Area */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  التحقق الدوري من سلامة الصفوف ومطابقتها قبل الاعتماد:
                </h3>
                
                {validationErrors.length === 0 ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-emerald-900 block mb-0.5">البيانات خالية من الأخطاء والتعارضات الحرجة!</span>
                      تم فحص كامل الصفوف المقروءة للتأكد من خلوها من تكرار الهويات المدنية أو الأرقام الأكاديمية. يمكنك البدء في عملية القيد والاستيراد بسلامة.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 border border-slate-100 rounded-lg p-2.5">
                    {validationErrors.map((err, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
                          err.type === 'error' 
                            ? 'bg-rose-50 border-rose-100 text-rose-800' 
                            : 'bg-amber-50 border-amber-100 text-amber-800'
                        }`}
                      >
                        {err.type === 'error' ? (
                          <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          {err.row > 0 && <span className="font-extrabold text-slate-705 ml-1 select-none">السطر {err.row}:</span>}
                          {err.details}
                          {err.type === 'error' && <span className="block text-[9px] text-rose-500 font-bold mt-0.5">(خطأ حرج - سيمنع الاستيراد الإجمالي للطلاب)</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Trigger Buttons */}
          <div className="flex justify-end gap-3.5 border-t border-slate-100 pt-5">
            <button
              onClick={() => {
                setStep(1);
                setFile(null);
                setParsedData([]);
                setValidationErrors([]);
                setImportSummary(null);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              الرجوع للخلف وإلغاء الملف
            </button>
            <button
              onClick={executeImport}
              disabled={isProcessing || (importType !== 'yemeni_grades' && validationErrors.some(e => e.type === 'error'))}
              className={`px-5 py-2.5 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer ${
                (importType !== 'yemeni_grades' && validationErrors.some(e => e.type === 'error'))
                  ? 'bg-slate-350 cursor-not-allowed bg-slate-450 text-slate-650'
                  : 'bg-gradient-to-l from-primary to-[#0F8A5F] hover:from-primary hover:to-[#0F8A5F]/90 hover:shadow-lg'
              }`}
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
              <span>تأكيد دمج السجلات وتسكين العلامات الموزعة</span>
            </button>
          </div>

        </div>
      )}

      {/* Step 3: Completed summary display state */}
      {step === 3 && importSummary && (
        <div className="space-y-6 text-center py-8">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center rounded-full mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800">اكتملت المعالجة وحوكمة الدمج بنجاح!</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
              تم بنجاح قيد ودمج البيانات المرفوعة بملف Excel وتحديث جداول قاعدة بيانات نظام المنارة الداخلي SQLite.
            </p>
          </div>

          {/* Metrics summary widget */}
          <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto pt-4 font-sans">
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center">
              <span className="block text-slate-400 text-[10px] font-bold">إجمالي السطور</span>
              <span className="block text-slate-800 text-lg font-black mt-1 font-mono">{importSummary.total}</span>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-center">
              <span className="block text-emerald-700 text-[10px] font-bold">تم قيدها بنجاح</span>
              <span className="block text-emerald-950 text-lg font-black mt-1 font-mono">{importSummary.success}</span>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-center font-bold">
              <span className="block text-amber-700 text-[10px]">تعديل مسبق</span>
              <span className="block text-amber-950 text-lg font-black mt-1 font-mono">{importSummary.updated}</span>
            </div>

            <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl text-center font-bold">
              <span className="block text-slate-500 text-[10px]">تخطى مكرر</span>
              <span className="block text-slate-800 text-lg font-black mt-1 font-mono">{importSummary.skipped}</span>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => {
                setStep(1);
                setFile(null);
                setParsedData([]);
                setValidationErrors([]);
                setImportSummary(null);
              }}
              className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
            >
              بدء جلسة استيراد جديدة لملفات أخرى
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
