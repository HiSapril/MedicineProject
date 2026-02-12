import type { ComprehensiveReport } from '../../types/report.types';

interface AppointmentComplianceSectionProps {
    data: ComprehensiveReport;
}

const AppointmentComplianceSection = ({ data }: AppointmentComplianceSectionProps) => {
    return (
        <div className="report-section slide-in">
            <div className="section-header">
                <h2>Appointment Compliance Audit</h2>
                <p>Ensuring all clinical visits are appropriately supported by reminders.</p>
            </div>
            <div className="section-grid">
                <div className="stats-panel">
                    <div className="stat-row">
                        <span>Total Appointments:</span>
                        <strong>{data.appointmentCompliance.totalAppointments}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Protected with Reminders:</span>
                        <strong className="text-success">{data.appointmentCompliance.withReminders}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Unprotected (Risk):</span>
                        <strong className="text-danger">{data.appointmentCompliance.withoutReminders}</strong>
                    </div>
                </div>
                <div className="chart-container">
                    <h3>No-Show Risk indicator</h3>
                    <p>Appointments where reminders were generated but missed.</p>
                    <h1 className="risk-level">{data.appointmentCompliance.noShowRiskCount}</h1>
                </div>
            </div>
        </div>
    );
};

export default AppointmentComplianceSection;
