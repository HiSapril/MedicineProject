import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { healthApi, type HealthLog } from '../api/health.api';
import { medicationApi, type Medication } from '../api/medication.api';
import { toast } from 'react-toastify';

const ReportPage = () => {
    const [loading, setLoading] = useState(false);

    const generatePDF = async () => {
        setLoading(true);
        try {
            // Fetch data
            const [healthRes, medRes] = await Promise.all([
                healthApi.getHealthLogs(),
                medicationApi.getMedications()
            ]);

            const healthLogs = healthRes.data;
            const medications = medRes.data;

            // Initialize PDF
            const doc = new jsPDF();

            // Title
            doc.setFontSize(20);
            doc.text('Health & Medication Report', 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

            // Medications Table
            doc.setFontSize(14);
            doc.text('Current Medications', 14, 40);

            const medData = medications.map((m: Medication) => [m.name, m.dosage, m.frequency, m.time]);
            autoTable(doc, {
                startY: 45,
                head: [['Name', 'Dosage', 'Frequency', 'Time']],
                body: medData,
            });

            // Health Logs Table
            const finalY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.text('Recent Health Logs', 14, finalY);

            const healthData = healthLogs.map((log: HealthLog) => [
                new Date(log.timestamp).toLocaleDateString(),
                log.weight ? `${log.weight} kg` : '-',
                log.bloodPressure || '-',
                log.heartRate ? `${log.heartRate} bpm` : '-',
                log.notes || '-'
            ]);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Date', 'Weight', 'Blood Pressure', 'Heart Rate', 'Notes']],
                body: healthData,
            });

            // Save
            doc.save('health-report.pdf');
            toast.success('Report downloaded successfully');

        } catch (error) {
            console.error('Export failed', error);
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Export Health Report</h1>
                <p style={styles.description}>
                    Download a comprehensive PDF report of your current medications and recent health logs.
                    This file is useful for your doctor visits.
                </p>
                <button
                    onClick={generatePDF}
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Download Report (PDF)'}
                </button>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
    },
    title: {
        fontSize: '28px',
        color: '#2c3e50',
        marginBottom: '20px',
    },
    description: {
        fontSize: '18px',
        color: '#7f8c8d',
        marginBottom: '30px',
        lineHeight: '1.5',
    },
    button: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: '#3498db',
        border: 'none',
        borderRadius: '8px',
        padding: '15px 30px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    }
};

export default ReportPage;
