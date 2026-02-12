import type { ComprehensiveReport } from '../../types/report.types';

interface SystemHealthSectionProps {
    data: ComprehensiveReport;
}

const SystemHealthSection = ({ data }: SystemHealthSectionProps) => {
    return (
        <div className="report-section slide-in">
            <div className="section-header">
                <h2>System Health & Reliability</h2>
                <p>Detecting systemic risks and integration failures.</p>
            </div>
            <div className="section-grid">
                <div className="stats-panel">
                    <h3>Failed Notifications by Reason</h3>
                    {data.systemHealth.failuresByReason.length === 0 ? (
                        <p className="no-data">No failures recorded in this period.</p>
                    ) : (
                        <ul className="fail-reasons">
                            {data.systemHealth.failuresByReason.map((r, i) => (
                                <li key={i}>
                                    <span>{r.reason}</span>
                                    <span className="count-pill">{r.count}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="stats-panel">
                    <div className="stat-row">
                        <span>Retry Success Rate:</span>
                        <strong>{data.systemHealth.retrySuccessRate}%</strong>
                    </div>
                    <div className="stat-row">
                        <span>Avg Delivery Delay:</span>
                        <strong>{data.systemHealth.averageDelayMs}ms</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemHealthSection;
