-- ==============================================================================
-- HỆ THỐNG WEBSITE & QUẢN TRỊ TUYỂN SINH SỐ HÓA TOÀN DIỆN (ADMISSIONS CRM & PORTAL)
-- TRƯỜNG ĐÀO TẠO QUỐC TẾ (VN-US) - ĐẠI HỌC DUY TÂN
-- TÀI LIỆU CSDL CHUẨN POSTGRESQL / SUPABASE (CORE SCHEMA V2.0)
-- ==============================================================================

-- 1. BẬT TIỆN ÍCH EXTENSION CHO UUID & MÃ HÓA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. BẢNG DANH MỤC VAI TRÒ (ROLES)
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    role_code VARCHAR(30) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG DANH MỤC QUYỀN HẠN CHI TIẾT (PERMISSIONS)
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(50) PRIMARY KEY,
    perm_code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG LIÊN KẾT VAI TRÒ - QUYỀN HẠN (ROLE_PERMISSIONS)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 5. BẢNG TÀI KHOẢN CÁN BỘ & CHUYÊN VIÊN (USERS)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Băm một chiều an toàn bằng pgcrypto (crypt(password, gen_salt('bf')))
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE RESTRICT,
    department_id VARCHAR(100) NOT NULL,
    assigned_region VARCHAR(100),
    target_quota INT DEFAULT 50, -- Chỉ tiêu KPI tuyển sinh
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'locked', 'suspended')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG DANH MỤC CHƯƠNG TRÌNH ĐÀO TẠO & CHỈ TIÊU (STUDY_PROGRAMS)
CREATE TABLE IF NOT EXISTS study_programs (
    id VARCHAR(50) PRIMARY KEY,
    program_code VARCHAR(50) UNIQUE NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    faculty VARCHAR(150) NOT NULL,
    partner VARCHAR(150) NOT NULL,
    degree VARCHAR(150) NOT NULL,
    accreditation VARCHAR(150),
    duration VARCHAR(50) DEFAULT '4 năm',
    target_quota INT DEFAULT 100, -- Chỉ tiêu tuyển sinh của ngành
    tuition_fee VARCHAR(100),
    description TEXT,
    career_prospects TEXT,
    admission_criteria TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. BẢNG HỒ SƠ THÍ SINH & LEAD (CANDIDATES)
CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(50) PRIMARY KEY, -- Mã duy nhất dạng TS-2026-XXXX
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_card_number VARCHAR(20), -- Số CCCD / Định danh cá nhân (12 chữ số)
    email VARCHAR(150),
    high_school VARCHAR(200),
    province_id VARCHAR(100),
    graduation_year INT DEFAULT 2026,
    
    -- Nguyện vọng ngành học
    primary_program_id VARCHAR(50) REFERENCES study_programs(id) ON DELETE SET NULL,
    secondary_program_id VARCHAR(50) REFERENCES study_programs(id) ON DELETE SET NULL,
    exam_block VARCHAR(10) DEFAULT 'A00',
    estimated_score NUMERIC(4, 2),
    
    -- Nguồn & Chiến dịch marketing
    source_id VARCHAR(50) DEFAULT 'website',
    utm_campaign VARCHAR(100),
    
    -- Tiến độ & Trạng thái đường ống 10 bước
    status_code VARCHAR(50) DEFAULT 'new' CHECK (
        status_code IN (
            'new', 'unreachable', 'consulted_1', 'hot_lead', 
            'waiting_transcript', 'submitted_app', 'conditional_admit', 
            'confirmed_enroll', 'tuition_paid', 'cancelled'
        )
    ),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    
    -- Phân công phụ trách (Row-Level Security)
    assigned_to VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    department_id VARCHAR(100),
    
    -- Thanh toán & Tài chính
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'deposit_paid', 'tuition_paid')),
    fee_paid_amount NUMERIC(15, 2) DEFAULT 0,
    payment_transaction_id VARCHAR(100),
    payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Hồ sơ minh chứng số hóa (JSONB)
    documents JSONB DEFAULT '{}'::jsonb,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Đặt chỉ mục tìm kiếm và khóa duy nhất để quét trùng lặp
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_phone ON candidates(phone);
CREATE INDEX IF NOT EXISTS idx_candidates_id_card ON candidates(id_card_number);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status_code);
CREATE INDEX IF NOT EXISTS idx_candidates_assigned_to ON candidates(assigned_to);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);

-- 8. BẢNG NHẬT KÝ TƯ VẤN & CHĂM SÓC (CONSULTATION_LOGS)
CREATE TABLE IF NOT EXISTS consultation_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('log-' || gen_random_uuid()),
    candidate_id VARCHAR(50) REFERENCES candidates(id) ON DELETE CASCADE,
    officer_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    officer_name VARCHAR(150),
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('call', 'zalo', 'facebook', 'meeting', 'email')),
    parent_attitude VARCHAR(30) DEFAULT 'considering',
    rating INT DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    outcome TEXT,
    next_action_date DATE, -- Ngày hẹn chăm sóc lại (Follow-up Reminder)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_candidate ON consultation_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_logs_officer ON consultation_logs(officer_id);
