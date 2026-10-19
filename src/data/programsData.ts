import { StudyProgram } from '@/types';

export const STUDY_PROGRAMS: StudyProgram[] = [
  // CMU Programs (Carnegie Mellon University - Top 1 Thế giới về CNTT)
  {
    id: 'cmu-se',
    code: '102(CMU)',
    name: 'Công nghệ Phần mềm chuẩn CMU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Carnegie Mellon (Mỹ) - Top 1 Thế giới về CNTT',
    degree: 'Kỹ sư / Cử nhân Đại học Duy Tân & Chứng chỉ hoàn tất từ CMU',
    accreditation: 'Đạt kiểm định quốc tế ABET (Hoa Kỳ)',
    duration: '4 năm',
    description: 'Chương trình chuyển giao 100% giáo trình từ Carnegie Mellon University (Mỹ). Sinh viên được đào tạo chuyên sâu về kỹ nghệ phần mềm hiện đại, kiến trúc hệ thống lớn, quy trình Agile/Scrum, DevSecOps và AI-driven development.',
    careerProspects: 'Software Engineer, Fullstack Developer, Solution Architect, QA/Test Automation Lead tại các tập đoàn công nghệ hàng đầu thế giới và Việt Nam.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức (Tuyển thẳng, Điểm thi THPT 2026, Học bạ lớp 12, ĐGNL ĐHQG TP.HCM, V-SAT).',
    isActive: true
  },
  {
    id: 'cmu-is',
    code: '116(CMU)',
    name: 'An ninh Mạng chuẩn CMU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Carnegie Mellon (Mỹ) - Top 1 Thế giới về CNTT',
    degree: 'Kỹ sư / Cử nhân Đại học Duy Tân & Chứng chỉ hoàn tất từ CMU',
    accreditation: 'Đạt kiểm định quốc tế ABET (Hoa Kỳ)',
    duration: '4 năm',
    description: 'Chương trình an toàn thông tin hàng đầu, trang bị kỹ năng phòng thủ không gian mạng, điều tra số (Digital Forensics), bảo mật đám mây, mật mã ứng dụng và kiểm thử thâm nhập (Penetration Testing).',
    careerProspects: 'Cybersecurity Analyst, SOC Engineer, Penetration Tester, Security Consultant tại ngân hàng, tài chính, quân đội và doanh nghiệp công nghệ.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức (Tuyển thẳng, Điểm thi THPT 2026, Học bạ lớp 12, ĐGNL ĐHQG TP.HCM, V-SAT).',
    isActive: true
  },
  {
    id: 'cmu-mis',
    code: '410(CMU)',
    name: 'Hệ thống Thông tin Quản lý chuẩn CMU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Carnegie Mellon (Mỹ)',
    degree: 'Cử nhân Đại học Duy Tân & Chứng chỉ hoàn tất từ CMU',
    accreditation: 'Đạt kiểm định quốc tế ABET (Hoa Kỳ)',
    duration: '4 năm',
    description: 'Kết hợp xuất sắc giữa công nghệ thông tin và quản trị chiến lược doanh nghiệp. Đào tạo phân tích dữ liệu kinh doanh (Business Analytics), triển khai ERP, quản trị dự án số.',
    careerProspects: 'Business Analyst (BA), ERP Consultant, IT Project Manager, Data Analyst.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức tuyển sinh của trường.',
    isActive: true
  },
  {
    id: 'cmu-ecom',
    code: '422(CMU)',
    name: 'Thương mại Điện tử chuẩn CMU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Carnegie Mellon (Mỹ)',
    degree: 'Cử nhân Đại học Duy Tân & Chứng chỉ hoàn tất từ CMU',
    accreditation: 'Chuẩn đầu ra kiểm định quốc tế',
    duration: '4 năm',
    description: 'Đào tạo các mô hình kinh doanh số, sàn thương mại điện tử, digital marketing đa kênh, thanh toán điện tử và phân tích hành vi khách hàng trực tuyến.',
    careerProspects: 'E-Commerce Manager, Digital Marketing Specialist, Growth Hacker, Quản lý sàn TMĐT.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức tuyển sinh 2026.',
    isActive: true
  },

  // PSU Programs (Penn State University - Top 1% Thế giới về Kinh tế & Quản trị)
  {
    id: 'psu-ba',
    code: '400(PSU)',
    name: 'Quản trị Kinh doanh chuẩn PSU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Bang Pennsylvania (Penn State University - Mỹ)',
    degree: 'Cử nhân Đại học Duy Tân & Chứng chỉ hoàn tất từ PSU',
    accreditation: 'Chuẩn AACSB (Hoa Kỳ)',
    duration: '4 năm',
    description: 'Chương trình chuẩn PSU đào tạo nhà lãnh đạo doanh nghiệp toàn cầu với tầm nhìn chiến lược, tư duy khởi nghiệp đổi mới sáng tạo và kỹ năng đàm phán quốc tế.',
    careerProspects: 'Brand Manager, Business Development Specialist, Khởi nghiệp kinh doanh, Quản lý vận hành.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức tuyển sinh của trường.',
    isActive: true
  },
  {
    id: 'psu-acc',
    code: '405(PSU)',
    name: 'Kế toán - Kiểm toán chuẩn PSU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Bang Pennsylvania (Penn State University - Mỹ)',
    degree: 'Cử nhân Đại học Duy Tân & Chứng chỉ hoàn tất từ PSU',
    accreditation: 'Tích hợp chứng chỉ quốc tế ACCA/CPA',
    duration: '4 năm',
    description: 'Đào tạo chuyên môn kiểm toán tài chính quốc tế theo chuẩn mực IFRS và GAAP, kế toán quản trị và phân tích rủi ro tài chính doanh nghiệp.',
    careerProspects: 'Auditor tại Big 4 (PwC, EY, Deloitte, KPMG), Kế toán trưởng, Kiểm toán viên nội bộ.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức tuyển sinh 2026.',
    isActive: true
  },
  {
    id: 'psu-fin',
    code: '404(PSU)',
    name: 'Tài chính - Ngân hàng chuẩn PSU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Bang Pennsylvania (Penn State University - Mỹ)',
    degree: 'Cử nhân Đại học Duy Tân & Chứng chỉ hoàn tất từ PSU',
    accreditation: 'Chuẩn quốc tế PSU',
    duration: '4 năm',
    description: 'Chương trình chuyên sâu về định chế tài chính, quản trị danh mục đầu tư, thẩm định tín dụng, thị trường vốn và ngân hàng thương mại quốc tế.',
    careerProspects: 'Chuyên viên phân tích đầu tư, Chuyên viên tín dụng ngân hàng, Quản lý tài sản (Asset Manager).',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức tuyển sinh 2026.',
    isActive: true
  },
  {
    id: 'psu-fintech',
    code: '435(PSU)',
    name: 'Công nghệ Tài chính (FinTech) chuẩn PSU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Bang Pennsylvania (Penn State University - Mỹ)',
    degree: 'Cử nhân Đại học Duy Tân & Chứng chỉ hoàn tất từ PSU',
    accreditation: 'Chuẩn quốc tế công nghệ & tài chính',
    duration: '4 năm',
    description: 'Ngành đón đầu xu thế giao thoa công nghệ và dịch vụ tài chính: Blockchain, thuật toán giao dịch tự động (Algo-trading), ví điện tử, chấm điểm tín dụng AI.',
    careerProspects: 'FinTech Product Manager, Blockchain Analyst, Quantitative Researcher, Chuyên viên giải pháp thanh toán số.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức tuyển sinh 2026.',
    isActive: true
  },
  {
    id: 'psu-ib',
    code: '411(PSU)',
    name: 'Kinh doanh Quốc tế chuẩn PSU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Bang Pennsylvania (Penn State University - Mỹ)',
    degree: 'Cử nhân Đại học Duy Tân & Chứng chỉ hoàn tất từ PSU',
    accreditation: 'Chuẩn AACSB (Hoa Kỳ)',
    duration: '4 năm',
    description: 'Đào tạo chuỗi cung ứng toàn cầu, logistics quốc tế, xuất nhập khẩu, chiến lược thâm nhập thị trường nước ngoài và luật thương mại quốc tế.',
    careerProspects: 'Chuyên viên xuất nhập khẩu, Logistics Coordinator, Quản lý quan hệ đối tác quốc tế.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức tuyển sinh 2026.',
    isActive: true
  },

  // CSU Programs (California State University, Fullerton - Mỹ)
  {
    id: 'csu-arch',
    code: '107(CSU)',
    name: 'Kiến trúc Công trình chuẩn CSU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Bang California (CSU Cal Poly - Mỹ)',
    degree: 'Kiến trúc sư Đại học Duy Tân & Chứng chỉ CSU',
    accreditation: 'Chuẩn quốc tế CSU Cal Poly',
    duration: '4.5 - 5 năm',
    description: 'Đào tạo kiến trúc sư hiện đại với tư duy thiết kế bền vững (Green Architecture), công nghệ BIM, thiết kế cảnh quan và quy hoạch đô thị tương lai.',
    careerProspects: 'Kiến trúc sư chủ trì thiết kế, Chuyên viên thiết kế nội thất, Quản lý quy hoạch dự án.',
    admissionCriteria: 'Xét tổ hợp 2 môn + Điểm thi Vẽ Mỹ thuật * 2 (Điểm XT = Điểm TB môn 1 + Điểm TB môn 2 + Điểm Vẽ * 2 + Điểm ưu tiên).',
    isActive: true
  },
  {
    id: 'csu-civil',
    code: '115(CSU)',
    name: 'Xây dựng Dân dụng & Công nghiệp chuẩn CSU',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Bang California (CSU Cal Poly - Mỹ)',
    degree: 'Kỹ sư Xây dựng Đại học Duy Tân & Chứng chỉ CSU',
    accreditation: 'Chuẩn quốc tế CSU Cal Poly',
    duration: '4 - 5 năm',
    description: 'Chương trình đào tạo kỹ sư công trình với công nghệ kết cấu chịu lực tiên tiến, quản lý tiến độ và chi phí công trình theo chuẩn thế giới.',
    careerProspects: 'Kỹ sư kết cấu, Chỉ huy trưởng công trình, Tư vấn giám sát dự án xây dựng.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức tuyển sinh của trường.',
    isActive: true
  },

  // TROY Programs (Troy University, Alabama, Mỹ - Cấp bằng Cử nhân Mỹ 100%)
  {
    id: 'troy-ba',
    code: '400(TROY)',
    name: 'Quản trị Kinh doanh TROY (Mỹ)',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Troy (Alabama, Mỹ)',
    degree: 'Bằng Cử nhân chính quy của Đại học Troy (Mỹ) cấp tại Việt Nam',
    accreditation: 'Kiểm định SACSCOC và ACBSP (Hoa Kỳ)',
    duration: '4 năm (11 học kỳ)',
    description: 'Học trọn vẹn tại Đà Nẵng hoặc chuyển tiếp sau Năm 2 sang Đại học Troy (Mỹ). Nhận 100% bằng Cử nhân chính quy của Đại học Troy (Mỹ), được Bộ GD&ĐT Việt Nam công nhận văn bằng toàn diện.',
    careerProspects: 'Làm việc tại các tập đoàn đa quốc gia toàn cầu, chuyên gia tư vấn chiến lược, du học sau đại học tại Mỹ/châu Âu.',
    admissionCriteria: 'Tốt nghiệp THPT, xét tuyển theo 05 phương thức + Điều kiện tiếng Anh IELTS từ 5.5+ hoặc kiểm tra tiếng Anh đầu vào.',
    isActive: true
  },
  {
    id: 'troy-thm',
    code: '407(TROY)',
    name: 'Quản trị Du lịch & Khách sạn TROY (Mỹ)',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Troy (Alabama, Mỹ)',
    degree: 'Bằng Cử nhân chính quy của Đại học Troy (Mỹ) cấp tại Việt Nam',
    accreditation: 'Kiểm định SACSCOC và ACBSP (Hoa Kỳ)',
    duration: '4 năm (11 học kỳ)',
    description: 'Chương trình liên kết độc quyền cấp bằng Mỹ trong ngành Quản trị Du lịch Khách sạn. Sinh viên thực tập tại các resort 5 sao quốc tế: InterContinental, Marriott, Hyatt.',
    careerProspects: 'General Manager tại khách sạn/resort 5 sao, Quản lý F&B quốc tế, Giám đốc điều hành tour cao cấp.',
    admissionCriteria: 'Tốt nghiệp THPT, chứng chỉ IELTS từ 5.5+ hoặc tham gia khóa Anh văn dự bị của chương trình.',
    isActive: true
  },
  {
    id: 'troy-cs',
    code: '102(TROY)',
    name: 'Khoa học Máy tính TROY (Mỹ)',
    faculty: 'Viện Đào tạo Quốc tế (VN-US)',
    partner: 'Đại học Troy (Alabama, Mỹ)',
    degree: 'Bằng Cử nhân Khoa học Máy tính của Đại học Troy (Mỹ)',
    accreditation: 'Kiểm định SACSCOC (Hoa Kỳ)',
    duration: '4 năm (11 học kỳ)',
    description: 'Nhận bằng cử nhân Computer Science chính quy từ Đại học Troy. Tập trung vào trí tuệ nhân tạo, khoa học dữ liệu, hệ điều hành phân tán và thuật toán nâng cao.',
    careerProspects: 'AI Research Engineer, Data Scientist, Systems Architect tại các công ty công nghệ quốc tế.',
    admissionCriteria: 'Tốt nghiệp THPT, IELTS từ 5.5+ hoặc tham gia kỳ kiểm tra tiếng Anh đầu vào.',
    isActive: true
  }
];

