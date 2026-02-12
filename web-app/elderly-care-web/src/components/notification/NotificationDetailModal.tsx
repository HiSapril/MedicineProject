import {
    X,
    CheckCircle2,
    Eye,
    CheckCheck,
    AlertCircle,
    Clock as ClockIcon,
    Bell
} from 'lucide-react';
import {
    type NotificationDetail,
    NotificationStatus,
    DeliveryChannel,
    RecipientType,
    SourceEventType
} from '../../api/notification.api';
import './NotificationDetailModal.css';

interface NotificationDetailModalProps {
    detail: NotificationDetail | null;
    onClose: () => void;
}

const NotificationDetailModal = ({ detail, onClose }: NotificationDetailModalProps) => {
    if (!detail) return null;

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

    const statusBadge = getStatusBadge(detail.status);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Notification Details</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Status Badge */}
                    <div className={`status-badge ${statusBadge.className}`}>
                        {statusBadge.icon}
                        <span>{statusBadge.text}</span>
                    </div>

                    <h3 className="detail-title">{detail.title}</h3>

                    {/* Full Message */}
                    <section className="detail-section">
                        <h4>Full Message</h4>
                        <p>{detail.message}</p>
                    </section>

                    {/* Delivery Information */}
                    <section className="detail-section">
                        <h4>Delivery Information</h4>
                        <div className="detail-info-grid">
                            <div className="info-item">
                                <span className="info-label">Sent at:</span>
                                <span>{formatTime(detail.sentAt)}</span>
                            </div>
                            {detail.deliveredAt && (
                                <div className="info-item">
                                    <span className="info-label">Delivered at:</span>
                                    <span>{formatTime(detail.deliveredAt)}</span>
                                </div>
                            )}
                            {detail.readAt && (
                                <div className="info-item">
                                    <span className="info-label">Read at:</span>
                                    <span>{formatTime(detail.readAt)}</span>
                                </div>
                            )}
                            {detail.acknowledgedAt && (
                                <div className="info-item">
                                    <span className="info-label">Acknowledged at:</span>
                                    <span>{formatTime(detail.acknowledgedAt)}</span>
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">Channel:</span>
                                <span>{getChannelText(detail.deliveryChannel)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Recipient:</span>
                                <span>{getRecipientText(detail.recipientType)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Source Event */}
                    <section className="detail-section">
                        <h4>Source Event</h4>
                        <div className="detail-info-grid">
                            <div className="info-item">
                                <span className="info-label">Reminder ID:</span>
                                <span>{detail.sourceReminderId}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Event Type:</span>
                                <span>{getSourceEventText(detail.sourceEventType)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Event ID:</span>
                                <span>{detail.sourceEventId}</span>
                            </div>
                            {detail.sourceEvent && (
                                <div className="info-item">
                                    <span className="info-label">Event Name:</span>
                                    <span>{detail.sourceEvent.name}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Delivery Attempts */}
                    {detail.deliveryAttempts && detail.deliveryAttempts.length > 0 && (
                        <section className="detail-section">
                            <h4>Delivery Attempts</h4>
                            <div className="delivery-attempts">
                                {detail.deliveryAttempts.map((attempt, idx) => (
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
                    <button className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetailModal;
