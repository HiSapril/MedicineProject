import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Pill,
    Activity,
    Bell,
    AlertCircle
} from "lucide-react";
import "./DashboardPage.css";

// API Imports
import { appointmentApi } from "../../api/appointment.api";
import { medicationService } from "../../services/medication.service";
import { type Medication } from "../../api/medication.api";
import { reminderApi, type Reminder } from "../../api/reminder.api";
import { healthApi, type HealthLog } from "../../api/health.api";
import { notificationApi, type Notification } from "../../api/notification.api";
import { useAuth } from "../../context/AuthContext";

// Sub-components
import DashboardSummaryCards from "../../components/dashboard/DashboardSummaryCards";
import PriorityAlertSection, { type PriorityAlert } from "../../components/dashboard/PriorityAlertSection";
import DashboardTimeline, { type TimelineItem } from "../../components/dashboard/DashboardTimeline";

// Types
interface DashboardData {
    appointments: any[];
    medications: Medication[];
    reminders: Reminder[];
    healthLogs: HealthLog[];
    notifications: Notification[];
}

export const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState<DashboardData>({
        appointments: [],
        medications: [],
        reminders: [],
        healthLogs: [],
        notifications: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- 1. Data Fetching ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [apptRes, medRes, remRes, healthRes, notifRes] = await Promise.all([
                    appointmentApi.getAll(),
                    medicationService.getMedications(),
                    reminderApi.getReminders(),
                    healthApi.getHealthLogs(),
                    user?.id ? notificationApi.getNotifications(user.id) : Promise.resolve({ data: [] })
                ]);

                setData({
                    appointments: apptRes.data || [],
                    medications: (medRes as any) || [],
                    reminders: remRes.data || [],
                    healthLogs: healthRes.data || [],
                    notifications: (notifRes as any).data || []
                });
            } catch (err) {
                console.error("Failed to load dashboard data", err);
                setError("Unable to load dashboard information. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    // --- 2. Derived State & Logic ---
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // A. Priority Alerts
    const priorityAlerts = useMemo(() => {
        const alerts: PriorityAlert[] = [];

        // Missed Reminders
        const missedReminders = data.reminders.filter(r => r.status === 2);
        if (missedReminders.length > 0) {
            alerts.push({
                type: 'reminder',
                title: 'Missed Medication Reminders',
                message: `You have ${missedReminders.length} missed reminder${missedReminders.length > 1 ? 's' : ''}.`,
                severity: 'high',
                link: '/app/reminders'
            });
        }

        // Failed Notifications
        const failedNotifs = data.notifications.filter(n => n.status === 4);
        if (failedNotifs.length > 0) {
            alerts.push({
                type: 'notification',
                title: 'Delivery Failed',
                message: `${failedNotifs.length} notification${failedNotifs.length > 1 ? 's' : ''} failed to send.`,
                severity: 'medium',
                link: '/app/notifications'
            });
        }

        return alerts;
    }, [data.reminders, data.notifications]);

    // B. Today's Timeline
    const timelineItems = useMemo(() => {
        const items: TimelineItem[] = [];

        data.appointments.forEach(appt => {
            const apptDate = new Date(appt.appointmentDate);
            if (apptDate.toDateString() === today.toDateString()) {
                items.push({
                    id: appt.id,
                    time: apptDate,
                    title: `Dr. ${appt.doctorName} (${appt.appointmentType || 'Visit'})`,
                    type: 'appointment',
                    status: appt.status || 'Upcoming',
                    link: '/app/appointments'
                });
            }
        });

        data.reminders.forEach(rem => {
            const remDate = new Date(rem.scheduledTime);
            if (remDate.toDateString() === today.toDateString()) {
                const typeLabel = rem.type === 0 ? "Medication" : rem.type === 1 ? "Appointment" : "Health";
                const statusLabel = rem.status === 0 ? "Pending" : rem.status === 1 ? "Taken" : "Missed";
                items.push({
                    id: rem.id,
                    time: remDate,
                    title: `${typeLabel} Reminder`,
                    type: 'reminder',
                    status: statusLabel,
                    link: '/app/reminders'
                });
            }
        });

        return items.sort((a, b) => a.time.getTime() - b.time.getTime());
    }, [data.appointments, data.reminders, today]);

    // C. Snapshot Data
    const activeMedCount = data.medications.filter(m => m.status === 'Active').length;
    const unreadNotifCount = data.notifications.filter(n => (n.status as any) !== 2).length;

    const nextAppointment = data.appointments
        .map(a => ({ ...a, dateObj: new Date(a.appointmentDate) }))
        .filter(a => a.dateObj >= new Date())
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

    const nextAppointmentDate = nextAppointment
        ? nextAppointment.dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : '--';

    // --- Render ---
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Gathering your daily overview...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <AlertCircle size={48} color="#e74c3c" />
                <h3>Unable to load dashboard</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="action-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-greeting">Good morning, {user?.name || 'User'}</h1>
                <p className="dashboard-subtitle">Here represents what needs your attention today.</p>
            </header>

            <PriorityAlertSection alerts={priorityAlerts} onNavigate={navigate} />

            <div className="dashboard-main-layout">
                <DashboardSummaryCards
                    activeMedCount={activeMedCount}
                    remindersTodayCount={timelineItems.filter(i => i.type === 'reminder').length}
                    nextAppointmentDate={nextAppointmentDate}
                    unreadNotifCount={unreadNotifCount}
                    onNavigate={navigate}
                />

                <DashboardTimeline items={timelineItems} onNavigate={navigate} />
            </div>

            <nav className="nav-shortcuts-bar">
                <button className="shortcut-btn" onClick={() => navigate('/app/medications')}>
                    <Pill size={20} /> Manage Medications
                </button>
                <button className="shortcut-btn" onClick={() => navigate('/app/reminders')}>
                    <Bell size={20} /> View Reminders
                </button>
                <button className="shortcut-btn" onClick={() => navigate('/app/appointments')}>
                    <Calendar size={20} /> Appointments
                </button>
                <button className="shortcut-btn" onClick={() => navigate('/app/health')}>
                    <Activity size={20} /> Health Records
                </button>
            </nav>
        </div>
    );
}