export const UNIVERSITY_PARTNERS = [
  {
    code: 'CMU',
    name: 'Carnegie Mellon University (Mỹ)',
    logoText: 'CMU',
    badge: 'Top 1 Thế giới CNTT',
    description: 'Chuyển giao chương trình Công nghệ Phần mềm, An ninh mạng, MIS và TMĐT đạt kiểm định ABET Hoa Kỳ.'
  },
  {
    code: 'PSU',
    name: 'Penn State University (Mỹ)',
    logoText: 'PSU',
    badge: 'Chuẩn Kiểm định AACSB',
    description: 'Chuyển giao chương trình Quản trị Kinh doanh, FinTech, Kế toán - Kiểm toán, Ngân hàng và Kinh doanh Quốc tế.'
  },
  {
    code: 'CSU',
    name: 'California State University (Mỹ)',
    logoText: 'CSU',
    badge: 'Top Đầu Kiến trúc & Kỹ thuật',
    description: 'Chương trình Kiến trúc Công trình & Xây dựng Dân dụng chuẩn CSU Cal Poly danh tiếng.'
  },
  {
    code: 'TROY',
    name: 'Troy University (Alabama, Mỹ)',
    logoText: 'TROY',
    badge: 'Bằng Cử nhân Mỹ 100%',
    description: 'Cấp bằng Cử nhân chính quy của Đại học Troy (Mỹ) học toàn phần tại Đà Nẵng, đào tạo chuẩn Hoa Kỳ và công nhận toàn cầu.'
  }
];

