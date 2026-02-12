import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import './SettingsPage.css';

// Sub-components
import NotificationSettings from '../../components/settings/NotificationSettings';
import PreferenceSettings from '../../components/settings/PreferenceSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';

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

export const SettingsPage = () => {
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
        const timer = setTimeout(() => setShowSaved(true), 500);
        const hideTimer = setTimeout(() => setShowSaved(false), 2500);
        return () => {
            clearTimeout(timer);
            clearTimeout(hideTimer);
        }
    }, [settings]);

    // Handlers
    const toggleNotification = (key: any) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key as keyof SettingsState['notifications']]
            }
        }));
    };

    const updateNotification = (key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value
            }
        }));
    }

    const updateDisplay = (key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            display: {
                ...prev.display,
                [key]: value
            }
        }));
    };

    const toggleAccessibility = (key: string) => {
        setSettings(prev => ({
            ...prev,
            accessibility: {
                ...prev.accessibility,
                [key]: !prev.accessibility[key as keyof SettingsState['accessibility']]
            }
        }));
    };

    const updateSystem = (key: string, value: any) => {
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

            <NotificationSettings
                notifications={settings.notifications}
                onToggle={toggleNotification}
                onUpdate={updateNotification}
            />

            <PreferenceSettings
                display={settings.display}
                accessibility={settings.accessibility}
                system={settings.system}
                onUpdateDisplay={updateDisplay}
                onToggleAccessibility={toggleAccessibility}
                onUpdateSystem={updateSystem}
            />

            <SecuritySettings
                autoLogout={settings.system.autoLogout}
                onToggleAutoLogout={() => updateSystem('autoLogout', !settings.system.autoLogout)}
            />

            {/* Saved Toast */}
            {showSaved && (
                <div className="saved-toast">
                    <Check size={18} /> Settings Saved
                </div>
            )}
        </div>
    );
};
