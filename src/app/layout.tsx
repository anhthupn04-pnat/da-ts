import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trung tâm Tư vấn & Hỗ trợ Sinh viên | Viện Đào tạo Quốc tế (VN-US) - ĐH Duy Tân',
  description: 'Cổng thông tin tuyển sinh, tư vấn hướng nghiệp & hỗ trợ sinh viên các chương trình đào tạo quốc tế chuẩn CMU, PSU, CSU và Troy University (Mỹ) - Đại học Duy Tân.',
  keywords: ['Trung tâm tư vấn sinh viên', 'Đại học Duy Tân', 'VN-US', 'Chương trình tiên tiến CMU', 'PSU', 'CSU', 'Đại học Troy', 'Tuyển sinh Đại học Quốc tế', 'Tòa G Duy Tân']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
