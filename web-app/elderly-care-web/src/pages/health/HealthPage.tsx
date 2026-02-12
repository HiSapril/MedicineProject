import { useEffect, useState, useMemo } from 'react';
import { healthApi, type HealthLog } from '../../api/health.api';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, ChevronRight, Plus } from 'lucide-react';

// Sub-components
import HealthStatusCard, { type HealthStatus } from '../../components/health/HealthStatusCard';
import HealthTrendChart from '../../components/health/HealthTrendChart';
import HealthHistoryItem from '../../components/health/HealthHistoryItem';
import HealthEntryForm from '../../components/health/HealthEntryForm';

import './HealthPage.css';

export const HealthPage = () => {
    const { user } = useAuth();

    // --- States ---
    const [logs, setLogs] = useState<HealthLog[]>([]);
    const [fetchError, setFetchError] = useState('');
    const [activeMetric, setActiveMetric] = useState<'bloodPressure' | 'heartRate' | 'weight'>('bloodPressure');

    // UI Modes
    const [isEntryMode, setIsEntryMode] = useState(false);
    const [editingLog, setEditingLog] = useState<HealthLog | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // --- Initial Layout Logic ---
    useEffect(() => {
        setIsMounted(true);
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await healthApi.getHealthLogs();
            const sortedLogs = response.data.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setLogs(sortedLogs);
            setFetchError('');
        } catch (err) {
            console.error(err);
            setFetchError('Unable to load health records. Please try again later.');
        }
    };

    // --- derived data ---
    const latestMetrics = useMemo(() => {
        const metrics = {
            bloodPressure: '--',
            heartRate: '--',
            weight: '--'
        };

        for (const log of logs) {
            const bp = log.bloodPressure || (log as any).BloodPressure;
            const hr = log.heartRate !== undefined ? log.heartRate : (log as any).HeartRate;
            const w = log.weight !== undefined ? log.weight : (log as any).Weight;

            if (metrics.bloodPressure === '--' && bp && bp !== '-') {
                metrics.bloodPressure = bp;
            }
            if (metrics.heartRate === '--' && hr !== undefined && hr !== null) {
                metrics.heartRate = hr.toString();
            }
            if (metrics.weight === '--' && w !== undefined && w !== null) {
                metrics.weight = w.toString();
            }
            if (metrics.bloodPressure !== '--' && metrics.heartRate !== '--' && metrics.weight !== '--') break;
        }
        return metrics;
    }, [logs]);

    const getStatus = (metric: string, value: any): HealthStatus => {
        if (value === '--' || value === '-' || value === undefined || value === null) return 'normal';
        if (metric === 'bloodPressure') {
            const parts = String(value).split('/');
            if (parts.length === 2) {
                const sys = parseInt(parts[0]);
                const dia = parseInt(parts[1]);
                if (sys >= 160 || dia >= 100) return 'critical';
                if (sys >= 140 || dia >= 90) return 'attention';
            }
        } else if (metric === 'heartRate') {
            const hr = Number(value);
            if (hr > 120 || hr < 40) return 'critical';
            if (hr > 100 || hr < 50) return 'attention';
        } else if (metric === 'weight') {
            const w = Number(value);
            if (w > 150 || w < 30) return 'attention';
        }
        return 'normal';
    };

    const chartData = useMemo(() => {
        return [...logs].reverse().map(log => {
            const hr = log.heartRate !== undefined ? log.heartRate : (log as any).HeartRate;
            const w = log.weight !== undefined ? log.weight : (log as any).Weight;
            const bp = log.bloodPressure || (log as any).BloodPressure;

            return {
                date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                heartRate: hr,
                weight: w,
                bloodPressure: bp && bp !== '-' ? parseInt(bp.split('/')[0]) : null,
            };
        }).filter(d => d.heartRate || d.bloodPressure || d.weight);
    }, [logs]);

    const handleOpenEntry = (log: HealthLog | null = null) => {
        setEditingLog(log);
        setIsEntryMode(true);
    };

    const handleSuccess = () => {
        setIsEntryMode(false);
        setEditingLog(null);
        fetchLogs();
    };

    if (isEntryMode && user) {
        return (
            <HealthEntryForm
                userId={user.id}
                editingLog={editingLog}
                onClose={() => setIsEntryMode(false)}
                onSuccess={handleSuccess}
            />
        );
    }

    return (
        <div className="health-page-container">
            <header className="health-header">
                <h1>Health Records</h1>
                <p>Track and review daily health measurements over time to monitor elderly well-being.</p>
            </header>

            {fetchError && (
                <div className="error-view-inline">
                    <AlertTriangle size={20} />
                    <span>{fetchError}</span>
                </div>
            )}

            <div className="health-content">
                <section className="health-section">
                    <h2 className="section-title"><ChevronRight size={24} /> Latest Recorded Values</h2>
                    <div className="status-grid">
                        <HealthStatusCard
                            type="bloodPressure"
                            value={latestMetrics.bloodPressure}
                            status={getStatus('bloodPressure', latestMetrics.bloodPressure)}
                        />
                        <HealthStatusCard
                            type="heartRate"
                            value={latestMetrics.heartRate}
                            status={getStatus('heartRate', latestMetrics.heartRate)}
                        />
                        <HealthStatusCard
                            type="weight"
                            value={latestMetrics.weight}
                            status={getStatus('weight', latestMetrics.weight)}
                        />
                    </div>
                </section>

                <section className="health-section">
                    <div className="trends-header">
                        <h2 className="section-title">Health Trends</h2>
                        <div className="metric-toggles">
                            {(['bloodPressure', 'heartRate', 'weight'] as const).map(m => (
                                <button key={m} className={`metric-toggle ${activeMetric === m ? 'active' : ''}`} onClick={() => setActiveMetric(m)}>
                                    {m === 'bloodPressure' ? 'BP' : m === 'heartRate' ? 'HR' : 'Weight'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <HealthTrendChart
                        data={chartData}
                        activeMetric={activeMetric}
                        isMounted={isMounted}
                    />
                </section>

                <section className="health-section">
                    <h2 className="section-title">History Logs</h2>
                    <div className="history-list">
                        {logs.length === 0 ? (
                            <p className="empty-text">No health records found.</p>
                        ) : (
                            logs.map(log => (
                                <HealthHistoryItem
                                    key={log.id}
                                    log={log}
                                    onEdit={handleOpenEntry}
                                    getStatus={getStatus}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>

            <button className="add-log-trigger" onClick={() => handleOpenEntry()}>
                <Plus size={20} /> Add Record
            </button>
        </div>
    );
};
