import React, { useState, useEffect } from 'react';
import {
    X,
    Stethoscope,
    Calendar,
    AlertCircle,
    MapPin,
    Home,
    Video,
    FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { appointmentApi, type CreateAppointmentPayload } from '../../api/appointment.api';
import type { Appointment } from './AppointmentCard';
import './AppointmentForm.css';

interface AppointmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    editingAppointment: Appointment | null;
    onSuccess: () => void;
}

interface FormData {
    appointmentType: string;
    doctorName: string;
    specialty: string;
    appointmentDate: string;
    appointmentTime: string;
    duration: string;
    location: string;
    isTelehealth: boolean;
    transportationNotes: string;
    preparationInstructions: string;
    notes: string;
}

interface FormErrors {
    [key: string]: string;
}

const AppointmentForm = ({
    isOpen,
    onClose,
    editingAppointment,
    onSuccess
}: AppointmentFormProps) => {
    const [formData, setFormData] = useState<FormData>({
        appointmentType: '',
        doctorName: '',
        specialty: '',
        appointmentDate: '',
        appointmentTime: '',
        duration: '',
        location: '',
        isTelehealth: false,
        transportationNotes: '',
        preparationInstructions: '',
        notes: ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    useEffect(() => {
        if (editingAppointment) {
            const aptDate = new Date(editingAppointment.appointmentDate);
            setFormData({
                appointmentType: editingAppointment.appointmentType || '',
                doctorName: editingAppointment.doctorName,
                specialty: editingAppointment.specialty || '',
                appointmentDate: aptDate.toISOString().split('T')[0],
                appointmentTime: aptDate.toTimeString().slice(0, 5),
                duration: editingAppointment.duration?.toString() || '',
                location: editingAppointment.location,
                isTelehealth: editingAppointment.isTelehealth || false,
                transportationNotes: editingAppointment.transportationNotes || '',
                preparationInstructions: editingAppointment.preparationInstructions || '',
                notes: editingAppointment.notes || ''
            });
            setIsDirty(false);
        } else {
            resetForm();
        }
    }, [editingAppointment, isOpen]);

    const resetForm = () => {
        setFormData({
            appointmentType: '',
            doctorName: '',
            specialty: '',
            appointmentDate: '',
            appointmentTime: '',
            duration: '',
            location: '',
            isTelehealth: false,
            transportationNotes: '',
            preparationInstructions: '',
            notes: ''
        });
        setFormErrors({});
        setIsDirty(false);
    };

    const handleFormChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateField = (field: keyof FormData, value: string | boolean): string => {
        switch (field) {
            case 'appointmentType':
                return !value ? 'Please select an appointment type' : '';
            case 'doctorName':
                return !value ? 'Please enter the doctor or facility name' :
                    (value as string).length < 2 ? 'Name must be at least 2 characters' : '';
            case 'appointmentDate':
                return !value ? 'Please select an appointment date' : '';
            case 'appointmentTime':
                return !value ? 'Please choose a valid appointment time' : '';
            case 'duration':
                return value && Number(value) <= 0 ? 'Duration must be greater than 0' : '';
            default:
                return '';
        }
    };

    const handleBlur = (field: keyof FormData) => {
        const error = validateField(field, formData[field]);
        setFormErrors(prev => ({ ...prev, [field]: error }));
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        errors.appointmentType = validateField('appointmentType', formData.appointmentType);
        errors.doctorName = validateField('doctorName', formData.doctorName);
        errors.appointmentDate = validateField('appointmentDate', formData.appointmentDate);
        errors.appointmentTime = validateField('appointmentTime', formData.appointmentTime);
        errors.duration = validateField('duration', formData.duration);

        const filteredErrors = Object.fromEntries(
            Object.entries(errors).filter(([_, v]) => v !== '')
        );

        setFormErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
            const payload: CreateAppointmentPayload = {
                doctorName: formData.doctorName,
                location: formData.location,
                appointmentDate: dateTime.toISOString(),
                notes: formData.notes,
                appointmentType: formData.appointmentType,
                specialty: formData.specialty,
                duration: formData.duration ? Number(formData.duration) : undefined,
                isTelehealth: formData.isTelehealth,
                transportationNotes: formData.transportationNotes,
                preparationInstructions: formData.preparationInstructions
            };

            if (editingAppointment) {
                await appointmentApi.update(editingAppointment.id, payload);
                toast.success('Appointment updated successfully');
            } else {
                await appointmentApi.create(payload);
                toast.success('Appointment created successfully');
            }

            onSuccess();
            onClose();
            resetForm();
        } catch (err) {
            toast.error('Failed to save appointment. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        if (isDirty) {
            setShowExitConfirm(true);
        } else {
            onClose();
            resetForm();
        }
    };

    const handleConfirmExit = () => {
        setShowExitConfirm(false);
        onClose();
        resetForm();
    };

    const isPastDateTime = () => {
        if (!formData.appointmentDate || !formData.appointmentTime) return false;
        const selectedDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
        return selectedDateTime < new Date();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content form-modal" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <div>
                            <h2>{editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}</h2>
                            <p className="form-subtitle">Schedule a medical visit</p>
                        </div>
                        <button type="button" className="btn-close" onClick={handleCancelForm}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="form-body">
                        {/* Section 1: Appointment Identity */}
                        <section className="form-section">
                            <h3 className="form-section-title">
                                <Stethoscope size={20} /> Appointment Information
                            </h3>

                            <div className="form-field">
                                <label htmlFor="appointmentType">Appointment Type (Required)</label>
                                <select
                                    id="appointmentType"
                                    value={formData.appointmentType}
                                    onChange={(e) => handleFormChange('appointmentType', e.target.value)}
                                    onBlur={() => handleBlur('appointmentType')}
                                    className={formErrors.appointmentType ? 'error' : ''}
                                >
                                    <option value="">Select type...</option>
                                    <option value="Checkup">Checkup</option>
                                    <option value="Test">Test</option>
                                    <option value="Surgery">Surgery</option>
                                    <option value="Consultation">Consultation</option>
                                    <option value="Follow-up">Follow-up</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                                {formErrors.appointmentType && (
                                    <span className="error-text">{formErrors.appointmentType}</span>
                                )}
                                <span className="helper-text">Examples: Checkup, Test, Surgery, Consultation</span>
                            </div>

                            <div className="form-field">
                                <label htmlFor="doctorName">Doctor / Facility Name (Required)</label>
                                <input
                                    type="text"
                                    id="doctorName"
                                    value={formData.doctorName}
                                    onChange={(e) => handleFormChange('doctorName', e.target.value)}
                                    onBlur={() => handleBlur('doctorName')}
                                    className={formErrors.doctorName ? 'error' : ''}
                                    maxLength={100}
                                />
                                {formErrors.doctorName && (
                                    <span className="error-text">{formErrors.doctorName}</span>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="specialty">Specialty (Optional)</label>
                                <input
                                    type="text"
                                    id="specialty"
                                    value={formData.specialty}
                                    onChange={(e) => handleFormChange('specialty', e.target.value)}
                                    maxLength={50}
                                />
                                <span className="helper-text">E.g., Cardiology, Orthopedics</span>
                            </div>
                        </section>

                        {/* Section 2: Date & Time */}
                        <section className="form-section">
                            <h3 className="form-section-title">
                                <Calendar size={20} /> Date & Time
                            </h3>

                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="appointmentDate">Appointment Date (Required)</label>
                                    <input
                                        type="date"
                                        id="appointmentDate"
                                        value={formData.appointmentDate}
                                        onChange={(e) => handleFormChange('appointmentDate', e.target.value)}
                                        onBlur={() => handleBlur('appointmentDate')}
                                        className={formErrors.appointmentDate ? 'error' : ''}
                                    />
                                    {formErrors.appointmentDate && (
                                        <span className="error-text">{formErrors.appointmentDate}</span>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label htmlFor="appointmentTime">Appointment Time (Required)</label>
                                    <input
                                        type="time"
                                        id="appointmentTime"
                                        value={formData.appointmentTime}
                                        onChange={(e) => handleFormChange('appointmentTime', e.target.value)}
                                        onBlur={() => handleBlur('appointmentTime')}
                                        className={formErrors.appointmentTime ? 'error' : ''}
                                    />
                                    {formErrors.appointmentTime && (
                                        <span className="error-text">{formErrors.appointmentTime}</span>
                                    )}
                                </div>
                            </div>

                            {isPastDateTime() && (
                                <div className="warning-box">
                                    <AlertCircle size={20} />
                                    <span>This appointment is scheduled in the past. Please confirm this is correct.</span>
                                </div>
                            )}

                            <div className="form-field">
                                <label htmlFor="duration">Duration (Optional)</label>
                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        id="duration"
                                        value={formData.duration}
                                        onChange={(e) => handleFormChange('duration', e.target.value)}
                                        onBlur={() => handleBlur('duration')}
                                        className={formErrors.duration ? 'error' : ''}
                                        min="1"
                                    />
                                    <span className="unit">minutes</span>
                                </div>
                                {formErrors.duration && (
                                    <span className="error-text">{formErrors.duration}</span>
                                )}
                                <span className="helper-text">Estimated appointment length</span>
                            </div>
                        </section>

                        {/* Section 3: Location & Access */}
                        <section className="form-section">
                            <h3 className="form-section-title">
                                <MapPin size={20} /> Location & Access
                            </h3>

                            <div className="form-field">
                                <label htmlFor="location">Location Address</label>
                                <input
                                    type="text"
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleFormChange('location', e.target.value)}
                                    maxLength={200}
                                    placeholder="123 Main St, City, State ZIP"
                                />
                            </div>

                            <div className="form-field">
                                <label>Appointment Format</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="appointmentFormat"
                                            checked={!formData.isTelehealth}
                                            onChange={() => handleFormChange('isTelehealth', false)}
                                        />
                                        <Home size={20} />
                                        <span>In-Person</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="appointmentFormat"
                                            checked={formData.isTelehealth}
                                            onChange={() => handleFormChange('isTelehealth', true)}
                                        />
                                        <Video size={20} />
                                        <span>Telehealth</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="transportationNotes">Transportation Notes (Optional)</label>
                                <textarea
                                    id="transportationNotes"
                                    value={formData.transportationNotes}
                                    onChange={(e) => handleFormChange('transportationNotes', e.target.value)}
                                    maxLength={300}
                                    rows={3}
                                />
                                <span className="helper-text">E.g., "Taxi booked", "Family member driving"</span>
                            </div>
                        </section>

                        {/* Section 4: Preparation & Notes */}
                        <section className="form-section">
                            <h3 className="form-section-title">
                                <FileText size={20} /> Preparation & Notes
                            </h3>

                            <div className="form-field">
                                <label htmlFor="preparationInstructions">Preparation Instructions</label>
                                <textarea
                                    id="preparationInstructions"
                                    value={formData.preparationInstructions}
                                    onChange={(e) => handleFormChange('preparationInstructions', e.target.value)}
                                    maxLength={500}
                                    rows={4}
                                />
                                <span className="helper-text">E.g., "Fasting required", "Bring previous reports"</span>
                            </div>

                            <div className="form-field">
                                <label htmlFor="notes">Additional Notes</label>
                                <textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleFormChange('notes', e.target.value)}
                                    maxLength={1000}
                                    rows={5}
                                />
                                <span className="helper-text">Any other important information</span>
                            </div>
                        </section>

                        {/* Section 5: Identity Block (Edit Mode Only) */}
                        {editingAppointment && (
                            <section className="form-section identity-block">
                                <h3 className="form-section-title">
                                    🔒 Appointment Record
                                </h3>
                                <div className="identity-info">
                                    <p><strong>Appointment ID:</strong> {editingAppointment.id}</p>
                                    <p><strong>Created:</strong> {new Date(editingAppointment.appointmentDate).toLocaleString()}</p>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (editingAppointment ? 'Update Appointment' : 'Save Appointment')}
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

                {showExitConfirm && (
                    <div className="modal-overlay">
                        <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>⚠️ Unsaved Changes</h2>
                            </div>
                            <div className="modal-body">
                                <p>You have unsaved appointment changes. Are you sure you want to leave?</p>
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
        </div>
    );
};

export default AppointmentForm;
