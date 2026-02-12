import { useEffect, useState, useMemo } from 'react';
import { reminderApi, type CreateReminderPayload, type Reminder } from '../api/reminder.api';
import { appointmentApi } from '../api/appointment.api';
import { medicationApi, type Medication } from '../api/medication.api';
import { healthApi, type HealthLog } from '../api/health.api';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Pill,
  Calendar,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Link as LinkIcon,
  Timer,
  Repeat,
  FileText,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import './RemindersPage.css';

interface Appointment {
  id: string;
  doctorName: string;
  appointmentDate: string;
  appointmentType?: string;
}

interface FormData {
  reminderType: 'Appointment' | 'Medication' | 'Health' | '';
  sourceEventId: string;
  timingMode: 'relative' | 'absolute';
  relativeTrigger: string;
  absoluteDate: string;
  absoluteTime: string;
  repeatMode: 'none' | 'daily' | 'weekly' | 'custom';
  customInterval: string;
  customUnit: 'hours' | 'days' | 'weeks';
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

// Extended reminder with display fields
interface EnrichedReminder extends Reminder {
  message: string;
  sourceEventName: string;
  sourceEventType: string;
}

const RemindersPage = () => {
  // --- Auth ---
  const { user } = useAuth();

  // --- State ---
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [enrichedReminders, setEnrichedReminders] = useState<EnrichedReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Source Events
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);

  // UI State
  const [isPastCollapsed, setIsPastCollapsed] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [snoozeDropdown, setSnoozeDropdown] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<FormData>({
    reminderType: '',
    sourceEventId: '',
    timingMode: 'relative',
    relativeTrigger: '1h_before',
    absoluteDate: '',
    absoluteTime: '',
    repeatMode: 'none',
    customInterval: '1',
    customUnit: 'days',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    fetchReminders();
    fetchSourceEvents();
  }, []);

