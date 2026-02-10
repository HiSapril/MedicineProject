import { useEffect, useState, useMemo } from 'react';
import { appointmentApi, type CreateAppointmentPayload } from '../api/appointment.api';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  FileText,
  ChevronRight,
  XCircle,
  CheckCircle,
  AlertCircle,
  History
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
}

const AppointmentsPage = () => {
  // --- State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interaction State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
    const appointmentDate = new Date(apt.appointmentDate);

    if (appointmentDate < now) {
      // Logic: If past and we don't have a "completed" flag, we assume completed
      // unless the system has a specific "missed" logic. For demo, we use temporal.
      return 'completed';
    }
    return 'upcoming';
  };

  const groupedAppointments = useMemo(() => {
    const sorted = [...appointments].sort(
      (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    );

    return {
      upcoming: sorted.filter(apt => new Date(apt.appointmentDate) >= now),
      past: sorted.filter(apt => new Date(apt.appointmentDate) < now).reverse() // Past visits in reverse chronological
    };
  }, [appointments]);

  // --- Handlers ---
  const handleCancelClick = async (apt: Appointment) => {
    if (!window.confirm(`Are you sure you want to cancel the appointment with ${apt.doctorName}?`)) return;

    try {
      // Mock cancellation by updating notes or just deleting if API doesn't support status
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
            <div className="appointment-location">
              <MapPin size={18} /> {apt.location}
            </div>
          </div>

          <div className="appointment-actions">
            <button className="btn-action btn-details" onClick={() => setSelectedAppointment(apt)}>
              View Details
            </button>
            {status === 'upcoming' && (
              <button
                className="btn-action btn-cancel-appt"
                onClick={() => handleCancelClick(apt)}
              >
                Cancel Visit
              </button>
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
        <h1>Appointments</h1>
        <p>Your medical visits and scheduled care events.</p>
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
          <h2 className="section-title">
            <History size={28} /> Past Appointments
          </h2>
          <div className="appointment-list">
            {groupedAppointments.past.length === 0 ? (
              <p className="empty-text">No past appointment records found.</p>
            ) : (
              groupedAppointments.past.map(apt => (
                <AppointmentCard key={apt.id} apt={apt} />
              ))
            )}
          </div>
        </section>
      </div>

      {/* --- Detail Modal --- */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Appointment Details</h2>
            </div>
            <div className="detail-modal-grid">
              <div className="detail-block">
                <span className="detail-label">Professional / Clinic</span>
                <span className="detail-text">{selectedAppointment.doctorName}</span>
              </div>
              <div className="detail-block">
                <span className="detail-label">Location</span>
                <span className="detail-text">{selectedAppointment.location}</span>
              </div>
              <div className="detail-block">
                <span className="detail-label">Date & Time</span>
                <span className="detail-text">
                  {new Date(selectedAppointment.appointmentDate).toLocaleString()}
                </span>
              </div>
              {selectedAppointment.notes && (
                <div className="detail-block">
                  <span className="detail-label">Special Instructions</span>
                  <span className="detail-text">{selectedAppointment.notes}</span>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ marginTop: '2rem' }}>
              <button
                className="btn-action btn-details"
                style={{ width: '100%', background: '#0f172a', color: 'white' }}
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
