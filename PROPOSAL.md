# ĐỀ XUẤT PHÁT TRIỂN & HOÀN THIỆN WEB APP

Dựa trên phân tích mã nguồn hiện tại và tài liệu kiến trúc, dưới đây là báo cáo đánh giá và lộ trình đề xuất để xây dựng trang web **Elderly Care** thành một hệ thống toàn diện.

## 1. Đánh giá hiện trạng (Current State)

### ✅ Đã hoàn thành (Strengths)
*   **Kiến trúc**: Cấu trúc thư mục rõ ràng, tuân thủ tách biệt API và UI.
*   **Chức năng cơ bản**: Đã có các trang quản lý chính: Thuốc, Lịch khám, Nhật ký sức khỏe, Nhắc nhở.
*   **Integrations**: Đã kết nối API đầy đủ cho các tính năng trên.
*   **Dashboard**: Đã có Dashboard hiển thị tóm tắt thông tin.

### ⚠️ Điểm thiếu sót (Gaps)
1.  **Trải nghiệm người dùng (UX)**:
    *   Trang `HomePage.tsx` hiện tại là Landing Page giới thiệu, chưa tự động điều hướng vào App sau khi đăng nhập.
    *   `ProfilePage.tsx` hoàn toàn trống.
    *   Giao diện còn cơ bản, chưa tận dụng biểu đồ trực quan (Charts).
2.  **Tính năng nâng cao**:
    *   Chưa có biểu đồ theo dõi chỉ số sức khỏe (Health Trends) - một tính năng quan trọng cho Web Client theo rules.
    *   Thiếu chức năng xuất báo cáo (Export PDF/Excel) cho bác sĩ.
    *   Chưa có thông báo thời gian thực (Real-time) trên web khi người già uống thuốc.
3.  **Xử lý lỗi & Validation**: Hiện tại thông báo lỗi chủ yếu dùng `alert` hoặc text đơn giản, chưa chuyên nghiệp.

---

## 2. Kế hoạch triển khai (Roadmap)

### Giai đoạn 1: Hoàn thiện tính năng lõi (Immediate Actions)
*Mục tiêu: Đảm bảo đầy đủ chức năng cơ bản và trải nghiệm liền mạch.*

- [ ] **Implement Profile Page**: Hiển thị thông tin người dùng, đổi mật khẩu, xem vai trò (Caregiver/Admin).
- [ ] **Fix Navigation Flow**: Sau khi đăng nhập, chuyển hướng thẳng đến Dashboard thay vì Home. Cập nhật Header để hiển thị Avatar/Tên người dùng.
- [ ] **Health Charts**: Tích hợp thư viện biểu đồ (ví dụ: `recharts` hoặc `chart.js`) vào `HealthPage` để vẽ biểu đồ Huyết áp/Nhịp tim theo thời gian.
- [ ] **Enhance Validation**: Thêm validation tin cậy hơn cho các form (ví dụ: ngày hẹn không được ở quá khứ).

### Giai đoạn 2: Nâng cấp trải nghiệm (UI/UX Polish)
*Mục tiêu: Giao diện chuyên nghiệp, thân thiện.*

- [ ] **Dashboard Widgets**: Nâng cấp Dashboard thành các thẻ tóm tắt (Ví dụ: "3 thuốc cần uống sáng nay", "Lịch khám: 2 ngày tới").
- [ ] **Smart Notifications**: Thêm Toast Notification (góc màn hình) thay vì `alert()` browser gây khó chịu.
- [ ] **Calendar View**: Hiển thị lịch uống thuốc/khám bệnh dưới dạng Lịch tháng (Calendar UI) thay vì list thuần túy.

### Giai đoạn 3: Tính năng mở rộng (Future features)
*Mục tiêu: Trở thành hệ thống toàn diện cao cấp.*

- [ ] **Export Reports**: Tạo nút "Xuất báo cáo sức khỏe" để in ra giấy mang đi khám bệnh.
- [ ] **Real-time Sync**: Sử dụng SignalR để Web App nhận thông báo ngay lập tức khi người già bấm "Đã uống thuốc" trên Mobile App.
- [ ] **Multi-language**: Hỗ trợ Tiếng Việt/Tiếng Anh hoàn chỉnh.

---

## 3. Khuyến nghị công nghệ (Tech Recommendations)
Để thực hiện lộ trình trên, đề xuất thêm một số thư viện nhẹ:
1.  **Biểu đồ**: sử dụng `recharts` (nhẹ, dễ dùng với React).
2.  **Lịch**: sử dụng `react-calendar` hoặc `fullcalendar`.
3.  **Thông báo**: sử dụng `react-toastify` hoặc `sonner` để hiển thị thông báo đẹp.
4.  **Form**: Giữ nguyên state cơ bản để đơn giản, hoặc dùng `react-hook-form` nếu form trở nên phức tạp.