  // Enrich reminders when source events or reminders change
  useEffect(() => {
    enrichReminders();
  }, [reminders, appointments, medications, healthLogs]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const response = await reminderApi.getReminders();
      const sorted = response.data.sort(
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

  const fetchSourceEvents = async () => {
    try {
      const [apptRes, medRes, healthRes] = await Promise.all([
        appointmentApi.getAll().catch(() => ({ data: [] })),
        medicationApi.getMedications().catch(() => ({ data: [] })),
        healthApi.getHealthLogs().catch(() => ({ data: [] }))
      ]);
      setAppointments(apptRes.data);
      setMedications(medRes.data);
      setHealthLogs(healthRes.data);
    } catch (err) {
      console.error('Error fetching source events:', err);
    }
  };

  // Enrich reminders with source event data
  const enrichReminders = () => {
    const enriched: EnrichedReminder[] = reminders.map(rem => {
      let sourceEventName = 'Unknown';
      let sourceEventType = '';

      // type: 0 = Medication, 1 = Appointment, 2 = Health
      if (rem.type === 1) {
        sourceEventType = 'Appointment';
        const apt = appointments.find(a => a.id === rem.referenceId);
        if (apt) sourceEventName = apt.doctorName;
      } else if (rem.type === 0) {
        sourceEventType = 'Medication';
        const med = medications.find(m => m.id === rem.referenceId);
        if (med) sourceEventName = med.name;
      } else if (rem.type === 2) {
        sourceEventType = 'Health';
        const log = healthLogs.find(h => h.id === rem.referenceId);
        if (log) sourceEventName = `Health Log - ${new Date(log.date).toLocaleDateString()}`;
      }

      return {
        ...rem,
        message: `${sourceEventType}: ${sourceEventName}`,
        sourceEventName,
        sourceEventType
      };
    });

    setEnrichedReminders(enriched);
  };

  // --- Logic & Grouping ---
  const now = new Date();

  const getReminderStatus = (rem: Reminder): string => {
    // status: 0 = Pending, 1 = Done, 2 = Missed
    if (rem.status === 1) return 'completed';
    const scheduled = new Date(rem.scheduledTime);
    if (scheduled < now) return 'overdue';
    return 'active';
  };

  const groupedReminders = useMemo(() => {
    const todayStr = now.toDateString();
    const upcoming = enrichedReminders.filter(r => new Date(r.scheduledTime) >= now && r.status !== 1);
    const past = enrichedReminders.filter(r => new Date(r.scheduledTime) < now || r.status === 1).reverse();

    return {
      today: upcoming.filter(r => new Date(r.scheduledTime).toDateString() === todayStr),
      upcoming: upcoming.filter(r => new Date(r.scheduledTime).toDateString() !== todayStr),
      past
    };
  }, [enrichedReminders]);

  // --- Form Handlers ---
  const resetForm = () => {
    setFormData({
      reminderType: '',
      sourceEventId: '',
      timingMode: 'relative',
      relativeTrigger: '1h_before',
      absoluteDate: '',
      absoluteTime: '',
      repeatMode: 'none',
      customInterval: '1',
      customUnit: 'days',
      notes: ''
    });
    setFormErrors({});
    setIsDirty(false);
    setEditingReminder(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (rem: Reminder) => {
    const remDate = new Date(rem.scheduledTime);

    // Convert type enum back to string
    let reminderType: 'Appointment' | 'Medication' | 'Health' = 'Appointment';
    if (rem.type === 0) reminderType = 'Medication';
    else if (rem.type === 1) reminderType = 'Appointment';
    else if (rem.type === 2) reminderType = 'Health';

    setFormData({
      reminderType,
      sourceEventId: rem.referenceId,
      timingMode: 'absolute', // Default to absolute for edit
      relativeTrigger: '1h_before',
      absoluteDate: remDate.toISOString().split('T')[0],
      absoluteTime: remDate.toTimeString().slice(0, 5),
      repeatMode: 'none',
      customInterval: '1',
      customUnit: 'days',
      notes: ''
    });
    setEditingReminder(rem);
    setShowForm(true);
    setIsDirty(false);
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Clear dependent fields when changing reminder type
      if (field === 'reminderType') {
        updated.sourceEventId = '';
      }

      return updated;
    });
    setIsDirty(true);

    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field: keyof FormData, value: string): string => {
    switch (field) {
      case 'reminderType':
        return !value ? 'Please select what this reminder is for' : '';
      case 'sourceEventId':
        return !value ? `Please select a ${formData.reminderType.toLowerCase()}` : '';
      case 'absoluteDate':
        return formData.timingMode === 'absolute' && !value ? 'Please select a date' : '';
      case 'absoluteTime':
        return formData.timingMode === 'absolute' && !value ? 'Please select a time' : '';
      case 'customInterval':
        return formData.repeatMode === 'custom' && (!value || Number(value) <= 0)
          ? 'Interval must be at least 1' : '';
      default:
        return '';
    }
  };

  const handleBlur = (field: keyof FormData) => {
    const error = validateField(field, formData[field]);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const calculateTriggerTime = (): Date | null => {
    if (formData.timingMode === 'absolute') {
      if (!formData.absoluteDate || !formData.absoluteTime) return null;
      return new Date(`${formData.absoluteDate}T${formData.absoluteTime}`);
    }

    // Relative trigger - need source event time
    if (!formData.sourceEventId) return null;

    let sourceTime: Date | null = null;

    if (formData.reminderType === 'Appointment') {
      const apt = appointments.find(a => a.id === formData.sourceEventId);
      if (apt) sourceTime = new Date(apt.appointmentDate);
    } else if (formData.reminderType === 'Medication') {
      const med = medications.find(m => m.id === formData.sourceEventId);
      if (med) {
        // Combine today's date with medication time
        const today = new Date();
        const [hours, minutes] = med.time.split(':');
        sourceTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
          parseInt(hours), parseInt(minutes));
      }
    }

    if (!sourceTime) return null;

    const triggerTime = new Date(sourceTime);

    switch (formData.relativeTrigger) {
      case 'at_event':
        return triggerTime;
      case '15m_before':
        triggerTime.setMinutes(triggerTime.getMinutes() - 15);
        return triggerTime;
      case '30m_before':
        triggerTime.setMinutes(triggerTime.getMinutes() - 30);
        return triggerTime;
      case '1h_before':
        triggerTime.setHours(triggerTime.getHours() - 1);
        return triggerTime;
      case '2h_before':
        triggerTime.setHours(triggerTime.getHours() - 2);
        return triggerTime;
      case '1d_before':
        triggerTime.setDate(triggerTime.getDate() - 1);
        return triggerTime;
      default:
        return triggerTime;
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    errors.reminderType = validateField('reminderType', formData.reminderType);
    errors.sourceEventId = validateField('sourceEventId', formData.sourceEventId);

    if (formData.timingMode === 'absolute') {
      errors.absoluteDate = validateField('absoluteDate', formData.absoluteDate);
      errors.absoluteTime = validateField('absoluteTime', formData.absoluteTime);
    }

    if (formData.repeatMode === 'custom') {
      errors.customInterval = validateField('customInterval', formData.customInterval);
    }

    // Check for past time
    const triggerTime = calculateTriggerTime();
    if (triggerTime && triggerTime < now) {
      errors.triggerTime = `Reminder time cannot be in the past. The selected time (${triggerTime.toLocaleString()}) has already passed. Current time: ${now.toLocaleString()}`;
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, v]) => v !== '')
    );

    setFormErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(formErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      const triggerTime = calculateTriggerTime();
      if (!triggerTime) {
        toast.error('Unable to calculate trigger time');
        return;
      }

      // Convert reminder type to backend enum
      let typeEnum: 0 | 1 | 2;
      switch (formData.reminderType) {
        case 'Medication':
          typeEnum = 0;
          break;
        case 'Appointment':
          typeEnum = 1;
          break;
        case 'Health':
          typeEnum = 2;
          break;
        default:
          toast.error('Invalid reminder type');
          return;
      }

      // Backend expects simple payload
      const payload: CreateReminderPayload = {
        userId: user.id,
        type: typeEnum,
        referenceId: formData.sourceEventId,
        scheduledTime: triggerTime.toISOString()
      };

      if (editingReminder) {
        await reminderApi.updateReminder(editingReminder.id, payload);
        toast.success('Reminder updated successfully');
      } else {
        await reminderApi.createReminder(payload);
        toast.success('Reminder created successfully');
      }

      await fetchReminders();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to save reminder. Please try again.';
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      setShowForm(false);
      resetForm();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setShowForm(false);
    resetForm();
  };

  // --- Action Handlers ---
  const handleMarkDone = async (rem: Reminder) => {
    try {
      await reminderApi.markAsCompleted(rem.id);
      toast.success('Reminder marked as done');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to mark reminder as done');
    }
  };

  const handleSnooze = async (rem: Reminder, minutes: number) => {
    try {
      await reminderApi.snooze(rem.id, minutes);
      toast.info(`Snoozed for ${minutes} minutes`);
      setSnoozeDropdown(null);
      fetchReminders();
    } catch (err) {
      toast.error('Failed to snooze reminder');
    }
  };

  const handleDelete = async (rem: Reminder) => {
    if (!window.confirm(`Are you sure you want to delete this reminder?`)) return;

    try {
      await reminderApi.deleteReminder(rem.id);
      toast.info('Reminder deleted');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to delete reminder');
    }
  };

  // --- Helper Functions ---
  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 0) return 'Overdue';
    if (diffMins < 60) return `In ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const formatAbsoluteTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceEventOptions = () => {
    if (formData.reminderType === 'Appointment') {
      return appointments.map(apt => ({
        id: apt.id,
        label: `${apt.doctorName} - ${new Date(apt.appointmentDate).toLocaleDateString()}`
      }));
    } else if (formData.reminderType === 'Medication') {
      return medications.map(med => ({
        id: med.id,
        label: `${med.name} - ${med.dosage}`
      }));
    } else if (formData.reminderType === 'Health') {
      return healthLogs.map(log => ({
        id: log.id,
        label: `Health Log - ${new Date(log.date).toLocaleDateString()}`
      }));
    }
    return [];
  };

  const getPreviewText = (): string => {
    const triggerTime = calculateTriggerTime();
    if (!triggerTime) return 'Select source event and timing to see preview';

    const sourceOptions = getSourceEventOptions();
    const sourceEvent = sourceOptions.find(opt => opt.id === formData.sourceEventId);

    let repeatText = '';
    if (formData.repeatMode === 'daily') repeatText = ' • Repeat: Daily';
    else if (formData.repeatMode === 'weekly') repeatText = ' • Repeat: Weekly';
    else if (formData.repeatMode === 'custom') {
      repeatText = ` • Repeat: Every ${formData.customInterval} ${formData.customUnit}`;
    }

    return `First trigger: ${triggerTime.toLocaleString()} • For: ${sourceEvent?.label || 'Unknown'}${repeatText}`;
  };

  // --- Render Helpers ---
  const ReminderCard = ({ rem }: { rem: EnrichedReminder }) => {
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
            <Bell size={16} />
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
              <button className="btn-action btn-done" onClick={() => handleMarkDone(rem)}>
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
                    <button onClick={() => handleSnooze(rem, 15)}>15 minutes</button>
                    <button onClick={() => handleSnooze(rem, 30)}>30 minutes</button>
                    <button onClick={() => handleSnooze(rem, 60)}>1 hour</button>
                  </div>
                )}
              </div>
            </>
          )}
          <button className="btn-action btn-edit" onClick={() => handleEditClick(rem)}>
            Edit
          </button>
          <button className="btn-action btn-delete" onClick={() => handleDelete(rem)}>
            Delete
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-view">Loading Reminders...</div>;

  return (
    <div className="reminders-container">
      <header className="reminders-header">
        <div className="header-content">
          <div>
            <h1><Bell size={32} /> Reminders</h1>
            <p>Scheduled notifications for your care events</p>
          </div>
          <button className="btn-primary btn-add" onClick={handleAddClick}>
            <Plus size={20} /> Add Reminder
          </button>
        </div>
      </header>

      {error && <div className="error-box">{error}</div>}

      <div className="reminders-content">
        {/* Today Section */}
        {groupedReminders.today.length > 0 && (
          <section className="reminder-section">
            <h2 className="section-title">
              <Calendar size={28} /> Today
            </h2>
            <div className="reminder-list">
              {groupedReminders.today.map(rem => (
                <ReminderCard key={rem.id} rem={rem} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Section */}
        {groupedReminders.upcoming.length > 0 && (
          <section className="reminder-section">
            <h2 className="section-title">
              <Calendar size={28} /> Upcoming
            </h2>
            <div className="reminder-list">
              {groupedReminders.upcoming.map(rem => (
                <ReminderCard key={rem.id} rem={rem} />
              ))}
            </div>
          </section>
        )}

        {/* Past Section */}
        {groupedReminders.past.length > 0 && (
          <section className="reminder-section">
            <h2
              className="section-title collapsible"
              onClick={() => setIsPastCollapsed(!isPastCollapsed)}
            >
              <CheckCircle2 size={28} /> Completed / Past ({groupedReminders.past.length})
              {isPastCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </h2>
            {!isPastCollapsed && (
              <div className="reminder-list">
                {groupedReminders.past.map(rem => (
                  <ReminderCard key={rem.id} rem={rem} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {enrichedReminders.length === 0 && (
          <div className="empty-state">
            <Bell size={64} />
            <h3>No reminders scheduled</h3>
            <p>Create a reminder to get notified about appointments, medications, or health activities</p>
            <button className="btn-primary" onClick={handleAddClick}>
              <Plus size={20} /> Add Your First Reminder
            </button>
          </div>
        )}
      </div>

      {/* --- Form Modal --- */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content form-modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <div>
                  <h2>{editingReminder ? 'Edit Reminder' : 'Add New Reminder'}</h2>
                  <p className="form-subtitle">Set up a notification trigger</p>
                </div>
                <button type="button" className="btn-close" onClick={handleCancelForm}>
                  <X size={24} />
                </button>
              </div>

              <div className="form-body">
                {/* Section 1: Reminder Source */}
                <section className="form-section">
                  <h3 className="form-section-title">
                    <LinkIcon size={20} /> Reminder Source
                  </h3>

                  <div className="form-field">
                    <label>What is this reminder for? (Required)</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="reminderType"
                          checked={formData.reminderType === 'Appointment'}
                          onChange={() => handleFormChange('reminderType', 'Appointment')}
                          disabled={!!editingReminder}
                        />
                        <Calendar size={20} />
                        <span>Appointment</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="reminderType"
                          checked={formData.reminderType === 'Medication'}
                          onChange={() => handleFormChange('reminderType', 'Medication')}
                          disabled={!!editingReminder}
                        />
                        <Pill size={20} />
                        <span>Medication</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="reminderType"
                          checked={formData.reminderType === 'Health'}
                          onChange={() => handleFormChange('reminderType', 'Health')}
                          disabled={!!editingReminder}
                        />
                        <Activity size={20} />
                        <span>Health Activity</span>
                      </label>
                    </div>
                    {formErrors.reminderType && (
                      <span className="error-text">{formErrors.reminderType}</span>
                    )}
                  </div>

                  {formData.reminderType && (
                    <div className="form-field">
                      <label htmlFor="sourceEventId">
                        Select {formData.reminderType} (Required)
                      </label>
                      <select
                        id="sourceEventId"
                        value={formData.sourceEventId}
                        onChange={(e) => handleFormChange('sourceEventId', e.target.value)}
                        onBlur={() => handleBlur('sourceEventId')}
                        className={formErrors.sourceEventId ? 'error' : ''}
                        disabled={!!editingReminder}
                      >
                        <option value="">Select...</option>
                        {getSourceEventOptions().map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                      {formErrors.sourceEventId && (
                        <span className="error-text">{formErrors.sourceEventId}</span>
                      )}
                      {getSourceEventOptions().length === 0 && (
                        <span className="helper-text">
                          No {formData.reminderType.toLowerCase()}s available
                        </span>
                      )}
                    </div>
                  )}
                </section>

                {/* Section 2: Trigger Timing */}
                <section className="form-section">
                  <h3 className="form-section-title">
                    <Timer size={20} /> Trigger Timing
                  </h3>

                  <div className="form-field">
                    <label>When should this reminder trigger? (Required)</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="timingMode"
                          checked={formData.timingMode === 'relative'}
                          onChange={() => handleFormChange('timingMode', 'relative')}
                        />
                        <span>Relative to event time (Recommended)</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="timingMode"
                          checked={formData.timingMode === 'absolute'}
                          onChange={() => handleFormChange('timingMode', 'absolute')}
                        />
                        <span>Absolute time (Advanced)</span>
                      </label>
                    </div>
                  </div>

                  {formData.timingMode === 'relative' ? (
                    <div className="form-field">
                      <label htmlFor="relativeTrigger">Trigger time</label>
                      <select
                        id="relativeTrigger"
                        value={formData.relativeTrigger}
                        onChange={(e) => handleFormChange('relativeTrigger', e.target.value)}
                      >
                        <option value="at_event">At event time</option>
                        <option value="15m_before">15 minutes before</option>
                        <option value="30m_before">30 minutes before</option>
                        <option value="1h_before">1 hour before</option>
                        <option value="2h_before">2 hours before</option>
                        <option value="1d_before">1 day before</option>
                      </select>
                    </div>
                  ) : (
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="absoluteDate">Reminder Date (Required)</label>
                        <input
                          type="date"
                          id="absoluteDate"
                          value={formData.absoluteDate}
                          onChange={(e) => handleFormChange('absoluteDate', e.target.value)}
                          onBlur={() => handleBlur('absoluteDate')}
                          className={formErrors.absoluteDate ? 'error' : ''}
                        />
                        {formErrors.absoluteDate && (
                          <span className="error-text">{formErrors.absoluteDate}</span>
                        )}
                      </div>
                      <div className="form-field">
                        <label htmlFor="absoluteTime">Reminder Time (Required)</label>
                        <input
                          type="time"
                          id="absoluteTime"
                          value={formData.absoluteTime}
                          onChange={(e) => handleFormChange('absoluteTime', e.target.value)}
                          onBlur={() => handleBlur('absoluteTime')}
                          className={formErrors.absoluteTime ? 'error' : ''}
                        />
                        {formErrors.absoluteTime && (
                          <span className="error-text">{formErrors.absoluteTime}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {formErrors.triggerTime && (
                    <div className="error-box-inline">
                      <AlertCircle size={20} />
                      <span>{formErrors.triggerTime}</span>
                    </div>
                  )}

                  <div className="preview-box">
                    <Info size={16} />
                    <span>Preview: {getPreviewText()}</span>
                  </div>
                </section>

                {/* Section 3: Repeat Logic */}
                <section className="form-section">
                  <h3 className="form-section-title">
                    <Repeat size={20} /> Repeat Settings
                  </h3>

                  <div className="form-field">
                    <label>Should this reminder repeat?</label>
                    <div className="radio-group vertical">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="repeatMode"
                          checked={formData.repeatMode === 'none'}
                          onChange={() => handleFormChange('repeatMode', 'none')}
                        />
                        <span>No repeat (One-time reminder)</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="repeatMode"
                          checked={formData.repeatMode === 'daily'}
                          onChange={() => handleFormChange('repeatMode', 'daily')}
                        />
                        <span>Daily</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="repeatMode"
                          checked={formData.repeatMode === 'weekly'}
                          onChange={() => handleFormChange('repeatMode', 'weekly')}
                        />
                        <span>Weekly</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="repeatMode"
                          checked={formData.repeatMode === 'custom'}
                          onChange={() => handleFormChange('repeatMode', 'custom')}
                        />
                        <span>Custom interval</span>
                      </label>
                    </div>
                  </div>

                  {formData.repeatMode === 'custom' && (
                    <div className="form-field">
                      <label htmlFor="customInterval">Repeat every</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="customInterval"
                          value={formData.customInterval}
                          onChange={(e) => handleFormChange('customInterval', e.target.value)}
                          onBlur={() => handleBlur('customInterval')}
                          className={formErrors.customInterval ? 'error' : ''}
                          min="1"
                        />
                        <select
                          value={formData.customUnit}
                          onChange={(e) => handleFormChange('customUnit', e.target.value as any)}
                        >
                          <option value="hours">hours</option>
                          <option value="days">days</option>
                          <option value="weeks">weeks</option>
                        </select>
                      </div>
                      {formErrors.customInterval && (
                        <span className="error-text">{formErrors.customInterval}</span>
                      )}
                    </div>
                  )}
                </section>

                {/* Section 4: Delivery Preview */}
                <section className="form-section delivery-preview">
                  <h3 className="form-section-title">
                    <Info size={20} /> Delivery Preview
                  </h3>
                  <div className="preview-content">
                    <p><strong>ℹ️ This reminder will send a notification:</strong></p>
                    <ul>
                      <li>{getPreviewText()}</li>
                      <li>The notification will be sent to the elderly user's mobile device.</li>
                    </ul>
                  </div>
                </section>

                {/* Section 5: Notes */}
                <section className="form-section">
                  <h3 className="form-section-title">
                    <FileText size={20} /> Caregiver Notes
                  </h3>

                  <div className="form-field">
                    <label htmlFor="notes">Additional context (Optional)</label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      maxLength={500}
                      rows={4}
                    />
                    <span className="helper-text">
                      For caregiver reference only, not shown to patient
                    </span>
                  </div>
                </section>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingReminder ? 'Update Reminder' : 'Save Reminder')}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Exit Confirmation Modal --- */}
      {showExitConfirm && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Unsaved Reminder</h2>
            </div>
            <div className="modal-body">
              <p>You have unsaved reminder changes. Are you sure you want to leave?</p>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={() => setShowExitConfirm(false)}>
                Stay on Page
              </button>
              <button className="btn-secondary" onClick={handleConfirmExit}>
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
