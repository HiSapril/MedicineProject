import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { appointmentApi } from "../api/appointment.api";
import { medicationApi, type Medication } from "../api/medication.api";
import { reminderApi } from "../api/reminder.api";
import { healthApi, type HealthLog } from "../api/health.api";
import { useAuth } from "../context/AuthContext";

// Define basic types for data
interface Appointment { id: string; doctorName: string; appointmentDate: string; }
interface Reminder { id: string; title: string; dateTime: string; isCompleted: boolean; }

import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // State for data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, medRes, remRes] = await Promise.all([
          appointmentApi.getAll(),
          medicationApi.getMedications(),
          reminderApi.getReminders()
        ]);
        setAppointments(apptRes.data);
        setMedications(medRes.data);
        setReminders(remRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Stats
  const today = new Date();
  const medsCount = medications.length; // Simplified: Total meds tracking
  const nextAppt = appointments
    .map(a => new Date(a.appointmentDate))
    .filter(d => d > today)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const daysUntilAppt = nextAppt
    ? Math.ceil((nextAppt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const remindersToday = reminders.filter(r => {
    const rDate = new Date(r.dateTime);
    return rDate.toDateString() === today.toDateString();
  }).length;

  // Calendar Helpers
  const isAppointmentDate = (date: Date) => {
    return appointments.some(a => new Date(a.appointmentDate).toDateString() === date.toDateString());
  };

  if (loading) return <div style={{ padding: 20 }}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>{t('welcome', { name: user?.name })}</h1>

      {/* STAT CARDS */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, backgroundColor: "#3498db" }}>
          <h3>{t('medications')}</h3>
          <p style={styles.statValue}>{medsCount}</p>
          <span style={styles.statLabel}>{t('meds_active')}</span>
        </div>
        <div style={{ ...styles.statCard, backgroundColor: "#e67e22" }}>
          <h3>{t('next_visit')}</h3>
          <p style={styles.statValue}>{nextAppt ? `${daysUntilAppt} days` : "None"}</p>
          <span style={styles.statLabel}>{nextAppt?.toLocaleDateString() || "No upcoming"}</span>
        </div>
        <div style={{ ...styles.statCard, backgroundColor: "#27ae60" }}>
          <h3>{t('reminders')}</h3>
          <p style={styles.statValue}>{remindersToday}</p>
          <span style={styles.statLabel}>{t('tasks_today')}</span>
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* LEFT COLUMN: QUICK ACTIONS & LISTS */}
        <div style={styles.leftCol}>
          <div style={styles.sectionHeader}>
            <h2>{t('upcoming_reminders')}</h2>
            <Link to="/app/reminders" style={styles.link}>{t('view_all')}</Link>
          </div>
          {reminders.slice(0, 3).map(r => (
            <div key={r.id} style={styles.listItem}>
              <strong>{r.title}</strong>
              <span>{new Date(r.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {reminders.length === 0 && <p style={styles.emptyText}>No reminders set.</p>}
        </div>

        {/* RIGHT COLUMN: CALENDAR */}
        <div style={styles.rightCol}>
          <h2 style={{ marginBottom: 15 }}>{t('calendar')}</h2>
          <div style={styles.calendarWrapper}>
            <Calendar
              tileClassName={({ date }) => isAppointmentDate(date) ? 'highlight-date' : ''}
              value={new Date()}
            />
          </div>
          <style>{`
            .highlight-date {
              background-color: #e74c3c !important;
              color: white !important;
              border-radius: 50%;
            }
            .react-calendar { 
              border: none; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
              border-radius: 12px; 
              width: 100%;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'Arial, sans-serif',
  },
  mainTitle: {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
  },
  section: {
    backgroundColor: '#f9f9f9',
    padding: '25px',
    borderRadius: '8px',
    border: '2px solid #ddd',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#444',
  },
  card: {
    backgroundColor: '#fff',
    padding: '18px',
    marginBottom: '15px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#222',
  },
  text: {
    fontSize: '20px',
    margin: '8px 0',
    color: '#555',
  },
  errorText: {
    fontSize: '20px',
    color: '#d9534f',
    fontWeight: 'bold',
  },
};

