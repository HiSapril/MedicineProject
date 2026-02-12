import { useEffect, useState, useMemo } from 'react';
import {
    notificationApi,
    type Notification,
    type NotificationDetail,
    NotificationStatus,
    DeliveryChannel,
    RecipientType,
    SourceEventType
} from '../api/notification.api';
import { useAuth } from '../context/AuthContext';
import {
    Bell,
    CheckCircle2,
    Eye,
    CheckCheck,
    AlertCircle,
    Clock as ClockIcon,
    ChevronDown,
    ChevronUp,
    X,
    RefreshCw,
    Smartphone,
    Mail,
    MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';
import './NotificationsPage.css';

const NotificationsPage = () => {
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

    // --- Helper Functions ---
    const getStatusBadge = (status: NotificationStatus) => {
        switch (status) {
            case NotificationStatus.Delivered:
                return {
                    icon: <CheckCircle2 size={16} />,
                    text: 'Delivered',
                    className: 'status-delivered'
                };
            case NotificationStatus.Read:
                return {
                    icon: <Eye size={16} />,
                    text: 'Read',
                    className: 'status-read'
                };
            case NotificationStatus.Acknowledged:
                return {
                    icon: <CheckCheck size={16} />,
                    text: 'Acknowledged',
                    className: 'status-acknowledged'
                };
            case NotificationStatus.Failed:
                return {
                    icon: <AlertCircle size={16} />,
                    text: 'Failed',
                    className: 'status-failed'
                };
            case NotificationStatus.Retrying:
                return {
                    icon: <ClockIcon size={16} />,
                    text: 'Retrying',
                    className: 'status-retrying'
                };
            default:
                return {
                    icon: <Bell size={16} />,
                    text: 'Unknown',
                    className: 'status-unknown'
                };
        }
    };

    const getChannelIcon = (channel: DeliveryChannel) => {
        switch (channel) {
            case DeliveryChannel.MobilePush:
                return <Smartphone size={14} />;
            case DeliveryChannel.Email:
                return <Mail size={14} />;
            case DeliveryChannel.SMS:
                return <MessageSquare size={14} />;
            case DeliveryChannel.InApp:
                return <Bell size={14} />;
            default:
                return <Bell size={14} />;
        }
    };

    const getChannelText = (channel: DeliveryChannel) => {
        switch (channel) {
            case DeliveryChannel.MobilePush:
                return 'Mobile Push';
            case DeliveryChannel.Email:
                return 'Email';
            case DeliveryChannel.SMS:
                return 'SMS';
            case DeliveryChannel.InApp:
                return 'In-App';
            default:
                return 'Unknown';
        }
    };

    const getRecipientText = (type: RecipientType) => {
        return type === RecipientType.ElderlyUser ? 'Elderly User' : 'Caregiver';
    };

    const getSourceEventText = (type: SourceEventType) => {
        switch (type) {
            case SourceEventType.Medication: return 'Medication';
            case SourceEventType.Appointment: return 'Appointment';
            case SourceEventType.Health: return 'Health';
            default: return 'Unknown';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateMessage = (message: string, maxLength: number = 150) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

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
    const NotificationCard = ({ notif }: { notif: Notification }) => {
        const statusBadge = getStatusBadge(notif.status);
        const isActioning = actioningId === notif.id;

        // Determine type string for source link
        const sourceType = notif.title.includes('Appointment') ? 'Appointment' : notif.title.includes('Medication') ? 'Medication' : 'Health';

        return (
            <div className={`notification-card ${statusBadge.className}`}>
                {/* Status Badge */}
                <div className={`status-badge ${statusBadge.className}`}>
                    {statusBadge.icon}
                    <span>{statusBadge.text}</span>
                </div>

                {/* Content */}
                <div className="notification-content">
                    <h3 className="notification-title">{notif.title}</h3>
                    <p className="notification-message">{truncateMessage(notif.message)}</p>
                    {notif.message.length > 150 && (
                        <button
                            className="view-details-link"
                            onClick={() => handleViewDetails(notif)}
                            disabled={loadingDetail}
                        >
                            {loadingDetail ? 'Loading...' : 'View details'}
                        </button>
                    )}
                </div>

                {/* Metadata */}
                <div className="notification-metadata">
                    <div className="metadata-item">
                        <ClockIcon size={14} />
                        <span>Sent at: {formatTime(notif.sentAt)}</span>
                    </div>
                    <div className="metadata-item">
                        {getChannelIcon(notif.deliveryChannel)}
                        <span>Channel: {getChannelText(notif.deliveryChannel)}</span>
                    </div>
                    <div className="metadata-item">
                        <Bell size={14} />
                        <span>Recipient: {getRecipientText(notif.recipientType)}</span>
                    </div>
                    <div className="metadata-item">
                        <span className="source-link" onClick={() => handleViewDetails(notif)}>
                            🔗 Source: Reminder → {sourceType}
                        </span>
                    </div>
                    {notif.failureReason && (
                        <div className="metadata-item error-reason">
                            <AlertCircle size={14} />
                            <span>Error: {notif.failureReason}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="notification-actions">
                    {notif.status === NotificationStatus.Delivered && (
                        <button
                            className="btn-action btn-primary"
                            onClick={() => handleMarkAsRead(notif)}
                            disabled={isActioning}
                        >
                            <Eye size={20} />
                            {isActioning ? 'Marking...' : 'Mark as Read'}
                        </button>
                    )}
                    {notif.status === NotificationStatus.Read && (
                        <button
                            className="btn-action btn-primary"
                            onClick={() => handleAcknowledge(notif)}
                            disabled={isActioning}
                        >
                            <CheckCheck size={20} />
                            {isActioning ? 'Acknowledging...' : 'Acknowledge'}
                        </button>
                    )}
                    {notif.status === NotificationStatus.Failed && (
                        <button
                            className="btn-action btn-warning"
                            onClick={() => handleRetry(notif)}
                            disabled={isActioning}
                        >
                            <RefreshCw size={20} />
                            {isActioning ? 'Retrying...' : 'Retry Delivery'}
                        </button>
                    )}
                    {notif.status === NotificationStatus.Retrying && (
                        <button className="btn-action" disabled>
                            <ClockIcon size={20} />
                            Retrying...
                        </button>
                    )}
                </div>
            </div>
        );
    };

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
                        <NotificationCard key={notif.id} notif={notif} />
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
                                    <NotificationCard key={notif.id} notif={notif} />
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
            {detailModal && (
                <div className="modal-overlay" onClick={() => setDetailModal(null)}>
                    <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Notification Details</h2>
                            <button className="btn-close" onClick={() => setDetailModal(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Status Badge */}
                            <div className={`status-badge ${getStatusBadge(detailModal.status).className}`}>
                                {getStatusBadge(detailModal.status).icon}
                                <span>{getStatusBadge(detailModal.status).text}</span>
                            </div>

                            <h3 className="detail-title">{detailModal.title}</h3>

                            {/* Full Message */}
                            <section className="detail-section">
                                <h4>Full Message</h4>
                                <p>{detailModal.message}</p>
                            </section>

                            {/* Delivery Information */}
                            <section className="detail-section">
                                <h4>Delivery Information</h4>
                                <div className="detail-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Sent at:</span>
                                        <span>{formatTime(detailModal.sentAt)}</span>
                                    </div>
                                    {detailModal.deliveredAt && (
                                        <div className="info-item">
                                            <span className="info-label">Delivered at:</span>
                                            <span>{formatTime(detailModal.deliveredAt)}</span>
                                        </div>
                                    )}
                                    {detailModal.readAt && (
                                        <div className="info-item">
                                            <span className="info-label">Read at:</span>
                                            <span>{formatTime(detailModal.readAt)}</span>
                                        </div>
                                    )}
                                    {detailModal.acknowledgedAt && (
                                        <div className="info-item">
                                            <span className="info-label">Acknowledged at:</span>
                                            <span>{formatTime(detailModal.acknowledgedAt)}</span>
                                        </div>
                                    )}
                                    <div className="info-item">
                                        <span className="info-label">Channel:</span>
                                        <span>{getChannelText(detailModal.deliveryChannel)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Recipient:</span>
                                        <span>{getRecipientText(detailModal.recipientType)}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Source Event */}
                            <section className="detail-section">
                                <h4>Source Event</h4>
                                <div className="detail-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Reminder ID:</span>
                                        <span>{detailModal.sourceReminderId}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Event Type:</span>
                                        <span>{getSourceEventText(detailModal.sourceEventType)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Event ID:</span>
                                        <span>{detailModal.sourceEventId}</span>
                                    </div>
                                    {detailModal.sourceEvent && (
                                        <div className="info-item">
                                            <span className="info-label">Event Name:</span>
                                            <span>{detailModal.sourceEvent.name}</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Delivery Attempts */}
                            {detailModal.deliveryAttempts && detailModal.deliveryAttempts.length > 0 && (
                                <section className="detail-section">
                                    <h4>Delivery Attempts</h4>
                                    <div className="delivery-attempts">
                                        {detailModal.deliveryAttempts.map((attempt, idx) => (
                                            <div key={idx} className={`attempt-item ${attempt.status.toLowerCase()}`}>
                                                <span className="attempt-number">{attempt.attemptNumber}.</span>
                                                <span className="attempt-time">{formatTime(attempt.attemptedAt)}</span>
                                                <span className="attempt-status">{attempt.status}</span>
                                                <span className="attempt-channel">({getChannelText(attempt.channel)})</span>
                                                {attempt.errorReason && (
                                                    <span className="attempt-error">- {attempt.errorReason}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setDetailModal(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
