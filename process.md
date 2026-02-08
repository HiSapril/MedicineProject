# NHẬT KÝ TIẾN TRÌNH DỰ ÁN (PROJECT PROCESS LOG)

File này ghi lại các cập nhật, chỉnh sửa và các mốc quan trọng trong quá trình phát triển dự án **Elderly Care Reminder**.

---

## 📅 Ngày: 06/02/2026

### 🕒 16:15 - Tạo Báo Cáo Tổng Quan Hệ Thống
- **Hành động**: Tạo file `Bao_cao.md`.
- **Nội dung**: Tổng hợp kiến trúc Microservices, Event-Driven Architecture, Tech Stack (React, .NET, Flutter, RabbitMQ), và các luồng xử lý chính.
- **Mục đích**: Cung cấp tài liệu tổng quan phục vụ báo cáo và tham khảo.

### 🕒 16:05 - Fix Lỗi TypeScript Trang Đăng Nhập
- **Vấn đề**: Lỗi `Object literal may only specify known properties` tại `LoginPage.tsx`.
- **Nguyên nhân**: `LoginPage` truyền object có cấu trúc lồng nhau `{ user: { ... } }` trong khi `AuthContext` mong đợi cấu trúc phẳng từ API response.
- **Giải pháp**: Cập nhật hàm `handleLogin` để truyền trực tiếp `response.data` vào `authContext.login()`.
- **Kết quả**: Đã fix lỗi biên dịch và logic đăng nhập.

### 🕒 16:40 - Hoàn thành Phase 1
- **Navigation**: Cập nhật Header hiển thị tên và email người dùng (`AppLayout.tsx`).
- **Profile Page**: Triển khai trang thông tin cá nhân hiện đại (`ProfilePage.tsx`).
- **Health Charts**: Tích hợp `recharts`, vẽ biểu đồ Huyết áp/Nhịp tim trong `HealthPage.tsx`.
- **Validation**: Chặn đặt lịch khám trong quá khứ tại `AppointmentsPage.tsx`.

### 🕒 16:55 - Hoàn thành Phase 2
- **Smart Notifications**: Thay thế `alert()` bằng `react-toastify` cho trải nghiệm mượt mà.
- **Dashboard Widgets**: Thêm các thẻ thống kê (Thuốc, Lịch khám, Việc cần làm) tại Dashboard.
- **Calendar View**: Tích hợp `react-calendar` hiển thị lịch khám trực quan.

### 🕒 17:15 - Hoàn thành Phase 3
- **Export Reports**: Thêm trang `ReportPage`, cho phép xuất PDF danh sách thuốc và nhật ký sức khỏe.
- **Internationalization**: Đa ngôn ngữ (Anh/Việt), chuyển đổi tức thì tại Header.
- **Code Refactor**: Tách cấu hình i18n ra file riêng, dọn dẹp import.

---

## 📅 Các cập nhật trước đó

### Cấu hình dự án & Môi trường
- Thiết lập cấu trúc Monorepo: `backend`, `web-app`, `mobile-app`.
- Cấu hình **Vite** cho Web App (React + TypeScript).
- Cấu hình **Microservices** cơ bản (.NET 8).
- Thiết lập tài liệu kiến trúc trong thư mục `architecture/`.

---
*Ghi chú: File này sẽ được cập nhật liên tục mỗi khi có thay đổi quan trọng trong dự án.*
