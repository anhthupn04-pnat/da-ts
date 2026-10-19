import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from './supabase';
import { STUDY_PROGRAMS } from '@/data/programsData';
import { INITIAL_LEADS } from '@/data/mockData';
import { Lead } from '@/types';

export interface DbUser {
  id: string;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF_ADMISSIONS' | 'STAFF_MARKETING' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  phone?: string | null;
  department?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type SafeDbUser = Omit<DbUser, 'password_hash'>;

let sqliteDbInstance: DatabaseSync | null = null;

/**
 * Khởi tạo và kết nối Cơ sở dữ liệu SQLite bền vững trên đĩa (Disk Database)
 */
export function getSqliteDb(): DatabaseSync {
  if (sqliteDbInstance) return sqliteDbInstance;

  let dbPath: string;
  if (process.env.VERCEL) {
    const tmpDir = path.join('/tmp', 'database');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    dbPath = path.join(tmpDir, 'vnus_admissions.db');
    const bundledDbPath = path.join(process.cwd(), 'database', 'vnus_admissions.db');
    if (!fs.existsSync(dbPath) && fs.existsSync(bundledDbPath)) {
      try {
        fs.copyFileSync(bundledDbPath, dbPath);
      } catch {
        // ignore copy error
      }
    }
  } else {
    const dbDir = path.join(process.cwd(), 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, 'vnus_admissions.db');
  }

  const db = new DatabaseSync(dbPath);

  // Kích hoạt journal mode và Foreign Keys để đảm bảo tính toàn vẹn và hiệu năng
  try {
    db.exec('PRAGMA journal_mode = WAL;');
  } catch {
    db.exec('PRAGMA journal_mode = DELETE;');
  }
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. Khởi tạo bảng users với 4 vai trò cụ thể: ADMIN, MANAGER, STAFF_ADMISSIONS, STAFF_MARKETING
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STAFF_ADMISSIONS' CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF_ADMISSIONS', 'STAFF_MARKETING', 'STAFF')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DELETED')),
      phone TEXT,
      department TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
  `);

  // Di chuyển tự động cấu trúc bảng nếu database cũ chưa hỗ trợ đủ 4 vai trò (Migration)
  try {
    const usersTableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get() as { sql: string } | undefined;
    if (usersTableInfo && !usersTableInfo.sql.includes('STAFF_ADMISSIONS')) {
      db.exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE users_migrated (
          id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'STAFF_ADMISSIONS' CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF_ADMISSIONS', 'STAFF_MARKETING', 'STAFF')),
          status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DELETED')),
          phone TEXT,
          department TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
        );
        INSERT OR IGNORE INTO users_migrated (id, full_name, username, email, password_hash, role, status, phone, department, created_at, updated_at, deleted_at)
          SELECT id, full_name, username, email, password_hash,
            CASE WHEN role = 'STAFF' THEN 'STAFF_ADMISSIONS' ELSE role END,
            status, phone, department, created_at, updated_at, deleted_at FROM users;
        DROP TABLE users;
        ALTER TABLE users_migrated RENAME TO users;
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
        PRAGMA foreign_keys = ON;
      `);
    }
  } catch (err: any) {
    console.error('Lỗi di chuyển schema users:', err.message);
  }

  // Seed các tài khoản đại diện cho cả 4 vai trò nếu chưa tồn tại
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, full_name, username, email, password_hash, role, status, phone, department, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const anhThuHash = bcrypt.hashSync('0102024', 10);
  const adminHash = bcrypt.hashSync('Admin@VNUS2026!', 10);
  const managerHash = bcrypt.hashSync('Manager@VNUS2026!', 10);
  const admissionsHash = bcrypt.hashSync('Staff@VNUS2026!', 10);
  const marketingHash = bcrypt.hashSync('Marketing@VNUS2026!', 10);
  const now = new Date().toISOString();

  // 0. ADMIN - Anh Thư (Quản trị viên)
  insertStmt.run(
    '00000000-0000-0000-0000-000000000000',
    'Anh Thư',
    'anhthuphan0102',
    'anhthuphan0102@gmail.com',
    anhThuHash,
    'ADMIN',
    'ACTIVE',
    '0905010224',
    'Ban Quản Trị Hệ Thống VN-US',
    now,
    now
  );

  // 1. ADMIN - Quản trị viên hệ thống
  insertStmt.run(
    '00000000-0000-0000-0000-000000000001',
    'Quản Trị Viên Hệ Thống',
    'admin',
    'admin@vnus.edu.vn',
    adminHash,
    'ADMIN',
    'ACTIVE',
    '0905123456',
    'Ban Quản Trị Hệ Thống & Tuyển Sinh',
    now,
    now
  );

  // 2. MANAGER - Quản lý / Trưởng phòng Tuyển sinh
  insertStmt.run(
    '00000000-0000-0000-0000-000000000003',
    'Trần Quản Lý (Trưởng Phòng Tuyển Sinh)',
    'manager',
    'manager@vnus.edu.vn',
    managerHash,
    'MANAGER',
    'ACTIVE',
    '0905666888',
    'Phòng Tuyển Sinh & Đào Tạo Quốc Tế VN-US',
    now,
    now
  );

  // 3. STAFF_ADMISSIONS - Chuyên viên Tuyển sinh
  insertStmt.run(
    '00000000-0000-0000-0000-000000000002',
    'Lê Tuyển Sinh (Chuyên Viên Tư Vấn)',
    'admissions',
    'admissions@vnus.edu.vn',
    admissionsHash,
    'STAFF_ADMISSIONS',
    'ACTIVE',
    '0905789101',
    'Tổ Tư Vấn Tuyển Sinh VN-US',
    now,
    now
  );

  // 4. STAFF_MARKETING - Chuyên viên Marketing
  insertStmt.run(
    '00000000-0000-0000-0000-000000000004',
    'Nguyễn Marketing (Chuyên Viên Leads & Ads)',
    'marketing',
    'marketing@vnus.edu.vn',
    marketingHash,
    'STAFF_MARKETING',
    'ACTIVE',
    '0905999222',
    'Bộ Phận Marketing & Truyền Thông Số VN-US',
    now,
    now
  );

  // 2. Khởi tạo bảng leads (Hồ sơ Thí sinh & Tiếp nhận tư vấn tuyển sinh)
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      id_card_number TEXT,
      email TEXT NOT NULL,
      high_school TEXT,
      province TEXT,
      graduation_year INT DEFAULT 2026,
      program_id TEXT NOT NULL,
      program_name TEXT,
      secondary_program_id TEXT,
      secondary_program_name TEXT,
      exam_block TEXT,
      estimated_score REAL,
      source TEXT NOT NULL DEFAULT 'website',
      utm_campaign TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      priority TEXT NOT NULL DEFAULT 'medium',
      assigned_to TEXT,
      assigned_to_name TEXT,
      department_id TEXT,
      payment_status TEXT DEFAULT 'unpaid',
      fee_paid_amount REAL,
      payment_transaction_id TEXT,
      payment_date TEXT,
      documents_json TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_program_id ON leads(program_id);
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
  `);

  // Seed mẫu hồ sơ thí sinh ban đầu nếu bảng chưa có dữ liệu
  const countLeads = db.prepare('SELECT COUNT(*) as cnt FROM leads').get() as { cnt: number };
  if (!countLeads || countLeads.cnt === 0) {
    const insertLeadStmt = db.prepare(`
      INSERT OR IGNORE INTO leads (
        id, full_name, phone, id_card_number, email, high_school, province, graduation_year,
        program_id, program_name, secondary_program_id, secondary_program_name, exam_block,
        estimated_score, source, utm_campaign, status, priority, assigned_to, assigned_to_name,
        department_id, payment_status, fee_paid_amount, payment_transaction_id, payment_date,
        documents_json, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN TRANSACTION;');
    try {
      for (const lead of INITIAL_LEADS) {
        insertLeadStmt.run(
          lead.id,
          lead.fullName,
          lead.phone,
          lead.idCardNumber || null,
          lead.email,
          lead.highSchool || null,
          lead.province || null,
          lead.graduationYear || 2026,
          lead.programId,
          lead.programName || null,
          lead.secondaryProgramId || null,
          lead.secondaryProgramName || null,
          lead.examBlock || null,
          lead.estimatedScore !== undefined ? lead.estimatedScore : null,
          lead.source || 'website',
          lead.utmCampaign || null,
          lead.status || 'new',
          lead.priority || 'medium',
          lead.assignedTo || null,
          lead.assignedToName || null,
          lead.departmentId || null,
          lead.paymentStatus || 'unpaid',
          lead.feePaidAmount !== undefined ? lead.feePaidAmount : null,
          lead.paymentTransactionId || null,
          lead.paymentDate || null,
          lead.documents ? JSON.stringify(lead.documents) : null,
          lead.notes || null,
          lead.createdAt,
          lead.updatedAt
        );
      }
      db.exec('COMMIT;');
    } catch {
      db.exec('ROLLBACK;');
    }
  }

  sqliteDbInstance = db;
  return sqliteDbInstance;
}

