import { useState, useEffect } from 'react';
import {
    Bell,
    Globe,
    Eye,
    Shield,
    Smartphone,
    Check,
    Monitor,
    LogOut
} from 'lucide-react';
import './SettingsPage.css';

// Types
interface SettingsState {
    notifications: {
        all: boolean;
        appointments: boolean;
        medications: boolean;
        health: boolean;
        system: boolean;
        reminderTime: 'early' | 'ontime' | 'late';
    };
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
}

const SettingsPage = () => {
    // Initial State (Mock)
    const [settings, setSettings] = useState<SettingsState>({
        notifications: {
            all: true,
            appointments: true,
            medications: true,
            health: true,
            system: true,
            reminderTime: 'ontime'
        },
        display: {
            language: 'en',
            fontSize: 'normal',
            theme: 'light'
        },
        accessibility: {
            highContrast: false,
            largeButtons: false,
            reducedMotion: false
        },
        system: {
            defaultLanding: 'dashboard',
            autoLogout: true,
            sessionDuration: '30m'
        }
    });

    const [showSaved, setShowSaved] = useState(false);

    // Effect to auto-save (mock)
    useEffect(() => {
        // Debounce save or save on change
        // For UX feedback:
        const timer = setTimeout(() => setShowSaved(true), 500);
        const hideTimer = setTimeout(() => setShowSaved(false), 2500);
        return () => {
            clearTimeout(timer);
            clearTimeout(hideTimer);
        }
    }, [settings]);

    // Handlers
    const toggleNotification = (key: Exclude<keyof SettingsState['notifications'], 'reminderTime'>) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const updateNotification = (key: keyof SettingsState['notifications'], value: any) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value
            }
        }));
    }

    const updateDisplay = (key: keyof SettingsState['display'], value: any) => {
        setSettings(prev => ({
            ...prev,
            display: {
                ...prev.display,
                [key]: value
            }
        }));
    };

    const toggleAccessibility = (key: keyof SettingsState['accessibility']) => {
        setSettings(prev => ({
            ...prev,
            accessibility: {
                ...prev.accessibility,
                [key]: !prev.accessibility[key]
            }
        }));
    };

    const updateSystem = (key: keyof SettingsState['system'], value: any) => {
        setSettings(prev => ({
            ...prev,
            system: {
                ...prev.system,
                [key]: value
            }
        }));
    };

    return (
        <div className="settings-container">
            {/* Header */}
            <header className="settings-header">
                <h1 className="settings-title">Settings</h1>
                <p className="settings-subtitle">Customize how the system works for you</p>
            </header>

            {/* Notification Settings */}
            <section className="settings-section">
                <div className="section-header">
                    <div className="section-icon"><Bell size={20} /></div>
                    <div className="section-title-group">
                        <h2>Notifications</h2>
                        <p>Manage your alerts and reminders</p>
                    </div>
                </div>
                <div className="section-body">
                    <div className="setting-item">
                        <div>
                            <div className="setting-label">Enable All Notifications</div>
                            <div className="setting-description">Master switch for all alerts</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.notifications.all}
                                onChange={() => toggleNotification('all')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    {settings.notifications.all && (
                        <>
                            <div className="setting-item">
                                <div>
                                    <div className="setting-label">Appointment Reminders</div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.appointments}
                                        onChange={() => toggleNotification('appointments')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div>
                                    <div className="setting-label">Medication Alerts</div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.medications}
                                        onChange={() => toggleNotification('medications')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div>
                                    <div className="setting-label">Health Monitoring Alerts</div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications.health}
                                        onChange={() => toggleNotification('health')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div>
                                    <div className="setting-label">Reminder Timing Preference</div>
                                    <div className="setting-description">When do you want to be notified?</div>
                                </div>
                                <select
                                    className="setting-select"
                                    value={settings.notifications.reminderTime}
                                    onChange={(e) => updateNotification('reminderTime', e.target.value)}
                                >
                                    <option value="early">Early (30 mins before)</option>
                                    <option value="ontime">On Time</option>
                                    <option value="late">Persistent (Late)</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </section>

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
                            value={settings.display.language}
                            onChange={(e) => updateDisplay('language', e.target.value)}
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
                            value={settings.display.fontSize}
                            onChange={(e) => updateDisplay('fontSize', e.target.value)}
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
                                checked={settings.accessibility.highContrast}
                                onChange={() => toggleAccessibility('highContrast')}
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
                                checked={settings.accessibility.largeButtons}
                                onChange={() => toggleAccessibility('largeButtons')}
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
                                checked={settings.accessibility.reducedMotion}
                                onChange={() => toggleAccessibility('reducedMotion')}
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
                            value={settings.system.defaultLanding}
                            onChange={(e) => updateSystem('defaultLanding', e.target.value)}
                        >
                            <option value="dashboard">Dashboard</option>
                            <option value="appointments">Appointments</option>
                            <option value="medications">Medications</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Security */}
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
                                checked={settings.system.autoLogout}
                                onChange={() => updateSystem('autoLogout', !settings.system.autoLogout)}
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

            {/* Saved Toast */}
            {showSaved && (
                <div className="saved-toast">
                    <Check size={18} /> Settings Saved
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
