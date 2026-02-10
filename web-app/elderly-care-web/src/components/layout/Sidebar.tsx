import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Calendar,
  Pill,
  Activity,
  Bell,
  BellRing,
  FileText,
  User,
  Settings
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/app" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>{t('dashboard')}</span>
        </NavLink>

        <NavLink to="/app/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>{t('appointments')}</span>
        </NavLink>

        <NavLink to="/app/medications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Pill size={20} />
          <span>{t('medications')}</span>
        </NavLink>

        <NavLink to="/app/health" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Activity size={20} />
          <span>{t('health_logs')}</span>
        </NavLink>

        <NavLink to="/app/reminders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Bell size={20} />
          <span>{t('reminders')}</span>
        </NavLink>

        <NavLink to="/app/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BellRing size={20} />
          <span>{t('notifications')}</span>
        </NavLink>

        <NavLink to="/app/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>{t('reports')}</span>
        </NavLink>

        <div className="sidebar-divider"></div>

        <NavLink to="/app/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>{t('profile')}</span>
        </NavLink>

        <NavLink to="/app/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>{t('settings')}</span>
        </NavLink>
      </nav>
    </aside>
  );
}