export const ADMISSION_METHODS = [
  {
    id: 'pt1',
    number: '01',
    title: 'Phương thức 1: Xét Tuyển Thẳng',
    criteria: 'Xét tuyển thẳng thí sinh theo qui chế của Bộ Giáo dục & Đào tạo (thí sinh đạt giải HSG Quốc gia, Hội thi KHKT cấp Quốc gia).',
    badge: 'Tuyển thẳng Bộ GD&ĐT'
  },
  {
    id: 'pt2',
    number: '02',
    title: 'Phương thức 2: Xét Điểm Thi Tốt Nghiệp THPT 2026',
    criteria: 'Căn cứ kết quả thi tốt nghiệp THPT năm 2026 theo các tổ hợp môn xét tuyển quy định.',
    badge: 'Kỳ thi THPT 2026'
  },
  {
    id: 'pt3',
    number: '03',
    title: 'Phương thức 3: Xét Kết Quả Học Tập THPT (Học Bạ)',
    criteria: 'Xét kết quả học tập THPT năm Lớp 12 của thí sinh theo tổ hợp 3 môn xét tuyển.',
    badge: 'Xét Học bạ Lớp 12'
  },
  {
    id: 'pt4',
    number: '04',
    title: 'Phương thức 4: Đánh Giá Năng Lực ĐHQG TP.HCM',
    criteria: 'Xét kết quả kỳ thi Đánh giá năng lực do ĐH Quốc gia TP.HCM tổ chức năm 2026 (ngoại trừ ngành Kiến trúc).',
    badge: 'ĐGNL ĐHQG TP.HCM'
  },
  {
    id: 'pt5',
    number: '05',
    title: 'Phương thức 5: Kỳ Thi Đánh Giá V-SAT',
    criteria: 'Xét kết quả kỳ thi đánh giá đầu vào đại học trên máy tính (V-SAT) năm 2026.',
    badge: 'Kỳ thi V-SAT 2026'
  }
];

