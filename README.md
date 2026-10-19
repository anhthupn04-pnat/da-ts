# TRUNG TÂM TƯ VẤN & HỖ TRỢ SINH VIÊN
### Trường Đào tạo Quốc tế (VN-US) — Đại học Duy Tân
> **Hệ Thống Số Hóa Tuyển Sinh & Tiếp Nhận Hồ Sơ Trực Tuyến**
> Phát triển trên nền tảng **Next.js 16 (App Router) + TypeScript + Tailwind CSS** và tối ưu hóa sẵn sàng triển khai 1-click lên **Vercel**.

---

## 🌟 TỔNG QUAN HỆ THỐNG

Phần mềm được xây dựng phục vụ công tác số hóa tuyển sinh đại học quốc tế của Trường Đào tạo Quốc tế (VN-US), Đại học Duy Tân:
- **14 Chương trình đào tạo quốc tế tinh hoa:**
  - **Troy University (Mỹ):** Quản trị Kinh doanh (400 TROY), Quản trị Du lịch & Khách sạn (407 TROY), Khoa học Máy tính (102 TROY) - Nhận bằng Cử nhân chính quy của Đại học Troy (Mỹ).
  - **Carnegie Mellon University (Mỹ):** Công nghệ Phần mềm (102 CMU), An ninh Mạng (116 CMU), Hệ thống Thông tin Quản lý (410 CMU), Thương mại Điện tử (422 CMU) - Đạt chuẩn kiểm định quốc tế **ABET**.
  - **Penn State University (Mỹ):** Quản trị Kinh doanh (400 PSU), Kế toán - Kiểm toán (405 PSU), Tài chính Ngân hàng (404 PSU), FinTech (435 PSU), Kinh doanh Quốc tế (411 PSU) - Chuẩn kiểm định **AACSB**.
  - **California State University (Mỹ):** Kiến trúc Công trình (107 CSU), Xây dựng Dân dụng & Công nghiệp (115 CSU) - Chuẩn Cal Poly.
- **Quỹ Học bổng 13 Tỷ Đồng:** 55 suất học bổng toàn phần CMU/PSU/CSU, 20 suất học bổng toàn phần Kiến trúc, và học bổng Troy giá trị cao.
- **05 Phương thức xét tuyển:** Tuyển thẳng, Điểm thi THPT, Học bạ THPT, ĐGNL ĐHQG TP.HCM, V-SAT.
- **Không gian học tập Tòa G hiện đại:** 120 Hoàng Minh Thảo với thang máy kính trong suốt, 184 phòng học, 1.300 máy tính.

---

## 🚀 HƯỚNG DẪN CHẠY LOCAL ĐỂ KIỂM THỬ

### Bước 1: Cài đặt thư viện dependencies
```bash
npm install
```

