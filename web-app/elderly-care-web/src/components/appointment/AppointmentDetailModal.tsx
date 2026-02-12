import { X } from 'lucide-react';
import type { Appointment } from './AppointmentCard';
import './AppointmentDetailModal.css';

interface AppointmentDetailModalProps {
    appointment: Appointment | null;
    onClose: () => void;
}

const AppointmentDetailModal = ({ appointment, onClose }: AppointmentDetailModalProps) => {
    if (!appointment) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Appointment Details</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="detail-modal-grid">
                    {appointment.appointmentType && (
                        <div className="detail-block">
                            <span className="detail-label">Appointment Type</span>
                            <span className="detail-text">{appointment.appointmentType}</span>
                        </div>
                    )}
                    <div className="detail-block">
                        <span className="detail-label">Professional / Clinic</span>
                        <span className="detail-text">{appointment.doctorName}</span>
                    </div>
                    {appointment.specialty && (
                        <div className="detail-block">
                            <span className="detail-label">Specialty</span>
                            <span className="detail-text">{appointment.specialty}</span>
                        </div>
                    )}
                    <div className="detail-block">
                        <span className="detail-label">Date & Time</span>
                        <span className="detail-text">
                            {new Date(appointment.appointmentDate).toLocaleString()}
                        </span>
                    </div>
                    {appointment.duration && (
                        <div className="detail-block">
                            <span className="detail-label">Duration</span>
                            <span className="detail-text">{appointment.duration} minutes</span>
                        </div>
                    )}
                    <div className="detail-block">
                        <span className="detail-label">Location</span>
                        <span className="detail-text">
                            {appointment.isTelehealth ? '🎥 Telehealth' : appointment.location}
                        </span>
                    </div>
                    {appointment.transportationNotes && (
                        <div className="detail-block">
                            <span className="detail-label">Transportation</span>
                            <span className="detail-text">{appointment.transportationNotes}</span>
                        </div>
                    )}
                    {appointment.preparationInstructions && (
                        <div className="detail-block">
                            <span className="detail-label">Preparation Instructions</span>
                            <span className="detail-text">{appointment.preparationInstructions}</span>
                        </div>
                    )}
                    {appointment.notes && (
                        <div className="detail-block">
                            <span className="detail-label">Additional Notes</span>
                            <span className="detail-text">{appointment.notes}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailModal;
