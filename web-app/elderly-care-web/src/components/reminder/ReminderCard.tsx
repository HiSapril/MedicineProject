import { Bell, CheckCircle2, AlertCircle, ChevronDown, Clock } from 'lucide-react';
import type { Reminder } from '../../api/reminder.api';
import './ReminderCard.css';

interface EnrichedReminder extends Reminder {
    message: string;
    sourceEventName: string;
    sourceEventType: string;
}

interface ReminderCardProps {
    rem: EnrichedReminder;
    onMarkDone: (rem: Reminder) => void;
    onSnooze: (rem: Reminder, minutes: number) => void;
    onEdit: (rem: Reminder) => void;
    onDelete: (rem: Reminder) => void;
    snoozeDropdown: string | null;
    setSnoozeDropdown: (id: string | null) => void;
    formatRelativeTime: (dateStr: string) => string;
    formatAbsoluteTime: (dateStr: string) => string;
    getReminderStatus: (rem: Reminder) => string;
}

const ReminderCard = ({
    rem,
    onMarkDone,
    onSnooze,
    onEdit,
    onDelete,
    snoozeDropdown,
    setSnoozeDropdown,
    formatRelativeTime,
    formatAbsoluteTime,
    getReminderStatus
}: ReminderCardProps) => {
    const status = getReminderStatus(rem);

    return (
        <div className={`reminder-card status-${status}`}>
            <div className="reminder-icon">
                {status === 'completed' && <CheckCircle2 size={24} />}
                {status === 'active' && <Bell size={24} />}
                {status === 'overdue' && <AlertCircle size={24} />}
            </div>

            <div className="reminder-content">
                <h3 className="reminder-title">{rem.message}</h3>
                <div className="reminder-time">
                    <Clock size={16} />
                    <span className="relative-time">{formatRelativeTime(rem.scheduledTime)}</span>
                    <span className="absolute-time">({formatAbsoluteTime(rem.scheduledTime)})</span>
                </div>
                <div className="reminder-source">
                    Source: {rem.sourceEventType} - {rem.sourceEventName}
                </div>
            </div>

            <div className="reminder-actions">
                {rem.status !== 1 && (
                    <>
                        <button className="btn-action btn-done" onClick={() => onMarkDone(rem)}>
                            Mark Done
                        </button>
                        <div className="snooze-wrapper">
                            <button
                                className="btn-action btn-snooze"
                                onClick={() => setSnoozeDropdown(snoozeDropdown === rem.id ? null : rem.id)}
                            >
                                Snooze <ChevronDown size={16} />
                            </button>
                            {snoozeDropdown === rem.id && (
                                <div className="snooze-dropdown">
                                    <button onClick={() => onSnooze(rem, 15)}>15 minutes</button>
                                    <button onClick={() => onSnooze(rem, 30)}>30 minutes</button>
                                    <button onClick={() => onSnooze(rem, 60)}>1 hour</button>
                                </div>
                            )}
                        </div>
                    </>
                )}
                <button className="btn-action btn-edit" onClick={() => onEdit(rem)}>
                    Edit
                </button>
                <button className="btn-action btn-delete" onClick={() => onDelete(rem)}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ReminderCard;
export type { EnrichedReminder };
