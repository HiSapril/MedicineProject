import { Pill, Clock, Calendar, AlertTriangle, Edit2, PlayCircle, PauseCircle, Trash2 } from 'lucide-react';
import type { Medication } from '../../api/medication.api';
import './MedicationCard.css';

interface MedicationCardProps {
    med: Medication;
    onEdit?: () => void;
    onToggle?: () => void;
    onDelete?: () => void;
    isPaused?: boolean;
    isReadOnly?: boolean;
}

const MedicationCard = ({
    med,
    onEdit,
    onToggle,
    onDelete,
    isPaused,
    isReadOnly
}: MedicationCardProps) => {
    return (
        <div className={`med-card ${isPaused ? 'paused' : ''}`}>
            <div className="med-header">
                <div className="med-name-section">
                    <div className="med-icon">
                        {med.form === 'Injection' ? '💉' : med.form === 'Liquid' ? '💧' : <Pill size={24} />}
                    </div>
                    <div>
                        <h3 className="med-name">{med.name}</h3>
                        <span className="med-form">{med.form} • {med.dosage.amount}{med.dosage.unit}</span>
                    </div>
                </div>
                <div className={`status-badge ${med.status.toLowerCase()}`}>
                    {med.status}
                </div>
            </div>

            <div className="med-details">
                <div className="detail-row">
                    <Clock size={16} />
                    <span>
                        {med.frequency.type === 'Daily'
                            ? `${med.frequency.timesPerDay}x Daily (${med.frequency.specificTimes?.join(', ')})`
                            : med.frequency.type}
                    </span>
                </div>
                <div className="detail-row">
                    <Calendar size={16} />
                    <span>Started: {new Date(med.startDate).toLocaleDateString()}</span>
                </div>
                {med.instructions && (
                    <div className="detail-row" style={{ fontStyle: 'italic', color: '#64748b' }}>
                        <AlertTriangle size={16} />
                        <span>{med.instructions}</span>
                    </div>
                )}
            </div>

            {!isReadOnly && (
                <div className="med-actions">
                    <button className="btn-action" onClick={onEdit}>
                        <Edit2 size={16} /> Edit
                    </button>
                    {onToggle && (
                        <button className={`btn-action ${isPaused ? 'btn-primary' : 'btn-warning'}`} onClick={onToggle}>
                            {isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                    )}
                    {isPaused && onDelete && (
                        <button className="btn-action" onClick={onDelete} style={{ color: '#ef4444' }}>
                            <Trash2 size={16} /> Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MedicationCard;