CREATE INDEX IF NOT EXISTS idx_logs_next_action ON consultation_logs(next_action_date);

-- 9. BẢNG NHẬT KÝ NHẬP FILE EXCEL (IMPORT_BATCHES)
CREATE TABLE IF NOT EXISTS import_batches (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('batch-' || gen_random_uuid()),
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    file_name VARCHAR(255) NOT NULL,
    total_rows INT NOT NULL,
    success_rows INT NOT NULL,
    failed_rows INT NOT NULL,
    deduplication_mode VARCHAR(30) NOT NULL CHECK (deduplication_mode IN ('skip', 'overwrite', 'merge_history')),
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. BẢNG NHẬT KÝ KIỂM TOÁN VĨNH VIỄN (AUDIT_TRAIL_LOGS)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('audit-' || gen_random_uuid()),
    user_id VARCHAR(50),
    user_name VARCHAR(150),
    user_role VARCHAR(50),
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, EXPORT, IMPORT, REASSIGN, VERIFY_DOCS, STATUS_CHANGE, PAYMENT_UPDATE
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- 11. BẢNG LỊCH SỬ GỬI TIN TỰ ĐỘNG ZALO ZNS / SMS BRANDNAME / EMAIL (ZNS_SMS_LOGS)
CREATE TABLE IF NOT EXISTS zns_sms_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('msg-' || gen_random_uuid()),
    candidate_id VARCHAR(50) REFERENCES candidates(id) ON DELETE CASCADE,
    candidate_name VARCHAR(150),
    phone VARCHAR(20) NOT NULL,
    channel VARCHAR(30) NOT NULL CHECK (channel IN ('zalo_zns', 'sms_brandname', 'email')),
    template_id VARCHAR(100),
    template_name VARCHAR(200),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
    payload_preview TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 12. DỮ LIỆU KHỞI TẠO CHUẨN (SEED DATA)
-- ==============================================================================

-- 12.1. Seed 5 Vai trò cốt lõi
INSERT INTO roles (id, role_code, role_name, description) VALUES
('role-admin', 'SUPER_ADMIN', 'Super Admin (Quản trị viên tối cao)', 'Toàn quyền cấu hình hệ thống, quản lý tài khoản, xem audit log, thiết lập chỉ tiêu.'),
('role-manager', 'ADMISSIONS_MANAGER', 'Admissions Manager (Trưởng ban Tuyển sinh)', 'Xem toàn bộ dữ liệu thí sinh, phân bổ leads, theo dõi KPI chuyên viên, duyệt học bổng và phê duyệt đặc biệt.'),
('role-officer', 'ADMISSIONS_OFFICER', 'Admissions Officer (Chuyên viên tư vấn)', 'Chỉ thao tác trên thí sinh được phân công phụ trách, nhập liệu form/excel, chăm sóc và chuyển trạng thái.'),
('role-marketing', 'MARKETING_COLLECTOR', 'Marketing & Data Collector (Cán bộ Truyền thông)', 'Quản lý chiến dịch, mã nguồn UTM, đo lường chi phí/lead, xem báo cáo marketing tổng hợp.'),
('role-verifier', 'DOCUMENT_VERIFIER', 'Document Verification Officer (Cán bộ Hậu kiểm)', 'Tiếp nhận hồ sơ số hóa, thẩm định đối chiếu điểm học bạ, CCCD, xác thực trúng tuyển.')
ON CONFLICT (id) DO NOTHING;

-- 12.2. Seed Quyền hạn chi tiết
INSERT INTO permissions (id, perm_code, module, description) VALUES
('perm-1', 'lead.view_all', 'Leads', 'Xem toàn bộ danh sách thí sinh'),
('perm-2', 'lead.view_assigned', 'Leads', 'Chỉ xem danh sách thí sinh được phân công'),
('perm-3', 'lead.create', 'Leads', 'Thêm mới thí sinh qua form'),
('perm-4', 'lead.import_excel', 'Leads', 'Nhập danh sách thí sinh từ Excel'),
('perm-5', 'lead.reassign', 'Leads', 'Phân bổ và chuyển giao chuyên viên phụ trách'),
('perm-6', 'lead.export', 'Leads', 'Xuất toàn bộ cơ sở dữ liệu ra Excel'),
('perm-7', 'lead.delete', 'Leads', 'Xóa hồ sơ thí sinh'),
('perm-8', 'lead.verify_docs', 'Verification', 'Thẩm định hồ sơ minh chứng học bạ'),
('perm-9', 'audit.view', 'System', 'Xem toàn bộ nhật ký kiểm toán hệ thống'),
('perm-10', 'system.configure', 'System', 'Cấu hình chỉ tiêu và tham số hệ thống')
ON CONFLICT (id) DO NOTHING;

-- 12.3. Seed Tài khoản cán bộ mẫu
INSERT INTO users (id, username, password_hash, full_name, email, phone, role_id, department_id, assigned_region, target_quota) VALUES
('usr-admin-1', 'admin.tuyensinh', crypt('Admin@2026', gen_salt('bf')), 'ThS. Nguyễn Văn Hải', 'admin.tuyensinh@dtu.edu.vn', '0905123456', 'role-admin', 'Ban Giám đốc & Quản trị Hệ thống', 'Toàn quốc', 200),
('usr-manager-1', 'manager.tuyensinh', crypt('Manager@2026', gen_salt('bf')), 'TS. Đặng Thanh Bình', 'manager.tuyensinh@dtu.edu.vn', '0905999888', 'role-manager', 'Ban Lãnh đạo Tuyển sinh (Trưởng Ban)', 'Toàn quốc', 150),
('usr-counselor-1', 'lan.tuyensinh', crypt('Officer@2026', gen_salt('bf')), 'Trần Thị Mai Lan', 'lan.tuyensinh@dtu.edu.vn', '0979407340', 'role-officer', 'Bộ phận Tư vấn Tuyển sinh & Hotline', 'Đà Nẵng & Quảng Nam', 80),
('usr-counselor-2', 'tuan.cmu', crypt('Officer@2026', gen_salt('bf')), 'Lê Hoàng Anh Tuấn', 'tuan.cmu@dtu.edu.vn', '0888414141', 'role-officer', 'Bộ phận Tư vấn Khối Công nghệ CMU', 'Thừa Thiên Huế & Bắc Trung Bộ', 80),
('usr-marketer-1', 'phuong.mkt', crypt('Marketing@2026', gen_salt('bf')), 'Phạm Minh Phương', 'phuong.mkt@dtu.edu.vn', '0912345678', 'role-marketing', 'Phòng Truyền thông & Tuyển sinh Số', 'Toàn quốc', 0),
('usr-verifier-1', 'ngoc.verify', crypt('Verifier@2026', gen_salt('bf')), 'ThS. Hoàng Thị Bích Ngọc', 'ngoc.verify@dtu.edu.vn', '0935112233', 'role-verifier', 'Tổ Hậu kiểm & Thẩm định Hồ sơ Xét tuyển', 'Toàn quốc', 0)
ON CONFLICT (id) DO NOTHING;

-- 12.4. Seed Chương trình đào tạo (14 ngành quốc tế)
INSERT INTO study_programs (id, program_code, program_name, faculty, partner, degree, accreditation, target_quota) VALUES
('cmu-se', '102(CMU)', 'Kỹ nghệ Phần mềm chuẩn CMU', 'Khoa Công nghệ Thông tin Quốc tế', 'Carnegie Mellon University', 'Kỹ sư Kỹ nghệ Phần mềm', 'ABET (Hoa Kỳ)', 120),
('cmu-is', '103(CMU)', 'An toàn Thông tin chuẩn CMU', 'Khoa Công nghệ Thông tin Quốc tế', 'Carnegie Mellon University', 'Kỹ sư An toàn Thông tin', 'ABET (Hoa Kỳ)', 80),
('psu-ba', '401(PSU)', 'Quản trị Kinh doanh chuẩn PSU', 'Khoa Đào tạo Quốc tế (VN-US)', 'Penn State University', 'Cử nhân Quản trị Kinh doanh', 'AACSB (Hoa Kỳ)', 100),
('psu-fintech', '435(PSU)', 'Công nghệ Tài chính (FinTech) chuẩn PSU', 'Khoa Đào tạo Quốc tế (VN-US)', 'Penn State University', 'Cử nhân FinTech', 'AACSB (Hoa Kỳ)', 90),
('troy-ba', '400(TROY)', 'Quản trị Kinh doanh Đại học TROY (Mỹ cấp bằng)', 'Chương trình Du học Tại chỗ Troy', 'Troy University (Hoa Kỳ)', 'Bachelor of Science in Business Administration', 'SACSCOC & ACBSP (Hoa Kỳ)', 150),
('csu-arch', '107(CSU)', 'Kiến trúc Công trình chuẩn CSU', 'Khoa Kiến trúc & Xây dựng Quốc tế', 'California State University', 'Kiến trúc sư', 'Chuẩn Kiểm định Hoa Kỳ', 60)
ON CONFLICT (id) DO NOTHING;

-- 13. CHÍNH SÁCH BẢO MẬT HÀNG DỮ LIỆU (ROW-LEVEL SECURITY - RLS) VÍ DỤ TRÊN SUPABASE / POSTGRES
-- Bật RLS trên bảng candidates
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Super Admin & Manager xem toàn bộ
CREATE POLICY admin_manager_all_access ON candidates
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN ('role-admin', 'role-manager')
        )
    );

-- Policy 2: Admissions Officer chỉ xem thí sinh được phân công
CREATE POLICY officer_assigned_access ON candidates
    FOR ALL
    USING (
        assigned_to = auth.uid() OR assigned_to IS NULL
    );

-- Policy 3: Verifier chỉ xem thí sinh đã nộp hồ sơ xét tuyển
CREATE POLICY verifier_submitted_access ON candidates
    FOR ALL
    USING (
        status_code IN ('submitted_app', 'conditional_admit', 'confirmed_enroll', 'waiting_transcript')
    );
