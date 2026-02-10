import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            "dashboard": "Dashboard",
            "appointments": "Appointments",
            "medications": "Medications",
            "health_logs": "Health Logs",
            "reminders": "Reminders",
            "notifications": "Notifications",
            "profile": "Profile",
            "reports": "Reports",
            "settings": "Settings",
            "logout": "Logout",
            "welcome": "Welcome back, {{name}}",
            "meds_active": "Active Prescriptions",
            "next_visit": "Next Visit",
            "tasks_today": "Tasks for Today",
            "upcoming_reminders": "Upcoming Reminders",
            "calendar": "Calendar",
            "view_all": "View All"
        }
    },
    vn: {
        translation: {
            "dashboard": "Trang chủ",
            "appointments": "Lịch hẹn",
            "medications": "Thuốc",
            "health_logs": "Sức khỏe",
            "reminders": "Nhắc nhở",
            "notifications": "Thông báo",
            "profile": "Hồ sơ",
            "reports": "Báo cáo",
            "settings": "Cài đặt",
            "logout": "Đăng xuất",
            "welcome": "Chào mừng, {{name}}",
            "meds_active": "Đơn thuốc đang dùng",
            "next_visit": "Lịch khám tới",
            "tasks_today": "Việc hôm nay",
            "upcoming_reminders": "Nhắc nhở sắp tới",
            "calendar": "Lịch",
            "view_all": "Xem tất cả"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
