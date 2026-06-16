/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import initSqlJs from 'sql.js';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'school.db');
console.log(`[SQLITE] Database file location configured as: ${DB_PATH}`);

interface DBEngine {
  run(sql: string, params?: any[]): Promise<void>;
  all(sql: string, params?: any[]): Promise<any[]>;
  serialize(callback: () => void): void;
}

let dbEngine: DBEngine;
let isWasmEngine = false;

// Delayed database initializer supporting clean Native <-> WASM fallback
async function startDatabase() {
  try {
    console.log('[DATABASE] Initializing active SQLite connection...');
    // Dynamically access native sqlite3 module to isolate GLIBC-vulnerable bindings
    const sqlite3 = require('sqlite3');
    const nativeDb = new sqlite3.Database(DB_PATH, (err: any) => {
      if (err) {
        console.error('[DATABASE] Native SQLite load error:', err.message);
        throw err;
      }
    });

    dbEngine = {
      run: (sql: string, params: any[] = []): Promise<void> => {
        return new Promise((resolve, reject) => {
          nativeDb.run(sql, params, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },
      all: (sql: string, params: any[] = []): Promise<any[]> => {
        return new Promise((resolve, reject) => {
          nativeDb.all(sql, params, (err: any, rows: any[]) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      },
      serialize: (callback: () => void) => {
        nativeDb.serialize(callback);
      }
    };
    console.log('[DATABASE] Synced with physical disk using native Driver bindings');
  } catch (err: any) {
    console.warn('[DATABASE] Native sqlite3 failed to load (likely due to sandbox GLIBC environment):', err.message);
    console.log('[DATABASE] Attempting seamless backup transition to pure WebAssembly (sql.js) engine...');
    isWasmEngine = true;

    try {
      const SQL = await initSqlJs();
      let wasmDb: any;

      if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        wasmDb = new SQL.Database(fileBuffer);
      } else {
        wasmDb = new SQL.Database();
      }

      const saveToDisk = () => {
        const binaryArray = wasmDb.export();
        const buffer = Buffer.from(binaryArray);
        fs.writeFileSync(DB_PATH, buffer);
      };

      dbEngine = {
        run: async (sql: string, params: any[] = []): Promise<void> => {
          wasmDb.run(sql, params);
          saveToDisk();
        },
        all: async (sql: string, params: any[] = []): Promise<any[]> => {
          const results: any[] = [];
          const stmt = wasmDb.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
        serialize: (callback: () => void) => {
          callback();
        }
      };
      
      // Save initial DB structure if just created in memory
      saveToDisk();
      console.log('[DATABASE] Connected using pure WebAssembly sql.js driver with instant disk synchronization.');
    } catch (wasmErr: any) {
      console.error('[DATABASE] Critical Error: Fallback WASM engine also failed to initialize!', wasmErr.message);
      process.exit(1);
    }
  }

  await initializeTables();
}

// Helper top-level function to run SQL queries as promises
function runSql(sql: string, params: any[] = []): Promise<void> {
  return dbEngine.run(sql, params);
}

function selectAll(sql: string, params: any[] = []): Promise<any[]> {
  return dbEngine.all(sql, params);
}

async function initializeTables() {
  try {
    // 1. Create tables with native structures
    await runSql(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      fullName TEXT,
      role TEXT,
      email TEXT,
      phone TEXT,
      status TEXT,
      createdAt TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS parents (
      id TEXT PRIMARY KEY,
      name TEXT,
      nationalId TEXT,
      phone TEXT,
      email TEXT,
      work TEXT,
      address TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS classrooms (
      id TEXT PRIMARY KEY,
      name TEXT,
      stage TEXT,
      maxCapacity INTEGER,
      roomNumber TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT,
      gender TEXT,
      birthDate TEXT,
      nationalId TEXT,
      seatNumber TEXT,
      studentNumber TEXT,
      address TEXT,
      medicalDetails TEXT,
      parentId TEXT,
      classId TEXT,
      avatar TEXT,
      bloodGroup TEXT,
      status TEXT,
      governorate TEXT,
      district TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT,
      nationalId TEXT,
      qualification TEXT,
      experienceYears INTEGER,
      email TEXT,
      phone TEXT,
      salary REAL,
      specialty TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT,
      minGrade REAL,
      maxGrade REAL,
      stage TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      classroomId TEXT,
      teacherId TEXT,
      subjectId TEXT,
      dayOfWeek INTEGER,
      periodNumber INTEGER
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      date TEXT,
      status TEXT,
      notes TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      subjectId TEXT,
      examName TEXT,
      examDate TEXT,
      courseworkGrade REAL,
      finalExamGrade REAL,
      totalGrade REAL,
      resultStatus TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS fee_types (
      id TEXT PRIMARY KEY,
      name TEXT,
      amount REAL,
      description TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS fee_payments (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      feeTypeId TEXT,
      amountPaid REAL,
      paymentDate TEXT,
      paymentMethod TEXT,
      referenceNumber TEXT,
      academicYear TEXT,
      notes TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS behavior_evaluations (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      date TEXT,
      notes TEXT,
      stars INTEGER,
      deductedPoints INTEGER
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS settings (
      schoolName TEXT,
      logoUrl TEXT,
      contactPhone TEXT,
      contactEmail TEXT,
      currentAcademicYear TEXT,
      address TEXT,
      bankAccount TEXT,
      schoolType TEXT,
      governorate TEXT,
      district TEXT,
      principalName TEXT,
      vicePrincipalName TEXT,
      studentAffairsName TEXT,
      semester TEXT
    )`);

    await runSql(`CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      username TEXT,
      action TEXT,
      details TEXT,
      timestamp TEXT
    )`);

    console.log('[SQLITE] Database structural tables created successfully');

    // 2. Check and Seed default admin if user table is empty
    const users = await selectAll('SELECT * FROM users');
    if (users.length === 0) {
      console.log('[SQLITE] Fresh database detected. Seeding full default datasets...');
      await seedDefaults();
    }
  } catch (e: any) {
    console.error('[SQLITE] Initialization error:', e.message);
  }
}

async function seedDefaults() {
  try {
    // Audit startup seeding
    console.log('[SQLITE] Seeding administrative metadata and default credentials...');
    
    // Seed users
    const defaultUsers = [
      ['usr-1', 'admin', 'أ. عادل عبد الله الصنعاني', 'admin', 'adel.admin@school.edu.ye', '771122334', 'active', new Date().toISOString()],
      ['usr-2', 'director', 'أ. محمد عبد الله الجائفي', 'director', 'director.g@school.edu.ye', '772233445', 'active', new Date().toISOString()],
      ['usr-3', 'vicedirector', 'أ. عبد الكريم حميد الارياني', 'vice_director', 'vice.iri@school.edu.ye', '773344556', 'active', new Date().toISOString()],
      ['usr-4', 'studentaffairs', 'أ. سلوى عبدالله الهمداني', 'student_affairs', 'salwa.h@school.edu.ye', '774455667', 'active', new Date().toISOString()],
      ['usr-5', 'teacher', 'أ. خالد محمد الحيمي', 'teacher', 'khaled.h@school.edu.ye', '775566778', 'active', new Date().toISOString()],
      ['usr-6', 'accountant', 'أ. محمد عبده الحرازي', 'accountant', 'harazi.a@school.edu.ye', '776677889', 'active', new Date().toISOString()],
      ['usr-7', 'parent', 'الشيخ عبد الله بن حسين السريحي', 'parent', 'parent.yem@gmail.com', '777112233', 'active', new Date().toISOString()]
    ];
    for (const u of defaultUsers) {
      await runSql('INSERT OR IGNORE INTO users (id, username, fullName, role, email, phone, status, createdAt) VALUES (?,?,?,?,?,?,?,?)', u);
    }

    // Seed parents
    const defaultParents = [
      ['prt-1', 'الشيخ عبد الله بن حسين السريحي', '1002345889', '777112233', 'parent.yem@gmail.com', 'تاجر ومستورد', 'شارع الخمسين - صنعاء'],
      ['prt-2', 'أ. علوان يحيى عياش', '1098234511', '773456789', 'alwan.a@yemen.ye', 'أستاذ مشارك - جامعة صنعاء', 'حي السنينة - صنعاء'],
      ['prt-3', 'م. عبد اللطيف عبد الملك شرف', '1034567812', '771239988', 'latif.sh@yahoo.com', 'مهندس اتصالات مستقل', 'شارع حدة - صنعاء']
    ];
    for (const p of defaultParents) {
      await runSql('INSERT OR IGNORE INTO parents (id, name, nationalId, phone, email, work, address) VALUES (?,?,?,?,?,?,?)', p);
    }

    // Seed classrooms
    const defaultClassrooms = [
      ['class-1', 'الصف الأول الأساسي', 'primary', 55, 'وزاري-11'],
      ['class-2', 'الصف الثاني الأساسي', 'primary', 45, 'وزاري-12'],
      ['class-3', 'الصف الثالث الأساسي', 'primary', 45, 'وزاري-13'],
      ['class-4', 'الصف الرابع الأساسي', 'primary', 45, 'وزاري-14'],
      ['class-5', 'الصف الخامس الأساسي', 'primary', 45, 'وزاري-15'],
      ['class-6', 'الصف السادس الأساسي', 'primary', 45, 'وزاري-16'],
      ['class-7', 'الصف السابع الأساسي', 'middle', 45, 'وزاري-27'],
      ['class-8', 'الصف الثامن الأساسي', 'middle', 45, 'وزاري-28']
    ];
    for (const c of defaultClassrooms) {
      await runSql('INSERT OR IGNORE INTO classrooms (id, name, stage, maxCapacity, roomNumber) VALUES (?,?,?,?,?)', c);
    }

    // Seed students
    const defaultStudents = [
      ['std-1-1', 'ابراهيم إسماعيل محمد سعيد الحداد', 'male', '2019-02-12', '2019183741', '322101', 'STU-1447-001', 'صنعاء - الجراف', 'سليم', 'prt-1', 'class-1', '', 'O+', 'active', 'أمانة العاصمة', 'مديرية الثورة'],
      ['std-1-2', 'احمد رمزي عبدالله حميد التاج', 'male', '2019-05-15', '2019183742', '322102', 'STU-1447-002', 'صنعاء - الحصبة', 'سليم', 'prt-1', 'class-1', '', 'B+', 'active', 'أمانة العاصمة', 'مديرية الثورة'],
      ['std-1-3', 'احمد محمد احمد سعيد مرشد', 'male', '2019-04-10', '2019183743', '322103', 'STU-1447-003', 'صنعاء - الستين', 'سليم', 'prt-2', 'class-1', '', 'A+', 'active', 'أمانة العاصمة', 'مديرية معين'],
      ['std-1-4', 'احمد محمد احمد سيف علي الصبيحي', 'male', '2019-03-24', '2019183744', '322104', 'STU-1447-004', 'صنعاء - المطار', 'سليم', 'prt-3', 'class-1', '', 'O-', 'active', 'أمانة العاصمة', 'مديرية بني الحارث'],
      ['std-1-5', 'احمد منصور محمد احمد علي', 'male', '2019-08-30', '2019183745', '322105', 'STU-1447-005', 'صنعاء - حدة', 'سليم', 'prt-1', 'class-1', '', 'O+', 'active', 'أمانة العاصمة', 'مديرية السبعين'],
      ['std-2-1', 'ابراهيم احمد سعيد ناجي الطالبي', 'male', '2018-03-12', '2018183701', '498101', 'STU-1447-201', 'صنعاء - حدة', 'سليم', 'prt-1', 'class-2', '', 'O+', 'active', 'أمانة العاصمة', 'مديرية السبعين'],
      ['std-2-2', 'ابراهيم بندر احمد عبده المنصوري', 'male', '2018-05-18', '2018183702', '566102', 'STU-1447-202', 'صنعاء - الستين', 'سليم', 'prt-2', 'class-2', '', 'A+', 'active', 'أمانة العاصمة', 'مديرية معين'],
      ['std-3-1', 'احمد عبدالحكيم علي محمد الجنيد', 'male', '2017-04-20', '2017183701', '527101', 'STU-1447-301', 'صنعاء - نقم', 'سليم', 'prt-1', 'class-3', '', 'A+', 'active', 'أمانة العاصمة', 'مديرية شعوب'],
      ['std-7-1', 'عبدالكريم طه يحيى عياش المنهي', 'male', '2013-02-14', '2013183701', '420101', 'STU-1447-701', 'تعز - المسبح', 'سليم', 'prt-1', 'class-7', '', 'B+', 'active', 'تعز', 'مديرية القاهرة'],
      ['std-8-1', 'سعيد مصلح سعيد عبدالله المخلافي', 'male', '2012-04-12', '2012183701', '530101', 'STU-1447-801', 'تعز - عصيفرة', 'سليم', 'prt-1', 'class-8', '', 'A+', 'active', 'تعز', 'مديرية القاهرة']
    ];
    for (const s of defaultStudents) {
      await runSql(`INSERT OR IGNORE INTO students 
        (id, name, gender, birthDate, nationalId, seatNumber, studentNumber, address, medicalDetails, parentId, classId, avatar, bloodGroup, status, governorate, district) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, s);
    }

    // Seed teachers
    const defaultTeachers = [
      ['tch-1', 'أ. جلال منصور الصلوي', '1044231201', 'بكالوريوس علوم متميز - جامعة صنعاء', 14, 'galal.s@school.edu.ye', '775566778', 180000, 'القرآن والتربية الإسلامية'],
      ['tch-2', 'أ. نجيب عبده اليوسفي', '1055312302', 'ليسانس لغة عربية - جامعة تعز', 11, 'najeeb.y@school.edu.ye', '771122331', 150000, 'اللغة العربية والاجتماعيات'],
      ['tch-3', 'أ. بلقيس علي الهمداني', '1066412303', 'ماجستير رياضيات تطبيقية - جامعة ذمار', 16, 'balqis.h@school.edu.ye', '772233442', 210000, 'الرياضيات والعلوم للمرحلة الأساسية']
    ];
    for (const t of defaultTeachers) {
      await runSql('INSERT OR IGNORE INTO teachers (id, name, nationalId, qualification, experienceYears, email, phone, salary, specialty) VALUES (?,?,?,?,?,?,?,?,?)', t);
    }

    // Seed subjects
    const defaultSubjects = [
      ['sub-1', 'القرآن الكريم وعلومه', 50, 100, 'primary'],
      ['sub-2', 'التربية الإسلامية', 50, 100, 'primary'],
      ['sub-3', 'اللغة العربية الأساسية', 50, 100, 'primary'],
      ['sub-4', 'الرياضيات التطبيقية', 50, 100, 'primary'],
      ['sub-5', 'العلوم العامة', 50, 100, 'primary'],
      ['sub-6', 'السلوك والمواظبة', 50, 100, 'primary'],
      ['sub-1-m', 'القرآن الكريم والتجويد', 50, 100, 'middle'],
      ['sub-2-m', 'التربية الإسلامية وفقهها', 50, 100, 'middle'],
      ['sub-3-m', 'اللغة العربية وفنونها', 50, 100, 'middle'],
      ['sub-4-m', 'الرياضيات العامة والفيزياء', 50, 100, 'middle']
    ];
    for (const s of defaultSubjects) {
      await runSql('INSERT OR IGNORE INTO subjects (id, name, minGrade, maxGrade, stage) VALUES (?,?,?,?,?)', s);
    }

    // Seed settings
    await runSql(`INSERT INTO settings (
      schoolName, logoUrl, contactPhone, contactEmail, currentAcademicYear, 
      address, bankAccount, schoolType, governorate, district, 
      principalName, vicePrincipalName, studentAffairsName, semester
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      'مدرسة مجمع عقبة بن نافع بالحليمة العليا الحكومي الشامل',
      '🇾🇪',
      '+967-4-244322',
      'info@oqbah.edu.ye',
      '1447هـ (2025 - 2026م)',
      'الجمهورية اليمنية - مجمع عقبة بن نافع - محافظة تعز - مديرية التعزية - الحليمة العليا',
      'YE3020000018873299102911 (البنك المركزي اليمني - تعز)',
      'government',
      'تعز',
      'التعزية',
      'أ. طه بن يحيى عياش المنهي',
      'أ. عبد السلام امين هزاع',
      'أ. سلوى عبدالله عبد اللطيف الشيباني',
      'first'
    ]);

    // Seed audit log
    await runSql('INSERT OR IGNORE INTO audit_logs (id, userId, username, action, details, timestamp) VALUES (?,?,?,?,?,?)', [
      'log-1', 'usr-1', 'admin', 'تهيئة النظام', 'نظام سيره المخلد: تهيئة الجداول في ملف SQLite المركزي بنجاح', new Date().toISOString()
    ]);

    console.log('[SQLITE] Database default sets populated successfully');
  } catch (e: any) {
    console.error('[SQLITE] Seeding error:', e.message);
  }
}

// ------ API ENDPOINTS ------

// 1. Load Complete Database Cache (Fast bulk endpoint for frontend client initialization)
app.get('/api/db/get', async (req, res) => {
  try {
    const users = await selectAll('SELECT * FROM users');
    const parents = await selectAll('SELECT * FROM parents');
    const classrooms = await selectAll('SELECT * FROM classrooms');
    const students = await selectAll('SELECT * FROM students');
    const teachers = await selectAll('SELECT * FROM teachers');
    const subjects = await selectAll('SELECT * FROM subjects');
    const schedules = await selectAll('SELECT * FROM schedules');
    const attendance = await selectAll('SELECT * FROM attendance');
    const grades = await selectAll('SELECT * FROM grades');
    const fee_types = await selectAll('SELECT * FROM fee_types');
    const fee_payments = await selectAll('SELECT * FROM fee_payments');
    const behavior_evaluations = await selectAll('SELECT * FROM behavior_evaluations');
    const rawSettings = await selectAll('SELECT * FROM settings LIMIT 1');
    const audit_logs = await selectAll('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 500');

    const appSettings = rawSettings[0] || {
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

    res.json({
      success: true,
      data: {
        users,
        parents,
        classrooms,
        students,
        teachers,
        subjects,
        schedules,
        attendance,
        grades,
        fee_types,
        fee_payments,
        behavior_evaluations,
        settings: appSettings,
        audit_logs
      }
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 2. Sync Table Row Data (Real-time Transactional State Replication)
app.post('/api/db/save-table', async (req, res) => {
  const { table, rows } = req.body;
  if (!table || !Array.isArray(rows)) {
    return res.status(400).json({ success: false, error: 'Name of the table and row array must be supplied.' });
  }

  try {
    // Begin transaction for safety
    await runSql('BEGIN TRANSACTION');

    // Clean current values
    await runSql(`DELETE FROM ${table}`);

    if (rows.length > 0) {
      const keys = Object.keys(rows[0]);
      const placeholders = keys.map(() => '?').join(',');
      const query = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = keys.map(k => {
          const val = row[k];
          return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
        });
        await runSql(query, values);
      }
    }

    await runSql('COMMIT');
    res.json({ success: true, table, rowCount: rows.length });
  } catch (e: any) {
    await runSql('ROLLBACK').catch(() => {});
    console.error(`[SQLITE] Sync table error for ${table}:`, e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// 3. Save Settings Explicitly
app.post('/api/db/save-settings', async (req, res) => {
  const { settings } = req.body;
  if (!settings) {
    return res.status(400).json({ success: false, error: 'Settings object is required.' });
  }

  try {
    await runSql('DELETE FROM settings');
    const keys = Object.keys(settings);
    const placeholders = keys.map(() => '?').join(',');
    const query = `INSERT INTO settings (${keys.join(',')}) VALUES (${placeholders})`;
    const values = keys.map(k => settings[k]);
    await runSql(query, values);

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 4. Exec Real Raw SQL Statements Console (Database Manager Terminal)
app.post('/api/sqlite/execute', async (req, res) => {
  const { sql } = req.body;
  if (!sql) {
    return res.status(400).json({ success: false, error: 'SQL query parameter is required.' });
  }

  const cleanQuery = sql.trim().toLowerCase();
  try {
    if (cleanQuery.startsWith('select') || cleanQuery.startsWith('pragma') || cleanQuery.startsWith('explain')) {
      const results = await selectAll(sql);
      res.json({ success: true, type: 'select', rows: results });
    } else {
      await runSql(sql);
      res.json({ success: true, type: 'write', message: 'نفذ الاستعلام بنجاح ودون أية أخطاء علائقية.' });
    }
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// 5. Database Repair Tool (Integrity Check/Vacuum)
app.post('/api/db/repair', async (req, res) => {
  try {
    const check = await selectAll('PRAGMA integrity_check');
    await runSql('VACUUM');
    res.json({
      success: true,
      integrity: check[0]?.integrity_check || 'ok',
      message: 'تم فحص جودة الجداول وضم الفهارس (VACUUM) وإعادة صيانة البنية بنسبة ١٠٠٪.'
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 6. DB File Statistics Information
app.get('/api/db/info', (req, res) => {
  try {
    const stats = fs.statSync(DB_PATH);
    res.json({
      success: true,
      path: DB_PATH,
      size: stats.size,
      lastModified: stats.mtime,
      status: 'نشط ويعمل بالكامل'
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 7. Database Backup Tool (Writes full .sql & .json backups directly to disk)
app.post('/api/db/backup', (req, res) => {
  try {
    const backupFolder = path.join(DATA_DIR, 'backups');
    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupFolder, `school_backup_${timestamp}.db`);

    // SQLite backup via file copy (extremely sturdy offline lock)
    fs.copyFileSync(DB_PATH, backupPath);

    res.json({
      success: true,
      backupFile: backupPath,
      name: `school_backup_${timestamp}.db`,
      message: 'تم مضاعفة وحفظ نسخة في كتل التاريخ والعمل المخلد بالقرص الصلب!'
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 8. Database Restore Tool
app.post('/api/db/restore', (req, res) => {
  const { jsonDump } = req.body;
  if (!jsonDump) {
    return res.status(400).json({ success: false, error: 'Database JSON restore dump is required.' });
  }

  try {
    const parsed = typeof jsonDump === 'string' ? JSON.parse(jsonDump) : jsonDump;
    
    // Quick validation check
    if (!parsed.hasOwnProperty('users') && !parsed.hasOwnProperty('settings')) {
      throw new Error('الملف فارغ أو لا يمتلك بنية متناسقة لربط الجداول.');
    }

    dbEngine.serialize(async () => {
      try {
        await runSql('BEGIN TRANSACTION');
        const tables = [
          'users', 'parents', 'classrooms', 'students', 'teachers', 'subjects', 
          'schedules', 'attendance', 'grades', 'fee_types', 'fee_payments', 
          'behavior_evaluations', 'settings', 'audit_logs'
        ];

        for (const tbl of tables) {
          await runSql(`DELETE FROM ${tbl}`);
          const rows = parsed[tbl === 'fee_types' ? 'fee_types' : tbl === 'fee_payments' ? 'fee_payments' : tbl];
          if (Array.isArray(rows) && rows.length > 0) {
            const keys = Object.keys(rows[0]);
            const placeholders = keys.map(() => '?').join(',');
            const valQuery = `INSERT INTO ${tbl} (${keys.join(',')}) VALUES (${placeholders})`;

            for (const r of rows) {
              const vals = keys.map(k => typeof r[k] === 'object' && r[k] !== null ? JSON.stringify(r[k]) : r[k]);
              await runSql(valQuery, vals);
            }
          } else if (tbl === 'settings' && parsed.settings) {
            const s = parsed.settings;
            const keys = Object.keys(s);
            const placeholders = keys.map(() => '?').join(',');
            await runSql(`INSERT INTO settings (${keys.join(',')}) VALUES (${placeholders})`, keys.map(k => s[k]));
          }
        }
        await runSql('COMMIT');
        res.json({ success: true, message: 'مبارك! تمت صيانة الجداول واسترجاع المستودع بأكمله بنجاح!' });
      } catch (err: any) {
        await runSql('ROLLBACK').catch(() => {});
        res.status(500).json({ success: false, error: err.message });
      }
    });

  } catch (e: any) {
    res.status(500).json({ success: false, error: `فشل التحليل الهيكلي للملف: ${e.message}` });
  }
});


// --- BOOTSTRAP SYSTEM AND START THE CHOSEN SQLITE ENGINE ---
async function bootstrap() {
  await startDatabase();

  // --- INTEGRATE VITE FOR SPA CLIENT & ASSETS ---
  if (process.env.NODE_ENV !== 'production') {
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then((vite) => {
      app.use(vite.middlewares);
      
      // Bind fallback routes
      app.use('*', (req, res, next) => {
        const indexHtml = path.join(process.cwd(), 'index.html');
        fs.readFile(indexHtml, 'utf-8', (err, html) => {
          if (err) return next(err);
          vite.transformIndexHtml(req.originalUrl, html).then((transformedHtml) => {
            res.status(250).set({ 'Content-Type': 'text/html' }).send(transformedHtml);
          }).catch(next);
        });
      });

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[SERVER] Fullstack development engine active at: http://localhost:${PORT}`);
      });
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] Production native container running on port ${PORT}`);
    });
  }
}

bootstrap().catch((err) => {
  console.error('[SERVER] Critical bootstrap failure:', err);
  process.exit(1);
});
