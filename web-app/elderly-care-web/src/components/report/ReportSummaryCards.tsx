import type { ComprehensiveReport } from '../../types/report.types';

interface ReportSummaryCardsProps {
    data: ComprehensiveReport;
}

const ReportSummaryCards = ({ data }: ReportSummaryCardsProps) => {
    return (
        <section className="summary-cards">
            <div className="summary-card gold">
                <span className="summary-label">Trigger Accuracy</span>
                <span className="summary-value">{data.reminderPerformance.triggeredOnTime}%</span>
                <span className="summary-hint">On-time reminder generation</span>
            </div>
            <div className="summary-card blue">
                <span className="summary-label">Delivery Rate</span>
                <span className="summary-value">
                    {Math.round((data.notificationDelivery.deliveredCount / data.notificationDelivery.totalSent) * 100 || 0)}%
                </span>
                <span className="summary-hint">Success across all channels</span>
            </div>
            <div className="summary-card green">
                <span className="summary-label">Adherence (Inferred)</span>
                <span className="summary-value">{data.medicationAdherence.acknowledgedCount}</span>
                <span className="summary-hint">Acknowledge notifications</span>
            </div>
            <div className="summary-card red">
                <span className="summary-label">Safety Risks</span>
                <span className="summary-value">{data.appointmentCompliance.noShowRiskCount + data.systemHealth.failuresByReason.length}</span>
                <span className="summary-hint">High priority failures</span>
            </div>
        </section>
    );
};

export default ReportSummaryCards;
