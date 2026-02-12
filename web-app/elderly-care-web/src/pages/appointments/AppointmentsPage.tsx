import { useEffect, useState, useMemo } from 'react';
import { appointmentApi } from '../../api/appointment.api';
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Plus,
    History
} from 'lucide-react';
import { toast } from 'react-toastify';
import AppointmentCard, { type Appointment } from '../../components/appointment/AppointmentCard';
import AppointmentDetailModal from '../../components/appointment/AppointmentDetailModal';
import AppointmentForm from '../../components/appointment/AppointmentForm';
import './AppointmentsPage.css';

export const AppointmentsPage = () => {
    // --- State ---
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI State
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isPastCollapsed, setIsPastCollapsed] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

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

    // --- Handlers ---
    const handleAddClick = () => {
        setEditingAppointment(null);
        setShowForm(true);
    };

    const handleEditClick = (apt: Appointment) => {
        setEditingAppointment(apt);
        setShowForm(true);
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

    if (loading) return (
        <div className="appointments-container">
            <div className="loading-view">Loading Appointments...</div>
        </div>
    );

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
                                <AppointmentCard
                                    key={apt.id}
                                    apt={apt}
                                    onViewDetails={setSelectedAppointment}
                                    onEdit={handleEditClick}
                                    onCancel={handleCancelAppointment}
                                    getAppointmentStatus={getAppointmentStatus}
                                    formatDateParts={formatDateParts}
                                />
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
                                    <AppointmentCard
                                        key={apt.id}
                                        apt={apt}
                                        onViewDetails={setSelectedAppointment}
                                        onEdit={handleEditClick}
                                        onCancel={handleCancelAppointment}
                                        getAppointmentStatus={getAppointmentStatus}
                                        formatDateParts={formatDateParts}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* Detail Modal */}
            <AppointmentDetailModal
                appointment={selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
            />

            {/* Form Modal */}
            <AppointmentForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                editingAppointment={editingAppointment}
                onSuccess={fetchAppointments}
            />
        </div>
    );
};
