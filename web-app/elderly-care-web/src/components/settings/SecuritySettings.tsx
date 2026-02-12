import { Shield, LogOut } from 'lucide-react';

interface SecuritySettingsProps {
    autoLogout: boolean;
    onToggleAutoLogout: () => void;
}

const SecuritySettings = ({ autoLogout, onToggleAutoLogout }: SecuritySettingsProps) => {
    return (
        <section className="settings-section">
            <div className="section-header">
                <div className="section-icon"><Shield size={20} /></div>
                <div className="section-title-group">
                    <h2>Security</h2>
                    <p>Session and privacy controls</p>
                </div>
            </div>
            <div className="section-body">
                <div className="setting-item">
                    <div>
                        <div className="setting-label">Auto Logs Out</div>
                        <div className="setting-description">Sign out automatically after inactivity</div>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={autoLogout}
                            onChange={onToggleAutoLogout}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button className="action-btn btn-danger">
                        <LogOut size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                        Log Out All Devices
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SecuritySettings;