export const SCHOLARSHIP_HIGHLIGHTS = [
  {
    title: 'Quỹ Học bổng Đại học Troy Đà Nẵng',
    value: 'Hơn 13 Tỷ Đồng',
    detail: 'Suất học bổng dành cho thí sinh có tổng điểm 3 môn THPT từ 23-26đ hoặc 2 môn từ 16-17đ kèm IELTS 5.5+, hoặc đạt giải Nhất/Nhì/Ba HSG Tỉnh/Quốc gia.'
  },
  {
    title: '55 Suất Học bổng Toàn phần VN-US',
    value: '55 Suất Toàn Phần',
    detail: 'Dành riêng cho thí sinh đạt từ 25 điểm trở lên trong kỳ thi THPT đăng ký bất kỳ chuyên ngành nào của CMU, PSU, CSU, PNU (05 suất cho mỗi ngành).'
  },
  {
    title: 'Học bổng Kiến trúc & Xây dựng CSU',
    value: '20 Suất Học Bổng',
    detail: 'Dành riêng cho thí sinh đăng ký các ngành thuộc khối Kiến trúc Công trình và Xây dựng Dân dụng chuẩn CSU.'
  }
];

export const ADMISSION_CONTACT_INFO = {
  institutionName: 'Trường Đào tạo Quốc tế (VN-US) - Đại học Duy Tân',
  headquartersAddress: '120 Hoàng Minh Thảo, P. Hòa Khánh Nam, Q. Liên Chiểu, TP. Đà Nẵng',
  admissionsOfficeAddress: '254 Nguyễn Văn Linh, P. Thạc Gián, Q. Thanh Khê, TP. Đà Nẵng',
  hotlines: ['0979 407 340', '0888 414 141'],
  emails: ['tuyensinh.vnus@dtu.edu.vn', 'admission@dtu.edu.vn']
};
