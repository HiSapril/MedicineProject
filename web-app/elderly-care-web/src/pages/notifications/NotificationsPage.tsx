import { useEffect, useState, useMemo } from 'react';
import {
    notificationApi,
    type Notification,
    type NotificationDetail,
    NotificationStatus
} from '../../api/notification.api';
import { useAuth } from '../../context/AuthContext';
import NotificationCard from '../../components/notification/NotificationCard';
import NotificationDetailModal from '../../components/notification/NotificationDetailModal';
import {
    Bell,
    CheckCircle2,
    Clock as ClockIcon,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import './NotificationsPage.css';

export const NotificationsPage = () => {
    // --- Auth ---
    const { user } = useAuth();

    // --- State ---
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPastCollapsed, setIsPastCollapsed] = useState(true);
    const [detailModal, setDetailModal] = useState<NotificationDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [actioningId, setActioningId] = useState<string | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        if (user?.id) {
            fetchNotifications(); // Initial load

            // Auto-refresh every 5 seconds
            const intervalId = setInterval(() => {
                fetchNotifications(true); // Silent refresh
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [user?.id]);

    const fetchNotifications = async (isSilent = false) => {
        if (!user?.id) return;

        if (!isSilent) setLoading(true);
        try {
            const response = await notificationApi.getNotifications(user.id);
            const sorted = response.data.sort(
                (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
            );
            setNotifications(sorted);
            setError('');
        } catch (err) {
            console.error(err);
            if (!isSilent) setError('Unable to load notifications. Please check your connection.');
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    // --- Temporal Grouping ---
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groupedNotifications = useMemo(() => {
        const todayNotifs: Notification[] = [];
        const yesterdayNotifs: Notification[] = [];
        const past7DaysNotifs: Notification[] = [];
        const olderNotifs: Notification[] = [];

        notifications.forEach(notif => {
            const sentDate = new Date(notif.sentAt);
            const sentDay = new Date(sentDate.getFullYear(), sentDate.getMonth(), sentDate.getDate());

            if (sentDay.getTime() === today.getTime()) {
                todayNotifs.push(notif);
            } else if (sentDay.getTime() === yesterday.getTime()) {
                yesterdayNotifs.push(notif);
            } else if (sentDay >= sevenDaysAgo) {
                past7DaysNotifs.push(notif);
            } else {
                olderNotifs.push(notif);
            }
        });

        return {
            today: todayNotifs,
            yesterday: yesterdayNotifs,
            past7Days: past7DaysNotifs,
            older: olderNotifs
        };
    }, [notifications]);

    // --- Action Handlers ---
    const handleMarkAsRead = async (notif: Notification) => {
        if (notif.status !== NotificationStatus.Delivered) return;

        setActioningId(notif.id);
        try {
            await notificationApi.markAsRead(notif.id);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notif.id
                        ? { ...n, status: NotificationStatus.Read, readAt: new Date().toISOString() }
                        : n
                )
            );
            toast.success('Marked as read');
        } catch (err) {
            toast.error('Failed to mark as read');
            console.error(err);
        } finally {
            setActioningId(null);
        }
    };

    const handleAcknowledge = async (notif: Notification) => {
        if (notif.status !== NotificationStatus.Read) return;

        setActioningId(notif.id);
        try {
            await notificationApi.acknowledge(notif.id);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notif.id
                        ? { ...n, status: NotificationStatus.Acknowledged, acknowledgedAt: new Date().toISOString() }
                        : n
                )
            );
            toast.success('Acknowledged');
        } catch (err) {
            toast.error('Failed to acknowledge');
            console.error(err);
        } finally {
            setActioningId(null);
        }
    };

    const handleRetry = async (notif: Notification) => {
        if (notif.status !== NotificationStatus.Failed) return;

        // Confirmation for multiple retries
        if (notif.retryCount >= 3) {
            const confirmed = window.confirm(
                `⚠️ Retry Delivery?\n\nThis notification has already failed ${notif.retryCount} times.\nAre you sure you want to retry?`
            );
            if (!confirmed) return;
        }

        setActioningId(notif.id);
        try {
            toast.info('Retrying delivery...');
            await notificationApi.retryDelivery(notif.id);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notif.id
                        ? { ...n, status: NotificationStatus.Retrying }
                        : n
                )
            );
            // Refresh after a delay to get updated status
            setTimeout(() => {
                fetchNotifications();
            }, 2000);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Retry failed';
            toast.error(`Delivery failed: ${errorMsg}`);
            console.error(err);
        } finally {
            setActioningId(null);
        }
    };

    const handleViewDetails = async (notif: Notification) => {
        setLoadingDetail(true);
        try {
            const response = await notificationApi.getNotificationDetail(notif.id);
            setDetailModal(response.data);
        } catch (err) {
            toast.error('Failed to load notification details');
            console.error(err);
        } finally {
            setLoadingDetail(false);
        }
    };

    // --- Render Helpers ---
    const NotificationGroup = ({ title, notifications: notifs, icon }: {
        title: string;
        notifications: Notification[];
        icon: React.ReactNode;
    }) => {
        if (notifs.length === 0) return null;

        return (
            <section className="notification-section">
                <h2 className="section-title">
                    {icon}
                    {title}
                </h2>
                <div className="notification-list">
                    {notifs.map(notif => (
                        <NotificationCard
                            key={notif.id}
                            notif={notif}
                            onMarkAsRead={handleMarkAsRead}
                            onAcknowledge={handleAcknowledge}
                            onRetry={handleRetry}
                            onViewDetails={handleViewDetails}
                            actioningId={actioningId}
                            loadingDetail={loadingDetail}
                        />
                    ))}
                </div>
            </section>
        );
    };

    if (loading) {
        return (
            <div className="notifications-container">
                <div className="loading-view">Loading Notifications...</div>
            </div>
        );
    }

    return (
        <div className="notifications-container">
            {/* Page Header */}
            <header className="notifications-header">
                <div className="header-content">
                    <div>
                        <h1><Bell size={32} /> Notifications</h1>
                        <p>System-delivered alerts from your reminders and care events</p>
                    </div>
                </div>
            </header>

            {error && <div className="error-box">{error}</div>}

            <div className="notifications-content">
                {/* Today */}
                <NotificationGroup
                    title="Today"
                    notifications={groupedNotifications.today}
                    icon={<Bell size={28} />}
                />

                {/* Yesterday */}
                <NotificationGroup
                    title="Yesterday"
                    notifications={groupedNotifications.yesterday}
                    icon={<ClockIcon size={28} />}
                />

                {/* Past 7 Days */}
                <NotificationGroup
                    title="Past 7 Days"
                    notifications={groupedNotifications.past7Days}
                    icon={<ClockIcon size={28} />}
                />

                {/* Older (Collapsible) */}
                {groupedNotifications.older.length > 0 && (
                    <section className="notification-section">
                        <h2
                            className="section-title collapsible"
                            onClick={() => setIsPastCollapsed(!isPastCollapsed)}
                        >
                            <CheckCircle2 size={28} /> Older ({groupedNotifications.older.length})
                            {isPastCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                        </h2>
                        {!isPastCollapsed && (
                            <div className="notification-list">
                                {groupedNotifications.older.map(notif => (
                                    <NotificationCard
                                        key={notif.id}
                                        notif={notif}
                                        onMarkAsRead={handleMarkAsRead}
                                        onAcknowledge={handleAcknowledge}
                                        onRetry={handleRetry}
                                        onViewDetails={handleViewDetails}
                                        actioningId={actioningId}
                                        loadingDetail={loadingDetail}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Empty State */}
                {notifications.length === 0 && (
                    <div className="empty-state">
                        <Bell size={64} style={{ opacity: 0.2 }} />
                        <h3>No notifications yet</h3>
                        <p>Notifications will appear here when your reminders are delivered</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <NotificationDetailModal
                detail={detailModal}
                onClose={() => setDetailModal(null)}
            />
        </div>
    );
};
