import { Globe, Eye, Monitor } from 'lucide-react';

interface PreferenceSettingsProps {
    display: {
        language: 'en' | 'vi';
        fontSize: 'normal' | 'large' | 'xl';
        theme: 'light' | 'contrast';
    };
    accessibility: {
        highContrast: boolean;
        largeButtons: boolean;
        reducedMotion: boolean;
    };
    system: {
        defaultLanding: 'dashboard' | 'appointments' | 'medications';
        autoLogout: boolean;
        sessionDuration: '15m' | '30m' | '1h';
    };
    onUpdateDisplay: (key: string, value: any) => void;
    onToggleAccessibility: (key: string) => void;
    onUpdateSystem: (key: string, value: any) => void;
}

const PreferenceSettings = ({
    display,
    accessibility,
    system,
    onUpdateDisplay,
    onToggleAccessibility,
    onUpdateSystem
}: PreferenceSettingsProps) => {
    return (
        <>
            {/* Language & Display */}
            <section className="settings-section">
                <div className="section-header">
                    <div className="section-icon"><Globe size={20} /></div>
                    <div className="section-title-group">
                        <h2>Language & Display</h2>
                        <p>Customize your viewing experience</p>
                    </div>
                </div>
                <div className="section-body">
                    <div className="setting-item">
                        <div>
                            <div className="setting-label">Language</div>
                        </div>
                        <select
                            className="setting-select"
                            value={display.language}
                            onChange={(e) => onUpdateDisplay('language', e.target.value)}
                        >
                            <option value="en">English (US)</option>
                            <option value="vi">Tiếng Việt</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <div>
                            <div className="setting-label">Font Size</div>
                        </div>
                        <select
                            className="setting-select"
                            value={display.fontSize}
                            onChange={(e) => onUpdateDisplay('fontSize', e.target.value)}
                        >
                            <option value="normal">Normal</option>
                            <option value="large">Large</option>
                            <option value="xl">Extra Large</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Accessibility */}
            <section className="settings-section">
                <div className="section-header">
                    <div className="section-icon"><Eye size={20} /></div>
                    <div className="section-title-group">
                        <h2>Accessibility</h2>
                        <p>Tools for easier navigation</p>
                    </div>
                </div>
                <div className="section-body">
                    <div className="setting-item">
                        <div>
                            <div className="setting-label">High Contrast Mode</div>
                            <div className="setting-description">Increases difference between text and background</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={accessibility.highContrast}
                                onChange={() => onToggleAccessibility('highContrast')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="setting-item">
                        <div>
                            <div className="setting-label">Larger Buttons</div>
                            <div className="setting-description">Make clickable areas bigger</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={accessibility.largeButtons}
                                onChange={() => onToggleAccessibility('largeButtons')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="setting-item">
                        <div>
                            <div className="setting-label">Reduced Motion</div>
                            <div className="setting-description">Minimize animations across the app</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={accessibility.reducedMotion}
                                onChange={() => onToggleAccessibility('reducedMotion')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </section>

            {/* System Preferences */}
            <section className="settings-section">
                <div className="section-header">
                    <div className="section-icon"><Monitor size={20} /></div>
                    <div className="section-title-group">
                        <h2>System Preferences</h2>
                        <p>General behavior settings</p>
                    </div>
                </div>
                <div className="section-body">
                    <div className="setting-item">
                        <div>
                            <div className="setting-label">Default Landing Page</div>
                            <div className="setting-description">Page to show after login</div>
                        </div>
                        <select
                            className="setting-select"
                            value={system.defaultLanding}
                            onChange={(e) => onUpdateSystem('defaultLanding', e.target.value)}
                        >
                            <option value="dashboard">Dashboard</option>
                            <option value="appointments">Appointments</option>
                            <option value="medications">Medications</option>
                        </select>
                    </div>
                </div>
            </section>
        </>
    );
};

export default PreferenceSettings;
