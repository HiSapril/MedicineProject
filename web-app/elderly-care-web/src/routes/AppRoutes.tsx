import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import AuthGuard from "./AuthGuard";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import AppointmentsPage from "../pages/AppointmentsPage";
import MedicationsPage from "../pages/MedicationsPage";
import HealthPage from "../pages/HealthPage";
import RemindersPage from "../pages/RemindersPage";
import ReportPage from "../pages/ReportPage";
import ProfilePage from "../pages/ProfilePage";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route element={<AuthGuard />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="medications" element={<MedicationsPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="reports" element={<ReportPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
