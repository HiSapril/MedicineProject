# BÁO CÁO TỔNG QUAN HỆ THỐNG ELDERLY CARE REMINDER

## 1. Tổng quan hệ thống
Hệ thống **Elderly Care Reminder** là giải pháp hỗ trợ người cao tuổi quản lý lịch uống thuốc, khám bệnh và tập luyện. Hệ thống kết nối giữa người cao tuổi (sử dụng Mobile App) và người chăm sóc (sử dụng Web App) thông qua nền tảng Backend Microservices mạnh mẽ.

## 2. Kiến trúc hệ thống
Hệ thống được thiết kế theo các mẫu kiến trúc hiện đại:

### 2.1 Microservices Architecture
- Hệ thống chia nhỏ thành các dịch vụ độc lập theo nghiệp vụ (Domain-Driven Design).
- Mỗi dịch vụ có cơ sở dữ liệu riêng, đảm bảo tính tách biệt và dễ dàng mở rộng.
- Giao tiếp giữa Client và Backend đi qua một cổng duy nhất là **API Gateway**.

### 2.2 Event-Driven Architecture (EDA)
- Giao tiếp bất đồng bộ giữa các dịch vụ Backend sử dụng **RabbitMQ**.
- Giúp giảm sự phụ thuộc (decoupling) giữa các dịch vụ, ví dụ: khi tạo lịch thuốc, Service không cần gọi trực tiếp Service Thông báo mà chỉ cần gửi sự kiện.

## 3. Thành phần chi tiết

### 3.1 Frontend Service (Web Client)
- **Công nghệ**: React 19, TypeScript, Vite.
- **Vai trò**: Dành cho người chăm sóc (Caregivers/Doctors).
- **Chức năng chính**:
  - Quản lý danh sách thuốc, lịch uống thuốc.
  - Đặt lịch khám bệnh.
  - Xem nhật ký sức khỏe và trạng thái uống thuốc của người già.
- **State Management**: Context API (AuthContext).
- **Routing**: React Router DOM.

### 3.2 Mobile Service (Mobile Client)
- **Công nghệ**: Flutter.
- **Vai trò**: Dành cho người cao tuổi.
- **Chức năng chính**:
  - Nhận thông báo nhắc nhở (uống thuốc, đi khám).
  - Xác nhận đã uống thuốc/đã đi khám.
  - Xem lịch trình sắp tới.
- **Đặc điểm**: Giao diện đơn giản, chữ to, dễ thao tác.

### 3.3 Backend Services (.NET)
Hệ thống Backend bao gồm các dịch vụ chính:

| Tên Dịch vụ | Nhiệm vụ |
|-------------|----------|
| **API Gateway** | Cổng vào duy nhất, điều hướng request, xác thực (Authentication), giới hạn truy cập (Rate Limiting). |
| **Auth Service** | Quản lý đăng ký, đăng nhập, cấp JWT Token. |
| **Medication Service** | Quản lý danh mục thuốc và lịch trình uống thuốc. |
| **Appointment Service** | Quản lý lịch hẹn khám bệnh. |
| **Reminder Service** | Tính toán thời gian và sinh ra các sự kiện nhắc nhở. |
| **Notification Service** | Gửi thông báo (Push/FCM) đến Mobile App. |
| **Health Tracking Service** | Lưu trữ các chỉ số sức khỏe (huyết áp, nhịp tim...). |

## 4. Công nghệ & Công cụ (Tech Stack)

### Frontend & Mobile
*   **React (Vite)**: Xây dựng Web App nhanh, nhẹ.
*   **TypeScript**: Đảm bảo type-safe, giảm lỗi runtime.
*   **Flutter**: Cross-platform cho Mobile.

### Backend & Infrastructure
*   **.NET 8**: Nền tảng chính cho các Microservices.
*   **SQL Server / PostgreSQL**: Database cho từng service.
*   **RabbitMQ**: Message Broker xử lý sự kiện bất đồng bộ.
*   **Redis**: Caching và lưu trạng thái tạm thời (Distributed Cache).
*   **Docker**: Container hóa dịch vụ (giả định dựa trên kiến trúc Microservices).

## 5. Luồng xử lý chính (Key Flows)

### 5.1 Luồng Xác thực (Authentication)
1.  Client gửi User/Pass -> **API Gateway**.
2.  Gateway chuyển tin đến **Auth Service**.
3.  Auth Service kiểm tra DB -> Trả về **JWT Token**.
4.  Client lưu Token và gửi kèm trong Header các request sau.

### 5.2 Luồng Nhắc nhở (Reminder Flow)
1.  Người chăm sóc tạo lịch uống thuốc trên **Web App**.
2.  **Medication Service** lưu DB -> Gửi sự kiện `MedicationCreated` vào RabbitMQ.
3.  **Reminder Service** nhận sự kiện -> Tính toán lịch nhắc -> Lưu vào DB Reminder.
4.  Đến giờ hẹn, Reminder Service gửi sự kiện `ReminderDue`.
5.  **Notification Service** nhận sự kiện -> Gửi Push Notification đến **Mobile App**.
6.  Người già bấm "Đã uống" trên Mobile -> Gửi xác nhận về Backend -> Cập nhật trạng thái.

## 6. Kết luận
Hệ thống có kiến trúc rõ ràng, tuân thủ các nguyên tắc thiết kế phần mềm tốt (SOLID, Separation of Concerns). Việc sử dụng Microservices và Event-Driven giúp hệ thống linh hoạt, dễ bảo trì và mở rộng trong tương lai.
