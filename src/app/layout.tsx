import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trung tâm Tư vấn & Hỗ trợ Sinh viên | Viện Đào tạo Quốc tế (VN-US) - ĐH Duy Tân',
  description: 'Cổng thông tin tuyển sinh, tư vấn hướng nghiệp & hỗ trợ sinh viên các chương trình đào tạo quốc tế chuẩn CMU, PSU, CSU và Troy University (Hoa Kỳ) - Đại học Duy Tân.',
  keywords: ['Trung tâm tư vấn sinh viên', 'Đại học Duy Tân', 'VN-US', 'Chương trình tiên tiến CMU', 'PSU', 'CSU', 'Đại học Troy', 'Tuyển sinh Đại học', 'Tòa G Duy Tân'],
  icons: {
    icon: [
      { url: '/logo.png?v=3', type: 'image/png' },
      { url: '/icon.png?v=3', type: 'image/png' },
    ],
    shortcut: '/logo.png?v=3',
    apple: '/logo.png?v=3',
  }
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
        <link rel="icon" href="/logo.png?v=3" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=3" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-800 selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
