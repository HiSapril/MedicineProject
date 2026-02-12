import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { medicationService } from '../../services/medication.service';
import type { Medication } from '../../api/medication.api';
import './MedicationForm.css';

interface MedicationFormData {
    name: string;
    form: Medication['form'];
    dosageAmount: number;
    dosageUnit: Medication['dosage']['unit'];
    frequencyType: Medication['frequency']['type'];
    timesPerDay: number;
    specificTimes: string[];
    intervalDays: number;
    daysOfWeek: number[];
    startDate: string;
    endDate: string;
    instructions: string;
}

const INITIAL_FORM: MedicationFormData = {
    name: '',
    form: 'Tablet',
    dosageAmount: 0,
    dosageUnit: 'mg',
    frequencyType: 'Daily',
    timesPerDay: 1,
    specificTimes: ['08:00'],
    intervalDays: 1,
    daysOfWeek: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: ''
};

interface MedicationFormProps {
    isOpen: boolean;
    onClose: () => void;
    editingId: string | null;
    medications: Medication[];
    onSuccess: () => void;
}

const MedicationForm = ({
    isOpen,
    onClose,
    editingId,
    medications,
    onSuccess
}: MedicationFormProps) => {
    const [formData, setFormData] = useState<MedicationFormData>(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editingId) {
            const med = medications.find(m => m.id === editingId);
            if (med) {
                setFormData({
                    name: med.name,
                    form: med.form,
                    dosageAmount: med.dosage.amount,
                    dosageUnit: med.dosage.unit,
                    frequencyType: med.frequency.type,
                    timesPerDay: med.frequency.timesPerDay || 1,
                    specificTimes: med.frequency.specificTimes || ['08:00'],
                    intervalDays: med.frequency.intervalDays || 1,
                    daysOfWeek: med.frequency.daysOfWeek || [],
                    startDate: new Date(med.startDate).toISOString().split('T')[0],
                    endDate: med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : '',
                    instructions: med.instructions || ''
                });
            }
        } else {
            setFormData(INITIAL_FORM);
        }
        setFormErrors({});
    }, [editingId, medications, isOpen]);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Medication name is required';
        if (formData.dosageAmount <= 0) errors.dosage = 'Dosage must be greater than 0';
        if (!formData.startDate) errors.startDate = 'Start date is required';

        if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
            errors.endDate = 'End date cannot be before start date';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        if (editingId) {
            const existing = medications.find(m => m.id === editingId);
            if (existing && existing.linkedRemindersCount && existing.linkedRemindersCount > 0) {
                const confirmed = window.confirm(
                    `⚠️ Warning: This medication has ${existing.linkedRemindersCount} active reminders.\n\nChanging the schedule will update all future reminders. Continue?`
                );
                if (!confirmed) return;
            }
        }

        try {
            const payload: Partial<Medication> = {
                name: formData.name,
                form: formData.form,
                dosage: {
                    amount: formData.dosageAmount,
                    unit: formData.dosageUnit
                },
                frequency: {
                    type: formData.frequencyType,
                    timesPerDay: formData.timesPerDay,
                    specificTimes: formData.specificTimes,
                    intervalDays: formData.intervalDays,
                    daysOfWeek: formData.daysOfWeek
                },
                startDate: new Date(formData.startDate).toISOString(),
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
                instructions: formData.instructions
            };

            if (editingId) {
                await medicationService.updateMedication(editingId, payload);
                toast.success('Medication updated successfully');
            } else {
                await medicationService.addMedication(payload as any);
                toast.success('Medication added successfully');
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save medication');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{editingId ? 'Edit Medication' : 'Add New Medication'}</h2>
                    <button className="btn-close" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body form-body">
                    {/* Section 1: Identity */}
                    <div className="form-section">
                        <h3>1. Medication Details</h3>
                        <div className="form-group">
                            <label>Medication Name</label>
                            <input
                                className="form-input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Lisinopril"
                            />
                            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Form</label>
                                <select
                                    className="form-select"
                                    value={formData.form}
                                    onChange={e => setFormData({ ...formData, form: e.target.value as any })}
                                >
                                    <option value="Tablet">Tablet</option>
                                    <option value="Capsule">Capsule</option>
                                    <option value="Liquid">Liquid</option>
                                    <option value="Injection">Injection</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Dosage */}
                    <div className="form-section">
                        <h3>2. Dosage</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.dosageAmount}
                                    onChange={e => setFormData({ ...formData, dosageAmount: Number(e.target.value) })}
                                />
                                {formErrors.dosage && <div className="form-error">{formErrors.dosage}</div>}
                            </div>
                            <div className="form-group">
                                <label>Unit</label>
                                <select
                                    className="form-select"
                                    value={formData.dosageUnit}
                                    onChange={e => setFormData({ ...formData, dosageUnit: e.target.value as any })}
                                >
                                    <option value="mg">mg</option>
                                    <option value="ml">ml</option>
                                    <option value="tablet">tablet(s)</option>
                                    <option value="pills">pills</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-hint">Typical dose: 250-500mg for most antibiotics</div>
                    </div>

                    {/* Section 3: Schedule */}
                    <div className="form-section">
                        <h3>3. Schedule</h3>
                        <div className="form-group">
                            <label>Frequency</label>
                            <select
                                className="form-select"
                                value={formData.frequencyType}
                                onChange={e => {
                                    setFormData({
                                        ...formData,
                                        frequencyType: e.target.value as any,
                                        specificTimes: e.target.value === 'Daily' ? ['08:00'] : []
                                    });
                                }}
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Interval">Every X Days</option>
                                <option value="AsNeeded">As Needed (PRN)</option>
                            </select>
                        </div>

                        {formData.frequencyType === 'Daily' && (
                            <div className="form-group">
                                <label>Times Per Day</label>
                                <select
                                    className="form-select"
                                    value={formData.timesPerDay}
                                    onChange={e => {
                                        const count = Number(e.target.value);
                                        const newTimes = [...formData.specificTimes];
                                        while (newTimes.length < count) newTimes.push('12:00');
                                        while (newTimes.length > count) newTimes.pop();

                                        setFormData({ ...formData, timesPerDay: count, specificTimes: newTimes });
                                    }}
                                >
                                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} time(s)</option>)}
                                </select>
                            </div>
                        )}

                        {formData.frequencyType === 'Daily' && (
                            <div className="form-group">
                                <label>Scheduled Times</label>
                                <div className="form-row">
                                    {formData.specificTimes.map((time, idx) => (
                                        <input
                                            key={idx}
                                            type="time"
                                            className="form-input"
                                            value={time}
                                            onChange={e => {
                                                const newTimes = [...formData.specificTimes];
                                                newTimes[idx] = e.target.value;
                                                setFormData({ ...formData, specificTimes: newTimes });
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 4: Duration */}
                    <div className="form-section">
                        <h3>4. Duration</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                                {formErrors.startDate && <div className="form-error">{formErrors.startDate}</div>}
                            </div>
                            <div className="form-group">
                                <label>End Date (Optional)</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                />
                                {formErrors.endDate && <div className="form-error">{formErrors.endDate}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Instructions */}
                    <div className="form-section" style={{ borderBottom: 'none' }}>
                        <h3>5. Instructions</h3>
                        <div className="form-group">
                            <label>Special Instructions</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                value={formData.instructions}
                                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                                placeholder="e.g. Take with food, do not operate heavy machinery..."
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={handleSave}>
                        {editingId ? 'Save Changes' : 'Create Medication'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicationForm;