### Bước 2: Chạy môi trường phát triển local
```bash
npm run dev
```
Mở trình duyệt truy cập: **[http://localhost:3000](http://localhost:3000)**

### Bước 3: Kiểm tra Build Production trước khi Deploy
```bash
npm run build
```
Hệ thống sẽ biên dịch tĩnh (Static Generation & Route Handlers) đảm bảo 0 lỗi type-check và 0 lỗi cú pháp.

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI LÊN VERCEL ĐỂ MỌI NGƯỜI CÙNG TEST

### Giai đoạn 1: Đưa Code lên GitHub

1. Khởi tạo Git và kiểm tra trạng thái:
   ```bash
   git init
   git add .
   git commit -m "feat: release Trung tam Tu van & Ho tro Sinh vien K32"
   ```
   *(Lưu ý: File PDF nặng 122MB đã được cấu hình trong `.gitignore` nên git push sẽ cực kỳ nhanh và không bị GitHub từ chối dung lượng).*

2. Tạo một repository mới trên GitHub (ví dụ: `trung-tam-tu-van-sinh-vien`).
3. Đẩy code lên GitHub:
   ```bash
   git remote add origin https://github.com/<tai-khoan-cua-ban>/trung-tam-tu-van-sinh-vien.git
   git branch -M main
   git push -u origin main
   ```

---

### Giai đoạn 2: Triển khai lên Vercel (1-Click Deploy)

1. Đăng nhập vào **[https://vercel.com](https://vercel.com)** (bằng tài khoản GitHub của bạn).
2. Bấm nút **"Add New..."** → Chọn **"Project"**.
3. Tìm và bấm **"Import"** repository `trung-tam-tu-van-sinh-vien` vừa đẩy lên.
4. Tại màn hình **Configure Project**:
   - **Framework Preset:** Next.js (Vercel tự động nhận diện).
   - **Root Directory:** `./` (để mặc định).
   - **Build Command:** `next build` (để mặc định).
5. Bấm nút **"Deploy"**.
6. Sau khoảng 1-2 phút, Vercel sẽ cấp cho bạn một đường link công khai (ví dụ: `https://trung-tam-tu-van-sinh-vien.vercel.app`).
👉 **Bây giờ bạn có thể gửi đường link này cho đồng nghiệp, hội đồng tuyển sinh và mọi người vào test thử trên máy tính lẫn điện thoại di động!**

---

### Giai đoạn 3: Cấu hình Supabase PostgreSQL (Tùy chọn)

Nếu bạn muốn kết nối ứng dụng trực tiếp với cơ sở dữ liệu Supabase trên đám mây:
1. Đăng ký tài khoản tại **[https://supabase.com](https://supabase.com)** → Tạo một dự án mới.
2. Vào mục **SQL Editor** trong Supabase:
   - Dán toàn bộ nội dung file `supabase/migrations/20261014_init_schema.sql` và bấm **Run**.
   - Dán nội dung file `supabase/seed.sql` và bấm **Run**.
3. Vào mục **Project Settings → API** lấy 2 thông số:
   - `Project URL`
   - `anon public key`
4. Vào Vercel → **Settings → Environment Variables** thêm:
   - `NEXT_PUBLIC_SUPABASE_URL` = `<Project URL>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<anon public key>`
5. Bấm **Redeploy** trên Vercel.

---

## 🧪 KỊCH BẢN KIỂM THỬ THỰC TẾ (TEST SCENARIOS)

| Kịch bản | Thao tác kiểm tra | Kết quả mong đợi |
|---|---|---|
| **1. Cổng công khai** | Vào trang chủ `/`, cuộn xem 14 ngành, học bổng 13 tỷ, 5 phương thức tuyển sinh | Giao diện hiện đại, responsive, không có ảnh lỗi |
| **2. Gửi form tư vấn** | Điền thông tin tại form `#registration-form` với SĐT 10 số và bấm Gửi | Hiển thị mã hồ sơ thành công, dữ liệu được ghi nhận ngay |
| **3. Chống gửi trùng** | Nhập lại đúng số điện thoại vừa gửi | Báo lỗi thân thiện cảnh báo thí sinh đã có trong hệ thống |
| **4. Cổng Quản trị CRM** | Truy cập `/admin`, xem KPI Cards, Phễu chuyển đổi, Bảng thí sinh mới | Số liệu tự động cập nhật phản ánh đúng hồ sơ vừa tạo |
| **5. Tư vấn & Nhật ký** | Vào `/admin/leads`, bấm "Tư Vấn" ở một thí sinh, ghi chú cuộc gọi | Trạng thái chuyển thành "Đang tư vấn", lưu nhật ký thời gian thực |
| **6. Chuyển đổi vai trò** | Bấm menu góc phải trên thanh Topbar, đổi vai trò sang Chuyên viên Tư vấn / Marketing | Quyền và góc nhìn quản trị thay đổi linh hoạt |
| **7. Trợ lý AI Tuyển sinh** | Vào `/admin/ai-assistant`, chọn "Soạn kịch bản gọi điện", bấm "Tạo Nội Dung" | AI tự động sinh kịch bản gọi điện chi tiết theo chuẩn ABET/Troy |
| **8. Xuất file Excel / CSV** | Vào `/admin/leads`, bấm "Xuất Excel / CSV" | Tải về file `.csv` chuẩn UTF-8 có dấu tiếng Việt không lỗi font |
| **9. Reset dữ liệu mẫu** | Vào `/admin/settings`, bấm "Khôi phục dữ liệu mẫu ban đầu" | Toàn bộ dữ liệu được hoàn nguyên về chuẩn dữ liệu hệ thống |

---

## 📞 THÔNG TIN LIÊN HỆ & BẢO HÀNH HỆ THỐNG
- **Đơn vị:** Trường Đào tạo Quốc tế (VN-US) – Đại học Duy Tân
- **Cơ sở đào tạo:** Tòa G, 120 Hoàng Minh Thảo, P. Hòa Khánh Nam, Q. Liên Chiểu, TP. Đà Nẵng
- **Văn phòng Tuyển sinh:** 254 Nguyễn Văn Linh, P. Thạc Gián, Q. Thanh Khê, TP. Đà Nẵng
- **Hotline Tuyển sinh:** `0979 407 340` | `0888 414141`
- **Website chính thức:** [https://troy.edu.vn](https://troy.edu.vn) | [https://duytan.edu.vn](https://duytan.edu.vn)
