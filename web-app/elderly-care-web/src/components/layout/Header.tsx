import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vn' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h2 className="app-logo">Elderly Care</h2>
        <button onClick={toggleLanguage} className="lang-button">
          {i18n.language === 'en' ? '🇻🇳 VN' : '🇺🇸 EN'}
        </button>
      </div>

      <div className="header-right">
        {user && (
          <div className="user-info">
            <span className="user-name">{t('welcome', { name: user.name })}</span>
            <span className="user-email">{user.email}</span>
          </div>
        )}
        <button onClick={handleLogout} className="logout-button">
          {t('logout')}
        </button>
      </div>
    </header>
  );
}
