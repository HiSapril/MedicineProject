import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthTrendChartProps {
    data: any[];
    activeMetric: 'bloodPressure' | 'heartRate' | 'weight';
    isMounted: boolean;
}

const HealthTrendChart = ({ data, activeMetric, isMounted }: HealthTrendChartProps) => {
    if (data.length <= 1) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                Record at least two measurements to see trends.
            </div>
        );
    }

    if (!isMounted) return null;

    return (
        <div className="trends-container" style={{ width: '100%', height: '350px', minHeight: '350px', position: 'relative', overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey={activeMetric}
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HealthTrendChart;
