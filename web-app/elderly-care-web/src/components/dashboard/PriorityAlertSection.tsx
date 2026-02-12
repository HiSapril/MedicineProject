import { AlertTriangle, ChevronRight } from 'lucide-react';

export interface PriorityAlert {
    type: string;
    title: string;
    message: string;
    severity: 'high' | 'medium';
    link: string;
}

interface PriorityAlertSectionProps {
    alerts: PriorityAlert[];
    onNavigate: (path: string) => void;
}

const PriorityAlertSection = ({ alerts, onNavigate }: PriorityAlertSectionProps) => {
    if (alerts.length === 0) return null;

    return (
        <section className="priority-alerts-section">
            {alerts.map((alert, idx) => (
                <div key={idx} className={`alert-card ${alert.severity}`} onClick={() => onNavigate(alert.link)}>
                    <div className="alert-icon-wrapper">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="alert-content">
                        <h3>{alert.title}</h3>
                        <p>{alert.message}</p>
                    </div>
                    <div className="alert-action">
                        <span>View</span> <ChevronRight size={16} />
                    </div>
                </div>
            ))}
        </section>
    );
};

export default PriorityAlertSection;
