import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from './supabase';

export interface DbUser {
  id: string;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'ADMIN' | 'STAFF';
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

  const dbDir = path.join(process.cwd(), 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'vnus_admissions.db');
  const db = new DatabaseSync(dbPath);

  // Kích hoạt WAL mode và Foreign Keys để đảm bảo tính toàn vẹn và hiệu năng
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Khởi tạo bảng users với các chỉ mục duy nhất (UNIQUE) và ràng buộc toàn vẹn
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF')),
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

  // Seed tài khoản Quản trị viên và Chuyên viên mặc định nếu bảng chưa có dữ liệu
  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM users WHERE status != ?').get('DELETED') as { cnt: number };
  if (!countRow || countRow.cnt === 0) {
    const adminHash = bcrypt.hashSync('Admin@VNUS2026!', 10);
    const staffHash = bcrypt.hashSync('Staff@VNUS2026!', 10);
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO users (id, full_name, username, email, password_hash, role, status, phone, department, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

    insertStmt.run(
      '00000000-0000-0000-0000-000000000002',
      'Chuyên Viên Tuyển Sinh',
      'staff',
      'staff@vnus.edu.vn',
      staffHash,
      'STAFF',
      'ACTIVE',
      '0905789101',
      'Tổ Tư Vấn Tuyển Sinh VN-US',
      now,
      now
    );
  }

  sqliteDbInstance = db;
  return sqliteDbInstance;
}

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
  role?: 'ADMIN' | 'STAFF';
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
  const role = data.role === 'ADMIN' ? 'ADMIN' : 'STAFF';

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
      data.department?.trim() || 'Tổ Tư Vấn Tuyển Sinh VN-US',
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
        department: data.department?.trim() || 'Tổ Tư Vấn Tuyển Sinh VN-US',
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
    department: data.department?.trim() || 'Tổ Tư Vấn Tuyển Sinh VN-US',
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
    role?: 'ADMIN' | 'STAFF';
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
  const role = data.role !== undefined ? (data.role === 'ADMIN' ? 'ADMIN' : 'STAFF') : existing.role;
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
