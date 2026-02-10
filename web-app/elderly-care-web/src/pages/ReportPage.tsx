import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import {
    Download,
    Calendar,
    Activity,
    Pill,
    CheckCircle,
    TrendingUp,
    AlertCircle,
    Clock
} from 'lucide-react';
import './ReportPage.css';
import { toast } from 'react-toastify';

const ReportPage = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [reportType, setReportType] = useState('all');

    // MOCK DATA for Charts
    const appointmentData = [
        { name: 'Week 1', completed: 2, missed: 0 },
        { name: 'Week 2', completed: 1, missed: 1 },
        { name: 'Week 3', completed: 3, missed: 0 },
        { name: 'Week 4', completed: 2, missed: 0 },
    ];

    const adherenceData = [
        { day: 'Mon', adherence: 100 },
        { day: 'Tue', adherence: 90 },
        { day: 'Wed', adherence: 85 },
        { day: 'Thu', adherence: 100 },
        { day: 'Fri', adherence: 95 },
        { day: 'Sat', adherence: 80 },
        { day: 'Sun', adherence: 100 },
    ];

    const healthData = [
        { date: '01/02', systolic: 120, diastolic: 80, heartRate: 72 },
        { date: '03/02', systolic: 122, diastolic: 82, heartRate: 75 },
        { date: '05/02', systolic: 118, diastolic: 78, heartRate: 70 },
        { date: '07/02', systolic: 125, diastolic: 85, heartRate: 78 },
        { date: '09/02', systolic: 121, diastolic: 79, heartRate: 74 },
    ];

    const handleExport = () => {
        toast.info("Preparing comprehensive report PDF...", { autoClose: 2000 });
        // Simulating export delay
        setTimeout(() => toast.success("Report downloaded successfully!"), 2000);
    };

    return (
        <div className="report-container">
            {/* 1. Header */}
            <header className="report-header">
                <h1 className="report-title">Health Reports & Analytics</h1>
                <p className="report-subtitle">Detailed insights and trends over time to support better care decisions.</p>
            </header>

            {/* 2. Filters */}
            <section className="filter-section">
                <div className="filter-group">
                    <span className="filter-label">Time Range:</span>
                    <button
                        className={`filter-btn ${timeRange === '7d' ? 'active' : ''}`}
                        onClick={() => setTimeRange('7d')}
                    >Last 7 Days</button>
                    <button
                        className={`filter-btn ${timeRange === '30d' ? 'active' : ''}`}
                        onClick={() => setTimeRange('30d')}
                    >Last 30 Days</button>
                    <button
                        className={`filter-btn ${timeRange === '3m' ? 'active' : ''}`}
                        onClick={() => setTimeRange('3m')}
                    >Last 3 Months</button>
                    <button
                        className={`filter-btn ${timeRange === 'custom' ? 'active' : ''}`}
                        onClick={() => setTimeRange('custom')}
                    >Custom Range</button>
                </div>

                <div className="filter-group">
                    <span className="filter-label">Report Type:</span>
                    <select
                        className="report-type-select"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="all">All Metrics</option>
                        <option value="appointments">Appointments</option>
                        <option value="medications">Medications</option>
                        <option value="health">Health Vitals</option>
                    </select>
                </div>

                <button className="export-btn" onClick={handleExport}>
                    <Download size={18} /> Export PDF
                </button>
            </section>

            {/* 3. Insight Summaries */}
            <section className="insight-cards-grid">
                <div className="insight-card">
                    <div className="card-icon-wrapper">
                        <Calendar size={48} opacity={0.2} color="#3498db" />
                    </div>
                    <span className="insight-label">Total Appointments</span>
                    <span className="insight-value">8</span>
                    <div className="insight-trend trend-up">
                        <TrendingUp size={16} /> <span>2 upcoming</span>
                    </div>
                </div>

                <div className="insight-card">
                    <div className="card-icon-wrapper">
                        <Pill size={48} opacity={0.2} color="#2ecc71" />
                    </div>
                    <span className="insight-label">Medication Adherence</span>
                    <span className="insight-value">92%</span>
                    <div className="insight-trend trend-up">
                        <TrendingUp size={16} /> <span>+5% vs last week</span>
                    </div>
                </div>

                <div className="insight-card">
                    <div className="card-icon-wrapper">
                        <CheckCircle size={48} opacity={0.2} color="#f1c40f" />
                    </div>
                    <span className="insight-label">Reminder Completion</span>
                    <span className="insight-value">88%</span>
                    <div className="insight-trend trend-neutral">
                        <span>Stable</span>
                    </div>
                </div>

                <div className="insight-card">
                    <div className="card-icon-wrapper">
                        <Activity size={48} opacity={0.2} color="#e74c3c" />
                    </div>
                    <span className="insight-label">Avg Health Score</span>
                    <span className="insight-value">Good</span>
                    <div className="insight-trend trend-up">
                        <span>Vitals stable</span>
                    </div>
                </div>
            </section>

            {/* 4. Detailed Charts */}
            <section className="charts-section">
                {/* Medication Adherence Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h3 className="chart-title">Medication Adherence Trend</h3>
                            <span className="chart-subtitle">Daily percentage of taken medications</span>
                        </div>
                        <Pill size={20} color="#3498db" />
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={adherenceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Area type="monotone" dataKey="adherence" stroke="#3498db" fill="#eaf2f8" name="Adherence %" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Appointment History Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h3 className="chart-title">Appointment History</h3>
                            <span className="chart-subtitle">Completed vs. Missed Visits</span>
                        </div>
                        <Calendar size={20} color="#3498db" />
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={appointmentData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completed" fill="#2ecc71" name="Completed" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="missed" fill="#e74c3c" name="Missed" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Health Vitals Chart (Full Width) */}
                <div className="chart-card full-width">
                    <div className="chart-header">
                        <div>
                            <h3 className="chart-title">Health Vitals Trends</h3>
                            <span className="chart-subtitle">Blood Pressure (Systolic/Diastolic) & Heart Rate Over Time</span>
                        </div>
                        <Activity size={20} color="#e74c3c" />
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={healthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="systolic" stroke="#e74c3c" name="Systolic BP" strokeWidth={2} />
                            <Line type="monotone" dataKey="diastolic" stroke="#f1c40f" name="Diastolic BP" strokeWidth={2} />
                            <Line type="monotone" dataKey="heartRate" stroke="#3498db" name="Heart Rate (bpm)" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* 5. Insights & Recommendations */}
            <section className="recommendation-section">
                <h2 className="recommendation-title">
                    <Clock size={24} color="#9b59b6" /> AI-Generated Insights
                </h2>
                <div className="recommendation-content">
                    <div className="recommendation-item">
                        <div className="recommendation-icon">
                            <CheckCircle size={20} />
                        </div>
                        <div className="recommendation-text">
                            <h4>Great Medication Consistency</h4>
                            <p>The patient has missed 0 doses in the last 3 days. Keep up the great routine!</p>
                        </div>
                    </div>

                    <div className="recommendation-item">
                        <div className="recommendation-icon" style={{ backgroundColor: '#fadbd8', color: '#e74c3c' }}>
                            <AlertCircle size={20} />
                        </div>
                        <div className="recommendation-text">
                            <h4>Blood Pressure slightly elevated</h4>
                            <p>Recorded systolic pressure was above 120 on Feb 7th. Consider monitoring more frequently.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReportPage;
