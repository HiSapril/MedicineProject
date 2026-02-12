import {
    CheckCircle2,
    Eye,
    CheckCheck,
    AlertCircle,
    Clock as ClockIcon,
    Bell,
    Smartphone,
    Mail,
    MessageSquare,
    RefreshCw
} from 'lucide-react';
import {
    type Notification,
    NotificationStatus,
    DeliveryChannel,
    RecipientType
} from '../../api/notification.api';
import './NotificationCard.css';

interface NotificationCardProps {
    notif: Notification;
    onMarkAsRead: (notif: Notification) => void;
    onAcknowledge: (notif: Notification) => void;
    onRetry: (notif: Notification) => void;
    onViewDetails: (notif: Notification) => void;
    actioningId: string | null;
    loadingDetail: boolean;
}

const NotificationCard = ({
    notif,
    onMarkAsRead,
    onAcknowledge,
    onRetry,
    onViewDetails,
    actioningId,
    loadingDetail
}: NotificationCardProps) => {
    const isActioning = actioningId === notif.id;

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
            case DeliveryChannel.MobilePush: return <Smartphone size={14} />;
            case DeliveryChannel.Email: return <Mail size={14} />;
            case DeliveryChannel.SMS: return <MessageSquare size={14} />;
            case DeliveryChannel.InApp: return <Bell size={14} />;
            default: return <Bell size={14} />;
        }
    };

    const getChannelText = (channel: DeliveryChannel) => {
        switch (channel) {
            case DeliveryChannel.MobilePush: return 'Mobile Push';
            case DeliveryChannel.Email: return 'Email';
            case DeliveryChannel.SMS: return 'SMS';
            case DeliveryChannel.InApp: return 'In-App';
            default: return 'Unknown';
        }
    };

    const getRecipientText = (type: RecipientType) => {
        return type === RecipientType.ElderlyUser ? 'Elderly User' : 'Caregiver';
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

    const statusBadge = getStatusBadge(notif.status);
    const sourceType = notif.title.includes('Appointment') ? 'Appointment' : notif.title.includes('Medication') ? 'Medication' : 'Health';

    return (
        <div className={`notification-card ${statusBadge.className}`}>
            <div className={`status-badge ${statusBadge.className}`}>
                {statusBadge.icon}
                <span>{statusBadge.text}</span>
            </div>

            <div className="notification-content">
                <h3 className="notification-title">{notif.title}</h3>
                <p className="notification-message">{truncateMessage(notif.message)}</p>
                {notif.message.length > 150 && (
                    <button
                        className="view-details-link"
                        onClick={() => onViewDetails(notif)}
                        disabled={loadingDetail}
                    >
                        {loadingDetail ? 'Loading...' : 'View details'}
                    </button>
                )}
            </div>

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
                    <span className="source-link" onClick={() => onViewDetails(notif)}>
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

            <div className="notification-actions">
                {notif.status === NotificationStatus.Delivered && (
                    <button
                        className="btn-action btn-primary"
                        onClick={() => onMarkAsRead(notif)}
                        disabled={isActioning}
                    >
                        <Eye size={20} />
                        {isActioning ? 'Marking...' : 'Mark as Read'}
                    </button>
                )}
                {notif.status === NotificationStatus.Read && (
                    <button
                        className="btn-action btn-primary"
                        onClick={() => onAcknowledge(notif)}
                        disabled={isActioning}
                    >
                        <CheckCheck size={20} />
                        {isActioning ? 'Acknowledging...' : 'Acknowledge'}
                    </button>
                )}
                {notif.status === NotificationStatus.Failed && (
                    <button
                        className="btn-action btn-warning"
                        onClick={() => onRetry(notif)}
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

export default NotificationCard;
