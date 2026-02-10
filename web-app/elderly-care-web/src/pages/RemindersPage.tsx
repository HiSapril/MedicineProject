import { useEffect, useState, useMemo } from 'react';
import { reminderApi } from '../api/reminder.api';
import {
  Bell,
  Pill,
  Calendar,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Timer,
  ChevronRight,
  History
} from 'lucide-react';
import { toast } from 'react-toastify';
import './RemindersPage.css';

interface Reminder {
  id: string;
  message: string;
  scheduledTime: string;
  type?: 'Medication' | 'Appointment' | 'Health' | string;
  isCompleted?: boolean;
}

const RemindersPage = () => {
  // --- State ---
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI Interaction State
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ reminder: Reminder, action: 'acknowledge' | 'snooze' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    fetchReminders();
    // Refresh status every minute
    const interval = setInterval(fetchReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await reminderApi.getReminders();
      // Sort chronologically
      const sorted = (response.data as Reminder[]).sort(
        (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      );
      setReminders(sorted);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load reminders. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // --- Logic & Grouping ---
  const now = new Date();

  const getReminderStatus = (rem: Reminder) => {
    if (rem.isCompleted) return 'acknowledged';
    const scheduled = new Date(rem.scheduledTime);
    const diffInMinutes = (scheduled.getTime() - now.getTime()) / 60000;

    if (diffInMinutes < -15) return 'overdue';
    if (diffInMinutes <= 0) return 'due-now';
    if (diffInMinutes <= 60) return 'due-soon'; // Optimization for UX
    return 'upcoming';
  };

  const groupedReminders = useMemo(() => {
    const todayStr = now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    return {
      today: reminders.filter(r => new Date(r.scheduledTime).toDateString() === todayStr),
      tomorrow: reminders.filter(r => new Date(r.scheduledTime).toDateString() === tomorrowStr),
      upcoming: reminders.filter(r => {
        const d = new Date(r.scheduledTime).toDateString();
        return d !== todayStr && d !== tomorrowStr && new Date(r.scheduledTime) > now;
      })
    };
  }, [reminders]);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'Medication': return <Pill size={32} />;
      case 'Appointment': return <Calendar size={32} />;
      case 'Health': return <Activity size={32} />;
      default: return <Bell size={32} />;
    }
  };

  // --- Handlers ---
  const handleAcknowledge = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      // Logic from MedicationsPage: mark as completed
      await reminderApi.updateReminder(confirmAction.reminder.id, {
        ...confirmAction.reminder,
        type: 'Acknowledged' // Mocking status update
      } as any);

      setReminders(prev => prev.map(r =>
        r.id === confirmAction.reminder.id ? { ...r, isCompleted: true } : r
      ));

      toast.success('Reminder acknowledged.');
      setConfirmAction(null);
    } catch (err) {
      toast.error('Failed to update reminder.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSnooze = async (minutes: number) => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const newTime = new Date(new Date(confirmAction.reminder.scheduledTime).getTime() + minutes * 60000);
      await reminderApi.updateReminder(confirmAction.reminder.id, {
        scheduledTime: newTime.toISOString()
      });

      setReminders(prev => prev.map(r =>
        r.id === confirmAction.reminder.id ? { ...r, scheduledTime: newTime.toISOString() } : r
      ));

      toast.info(`Snoozed for ${minutes} minutes.`);
      setConfirmAction(null);
    } catch (err) {
      toast.error('Failed to snooze reminder.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // --- Render Helpers ---
  const ReminderList = ({ items, title }: { items: Reminder[], title: string }) => {
    if (items.length === 0) return null;
    return (
      <section className="timeline-section">
        <h2 className="timeline-title">{title}</h2>
        <div className="reminders-grid">
          {items.map(rem => {
            const status = getReminderStatus(rem);
            return (
              <div key={rem.id} className={`reminder-card status-${status}`}>
                <div className="reminder-icon-box">
                  {getIcon(rem.type)}
                </div>

                <div className="reminder-content">
                  <span className="reminder-type-label">{rem.type || 'General'}</span>
                  <div className="reminder-time">{formatTime(rem.scheduledTime)}</div>
                  <div className="reminder-description">{rem.message}</div>
                  <button className="btn-detail" onClick={() => setActiveReminder(rem)}>
                    View Details
                  </button>
                </div>

                <div className="reminder-actions">
                  <div className="status-indicator">
                    {status.replace('-', ' ').toUpperCase()}
                  </div>
                  {!rem.isCompleted && (
                    <>
                      <button
                        className="btn-acknowledge"
                        onClick={() => setConfirmAction({ reminder: rem, action: 'acknowledge' })}
                      >
                        Acknowledge
                      </button>
                      <button
                        className="btn-snooze"
                        onClick={() => setConfirmAction({ reminder: rem, action: 'snooze' })}
                      >
                        Snooze
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  if (loading) return <div className="loading-view">Loading...</div>;

  return (
    <div className="reminders-container">
      <header className="reminders-header">
        <h1>Reminders</h1>
        <p>Upcoming tasks and important alerts for your well-being.</p>
      </header>

      {error && <div className="error-box">{error}</div>}

      <div className="reminders-content">
        <ReminderList items={groupedReminders.today} title="Today" />
        <ReminderList items={groupedReminders.tomorrow} title="Tomorrow" />
        <ReminderList items={groupedReminders.upcoming} title="Upcoming" />

        {reminders.length === 0 && (
          <div className="empty-state">
            <Bell size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No reminders scheduled at the moment.</p>
          </div>
        )}
      </div>

      {/* --- Modals --- */}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{confirmAction.action === 'acknowledge' ? 'Confirm Action' : 'Snooze Reminder'}</h2>
            </div>
            <div className="modal-body">
              {confirmAction.action === 'acknowledge' ? (
                <p>Are you sure you have completed <strong>{confirmAction.reminder.message}</strong>?</p>
              ) : (
                <div className="snooze-options">
                  <p>Choose snooze duration:</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn-snooze" onClick={() => handleSnooze(15)}>15 min</button>
                    <button className="btn-snooze" onClick={() => handleSnooze(60)}>1 hour</button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              {confirmAction.action === 'acknowledge' && (
                <button
                  className="btn-confirm"
                  onClick={handleAcknowledge}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeReminder && (
        <div className="modal-overlay" onClick={() => setActiveReminder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reminder Details</h2>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <span className="detail-label">Task</span>
                <span className="detail-value">{activeReminder.message}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category</span>
                <span className="detail-value">{activeReminder.type || 'General'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Scheduled Time</span>
                <span className="detail-value">
                  {new Date(activeReminder.scheduledTime).toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                  {getReminderStatus(activeReminder).replace('-', ' ')}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setActiveReminder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