// ==============================================================================
// PHÂN HỆ QUẢN LÝ TÀI KHOẢN (USERS)
// ==============================================================================

/**
 * 1. Truy vấn danh sách người dùng kèm phân trang, tìm kiếm và lọc từ Database
 */
export async function queryUsersFromDb(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}): Promise<{
  users: SafeDbUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
  const offset = (page - 1) * limit;
  const search = (params.search || '').trim().toLowerCase();
  const role = (params.role || 'ALL').toUpperCase();
  const status = (params.status || 'ALL').toUpperCase();

  // A. Nếu kết nối Supabase Cloud Database đang hoạt động
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('users')
        .select('id, full_name, username, email, role, status, phone, department, created_at, updated_at', { count: 'exact' })
        .neq('status', 'DELETED')
        .is('deleted_at', null);

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
      }
      if (role !== 'ALL') {
        query = query.eq('role', role);
      }
      if (status !== 'ALL') {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (!error && data) {
        const total = count || 0;
        return {
          users: data as SafeDbUser[],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1
          }
        };
      }
    } catch {
      // Fallback về local database
    }
  }

  // B. Thực thi truy vấn SQL trực tiếp trên Persistent SQLite Database
  const db = getSqliteDb();

  const conditions: string[] = ["status != 'DELETED'", "deleted_at IS NULL"];
  const args: any[] = [];

  if (search) {
    conditions.push('(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(username) LIKE ? OR phone LIKE ?)');
    const term = `%${search}%`;
    args.push(term, term, term, term);
  }

  if (role !== 'ALL') {
    conditions.push('role = ?');
    args.push(role);
  }

  if (status !== 'ALL') {
    conditions.push('status = ?');
    args.push(status);
  }

  const whereClause = conditions.join(' AND ');

  // Đếm tổng số bản ghi
  const countSql = `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`;
  const countRow = db.prepare(countSql).get(...args) as { total: number };
  const total = countRow ? countRow.total : 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // Lấy dữ liệu phân trang
  const selectSql = `
    SELECT id, full_name, username, email, role, status, phone, department, created_at, updated_at
    FROM users
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = db.prepare(selectSql).all(...args, limit, offset) as SafeDbUser[];

  return {
    users: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

/**
 * 2. Lấy thông tin người dùng theo ID
 */
export async function getUserByIdFromDb(id: string): Promise<DbUser | null> {
  const db = getSqliteDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ? AND status != ?').get(id, 'DELETED') as DbUser | undefined;
  return row || null;
}

/**
 * 3. Lấy thông tin người dùng theo Email hoặc Username
 */
export async function getUserByEmailOrUsernameFromDb(identifier: string): Promise<DbUser | null> {
  const clean = identifier.trim().toLowerCase();
  const db = getSqliteDb();
  const row = db.prepare(`
    SELECT * FROM users 
    WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND status != 'DELETED'
  `).get(clean, clean) as DbUser | undefined;

  return row || null;
}

/**
 * 4. Tạo tài khoản người dùng mới (có Database Transaction, mã hóa Bcrypt và kiểm tra trùng lặp)
 */
export async function createUserInDb(data: {
  full_name: string;
  email: string;
  username?: string;
  password: string;
  role?: 'ADMIN' | 'MANAGER' | 'STAFF_ADMISSIONS' | 'STAFF_MARKETING' | 'STAFF';
  phone?: string;
  department?: string;
}): Promise<SafeDbUser> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanUsername = (data.username ? data.username.trim().toLowerCase() : cleanEmail.split('@')[0]);

  const db = getSqliteDb();

  // Kiểm tra trùng lặp Email hoặc Username trong Database
  const existing = db.prepare(`
    SELECT id, email, username FROM users 
    WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND status != 'DELETED'
  `).get(cleanEmail, cleanUsername) as { id: string; email: string; username: string } | undefined;

  if (existing) {
    if (existing.email.toLowerCase() === cleanEmail) {
      throw new Error(`Email "${cleanEmail}" đã tồn tại trong cơ sở dữ liệu.`);
    }
    throw new Error(`Tên đăng nhập "${cleanUsername}" đã được sử dụng.`);
  }

  // Mã hóa mật khẩu bảo mật bằng bcrypt
  const passwordHash = bcrypt.hashSync(data.password.trim(), 10);
  const now = new Date().toISOString();
  const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Chuẩn hóa 4 vai trò cụ thể
  let role: 'ADMIN' | 'MANAGER' | 'STAFF_ADMISSIONS' | 'STAFF_MARKETING' = 'STAFF_ADMISSIONS';
  if (data.role === 'ADMIN') role = 'ADMIN';
  else if (data.role === 'MANAGER') role = 'MANAGER';
  else if (data.role === 'STAFF_MARKETING') role = 'STAFF_MARKETING';
  else if (data.role === 'STAFF_ADMISSIONS' || data.role === 'STAFF') role = 'STAFF_ADMISSIONS';

  // Thực thi Database Transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    const insertStmt = db.prepare(`
      INSERT INTO users (id, full_name, username, email, password_hash, role, status, phone, department, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)
    `);

    insertStmt.run(
      newId,
      data.full_name.trim(),
      cleanUsername,
      cleanEmail,
      passwordHash,
      role,
      data.phone?.trim() || null,
      data.department?.trim() || (role === 'STAFF_MARKETING' ? 'Phòng Marketing Tuyển Sinh' : role === 'MANAGER' ? 'Phòng Quản Lý Tuyển Sinh' : 'Tổ Tư Vấn Tuyển Sinh VN-US'),
      now,
      now
    );

    db.exec('COMMIT;');
  } catch (err: any) {
    db.exec('ROLLBACK;');
    throw new Error(`Lỗi Database Transaction khi tạo người dùng: ${err.message}`);
  }

  // Đồng bộ lên Supabase nếu có cấu hình
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('users').insert({
        id: newId,
        full_name: data.full_name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password_hash: passwordHash,
        role,
        status: 'ACTIVE',
        phone: data.phone?.trim() || null,
        department: data.department?.trim() || (role === 'STAFF_MARKETING' ? 'Phòng Marketing Tuyển Sinh' : role === 'MANAGER' ? 'Phòng Quản Lý Tuyển Sinh' : 'Tổ Tư Vấn Tuyển Sinh VN-US'),
        created_at: now,
        updated_at: now
      });
    } catch {
      // ignore
    }
  }

  return {
    id: newId,
    full_name: data.full_name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    role,
    status: 'ACTIVE',
    phone: data.phone?.trim() || null,
    department: data.department?.trim() || (role === 'STAFF_MARKETING' ? 'Phòng Marketing Tuyển Sinh' : role === 'MANAGER' ? 'Phòng Quản Lý Tuyển Sinh' : 'Tổ Tư Vấn Tuyển Sinh VN-US'),
    created_at: now,
    updated_at: now
  };
}

/**
 * 5. Cập nhật thông tin người dùng trong DB (Họ tên, Vai trò, SĐT, Phòng ban)
 */
export async function updateUserInDb(
  id: string,
  data: {
    full_name?: string;
    role?: 'ADMIN' | 'MANAGER' | 'STAFF_ADMISSIONS' | 'STAFF_MARKETING' | 'STAFF';
    phone?: string;
    department?: string;
  }
): Promise<SafeDbUser> {
  const db = getSqliteDb();
  const existing = await getUserByIdFromDb(id);
  if (!existing) {
    throw new Error('Tài khoản người dùng không tồn tại trong cơ sở dữ liệu.');
  }

  const now = new Date().toISOString();
  const fullName = data.full_name !== undefined ? data.full_name.trim() : existing.full_name;

  let role = existing.role;
  if (data.role !== undefined) {
    if (data.role === 'ADMIN') role = 'ADMIN';
    else if (data.role === 'MANAGER') role = 'MANAGER';
    else if (data.role === 'STAFF_MARKETING') role = 'STAFF_MARKETING';
    else if (data.role === 'STAFF_ADMISSIONS' || data.role === 'STAFF') role = 'STAFF_ADMISSIONS';
  }

  const phone = data.phone !== undefined ? data.phone.trim() : existing.phone;
  const department = data.department !== undefined ? data.department.trim() : existing.department;

  db.exec('BEGIN TRANSACTION;');
  try {
    const updateStmt = db.prepare(`
      UPDATE users 
      SET full_name = ?, role = ?, phone = ?, department = ?, updated_at = ?
      WHERE id = ?
    `);
    updateStmt.run(fullName, role, phone || null, department || null, now, id);
    db.exec('COMMIT;');
  } catch (err: any) {
    db.exec('ROLLBACK;');
    throw new Error(`Lỗi Database khi cập nhật người dùng: ${err.message}`);
  }

  // Đồng bộ lên Supabase nếu có
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('users').update({
        full_name: fullName,
        role,
        phone,
        department,
        updated_at: now
      }).eq('id', id);
    } catch {
      // ignore
    }
  }

  return {
    id: existing.id,
    full_name: fullName,
    username: existing.username,
    email: existing.email,
    role,
    status: existing.status,
    phone: phone || null,
    department: department || null,
    created_at: existing.created_at,
    updated_at: now
  };
}

/**
 * 6. Đổi trạng thái Kích hoạt / Tạm khóa tài khoản
 */
export async function toggleUserStatusInDb(id: string, newStatus?: 'ACTIVE' | 'INACTIVE'): Promise<{ status: 'ACTIVE' | 'INACTIVE'; message: string }> {
  const db = getSqliteDb();
  const existing = await getUserByIdFromDb(id);
  if (!existing) {
    throw new Error('Không tìm thấy tài khoản cần đổi trạng thái.');
  }

  const targetStatus = newStatus || (existing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
  const now = new Date().toISOString();

  db.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?').run(targetStatus, now, id);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('users').update({ status: targetStatus, updated_at: now }).eq('id', id);
    } catch {
      // ignore
    }
  }

  return {
    status: targetStatus,
    message: targetStatus === 'ACTIVE' ? 'Đã kích hoạt lại tài khoản thành công.' : 'Đã tạm khóa tài khoản người dùng.'
  };
}

/**
 * 7. Đặt lại mật khẩu mới (Mã hóa Bcrypt và cập nhật trực tiếp DB)
 */
export async function resetUserPasswordInDb(id: string, newPassword?: string): Promise<{ newPassword: string; message: string }> {
  const db = getSqliteDb();
  const existing = await getUserByIdFromDb(id);
  if (!existing) {
    throw new Error('Không tìm thấy tài khoản để đặt lại mật khẩu.');
  }

  const pass = newPassword?.trim() || `VNUS@${Math.floor(100000 + Math.random() * 900000)}!`;
  const passwordHash = bcrypt.hashSync(pass, 10);
  const now = new Date().toISOString();

  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, now, id);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('users').update({ password_hash: passwordHash, updated_at: now }).eq('id', id);
    } catch {
      // ignore
    }
  }

  return {
    newPassword: pass,
    message: `Đã cập nhật mật khẩu mới thành công vào cơ sở dữ liệu.`
  };
}

/**
 * 8. Xóa tài khoản khỏi Database (Hỗ trợ Hard Delete hoặc Soft Delete để đảm bảo toàn vẹn dữ liệu)
 */
export async function deleteUserFromDb(id: string, options?: { hardDelete?: boolean }): Promise<{ success: boolean; message: string }> {
  const db = getSqliteDb();
  const existing = await getUserByIdFromDb(id);
  if (!existing) {
    throw new Error('Tài khoản cần xóa không tồn tại trong cơ sở dữ liệu.');
  }

  db.exec('BEGIN TRANSACTION;');
  try {
    if (options?.hardDelete) {
      // Xóa dứt điểm bản ghi khỏi DB
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
    } else {
      // Soft Delete: Gán nhãn DELETED và timestamp deleted_at để đảm bảo toàn vẹn liên kết hồ sơ/audit
      const now = new Date().toISOString();
      db.prepare('UPDATE users SET status = ?, deleted_at = ?, updated_at = ? WHERE id = ?').run('DELETED', now, now, id);
    }
    db.exec('COMMIT;');
  } catch (err: any) {
    db.exec('ROLLBACK;');
    throw new Error(`Lỗi khi xóa người dùng khỏi Database: ${err.message}`);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      if (options?.hardDelete) {
        await supabase.from('users').delete().eq('id', id);
      } else {
        await supabase.from('users').update({ status: 'DELETED', deleted_at: new Date().toISOString() }).eq('id', id);
      }
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    message: 'Đã xóa tài khoản người dùng thành công khỏi hệ thống.'
  };
}

/**
 * 9. Xác thực đăng nhập qua Database với Bcrypt
 */
export async function verifyUserCredentials(identifier: string, plainPassword: string): Promise<{ success: boolean; user?: SafeDbUser; message?: string }> {
  const user = await getUserByEmailOrUsernameFromDb(identifier);
  if (!user) {
    return {
      success: false,
      message: 'Tài khoản không tồn tại trong cơ sở dữ liệu. Vui lòng liên hệ Quản trị viên.'
    };
  }

  if (user.status === 'INACTIVE') {
    return {
      success: false,
      message: 'Tài khoản này hiện đang bị khóa. Vui lòng liên hệ Quản trị viên để được mở lại.'
    };
  }

  // So sánh mật khẩu với mã băm bcrypt
  const isMatch = bcrypt.compareSync(plainPassword.trim(), user.password_hash);
  if (!isMatch) {
    return {
      success: false,
      message: 'Mật khẩu đăng nhập không chính xác! Vui lòng thử lại.'
    };
  }

  const { password_hash, ...safeUser } = user;
  return {
    success: true,
    user: safeUser
  };
}

// ==============================================================================
// PHÂN HỆ HỒ SƠ THÍ SINH & ĐĂNG KÝ TUYỂN SINH (LEADS)
// ==============================================================================

/**
 * Chuyển đổi bản ghi SQL dạng snake_case thành đối tượng Lead TypeScript
 */
function dbRowToLead(row: any): Lead {
  let docs = undefined;
  if (row.documents_json) {
    try {
      docs = JSON.parse(row.documents_json);
    } catch {
      docs = undefined;
    }
  }

  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    idCardNumber: row.id_card_number || undefined,
    email: row.email,
    highSchool: row.high_school || undefined,
    province: row.province || undefined,
    graduationYear: row.graduation_year || 2026,
    programId: row.program_id,
    programName: row.program_name || undefined,
    secondaryProgramId: row.secondary_program_id || undefined,
    secondaryProgramName: row.secondary_program_name || undefined,
    examBlock: row.exam_block || undefined,
    estimatedScore: row.estimated_score !== null ? row.estimated_score : undefined,
    source: row.source || 'website',
    utmCampaign: row.utm_campaign || undefined,
    status: row.status || 'new',
    priority: row.priority || 'medium',
    assignedTo: row.assigned_to || undefined,
    assignedToName: row.assigned_to_name || undefined,
    departmentId: row.department_id || undefined,
    paymentStatus: row.payment_status || 'unpaid',
    feePaidAmount: row.fee_paid_amount !== null ? row.fee_paid_amount : undefined,
    paymentTransactionId: row.payment_transaction_id || undefined,
    paymentDate: row.payment_date || undefined,
    documents: docs,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * 10. Truy vấn danh sách Hồ sơ thí sinh từ Database
 */
export async function queryLeadsFromDb(params?: {
  role?: string;
  userId?: string;
  search?: string;
  status?: string;
  programId?: string;
}): Promise<Lead[]> {
  const db = getSqliteDb();

  const conditions: string[] = ['1=1'];
  const args: any[] = [];

  // Phân quyền: Nếu là Chuyên viên Tuyển sinh thì chỉ xem hồ sơ được phân công hoặc chưa gán
  if ((params?.role === 'STAFF_ADMISSIONS' || params?.role === 'counselor') && params?.userId) {
    conditions.push('(assigned_to = ? OR assigned_to IS NULL)');
    args.push(params.userId);
  }

  if (params?.status && params.status !== 'all') {
    conditions.push('status = ?');
    args.push(params.status);
  }

  if (params?.programId && params.programId !== 'all') {
    conditions.push('program_id = ?');
    args.push(params.programId);
  }

  if (params?.search) {
    const term = `%${params.search.trim().toLowerCase()}%`;
    conditions.push('(LOWER(full_name) LIKE ? OR phone LIKE ? OR LOWER(email) LIKE ? OR id_card_number LIKE ? OR id LIKE ?)');
    args.push(term, term, term, term, term);
  }

  const sql = `
    SELECT * FROM leads 
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
  `;

  const rows = db.prepare(sql).all(...args);
  return rows.map(dbRowToLead);
}

/**
 * 11. Lưu hồ sơ thí sinh đăng ký tư vấn / nộp trực tuyến vào Database
 */
export async function createLeadInDb(data: {
  fullName: string;
  phone: string;
  email: string;
  idCardNumber?: string;
  highSchool?: string;
  province?: string;
  graduationYear?: number;
  programId: string;
  secondaryProgramId?: string;
  examBlock?: string;
  estimatedScore?: number;
  source?: string;
  utmCampaign?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  assignedToName?: string;
  departmentId?: string;
  paymentStatus?: string;
  feePaidAmount?: number;
  paymentTransactionId?: string;
  paymentDate?: string;
  documents?: any;
  notes?: string;
  allowUpdateIfExists?: boolean;
}): Promise<Lead> {
  const db = getSqliteDb();

  const cleanPhone = (data.phone || '').replace(/[\s\-\.]/g, '');
  const cleanIdCard = (data.idCardNumber || '').replace(/[\s\-\.]/g, '');
  const cleanEmail = (data.email || '').trim().toLowerCase();

  // Kiểm tra trùng lặp SĐT hoặc CCCD
  const existingRow = db.prepare(`
    SELECT * FROM leads 
    WHERE phone = ? OR (? != '' AND id_card_number = ?)
  `).get(cleanPhone, cleanIdCard, cleanIdCard);

  if (existingRow) {
    const existing = dbRowToLead(existingRow);
    // Nếu cho phép cập nhật hoặc thí sinh gửi bổ sung hồ sơ nộp trực tuyến kèm minh chứng
    if (data.allowUpdateIfExists || data.status === 'submitted_app' || data.documents) {
      const prog1 = STUDY_PROGRAMS.find(p => p.id === data.programId);
      const prog2 = data.secondaryProgramId
        ? STUDY_PROGRAMS.find(p => p.id === data.secondaryProgramId)
        : undefined;

      return await updateLeadInDb(existing.id, {
        fullName: data.fullName || existing.fullName,
        email: cleanEmail || existing.email,
        idCardNumber: cleanIdCard || existing.idCardNumber,
        highSchool: data.highSchool || existing.highSchool,
        province: data.province || existing.province,
        graduationYear: data.graduationYear || existing.graduationYear,
        programId: data.programId || existing.programId,
        programName: prog1 ? prog1.name : existing.programName,
        secondaryProgramId: data.secondaryProgramId || existing.secondaryProgramId,
        secondaryProgramName: prog2 ? prog2.name : existing.secondaryProgramName,
        examBlock: data.examBlock || existing.examBlock,
        estimatedScore: data.estimatedScore !== undefined ? data.estimatedScore : existing.estimatedScore,
        status: (data.status as any) || existing.status,
        priority: (data.priority as any) || existing.priority,
        documents: data.documents || existing.documents,
        notes: data.notes ? `${existing.notes ? existing.notes + ' | ' : ''}${data.notes}` : existing.notes
      });
    }

    throw new Error(
      `Thí sinh với SĐT (${cleanPhone}) hoặc CCCD (${cleanIdCard}) đã tồn tại trong hệ thống (Mã: ${existing.id}, Họ tên: ${existing.fullName}, Trạng thái: ${existing.status}).`
    );
  }

  // Khớp tên ngành đào tạo chuẩn
  const prog1 = STUDY_PROGRAMS.find(p => p.id === data.programId);
  const prog2 = data.secondaryProgramId
    ? STUDY_PROGRAMS.find(p => p.id === data.secondaryProgramId)
    : undefined;

  // Tự động phân công chuyên viên mặc định nếu chưa gán
  let assignedTo = data.assignedTo;
  let assignedToName = data.assignedToName;

  if (!assignedTo) {
    const defaultStaff = db.prepare("SELECT id, full_name FROM users WHERE (role = 'STAFF_ADMISSIONS' OR role = 'STAFF') AND status = 'ACTIVE' LIMIT 1").get() as { id: string; full_name: string } | undefined;
    if (defaultStaff) {
      assignedTo = defaultStaff.id;
      assignedToName = defaultStaff.full_name;
    }
  }

  // Sinh mã thí sinh chuẩn định dạng TS-2026-XXXX
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const candidateId = `TS-2026-${randomSuffix}`;
  const now = new Date().toISOString();

  const docJson = data.documents ? JSON.stringify(data.documents) : null;

  db.exec('BEGIN TRANSACTION;');
  try {
    const insertStmt = db.prepare(`
      INSERT INTO leads (
        id, full_name, phone, id_card_number, email, high_school, province, graduation_year,
        program_id, program_name, secondary_program_id, secondary_program_name, exam_block,
        estimated_score, source, utm_campaign, status, priority, assigned_to, assigned_to_name,
        department_id, payment_status, fee_paid_amount, payment_transaction_id, payment_date,
        documents_json, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      candidateId,
      data.fullName.trim(),
      cleanPhone,
      cleanIdCard || null,
      cleanEmail,
      data.highSchool?.trim() || null,
      data.province || null,
      data.graduationYear || 2026,
      data.programId,
      prog1 ? prog1.name : data.programId,
      data.secondaryProgramId || null,
      prog2 ? prog2.name : null,
      data.examBlock || null,
      data.estimatedScore !== undefined ? data.estimatedScore : null,
      data.source || 'website',
      data.utmCampaign || null,
      data.status || 'new',
      data.priority || 'medium',
      assignedTo || null,
      assignedToName || null,
      data.departmentId || null,
      data.paymentStatus || 'unpaid',
      data.feePaidAmount !== undefined ? data.feePaidAmount : null,
      data.paymentTransactionId || null,
      data.paymentDate || null,
      docJson,
      data.notes || null,
      now,
      now
    );

    db.exec('COMMIT;');
  } catch (err: any) {
    db.exec('ROLLBACK;');
    throw new Error(`Lỗi Database khi ghi nhận hồ sơ thí sinh: ${err.message}`);
  }

  // Đồng bộ lên Supabase nếu có cấu hình
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('leads').insert({
        id: candidateId,
        full_name: data.fullName.trim(),
        phone: cleanPhone,
        id_card_number: cleanIdCard || null,
        email: cleanEmail,
        high_school: data.highSchool?.trim() || null,
        province: data.province || null,
        graduation_year: data.graduationYear || 2026,
        program_id: data.programId,
        source: data.source || 'website',
        status: data.status || 'new',
        priority: data.priority || 'medium',
        notes: data.notes || null,
        created_at: now,
        updated_at: now
      });
    } catch {
      // ignore
    }
  }

  const createdRow = db.prepare('SELECT * FROM leads WHERE id = ?').get(candidateId);
  return dbRowToLead(createdRow);
}

