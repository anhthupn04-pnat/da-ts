// Cấu hình tổng quát cho các mùa tuyển sinh (General Admission Batch & Cohort Config)
// Phục vụ lâu dài cho nhiều mùa tuyển sinh tiếp theo, không phụ thuộc hardcode vào một khóa cụ thể.

export const ADMISSION_CONFIG = {
  // Định danh khóa hiện tại (dùng chung cho các mùa tuyển sinh)
  cohortName: 'Khóa Mới',
  academicBatch: 'Tuyển sinh Đại học & Liên kết Quốc tế',
  systemTitle: 'Hệ thống Quản trị & Cổng Tuyển sinh Quốc tế',
  institutionShort: 'VN-US',
  institutionFull: 'Trường Đào tạo Quốc tế (VN-US) • Đại học Duy Tân',
  campusName: 'Cơ sở Tòa G (120 Hoàng Minh Thảo, Đà Nẵng)',
  hotline: '0979 407 340',
  secondaryHotline: '0888 414 141',
  email: 'tuyensinh.vnus@dtu.edu.vn',
  totalPrograms: 14,
  partners: ['Carnegie Mellon (CMU)', 'Penn State (PSU)', 'California State University (CSU)', 'Troy University (TROY)']
};
