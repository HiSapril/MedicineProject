import { useEffect, useState, useMemo } from 'react';
import { appointmentApi, type CreateAppointmentPayload } from '../api/appointment.api';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  XCircle,
  CheckCircle,
  AlertCircle,
  History,
  Plus,
  X,
  Stethoscope,
  Home,
  Video
} from 'lucide-react';
import { toast } from 'react-toastify';
import './AppointmentsPage.css';

interface Appointment {
  id: string;
  doctorName: string;
  location: string;
  appointmentDate: string;
  notes?: string;
  status?: 'Upcoming' | 'Completed' | 'Missed' | 'Cancelled';
  appointmentType?: string;
  specialty?: string;
  duration?: number;
  isTelehealth?: boolean;
  transportationNotes?: string;
  preparationInstructions?: string;
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

const AppointmentsPage = () => {
  // --- State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isPastCollapsed, setIsPastCollapsed] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form State
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

  // --- Data Fetching ---
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentApi.getAll();
      setAppointments(response.data);
      setError('');
    } catch (err) {
      setError('Unable to load appointments. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Logic & Grouping ---
  const now = new Date();

  const getAppointmentStatus = (apt: Appointment): string => {
    if (apt.status === 'Cancelled') return 'cancelled';
    if (apt.status === 'Missed') return 'missed';
    const appointmentDate = new Date(apt.appointmentDate);

    if (appointmentDate < now) {
      return apt.status === 'Completed' ? 'completed' : 'completed';
    }
    return 'upcoming';
  };

  const groupedAppointments = useMemo(() => {
    const sorted = [...appointments].sort(
      (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    );

    return {
      upcoming: sorted.filter(apt => new Date(apt.appointmentDate) >= now),
      past: sorted.filter(apt => new Date(apt.appointmentDate) < now).reverse()
    };
  }, [appointments]);

  // --- Form Handlers ---
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
    setEditingAppointment(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (apt: Appointment) => {
    const aptDate = new Date(apt.appointmentDate);
    setFormData({
      appointmentType: apt.appointmentType || '',
      doctorName: apt.doctorName,
      specialty: apt.specialty || '',
      appointmentDate: aptDate.toISOString().split('T')[0],
      appointmentTime: aptDate.toTimeString().slice(0, 5),
      duration: apt.duration?.toString() || '',
      location: apt.location,
      isTelehealth: apt.isTelehealth || false,
      transportationNotes: apt.transportationNotes || '',
      preparationInstructions: apt.preparationInstructions || '',
      notes: apt.notes || ''
    });
    setEditingAppointment(apt);
    setShowForm(true);
    setIsDirty(false);
  };

  const handleFormChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error for this field
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
      // Focus first error field
      const firstErrorField = Object.keys(formErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

      const payload: CreateAppointmentPayload & Partial<Appointment> = {
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

      await fetchAppointments();
      setShowForm(false);
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
      setShowForm(false);
      resetForm();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setShowForm(false);
    resetForm();
  };

  const handleCancelAppointment = async (apt: Appointment) => {
    if (!window.confirm(`Are you sure you want to cancel the appointment with ${apt.doctorName}?`)) return;

    try {
      await appointmentApi.delete(apt.id);
      toast.info('Appointment cancelled.');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel appointment.');
    }
  };

  const formatDateParts = (dateIso: string) => {
    const d = new Date(dateIso);
    return {
      day: d.getDate(),
      month: d.toLocaleString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const isPastDateTime = () => {
    if (!formData.appointmentDate || !formData.appointmentTime) return false;
    const selectedDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
    return selectedDateTime < now;
  };

  // --- Render Helpers ---
  const AppointmentCard = ({ apt }: { apt: Appointment }) => {
    const status = getAppointmentStatus(apt);
    const { day, month, year, time } = formatDateParts(apt.appointmentDate);

    return (
      <div className={`appointment-card status-${status}`}>
        <div className="date-sidestrip">
          <span className="date-month">{month}</span>
          <span className="date-day">{day}</span>
          <span className="date-year">{year}</span>
        </div>

        <div className="appointment-main">
          <div className="appointment-info">
            <div className="appointment-badge">{status}</div>
            <div className="appointment-time">
              <Clock size={18} /> {time}
            </div>
            <h3 className="appointment-doctor">{apt.doctorName}</h3>
            {apt.appointmentType && (
              <div className="appointment-type">
                <Stethoscope size={16} /> {apt.appointmentType}
              </div>
            )}
            <div className="appointment-location">
              {apt.isTelehealth ? <Video size={18} /> : <MapPin size={18} />}
              {apt.location || (apt.isTelehealth ? 'Telehealth' : 'Location not specified')}
            </div>
          </div>

          <div className="appointment-actions">
            <button className="btn-action btn-details" onClick={() => setSelectedAppointment(apt)}>
              View Details
            </button>
            {status === 'upcoming' && (
              <>
                <button className="btn-action btn-edit" onClick={() => handleEditClick(apt)}>
                  Edit
                </button>
                <button
                  className="btn-action btn-cancel-appt"
                  onClick={() => handleCancelAppointment(apt)}
                >
                  Cancel Visit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-view">Loading Appointments...</div>;

  return (
    <div className="appointments-container">
      <header className="appointments-header">
        <div className="header-content">
          <div>
            <h1><Calendar size={32} /> Appointments</h1>
            <p>Your medical visits and scheduled care events</p>
          </div>
          <button className="btn-primary btn-add" onClick={handleAddClick}>
            <Plus size={20} /> Add Appointment
          </button>
        </div>
      </header>

      {error && <div className="error-box">{error}</div>}

      <div className="appointments-content">
        {/* Upcoming Section */}
        <section className="appointment-section">
          <h2 className="section-title">
            <Calendar size={28} /> Upcoming Visits
          </h2>
          <div className="appointment-list">
            {groupedAppointments.upcoming.length === 0 ? (
              <p className="empty-text">No upcoming appointments scheduled.</p>
            ) : (
              groupedAppointments.upcoming.map(apt => (
                <AppointmentCard key={apt.id} apt={apt} />
              ))
            )}
          </div>
        </section>

        {/* Past Section */}
        <section className="appointment-section">
          <h2
            className="section-title collapsible"
            onClick={() => setIsPastCollapsed(!isPastCollapsed)}
          >
            <History size={28} /> Past Appointments ({groupedAppointments.past.length})
            {isPastCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </h2>
          {!isPastCollapsed && (
            <div className="appointment-list">
              {groupedAppointments.past.length === 0 ? (
                <p className="empty-text">No past appointment records found.</p>
              ) : (
                groupedAppointments.past.map(apt => (
                  <AppointmentCard key={apt.id} apt={apt} />
                ))
              )}
            </div>
          )}
        </section>
      </div>

      {/* --- Detail Modal --- */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button className="btn-close" onClick={() => setSelectedAppointment(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="detail-modal-grid">
              {selectedAppointment.appointmentType && (
                <div className="detail-block">
                  <span className="detail-label">Appointment Type</span>
                  <span className="detail-text">{selectedAppointment.appointmentType}</span>
                </div>
              )}
              <div className="detail-block">
                <span className="detail-label">Professional / Clinic</span>
                <span className="detail-text">{selectedAppointment.doctorName}</span>
              </div>
              {selectedAppointment.specialty && (
                <div className="detail-block">
                  <span className="detail-label">Specialty</span>
                  <span className="detail-text">{selectedAppointment.specialty}</span>
                </div>
              )}
              <div className="detail-block">
                <span className="detail-label">Date & Time</span>
                <span className="detail-text">
                  {new Date(selectedAppointment.appointmentDate).toLocaleString()}
                </span>
              </div>
              {selectedAppointment.duration && (
                <div className="detail-block">
                  <span className="detail-label">Duration</span>
                  <span className="detail-text">{selectedAppointment.duration} minutes</span>
                </div>
              )}
              <div className="detail-block">
                <span className="detail-label">Location</span>
                <span className="detail-text">
                  {selectedAppointment.isTelehealth ? '🎥 Telehealth' : selectedAppointment.location}
                </span>
              </div>
              {selectedAppointment.transportationNotes && (
                <div className="detail-block">
                  <span className="detail-label">Transportation</span>
                  <span className="detail-text">{selectedAppointment.transportationNotes}</span>
                </div>
              )}
              {selectedAppointment.preparationInstructions && (
                <div className="detail-block">
                  <span className="detail-label">Preparation Instructions</span>
                  <span className="detail-text">{selectedAppointment.preparationInstructions}</span>
                </div>
              )}
              {selectedAppointment.notes && (
                <div className="detail-block">
                  <span className="detail-label">Additional Notes</span>
                  <span className="detail-text">{selectedAppointment.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Form Modal --- */}
      {showForm && (
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
          </div>
        </div>
      )}

      {/* --- Exit Confirmation Modal --- */}
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
  );
};

export default AppointmentsPage;
