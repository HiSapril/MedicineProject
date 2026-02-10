import { useState } from 'react';
import {
    Bell,
    Calendar,
    Heart,
    Pill,
    Info,
    CheckCheck,
    ChevronDown,
    ChevronUp,
    Clock
} from 'lucide-react';
import './NotificationsPage.css';

// Type definitions
type NotificationType = 'health' | 'medication' | 'appointment' | 'reminder' | 'system';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string; // ISO string or relative time for mock
    isRead: boolean;
    context?: string; // Additional detailed info
}

const NotificationsPage = () => {
    // Mock Data
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'health',
            title: 'Irregular Heart Rate Detected',
            message: 'Your heart rate was slightly higher than usual this morning.',
            timestamp: '10 mins ago',
            isRead: false,
            context: 'Recorded: 95 bpm at 08:30 AM. Suggested Action: Rest and monitor again in 1 hour.'
        },
        {
            id: '2',
            type: 'medication',
            title: 'Missed Medication: Aspirin',
            message: 'You missed your 08:00 AM dose of Aspirin.',
            timestamp: '1 hour ago',
            isRead: false,
            context: 'Please take it as soon as possible if it is not too close to your next dose.'
        },
        {
            id: '3',
            type: 'appointment',
            title: 'Upcoming Appointment Reminder',
            message: 'Dr. Smith (Cardiologist) tomorrow at 10:00 AM.',
            timestamp: '2 hours ago',
            isRead: true,
            context: 'Location: City General Hospital, Room 302. Bring your recent lab reports.'
        },
        {
            id: '4',
            type: 'system',
            title: 'System Maintenance Scheduled',
            message: 'The system will undergo maintenance on Sunday at 2 AM.',
            timestamp: 'Yesterday',
            isRead: true,
            context: 'Downtime is expected to last 30 minutes. Emergency alerts will still function.'
        },
        {
            id: '5',
            type: 'reminder',
            title: 'Drink Water',
            message: 'Time to hydrate! Drink a glass of water.',
            timestamp: 'Yesterday',
            isRead: true,
            context: 'Daily Goal: 8 glasses. Current status: 3/8.'
        }
    ]);

    const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Derived State
    const filteredNotifications = notifications.filter(n => {
        const typeMatch = filterType === 'all' || n.type === filterType;
        const statusMatch = filterStatus === 'all' || (filterStatus === 'unread' ? !n.isRead : n.isRead);
        return typeMatch && statusMatch;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Handlers
    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
        // Optional: Mark as read on expand? 
        // For now, keep it manual or separate logic based on UX preference.
        // Let's mark as read when expanded for better UX:
        markAsRead(id);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    // Icons Mapping
    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'health': return <Heart size={20} />;
            case 'medication': return <Pill size={20} />;
            case 'appointment': return <Calendar size={20} />;
            case 'reminder': return <Bell size={20} />;
            case 'system': return <Info size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const getIconClass = (type: NotificationType) => {
        return `notification-icon icon-${type}`;
    };

    return (
        <div className="notifications-container">
            {/* 1. Header */}
            <header className="notifications-header">
                <h1 className="notifications-title">Notifications</h1>
                <p className="notifications-subtitle">Important updates and system alerts</p>
            </header>

            {/* 2. Filters */}
            <section className="notifications-filters">
                <div className="filter-group">
                    <button
                        className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterType('all')}
                    >All</button>
                    <button
                        className={`filter-btn ${filterType === 'health' ? 'active' : ''}`}
                        onClick={() => setFilterType('health')}
                    >Health</button>
                    <button
                        className={`filter-btn ${filterType === 'medication' ? 'active' : ''}`}
                        onClick={() => setFilterType('medication')}
                    >Meds</button>
                    <button
                        className={`filter-btn ${filterType === 'appointment' ? 'active' : ''}`}
                        onClick={() => setFilterType('appointment')}
                    >Appts</button>
                </div>

                <div className="filter-group">
                    {unreadCount > 0 && (
                        <button className="mark-read-btn" onClick={markAllAsRead}>
                            <CheckCheck size={16} /> Mark all as read
                        </button>
                    )}
                </div>
            </section>

            {/* 3. Notification List */}
            <div className="notification-list">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
                            onClick={() => toggleExpand(notification.id)}
                        >
                            <div className="notification-header-row">
                                <div className={getIconClass(notification.type)}>
                                    {getIcon(notification.type)}
                                </div>

                                <div className="notification-summary">
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-message-preview">
                                        {notification.message}
                                    </div>
                                </div>

                                <div className="notification-meta">
                                    <span className="notification-time">{notification.timestamp}</span>
                                    {!notification.isRead && <div className="unread-dot" />}
                                    {expandedId === notification.id ? <ChevronUp size={16} color="#95a5a6" /> : <ChevronDown size={16} color="#95a5a6" />}
                                </div>
                            </div>

                            {/* 4. Expanded Details */}
                            {expandedId === notification.id && (
                                <div className="notification-details">
                                    <div className="detail-message">
                                        {notification.message}
                                    </div>
                                    {notification.context && (
                                        <div className="detail-meta">
                                            <p><Info size={14} /> {notification.context}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <Bell size={64} opacity={0.1} />
                        <p>You're all caught up! No notifications to show.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
