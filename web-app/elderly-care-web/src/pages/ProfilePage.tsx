import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User as UserIcon,
  ShieldCheck,
  Globe,
  Lock,
  LogOut,
  CheckCircle2,
  Clock,
  ChevronRight
} from "lucide-react";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [language, setLanguage] = useState("English");
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading-card">Loading profile identity...</div>
      </div>
    );
  }

  const isElderly = String(user.role) === "0";

  const handleSave = () => {
    // In a real app, this would call an API
    // For now, we update local state and show a confirmation
    setShowSavedMsg(true);
    setIsEditing(false);
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  return (
    <div className="profile-container">
      {/* 1️⃣ Profile Header (Identity Anchor) */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="profile-name-title">{name}</h1>
          <div className={`role-badge-large ${isElderly ? 'role-badge-elderly' : 'role-badge-caregiver'}`}>
            <ShieldCheck size={16} />
            {isElderly ? "Elderly User" : "Caregiver"}
          </div>
        </div>

        {/* 2️⃣ Personal Information Section */}
        <section className="profile-section">
          <div className="section-title">
            <UserIcon size={20} className="section-icon" />
            <h2>Personal Information</h2>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <label className="info-label">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="info-value"
                />
              ) : (
                <div className="info-value editable" onClick={() => setIsEditing(true)}>
                  {name}
                </div>
              )}
            </div>

            <div className="info-item">
              <label className="info-label">Email Address</label>
              <div className="info-value read-only">
                {user.email}
              </div>
            </div>

            <div className="info-item">
              <label className="info-label">Preferred Language</label>
              <select
                className="info-value"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save Changes</button>
            </div>
          )}

          {showSavedMsg && (
            <div style={{ marginTop: '10px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
              <CheckCircle2 size={16} /> Changes saved successfully
            </div>
          )}
        </section>

        {/* 3️⃣ Role & Permissions Overview (Read-only) */}
        <section className="profile-section">
          <div className="section-title">
            <ShieldCheck size={20} className="section-icon" />
            <h2>Role & Permissions</h2>
          </div>

          <div className="permissions-list">
            <p style={{ marginBottom: '15px', color: '#2c3e50', fontWeight: 600 }}>
              Your account has the <span style={{ color: '#3498db' }}>{isElderly ? "Elderly" : "Caregiver"}</span> role.
            </p>

            {isElderly ? (
              <div className="permission-grid">
                <div className="permission-entry">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Receive reminders for medications and appointments.</span>
                </div>
                <div className="permission-entry">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Confirm medication intake and appointment attendance.</span>
                </div>
                <div className="permission-entry">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>View personal health tracking and logs.</span>
                </div>
              </div>
            ) : (
              <div className="permission-grid">
                <div className="permission-entry">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Manage medications, schedules, and appointments.</span>
                </div>
                <div className="permission-entry">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Monitor health data and receive missed reminder alerts.</span>
                </div>
                <div className="permission-entry">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Access system-wide reports and logs.</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4️⃣ Preferences Section (Non-Identity) */}
        <section className="profile-section">
          <div className="section-title">
            <Globe size={20} className="section-icon" />
            <h2>User Preferences</h2>
          </div>

          <div className="preference-grid">
            <div className="preference-card">
              <div className="preference-info">
                <span className="preference-label">Notifications</span>
                <span className="preference-desc">Enable notifications for upcoming tasks</span>
              </div>
              <input type="checkbox" defaultChecked />
            </div>

            <div className="preference-card">
              <div className="preference-info">
                <span className="preference-label">High Contrast Mode</span>
                <span className="preference-desc">Increase visibility of text and elements</span>
              </div>
              <input type="checkbox" />
            </div>

            <div className="preference-card">
              <div className="preference-info">
                <span className="preference-label">Large Text</span>
                <span className="preference-desc">Increase font size across all pages</span>
              </div>
              <input type="checkbox" />
            </div>
          </div>
        </section>

        {/* 5️⃣ Security Awareness Section */}
        <section className="profile-section">
          <div className="section-title">
            <Lock size={20} className="section-icon" />
            <h2>Security</h2>
          </div>

          <div className="preference-grid">
            <div className="preference-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color="#7f8c8d" />
                <div className="preference-info">
                  <span className="preference-label">Last Login</span>
                  <span className="preference-desc">{new Date().toLocaleString()} (Current Session)</span>
                </div>
              </div>
            </div>

            <div className="preference-card" style={{ cursor: 'pointer' }} onClick={() => logout()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LogOut size={20} color="#e74c3c" />
                <div className="preference-info">
                  <span className="preference-label" style={{ color: '#e74c3c' }}>Sign Out</span>
                  <span className="preference-desc">Securely exit your session</span>
                </div>
              </div>
              <ChevronRight size={16} color="#7f8c8d" />
            </div>
          </div>
        </section>
      </div>

      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', paddingBottom: '20px' }}>
        System Identity ID: {user.id} • Version 1.0.4
      </div>
    </div>
  );
};

export default ProfilePage;
