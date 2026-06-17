/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
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
console.log(`[SQLITE] System initialized. Physical database file at: ${DB_PATH}`);

let db: any;

function startDatabase() {
  try {
    db = new Database(DB_PATH, { verbose: console.log });
    db.pragma('journal_mode = WAL');
    console.log('[DATABASE] Connected successfully using better-sqlite3 native driver.');
    initializeTables();
  } catch (err: any) {
    console.error('[DATABASE] Fatal error connecting to physical SQLite file:', err.message);
    process.exit(1);
  }
}

function runSql(sql: string, params: any[] = []): any {
  return db.prepare(sql).run(...params);
}

function selectAll(sql: string, params: any[] = []): any[] {
  return db.prepare(sql).all(...params);
}

function selectOne(sql: string, params: any[] = []): any {
  return db.prepare(sql).get(...params);
}

function initializeTables() {
  try {
    // Audit logs first for internal tracking
    db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      username TEXT,
      action TEXT,
      details TEXT,
      timestamp TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      fullName TEXT,
      role TEXT,
      email TEXT,
      phone TEXT,
      status TEXT,
      createdAt TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS parents (
      id TEXT PRIMARY KEY,
      name TEXT,
      nationalId TEXT,
      phone TEXT,
      email TEXT,
      work TEXT,
      address TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS classrooms (
      id TEXT PRIMARY KEY,
      name TEXT,
      stage TEXT,
      maxCapacity INTEGER,
      roomNumber TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS students (
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

    db.exec(`CREATE TABLE IF NOT EXISTS teachers (
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

    db.exec(`CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT,
      minGrade REAL,
      maxGrade REAL,
      stage TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      classroomId TEXT,
      teacherId TEXT,
      subjectId TEXT,
      dayOfWeek INTEGER,
      periodNumber INTEGER
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      date TEXT,
      status TEXT,
      notes TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS grades (
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

    db.exec(`CREATE TABLE IF NOT EXISTS fee_types (
      id TEXT PRIMARY KEY,
      name TEXT,
      amount REAL,
      description TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS fee_payments (
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

    db.exec(`CREATE TABLE IF NOT EXISTS behavior_evaluations (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      date TEXT,
      notes TEXT,
      stars INTEGER,
      deductedPoints INTEGER
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS settings (
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
      semester TEXT,
      isConfigured INTEGER,
      version TEXT
    )`);

    console.log('[SQLITE] Structural integrity verified. Tables exist and are ready.');

    // Seed if empty
    const usersCount: any = db.prepare('SELECT count(*) as count FROM users').get();
    if (usersCount.count === 0) {
      console.log('[SQLITE] Database is fresh. Applying default seeds...');
      seedDefaults();
    }
  } catch (e: any) {
    console.error('[SQLITE] Table initialization failed:', e.message);
  }
}

function seedDefaults() {
  const transaction = db.transaction(() => {
    // Seed users
    const defaultUsers = [
      ['usr-1', 'admin', 'أ. عادل عبد الله الصنعاني', 'admin', 'adel.admin@school.edu.ye', '771122334', 'active', new Date().toISOString()],
      ['usr-2', 'director', 'أ. محمد عبد الله الجائفي', 'director', 'director.g@school.edu.ye', '772233445', 'active', new Date().toISOString()],
      ['usr-7', 'parent', 'الشيخ عبد الله بن حسين السريحي', 'parent', 'parent.yem@gmail.com', '777112233', 'active', new Date().toISOString()]
    ];
    const insertUser = db.prepare('INSERT INTO users (id, username, fullName, role, email, phone, status, createdAt) VALUES (?,?,?,?,?,?,?,?)');
    for (const u of defaultUsers) insertUser.run(...u);

    // Seed parents
    const defaultParents = [
      ['prt-1', 'الشيخ عبد الله بن حسين السريحي', '1002345889', '777112233', 'parent.yem@gmail.com', 'تاجر ومستورد', 'شارع الخمسين - صنعاء'],
      ['prt-2', 'أ. علوان يحيى عياش', '1098234511', '773456789', 'alwan.a@yemen.ye', 'أستاذ مشارك - جامعة صنعاء', 'حي السنينة - صنعاء']
    ];
    const insertParent = db.prepare('INSERT INTO parents (id, name, nationalId, phone, email, work, address) VALUES (?,?,?,?,?,?,?)');
    for (const p of defaultParents) insertParent.run(...p);

    // Seed classrooms
    const defaultClassrooms = [
      ['class-1', 'الصف الأول الأساسي', 'primary', 55, 'وزاري-11'],
      ['class-7', 'الصف السابع الأساسي', 'middle', 45, 'وزاري-27']
    ];
    const insertClass = db.prepare('INSERT INTO classrooms (id, name, stage, maxCapacity, roomNumber) VALUES (?,?,?,?,?)');
    for (const c of defaultClassrooms) insertClass.run(...c);

    // Seed settings
    db.prepare(`INSERT INTO settings (
      schoolName, logoUrl, contactPhone, contactEmail, currentAcademicYear, 
      address, bankAccount, schoolType, governorate, district, 
      principalName, vicePrincipalName, studentAffairsName, semester,
      isConfigured, version
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run([
      'مؤسسة المنارة التعليمية - مجمع المنارة الشامل',
      '🇾🇪',
      '+967-4-244322',
      'info@al-manara.edu.ye',
      '1447هـ (2025 - 2026م)',
      'الجمهورية اليمنية - مجمع المنارة - محافظة تعز - مديرية التعزية - الحليمة العليا',
      'YE3020000018873299102911 (البنك المركزي اليمني - تعز)',
      'government',
      'تعز',
      'التعزية',
      'أ. طه بن يحيى عياش المنهي',
      'أ. عبد السلام امين هزاع',
      'أ. سلوى عبدالله عبد اللطيف الشيباني',
      'first',
      0, // isConfigured
      '2.5.0-YEM'
    ]);
  });
  transaction();
  console.log('[SQLITE] Default records created.');
}

// ------ API ENDPOINTS ------

app.get('/api/db/get', (req, res) => {
  try {
    const data = {
      users: selectAll('SELECT * FROM users'),
      parents: selectAll('SELECT * FROM parents'),
      classrooms: selectAll('SELECT * FROM classrooms'),
      students: selectAll('SELECT * FROM students'),
      teachers: selectAll('SELECT * FROM teachers'),
      subjects: selectAll('SELECT * FROM subjects'),
      schedules: selectAll('SELECT * FROM schedules'),
      attendance: selectAll('SELECT * FROM attendance'),
      grades: selectAll('SELECT * FROM grades'),
      fee_types: selectAll('SELECT * FROM fee_types'),
      fee_payments: selectAll('SELECT * FROM fee_payments'),
      behavior_evaluations: selectAll('SELECT * FROM behavior_evaluations'),
      settings: selectOne('SELECT * FROM settings LIMIT 1'),
      audit_logs: selectAll('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 500')
    };
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/db/save-table', (req, res) => {
  const { table, rows } = req.body;
  if (!table || !Array.isArray(rows)) return res.status(400).json({ success: false });

  try {
    const transaction = db.transaction(() => {
      db.prepare(`DELETE FROM ${table}`).run();
      if (rows.length > 0) {
        const keys = Object.keys(rows[0]);
        const placeholders = keys.map(() => '?').join(',');
        const q = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
        const stmt = db.prepare(q);
        for (const row of rows) {
          const values = keys.map(k => typeof row[k] === 'object' && row[k] !== null ? JSON.stringify(row[k]) : row[k]);
          stmt.run(...values);
        }
      }
    });
    transaction();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/db/save-settings', (req, res) => {
  const { settings } = req.body;
  try {
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM settings').run();
      const keys = Object.keys(settings);
      const placeholders = keys.map(() => '?').join(',');
      const q = `INSERT INTO settings (${keys.join(',')}) VALUES (${placeholders})`;
      db.prepare(q).run(...keys.map(k => settings[k]));
    });
    transaction();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false });
  }
});

// SYSTEM BOOTSTRAP
async function bootstrap() {
  startDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
    app.use('*', (req, res, next) => {
      const indexHtml = path.join(process.cwd(), 'index.html');
      fs.readFile(indexHtml, 'utf-8', (err, html) => {
        if (err) return next(err);
        vite.transformIndexHtml(req.originalUrl, html).then(transformed => res.status(250).set({ 'Content-Type': 'text/html' }).send(transformed)).catch(next);
      });
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`[SERVER] Fullstack active at: http://localhost:${PORT}`));
}

bootstrap();

