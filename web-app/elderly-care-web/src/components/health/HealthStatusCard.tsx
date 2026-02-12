import { Activity, Heart, Weight } from 'lucide-react';

export type HealthMetricType = 'bloodPressure' | 'heartRate' | 'weight';
export type HealthStatus = 'normal' | 'attention' | 'critical';

interface HealthStatusCardProps {
    type: HealthMetricType;
    value: string;
    status: HealthStatus;
}

const HealthStatusCard = ({ type, value, status }: HealthStatusCardProps) => {
    const getIcon = () => {
        switch (type) {
            case 'bloodPressure': return <Activity size={20} />;
            case 'heartRate': return <Heart size={20} />;
            case 'weight': return <Weight size={20} />;
        }
    };

    const getLabel = () => {
        switch (type) {
            case 'bloodPressure': return 'Blood Pressure';
            case 'heartRate': return 'Heart Rate';
            case 'weight': return 'Weight';
        }
    };

    const getUnit = () => {
        if (value === '--') return '';
        switch (type) {
            case 'bloodPressure': return 'mmHg';
            case 'heartRate': return 'bpm';
            case 'weight': return 'kg';
        }
    };

    return (
        <div className={`status-card ${status}`}>
            <div className="status-card-header">
                <span>{getLabel()}</span>
                {getIcon()}
            </div>
            <div className="status-value">
                {value}
                <span className="status-unit"> {getUnit()}</span>
            </div>
        </div>
    );
};

export default HealthStatusCard;
