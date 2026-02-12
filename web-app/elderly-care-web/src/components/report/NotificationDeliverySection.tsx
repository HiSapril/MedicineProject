import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { ComprehensiveReport } from '../../types/report.types';
import { chartHelpers } from '../../utils/report.charts';

interface NotificationDeliverySectionProps {
    data: ComprehensiveReport;
}

const NotificationDeliverySection = ({ data }: NotificationDeliverySectionProps) => {
    const { colors } = chartHelpers;

    return (
        <div className="report-section slide-in">
            <div className="section-header">
                <h2>Notification Delivery & Read Rates</h2>
                <p>Auditing the reliability of the Delivery Domain.</p>
            </div>
            <div className="section-grid">
                <div className="chart-container">
                    <h3>Delivery by Channel</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.notificationDelivery.channelBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill={colors.primary} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="stats-panel">
                    <div className="stat-circle-group">
                        <div className="stat-circle">
                            <span className="circle-val">{data.notificationDelivery.readRate}%</span>
                            <span className="circle-label">Read Rate</span>
                        </div>
                        <div className="stat-circle">
                            <span className="circle-val">{data.notificationDelivery.acknowledgementRate}%</span>
                            <span className="circle-label">Ack Rate</span>
                        </div>
                    </div>
                    <div className="stat-row">
                        <span>Avg Retries:</span>
                        <strong>{data.notificationDelivery.averageRetries.toFixed(1)}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Max Retries:</span>
                        <strong>{data.notificationDelivery.maxRetries}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDeliverySection;
