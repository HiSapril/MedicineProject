import { Bell } from 'lucide-react';

interface NotificationSettingsProps {
    notifications: {
        all: boolean;
        appointments: boolean;
        medications: boolean;
        health: boolean;
        system: boolean;
        reminderTime: 'early' | 'ontime' | 'late';
    };
    onToggle: (key: string) => void;
    onUpdate: (key: string, value: any) => void;
}

const NotificationSettings = ({ notifications, onToggle, onUpdate }: NotificationSettingsProps) => {
    return (
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
                            checked={notifications.all}
                            onChange={() => onToggle('all')}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                {notifications.all && (
                    <>
                        <div className="setting-item">
                            <div>
                                <div className="setting-label">Appointment Reminders</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.appointments}
                                    onChange={() => onToggle('appointments')}
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
                                    checked={notifications.medications}
                                    onChange={() => onToggle('medications')}
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
                                    checked={notifications.health}
                                    onChange={() => onToggle('health')}
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
                                value={notifications.reminderTime}
                                onChange={(e) => onUpdate('reminderTime', e.target.value)}
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
    );
};

export default NotificationSettings;
