import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Pill,
  Activity,
  Bell,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import "./DashboardPage.css";

// API Imports
import { appointmentApi } from "../api/appointment.api";
import { medicationApi, type Medication } from "../api/medication.api";
import { reminderApi } from "../api/reminder.api";
import { healthApi, type HealthLog } from "../api/health.api";
import { useAuth } from "../context/AuthContext";

// Types
interface DashboardData {
  appointments: any[];
  medications: Medication[];
  reminders: any[];
  healthLogs: HealthLog[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData>({
    appointments: [],
    medications: [],
    reminders: [],
    healthLogs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [apptRes, medRes, remRes, healthRes] = await Promise.all([
          appointmentApi.getAll(),
          medicationApi.getMedications(),
          reminderApi.getReminders(),
          healthApi.getHealthLogs()
        ]);

        setData({
          appointments: apptRes.data,
          medications: medRes.data,
          reminders: remRes.data,
          healthLogs: healthRes.data
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Unable to load dashboard information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} color="#e74c3c" />
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="action-btn">Retry</button>
      </div>
    );
  }

  // --- Logic & Stats Computation ---
  const today = new Date();

  // 1. Next Appointment
  const nextAppt = data.appointments
    .map(a => ({ ...a, dateObj: new Date(a.appointmentDate) }))
    .filter(a => a.dateObj >= today)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

  const daysUntilAppt = nextAppt
    ? Math.ceil((nextAppt.dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // 2. Medications
  const activeMeds = data.medications.length;
  // Mock adherence calculation if not available in API
  const adherenceRate = 95; // Placeholder

  // 3. Reminders Today
  const remindersToday = data.reminders.filter(r => {
    const rDate = new Date(r.dateTime);
    return rDate.toDateString() === today.toDateString();
  });
  const pendingReminders = remindersToday.filter(r => !r.isCompleted);

  // 4. Latest Health Log
  const latestHealth = data.healthLogs.length > 0 ? data.healthLogs[0] : null;

  // --- Priority Item Logic ---
  const getPriorityItem = () => {
    if (pendingReminders.length > 0) {
      const nextReminder = pendingReminders[0]; // Assuming sorted
      return {
        type: 'reminder',
        title: 'Upcoming Reminder',
        message: `${nextReminder.title} at ${new Date(nextReminder.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        urgent: true
      };
    }
    if (daysUntilAppt === 0 || daysUntilAppt === 1) {
      return {
        type: 'appointment',
        title: 'Appointment Soon',
        message: `Dr. ${nextAppt.doctorName} - ${daysUntilAppt === 0 ? 'Today' : 'Tomorrow'}`,
        urgent: true
      };
    }
    return {
      type: 'status',
      title: 'All Caught Up',
      message: 'You have no urgent tasks for today. Great job!',
      urgent: false
    };
  };

  const priority = getPriorityItem();

  return (
    <div className="dashboard-container">
      {/* 1. Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">{t('welcome', { name: user?.name || 'User' })}</h1>
        <p className="dashboard-subtitle">Here is your health and care overview for today.</p>
      </header>

      {/* 2. Summary Cards */}
      <section className="summary-cards-grid">
        {/* Card: Medications */}
        <div className="summary-card card-blue">
          <div className="card-top">
            <div className="dash-icon-box">
              <Pill size={24} />
            </div>
            <div className="card-content">
              <h3>Medications</h3>
              <p className="card-value">{activeMeds}</p>
              <p className="card-context">Active prescriptions</p>
            </div>
          </div>
          <Link to="/app/medications" className="card-link">
            View List <ArrowRight size={16} />
          </Link>
        </div>

        {/* Card: Appointments */}
        <div className="summary-card card-orange">
          <div className="card-top">
            <div className="dash-icon-box">
              <Calendar size={24} />
            </div>
            <div className="card-content">
              <h3>Next Visit</h3>
              <p className="card-value">
                {daysUntilAppt !== null ? `${daysUntilAppt} Days` : "None"}
              </p>
              <p className="card-context">
                {nextAppt ? new Date(nextAppt.appointmentDate).toLocaleDateString() : "No upcoming appointments"}
              </p>
            </div>
          </div>
          <Link to="/app/appointments" className="card-link">
            See Schedule <ArrowRight size={16} />
          </Link>
        </div>

        {/* Card: Health */}
        <div className="summary-card card-green">
          <div className="card-top">
            <div className="dash-icon-box">
              <Activity size={24} />
            </div>
            <div className="card-content">
              <h3>Health Status</h3>
              <p className="card-value">Stable</p>
              <p className="card-context">Last check: {latestHealth ? new Date(latestHealth.timestamp).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <Link to="/app/health" className="card-link">
            View Logs <ArrowRight size={16} />
          </Link>
        </div>

        {/* Card: Reminders */}
        <div className="summary-card card-purple">
          <div className="card-top">
            <div className="dash-icon-box">
              <Bell size={24} />
            </div>
            <div className="card-content">
              <h3>Today's Tasks</h3>
              <p className="card-value">{pendingReminders.length}</p>
              <p className="card-context">{remindersToday.length} total tasks today</p>
            </div>
          </div>
          <Link to="/app/reminders" className="card-link">
            Manage Tasks <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 3. Main Content Grid */}
      <div className="dashboard-main-grid">

        {/* Today Focus Section */}
        <section className={`focus-section ${priority.urgent ? '' : 'all-good'}`}>
          <div className="section-header">
            <h2 className="section-title">
              {priority.urgent ? <AlertCircle size={24} color="#e74c3c" /> : <CheckCircle2 size={24} color="#27ae60" />}
              Today's Focus
            </h2>
          </div>

          <div className={`focus-item ${priority.urgent ? '' : 'success'}`}>
            <div className="focus-content">
              <h4>{priority.title}</h4>
              <p>{priority.message}</p>
            </div>
          </div>

          {pendingReminders.slice(0, 3).map(reminder => (
            <div key={reminder.id} className="focus-item">
              <Clock className="focus-icon" size={20} />
              <div className="focus-content">
                <h4>Pixel Reminder</h4>
                <p>{reminder.title}</p>
                <p className="focus-time">{new Date(reminder.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}

        </section>

        {/* Health Overview / Mini Stats */}
        <section className="health-section">
          <h2 className="section-title" style={{ fontSize: '18px', marginBottom: '20px' }}>
            <Activity size={20} style={{ marginRight: '8px', color: '#3498db' }} />
            Quick Stats
          </h2>

          {latestHealth && (
            <>
              <div className="health-stat-row">
                <span className="health-label">Blood Pressure</span>
                <span className="health-value">{latestHealth.bloodPressure || 'N/A'} mmHg</span>
              </div>
              <div className="health-stat-row">
                <span className="health-label">Heart Rate</span>
                <span className="health-value">{latestHealth.heartRate} bpm</span>
              </div>
            </>
          )}

          <div className="health-stat-row">
            <span className="health-label">Medication Adherence</span>
            <span className="health-value" style={{ color: '#27ae60' }}>{adherenceRate}%</span>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
            <p style={{ fontSize: '13px', color: '#95a5a6', fontStyle: 'italic' }}>
              "Health is wealth. Keep up the good work!"
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
