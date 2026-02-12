import { Pill, Bell, Calendar, Activity } from 'lucide-react';

interface DashboardSummaryCardsProps {
    activeMedCount: number;
    remindersTodayCount: number;
    nextAppointmentDate: string;
    unreadNotifCount: number;
    onNavigate: (path: string) => void;
}

const DashboardSummaryCards = ({
    activeMedCount,
    remindersTodayCount,
    nextAppointmentDate,
    unreadNotifCount,
    onNavigate
}: DashboardSummaryCardsProps) => {
    return (
        <section className="status-overview-grid">
            <div className="status-card" onClick={() => onNavigate('/app/medications')}>
                <div className="status-icon blue">
                    <Pill size={24} />
                </div>
                <div className="status-info">
                    <span className="status-value">{activeMedCount}</span>
                    <span className="status-label">Active Meds</span>
                </div>
            </div>

            <div className="status-card" onClick={() => onNavigate('/app/reminders')}>
                <div className="status-icon purple">
                    <Bell size={24} />
                </div>
                <div className="status-info">
                    <span className="status-value">{remindersTodayCount}</span>
                    <span className="status-label">Reminders Today</span>
                </div>
            </div>

            <div className="status-card" onClick={() => onNavigate('/app/appointments')}>
                <div className="status-icon orange">
                    <Calendar size={24} />
                </div>
                <div className="status-info">
                    <span className="status-value date-value">
                        {nextAppointmentDate}
                    </span>
                    <span className="status-label">Next Visit</span>
                </div>
            </div>

            <div className="status-card" onClick={() => onNavigate('/app/notifications')}>
                <div className="status-icon green">
                    <Activity size={24} />
                </div>
                <div className="status-info">
                    <span className="status-value">{unreadNotifCount}</span>
                    <span className="status-label">Unread Alerts</span>
                </div>
            </div>
        </section>
    );
};

export default DashboardSummaryCards;
