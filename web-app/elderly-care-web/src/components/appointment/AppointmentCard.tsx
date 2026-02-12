import {
    Clock,
    Stethoscope,
    Video,
    MapPin
} from 'lucide-react';
import './AppointmentCard.css';

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

interface AppointmentCardProps {
    apt: Appointment;
    onViewDetails: (apt: Appointment) => void;
    onEdit: (apt: Appointment) => void;
    onCancel: (apt: Appointment) => void;
    getAppointmentStatus: (apt: Appointment) => string;
    formatDateParts: (dateIso: string) => {
        day: number;
        month: string;
        year: number;
        time: string;
    };
}

const AppointmentCard = ({
    apt,
    onViewDetails,
    onEdit,
    onCancel,
    getAppointmentStatus,
    formatDateParts
}: AppointmentCardProps) => {
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
                    <button className="btn-action btn-details" onClick={() => onViewDetails(apt)}>
                        View Details
                    </button>
                    {status === 'upcoming' && (
                        <>
                            <button className="btn-action btn-edit" onClick={() => onEdit(apt)}>
                                Edit
                            </button>
                            <button
                                className="btn-action btn-cancel-appt"
                                onClick={() => onCancel(apt)}
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

export default AppointmentCard;
export type { Appointment };
