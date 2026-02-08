import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vn' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <h2 style={styles.logo}>Elderly Care</h2>
          {/* Language Toggle */}
          <button onClick={toggleLanguage} style={styles.langButton}>
            {i18n.language === 'en' ? '🇻🇳 VN' : '🇺🇸 EN'}
          </button>
        </div>

        <div style={styles.userSection}>
          {user && (
            <div style={styles.userInfo}>
              <span style={styles.userName}>{t('welcome', { name: user.name })}</span>
              <span style={styles.userEmail}>{user.email}</span>
            </div>
          )}
          <button onClick={handleLogout} style={styles.logoutButton}>
            {t('logout')}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={styles.body}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <NavLink to="/app" end style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {})
          })}>
            {t('dashboard')}
          </NavLink>

          <NavLink to="/app/appointments" style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {})
          })}>
            {t('appointments')}
          </NavLink>

          <NavLink to="/app/medications" style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {})
          })}>
            {t('medications')}
          </NavLink>

          <NavLink to="/app/health" style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {})
          })}>
            {t('health_logs')}
          </NavLink>

          <NavLink to="/app/reminders" style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {})
          })}>
            {t('reminders')}
          </NavLink>

          <NavLink to="/app/reports" style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {})
          })}>
            {t('reports')}
          </NavLink>

          <NavLink to="/app/profile" style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {})
          })}>
            {t('profile')}
          </NavLink>
        </aside>


        {/* Main content */}
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    height: "64px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    backgroundColor: "#2980b9",
    color: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    border: "none",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  langButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.5)",
    color: "white",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
  body: {
    flex: 1,
    display: "flex",
  },
  sidebar: {
    width: "240px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #ddd",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  link: {
    textDecoration: "none",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2c3e50",
    padding: "10px 12px",
    borderRadius: "8px",
  },
  main: {
    flex: 1,
    padding: "30px",
  },
  activeLink: {
    backgroundColor: "#2980b9",
    color: "white",
    padding: "10px 12px",
    borderRadius: "8px",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  userName: {
    fontWeight: "bold",
    fontSize: "16px",
  },
  userEmail: {
    fontSize: "12px",
    opacity: 0.9,
  },
};
