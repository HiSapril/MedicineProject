import { useEffect, useState } from 'react';
import {
    Download,
    Calendar,
    Activity,
    Pill,
    CheckCircle2,
    ShieldCheck,
    Bell,
    FileJson,
    FileSpreadsheet,
    ChevronDown
} from 'lucide-react';
import { reportApi } from '../../api/report.api';
import { exportHelpers } from '../../utils/report.export';
import { type ComprehensiveReport, type TimeRange } from '../../types/report.types';
import { toast } from 'react-toastify';

// Sub-components
import ReportSummaryCards from '../../components/report/ReportSummaryCards';
import ReminderPerformanceSection from '../../components/report/ReminderPerformanceSection';
import NotificationDeliverySection from '../../components/report/NotificationDeliverySection';
import MedicationAdherenceSection from '../../components/report/MedicationAdherenceSection';
import AppointmentComplianceSection from '../../components/report/AppointmentComplianceSection';
import SystemHealthSection from '../../components/report/SystemHealthSection';

import './ReportPage.css';

export const ReportPage = () => {
    const [range, setRange] = useState<TimeRange>('7d');
    const [data, setData] = useState<ComprehensiveReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'reminders' | 'notifications' | 'adherence' | 'appointments' | 'system'>('reminders');

    useEffect(() => {
        fetchReportData();
    }, [range]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const report = await reportApi.generateReport(range);
            setData(report);
        } catch (error) {
            console.error('Failed to load report data', error);
            toast.error('Unable to load analytics. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (format: 'pdf' | 'csv' | 'json') => {
        if (!data) return;

        try {
            switch (format) {
                case 'json':
                    exportHelpers.exportAsJSON(data);
                    break;
                case 'csv':
                    exportHelpers.exportAsCSV(data);
                    break;
                case 'pdf':
                    exportHelpers.exportAsPDF(data);
                    break;
            }
            toast.success(`${format.toUpperCase()} exported successfully`);
        } catch (error) {
            toast.error(`Failed to export ${format.toUpperCase()}`);
        }
    };

    if (loading || !data) {
        return (
            <div className="report-loading">
                <div className="spinner"></div>
                <p>Aggregating system accountability metrics...</p>
            </div>
        );
    }

    return (
        <div className="report-container">
            {/* 1. Header & Global Controls */}
            <header className="report-header">
                <div className="title-section">
                    <h1 className="report-title">System Accountability Reports</h1>
                    <p className="report-subtitle">
                        Compliance, safety audit, and system performance analytics (Read-Only)
                    </p>
                </div>

                <div className="global-controls">
                    <div className="range-selector">
                        <Calendar size={18} />
                        <select value={range} onChange={(e) => setRange(e.target.value as TimeRange)}>
                            <option value="today">Today</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    <div className="export-dropdown">
                        <button className="export-main-btn">
                            <Download size={18} /> Export <ChevronDown size={14} />
                        </button>
                        <div className="export-menu">
                            <button onClick={() => handleExport('pdf')}><CheckCircle2 size={16} /> PDF Summary</button>
                            <button onClick={() => handleExport('csv')}><FileSpreadsheet size={16} /> Raw Data CSV</button>
                            <button onClick={() => handleExport('json')}><FileJson size={16} /> Audit JSON</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Accountability Summary Cards */}
            <ReportSummaryCards data={data} />

            {/* 3. Report Categories Tabs */}
            <nav className="report-tabs">
                <button className={activeTab === 'reminders' ? 'active' : ''} onClick={() => setActiveTab('reminders')}>
                    <Bell size={18} /> Reminder Performance
                </button>
                <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
                    <ShieldCheck size={18} /> Notification Delivery
                </button>
                <button className={activeTab === 'adherence' ? 'active' : ''} onClick={() => setActiveTab('adherence')}>
                    <Pill size={18} /> Med Adherence
                </button>
                <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
                    <Calendar size={18} /> Appointments
                </button>
                <button className={activeTab === 'system' ? 'active' : ''} onClick={() => setActiveTab('system')}>
                    <Activity size={18} /> System Health
                </button>
            </nav>

            {/* 4. Active Report Section */}
            <main className="report-content">
                {activeTab === 'reminders' && <ReminderPerformanceSection data={data} />}
                {activeTab === 'notifications' && <NotificationDeliverySection data={data} />}
                {activeTab === 'adherence' && <MedicationAdherenceSection data={data} />}
                {activeTab === 'appointments' && <AppointmentComplianceSection data={data} />}
                {activeTab === 'system' && <SystemHealthSection data={data} />}
            </main>

            {/* 5. Audit Compliance Footer */}
            <footer className="report-footer">
                <div className="disclaimer">
                    <ShieldCheck size={16} />
                    <span>Selected Date Range: {data.metadata.range} | Report Generated: {new Date(data.metadata.timestamp).toLocaleString()} | System v{data.metadata.version}</span>
                </div>
                <p className="legal-notice">
                    This report is for audit and accountability purposes. Do not use for immediate clinical intervention.
                </p>
            </footer>
        </div>
    );
};