/**
 * 12. Cập nhật hồ sơ thí sinh trong CSDL
 */
export async function updateLeadInDb(id: string, updates: Partial<Lead>): Promise<Lead> {
  const db = getSqliteDb();
  const existingRow = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  if (!existingRow) {
    throw new Error(`Không tìm thấy hồ sơ thí sinh với mã ${id}.`);
  }

  const existing = dbRowToLead(existingRow);
  const now = new Date().toISOString();

  const fullName = updates.fullName !== undefined ? updates.fullName.trim() : existing.fullName;
  const phone = updates.phone !== undefined ? updates.phone.replace(/[\s\-\.]/g, '') : existing.phone;
  const idCardNumber = updates.idCardNumber !== undefined ? (updates.idCardNumber?.replace(/[\s\-\.]/g, '') || null) : (existing.idCardNumber || null);
  const email = updates.email !== undefined ? updates.email.trim().toLowerCase() : existing.email;
  const highSchool = updates.highSchool !== undefined ? updates.highSchool.trim() : existing.highSchool;
  const province = updates.province !== undefined ? updates.province : existing.province;
  const graduationYear = updates.graduationYear !== undefined ? updates.graduationYear : existing.graduationYear;
  const programId = updates.programId !== undefined ? updates.programId : existing.programId;
  const programName = updates.programName !== undefined ? updates.programName : existing.programName;
  const secondaryProgramId = updates.secondaryProgramId !== undefined ? updates.secondaryProgramId : existing.secondaryProgramId;
  const secondaryProgramName = updates.secondaryProgramName !== undefined ? updates.secondaryProgramName : existing.secondaryProgramName;
  const examBlock = updates.examBlock !== undefined ? updates.examBlock : existing.examBlock;
  const estimatedScore = updates.estimatedScore !== undefined ? updates.estimatedScore : existing.estimatedScore;
  const status = updates.status !== undefined ? updates.status : existing.status;
  const priority = updates.priority !== undefined ? updates.priority : existing.priority;
  const notes = updates.notes !== undefined ? updates.notes : existing.notes;
  const assignedTo = updates.assignedTo !== undefined ? updates.assignedTo : existing.assignedTo;
  const assignedToName = updates.assignedToName !== undefined ? updates.assignedToName : existing.assignedToName;
  const paymentStatus = updates.paymentStatus !== undefined ? updates.paymentStatus : existing.paymentStatus;
  const feePaidAmount = updates.feePaidAmount !== undefined ? updates.feePaidAmount : existing.feePaidAmount;
  const docsJson = updates.documents !== undefined ? JSON.stringify(updates.documents) : (existing.documents ? JSON.stringify(existing.documents) : null);

  db.prepare(`
    UPDATE leads 
    SET full_name = ?, phone = ?, id_card_number = ?, email = ?, high_school = ?, province = ?,
        graduation_year = ?, program_id = ?, program_name = ?, secondary_program_id = ?, secondary_program_name = ?,
        exam_block = ?, estimated_score = ?, status = ?, priority = ?, notes = ?,
        assigned_to = ?, assigned_to_name = ?, payment_status = ?, fee_paid_amount = ?,
        documents_json = ?, updated_at = ?
    WHERE id = ?
  `).run(
    fullName,
    phone,
    idCardNumber,
    email,
    highSchool || null,
    province || null,
    graduationYear || 2026,
    programId,
    programName,
    secondaryProgramId || null,
    secondaryProgramName || null,
    examBlock || null,
    estimatedScore !== undefined ? estimatedScore : null,
    status,
    priority,
    notes || null,
    assignedTo || null,
    assignedToName || null,
    paymentStatus || 'unpaid',
    feePaidAmount !== undefined ? feePaidAmount : null,
    docsJson,
    now,
    id
  );

  const updatedRow = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  return dbRowToLead(updatedRow);
}

/**
 * 13. Xóa hồ sơ thí sinh khỏi Database
 */
export async function deleteLeadFromDb(id: string): Promise<boolean> {
  const db = getSqliteDb();
  db.prepare('DELETE FROM leads WHERE id = ?').run(id);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('leads').delete().eq('id', id);
    } catch {
      // ignore
    }
  }
  return true;
}

/**
 * 14. Phân công hàng loạt thí sinh cho chuyên viên trong DB
 */
export async function batchAssignLeadsInDb(leadIds: string[], staffId: string, staffName: string): Promise<number> {
  const db = getSqliteDb();
  const now = new Date().toISOString();
  let count = 0;

  db.exec('BEGIN TRANSACTION;');
  try {
    const stmt = db.prepare(`
      UPDATE leads 
      SET assigned_to = ?, assigned_to_name = ?, updated_at = ?
      WHERE id = ?
    `);
    for (const id of leadIds) {
      stmt.run(staffId, staffName, now, id);
      count++;
    }
    db.exec('COMMIT;');
  } catch (err: any) {
    db.exec('ROLLBACK;');
    throw new Error(`Lỗi cập nhật phân công trong Database: ${err.message}`);
  }

  return count;
}
