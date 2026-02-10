import { useEffect, useState, useMemo } from 'react';
import { medicationApi, type Medication } from '../api/medication.api';
import { reminderApi } from '../api/reminder.api';
import {
  Pill,
  Clock,
  Info,
  Calendar,
  History,
  RotateCcw
} from 'lucide-react';
import './MedicationsPage.css';
import { toast } from 'react-toastify';

interface ReminderInstance {
  id: string;
  message: string;
  scheduledTime: string;
  isCompleted: boolean;
  type?: string;
  medicationId?: string; // Optional if existing in API
}

const MedicationsPage = () => {
  // --- State ---
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<ReminderInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interaction State
  const [detailMed, setDetailMed] = useState<Medication | null>(null);
  const [confirmingReminder, setConfirmingReminder] = useState<ReminderInstance | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, remRes] = await Promise.all([
        medicationApi.getMedications(),
        reminderApi.getReminders()
      ]);
      setMedications(medRes.data);
      setReminders(remRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load medication data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // --- Logic ---
  const today = new Date().toDateString();

  const todaySchedule = useMemo(() => {
    return reminders
      .filter(r => new Date(r.scheduledTime).toDateString() === today)
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  }, [reminders, today]);

  const historyLogs = useMemo(() => {
    return reminders
      .filter(r => new Date(r.scheduledTime).toDateString() !== today)
      .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime())
      .slice(0, 10); // Show last 10 entries
  }, [reminders, today]);

  const getStatus = (reminder: ReminderInstance) => {
    if (reminder.isCompleted) return 'taken';
    const scheduledDate = new Date(reminder.scheduledTime);
    const now = new Date();
    if (scheduledDate < now) return 'missed';
    return 'upcoming';
  };

  const findMedInfo = (message: string) => {
    // Attempt to match reminder message with medication name
    return medications.find(m => message.toLowerCase().includes(m.name.toLowerCase()));
  };

  // --- Handlers ---
  const handleMarkAsTaken = async () => {
    if (!confirmingReminder) return;

    setActionLoading(true);
    try {
      await reminderApi.updateReminder(confirmingReminder.id, {
        scheduledTime: confirmingReminder.scheduledTime,
        message: confirmingReminder.message,
        type: 'MedicationMarkedTaken' // Custom flag or just update status
      } as any);

      // Note: The mock API might not support a dedicated "toggle" field yet,
      // but we update the local state to show immediate feedback.
      setReminders(prev => prev.map(r =>
        r.id === confirmingReminder.id ? { ...r, isCompleted: true } : r
      ));

      toast.success(`${confirmingReminder.message} marked as taken.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setActionLoading(false);
      setConfirmingReminder(null);
    }
  };

  const handleUndoTaken = async (reminder: ReminderInstance) => {
    setActionLoading(true);
    try {
      // Mock undo logic
      setReminders(prev => prev.map(r =>
        r.id === reminder.id ? { ...r, isCompleted: false } : r
      ));
      toast.info('Action undone.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Sub-components ---
  const StatusBadge = ({ status }: { status: string }) => {
    const labels: Record<string, string> = {
      taken: 'Taken',
      upcoming: 'Upcoming',
      missed: 'Missed'
    };
    return (
      <span className={`status - badge status - ${status} `}>
        {labels[status]}
      </span>
    );
  };

  if (loading) return (
    <div className="loading-view">
      <div className="loading-spinner"></div>
      <p>Loading Medications...</p>
    </div>
  );

  return (
    <div className="medications-container">
      {/* 1. Header */}
      <header className="medications-header">
        <h1>Medications</h1>
        <p>Manage daily medication schedules and track intake status for elderly well-being.</p>
      </header>

      {error && <div className="error-box">{error}</div>}

      <div className="medications-content">
        {/* 2. Today's Schedule */}
        <section className="medications-section">
          <h2 className="section-title">
            <Calendar size={24} /> Today's Schedule
          </h2>

          {todaySchedule.length === 0 ? (
            <div className="empty-state">
              <Pill size={48} />
              <p>No medications scheduled for today.</p>
            </div>
          ) : (
            <div className="schedule-grid">
              {todaySchedule.map(reminder => {
                const status = getStatus(reminder);
                const medInfo = findMedInfo(reminder.message);

                return (
                  <div key={reminder.id} className={`medication - card ${status} `}>
                    <div className="medication-info">
                      <h3>{reminder.message}</h3>
                      <div className="medication-meta">
                        <div className="meta-item">
                          <Clock size={18} />
                          {new Date(reminder.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {medInfo && (
                          <div className="meta-item">
                            <Info size={18} />
                            {medInfo.dosage}
                          </div>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={status} />

                    <div className="card-actions">
                      {status !== 'taken' ? (
                        <button
                          className="btn-taken"
                          onClick={() => setConfirmingReminder(reminder)}
                        >
                          Mark as Taken
                        </button>
                      ) : (
                        <button
                          className="btn-taken btn-undo"
                          onClick={() => handleUndoTaken(reminder)}
                          style={{ backgroundColor: '#64748b' }}
                        >
                          <RotateCcw size={18} /> Undo
                        </button>
                      )}

                      {medInfo && (
                        <button
                          className="btn-details"
                          onClick={() => setDetailMed(medInfo)}
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. History Section */}
        <section className="medications-section history-section">
          <h2 className="section-title">
            <History size={24} /> Medication History
          </h2>
          <div className="history-list">
            {historyLogs.length === 0 ? (
              <p className="empty-history">No recent history logs.</p>
            ) : (
              historyLogs.map(log => (
                <div key={log.id} className="history-item">
                  <div className="history-info">
                    <span className="history-med-name">{log.message}</span>
                    <span className="history-time">
                      {new Date(log.scheduledTime).toLocaleString([], {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <StatusBadge status={getStatus(log)} />
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* --- Modals --- */}

      {/* Confirmation Modal */}
      {confirmingReminder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ color: '#2563eb', marginBottom: '1rem' }}>
              <Pill size={48} />
            </div>
            <h2>Confirm Intake</h2>
            <p>Are you sure <strong>{confirmingReminder.message}</strong> was taken as scheduled?</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmingReminder(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleMarkAsTaken}
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : 'Yes, Marked as Taken'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailMed && (
        <div className="modal-overlay" onClick={() => setDetailMed(null)}>
          <div className="modal-content detail-panel" onClick={e => e.stopPropagation()}>
            <div className="detail-header">
              <h2>{detailMed.name} Details</h2>
              <button className="btn-close" onClick={() => setDetailMed(null)}>&times;</button>
            </div>
            <div className="detail-body" style={{ textAlign: 'left', marginTop: '1.5rem' }}>
              <p><strong>Dosage:</strong> {detailMed.dosage}</p>
              <p><strong>Frequency:</strong> {detailMed.frequency}</p>
              <p><strong>Standard Time:</strong> {detailMed.time}</p>
              {detailMed.notes && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                  <strong>Instructions:</strong>
                  <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{detailMed.notes}</p>
                </div>
              )}
              <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                <p>Start Date: {new Date(detailMed.startDate).toLocaleDateString()}</p>
                {detailMed.endDate && <p>End Date: {new Date(detailMed.endDate).toLocaleDateString()}</p>}
              </div>
            </div>
            <button
              className="btn-details"
              style={{ width: '100%', marginTop: '2rem' }}
              onClick={() => setDetailMed(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;
