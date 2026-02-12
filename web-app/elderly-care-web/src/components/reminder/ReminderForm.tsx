import { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Calendar, Pill, Activity, Timer, Info } from 'lucide-react';
import { reminderApi, type CreateReminderPayload, type Reminder } from '../../api/reminder.api';
import { toast } from 'react-toastify';
import './ReminderForm.css';

interface Appointment {
    id: string;
    doctorName: string;
    appointmentDate: string;
    appointmentType?: string;
}

interface Medication {
    id: string;
    name: string;
    dosage: any;
    time: string;
}

interface HealthLog {
    id: string;
    date: string;
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

interface ReminderFormProps {
    isOpen: boolean;
    onClose: () => void;
    editingReminder: Reminder | null;
    appointments: Appointment[];
    medications: Medication[];
    healthLogs: HealthLog[];
    userId: string;
    onSuccess: () => void;
}

const INITIAL_FORM: FormData = {
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
};

const ReminderForm = ({
    isOpen,
    onClose,
    editingReminder,
    appointments,
    medications,
    healthLogs,
    userId,
    onSuccess
}: ReminderFormProps) => {
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    useEffect(() => {
        if (editingReminder) {
            const remDate = new Date(editingReminder.scheduledTime);
            let reminderType: 'Appointment' | 'Medication' | 'Health' = 'Appointment';
            if (editingReminder.type === 0) reminderType = 'Medication';
            else if (editingReminder.type === 1) reminderType = 'Appointment';
            else if (editingReminder.type === 2) reminderType = 'Health';

            setFormData({
                reminderType,
                sourceEventId: editingReminder.referenceId,
                timingMode: 'absolute',
                relativeTrigger: '1h_before',
                absoluteDate: remDate.toISOString().split('T')[0],
                absoluteTime: remDate.toTimeString().slice(0, 5),
                repeatMode: 'none',
                customInterval: '1',
                customUnit: 'days',
                notes: ''
            });
            setIsDirty(false);
        } else {
            setFormData(INITIAL_FORM);
            setFormErrors({});
            setIsDirty(false);
        }
    }, [editingReminder, isOpen]);

    const handleFormChange = (field: keyof FormData, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
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

        if (!formData.sourceEventId) return null;

        let sourceTime: Date | null = null;
        if (formData.reminderType === 'Appointment') {
            const apt = appointments.find(a => a.id === formData.sourceEventId);
            if (apt) sourceTime = new Date(apt.appointmentDate);
        } else if (formData.reminderType === 'Medication') {
            const med = medications.find(m => m.id === formData.sourceEventId);
            if (med) {
                const today = new Date();
                const [hours, minutes] = med.time.split(':');
                sourceTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                    parseInt(hours), parseInt(minutes));
            }
        }

        if (!sourceTime) return null;
        const triggerTime = new Date(sourceTime);

        switch (formData.relativeTrigger) {
            case 'at_event': break;
            case '15m_before': triggerTime.setMinutes(triggerTime.getMinutes() - 15); break;
            case '30m_before': triggerTime.setMinutes(triggerTime.getMinutes() - 30); break;
            case '1h_before': triggerTime.setHours(triggerTime.getHours() - 1); break;
            case '2h_before': triggerTime.setHours(triggerTime.getHours() - 2); break;
            case '1d_before': triggerTime.setDate(triggerTime.getDate() - 1); break;
        }
        return triggerTime;
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        const now = new Date();

        errors.reminderType = validateField('reminderType', formData.reminderType);
        errors.sourceEventId = validateField('sourceEventId', formData.sourceEventId);

        if (formData.timingMode === 'absolute') {
            errors.absoluteDate = validateField('absoluteDate', formData.absoluteDate);
            errors.absoluteTime = validateField('absoluteTime', formData.absoluteTime);
        }

        if (formData.repeatMode === 'custom') {
            errors.customInterval = validateField('customInterval', formData.customInterval);
        }

        const triggerTime = calculateTriggerTime();
        if (triggerTime && triggerTime < now) {
            errors.triggerTime = `Reminder time cannot be in the past. Selection: ${triggerTime.toLocaleString()}`;
        }

        const filteredErrors = Object.fromEntries(Object.entries(errors).filter(([_, v]) => v !== ''));
        setFormErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const triggerTime = calculateTriggerTime();
            if (!triggerTime) return;

            let typeEnum: 0 | 1 | 2;
            switch (formData.reminderType) {
                case 'Medication': typeEnum = 0; break;
                case 'Appointment': typeEnum = 1; break;
                case 'Health': typeEnum = 2; break;
                default: return;
            }

            const payload: CreateReminderPayload = {
                userId,
                type: typeEnum,
                referenceId: formData.sourceEventId,
                scheduledTime: triggerTime.toISOString()
            };

            if (editingReminder) {
                await reminderApi.updateReminder(editingReminder.id, payload);
                toast.success('Reminder updated');
            } else {
                await reminderApi.createReminder(payload);
                toast.success('Reminder created');
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save reminder');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        if (isDirty) setShowExitConfirm(true);
        else onClose();
    };

    const getSourceEventOptions = () => {
        if (formData.reminderType === 'Appointment') {
            return appointments.map(apt => ({
                id: apt.id, label: `${apt.doctorName} - ${new Date(apt.appointmentDate).toLocaleDateString()}`
            }));
        } else if (formData.reminderType === 'Medication') {
            return medications.map(med => ({
                id: med.id, label: `${med.name}`
            }));
        } else if (formData.reminderType === 'Health') {
            return healthLogs.map(log => ({
                id: log.id, label: `Health Log - ${new Date(log.date).toLocaleDateString()}`
            }));
        }
        return [];
    };

    const getPreviewText = (): string => {
        const triggerTime = calculateTriggerTime();
        if (!triggerTime) return 'Select source event and timing to see preview';
        const sourceOptions = getSourceEventOptions();
        const sourceEvent = sourceOptions.find(opt => opt.id === formData.sourceEventId);
        return `Trigger: ${triggerTime.toLocaleString()} • For: ${sourceEvent?.label || 'Unknown'}`;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content form-modal">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <div>
                            <h2>{editingReminder ? 'Edit Reminder' : 'Add New Reminder'}</h2>
                            <p className="form-subtitle">Set up a notification trigger</p>
                        </div>
                        <button type="button" className="btn-close" onClick={handleCancelForm}><X size={24} /></button>
                    </div>

                    <div className="form-body">
                        <section className="form-section">
                            <h3 className="form-section-title"><LinkIcon size={20} /> Reminder Source</h3>
                            <div className="form-field">
                                <label>What is this reminder for? (Required)</label>
                                <div className="radio-group">
                                    {(['Appointment', 'Medication', 'Health'] as const).map(type => (
                                        <label key={type} className="radio-label">
                                            <input
                                                type="radio"
                                                checked={formData.reminderType === type}
                                                onChange={() => handleFormChange('reminderType', type)}
                                                disabled={!!editingReminder}
                                            />
                                            {type === 'Appointment' ? <Calendar size={20} /> : type === 'Medication' ? <Pill size={20} /> : <Activity size={20} />}
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                                {formErrors.reminderType && <span className="error-text">{formErrors.reminderType}</span>}
                            </div>

                            {formData.reminderType && (
                                <div className="form-field">
                                    <label htmlFor="sourceEventId">Select {formData.reminderType} (Required)</label>
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
                                    {formErrors.sourceEventId && <span className="error-text">{formErrors.sourceEventId}</span>}
                                </div>
                            )}
                        </section>

                        <section className="form-section">
                            <h3 className="form-section-title"><Timer size={20} /> Trigger Timing</h3>
                            <div className="form-field">
                                <label>When should this reminder trigger? (Required)</label>
                                <div className="radio-group vertical">
                                    <label className="radio-label">
                                        <input type="radio" checked={formData.timingMode === 'relative'} onChange={() => handleFormChange('timingMode', 'relative')} />
                                        <span>Relative to event time (Recommended)</span>
                                    </label>
                                    <label className="radio-label">
                                        <input type="radio" checked={formData.timingMode === 'absolute'} onChange={() => handleFormChange('timingMode', 'absolute')} />
                                        <span>Specific date and time</span>
                                    </label>
                                </div>
                            </div>

                            {formData.timingMode === 'relative' ? (
                                <div className="form-field">
                                    <label>Relative Trigger Time</label>
                                    <select value={formData.relativeTrigger} onChange={(e) => handleFormChange('relativeTrigger', e.target.value)}>
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
                                        <label>Date</label>
                                        <input type="date" value={formData.absoluteDate} onChange={(e) => handleFormChange('absoluteDate', e.target.value)} onBlur={() => handleBlur('absoluteDate')} />
                                        {formErrors.absoluteDate && <span className="error-text">{formErrors.absoluteDate}</span>}
                                    </div>
                                    <div className="form-field">
                                        <label>Time</label>
                                        <input type="time" value={formData.absoluteTime} onChange={(e) => handleFormChange('absoluteTime', e.target.value)} onBlur={() => handleBlur('absoluteTime')} />
                                        {formErrors.absoluteTime && <span className="error-text">{formErrors.absoluteTime}</span>}
                                    </div>
                                </div>
                            )}
                        </section>

                        <div className="delivery-preview">
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#3498db' }}>
                                <Info size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                Reminder Preview
                            </h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>{getPreviewText()}</p>
                            {formErrors.triggerTime && <span className="error-text" style={{ marginTop: '10px' }}>{formErrors.triggerTime}</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={handleCancelForm}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editingReminder ? 'Update Reminder' : 'Create Reminder'}</button>
                    </div>
                </form>
            </div>

            {showExitConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content confirm-modal">
                        <div className="modal-body">
                            <h3>Discard Unsaved Changes?</h3>
                            <p>You have unsaved changes. Are you sure you want to close the form?</p>
                            <div className="form-actions" style={{ padding: 0, marginTop: '20px' }}>
                                <button className="btn-secondary" onClick={() => setShowExitConfirm(false)}>Stay</button>
                                <button className="btn-primary" style={{ background: '#e74c3c' }} onClick={() => { setShowExitConfirm(false); onClose(); }}>Discard</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReminderForm;
