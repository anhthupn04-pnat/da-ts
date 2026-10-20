# Quy Trình Tự Động Hóa Triển Khai & Báo Cáo Kết Quả (Git & Vercel)

Sau mỗi lần hoàn thành chỉnh sửa hoặc tối ưu code trong dự án:

1. **Kiểm tra chất lượng code & build**:
   - Chạy `npm run build` hoặc kiểm tra type-check/linter để đảm bảo mã nguồn biên dịch thành công 100%, không phát sinh lỗi cú pháp hay gãy build production.

2. **Tự động Commit & Push lên Remote Git**:
   - Tự động thực hiện staging toàn bộ thay đổi: `git add .`
   - Tạo commit với message rõ ràng, chuẩn Conventional Commits (ví dụ: `feat: ...`, `fix: ...`, `refactor: ...`): `git commit -m "..."`
   - Đẩy lên nhánh remote hiện tại: `git push origin <branch>` (mặc định: `main`).

3. **Kích hoạt & Giám sát Triển khai Vercel**:
   - Khi push lên GitHub (`main`), GitHub Webhook sẽ tự động kích hoạt tiến trình Build & Deploy trên Vercel.
   - Nếu cần kích hoạt trực tiếp từ CLI: sử dụng lệnh `npx vercel --prod --yes`.

4. **Báo cáo Kết quả cho Người dùng**:
   - Sau khi hoàn tất mỗi lần chỉnh sửa và deploy thành công, luôn phản hồi lại với:
     - **Link Production Live Vercel**: [https://da-ts.vercel.app/](https://da-ts.vercel.app/)
     - **Tóm tắt ngắn gọn** các điểm vừa sửa đổi / bổ sung / tối ưu.
