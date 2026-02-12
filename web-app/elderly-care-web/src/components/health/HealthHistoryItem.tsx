import { type HealthLog } from '../../api/health.api';

interface HealthHistoryItemProps {
    log: HealthLog;
    onEdit: (log: HealthLog) => void;
    getStatus: (metric: string, value: any) => 'normal' | 'attention' | 'critical';
}

const HealthHistoryItem = ({ log, onEdit, getStatus }: HealthHistoryItemProps) => {
    const hr = log.heartRate !== undefined ? log.heartRate : (log as any).HeartRate;
    const w = log.weight !== undefined ? log.weight : (log as any).Weight;
    const bp = log.bloodPressure || (log as any).BloodPressure;

    return (
        <div className="history-item" onClick={() => onEdit(log)} style={{ cursor: 'pointer' }}>
            <div className="history-date">
                {new Date(log.date).toLocaleDateString()}<br />
                <span style={{ fontWeight: 400, fontSize: '0.8rem' }}>
                    {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <div className="history-metrics">
                <div className="history-metric">
                    <span className="history-metric-label">BP (mmHg)</span>
                    <span className={`history-metric-value ${getStatus('bloodPressure', bp)}`}>
                        {bp || '--'}
                    </span>
                </div>
                <div className="history-metric">
                    <span className="history-metric-label">HR (bpm)</span>
                    <span className={`history-metric-value ${getStatus('heartRate', hr)}`}>
                        {hr || '--'}
                    </span>
                </div>
                <div className="history-metric">
                    <span className="history-metric-label">Weight (kg)</span>
                    <span className={`history-metric-value ${getStatus('weight', w)}`}>
                        {w || '--'}
                    </span>
                </div>
                {log.note && <div className="history-note">{log.note}</div>}
            </div>
        </div>
    );
};

export default HealthHistoryItem;
