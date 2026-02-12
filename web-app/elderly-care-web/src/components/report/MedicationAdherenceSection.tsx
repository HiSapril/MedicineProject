import { AlertCircle } from 'lucide-react';
import type { ComprehensiveReport } from '../../types/report.types';

interface MedicationAdherenceSectionProps {
    data: ComprehensiveReport;
}

const MedicationAdherenceSection = ({ data }: MedicationAdherenceSectionProps) => {
    return (
        <div className="report-section slide-in">
            <div className="section-header">
                <h2>Medication Adherence Compliance</h2>
                <p>Safety tracking based on reminder acknowledgements.</p>
            </div>
            <div className="metrics-row">
                <div className="metric-box">
                    <h3>{data.medicationAdherence.activeMedications}</h3>
                    <p>Active Meds Monitored</p>
                </div>
                <div className="metric-box warning">
                    <h3>{data.medicationAdherence.missedRemindersCount}</h3>
                    <p>Missed Doses (Inferred)</p>
                </div>
            </div>
            <div className="disclaimer-area">
                <AlertCircle size={20} />
                <p>
                    <strong>Safety Notice:</strong> Adherence is inferred from system interactions.
                    It does not constitute digital verification of actual medication ingestion.
                </p>
            </div>
        </div>
    );
};

export default MedicationAdherenceSection;
