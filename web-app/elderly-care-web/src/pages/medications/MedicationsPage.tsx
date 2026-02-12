import { useEffect, useState, useMemo } from 'react';
import { medicationService } from '../../services/medication.service';
import { type Medication } from '../../api/medication.api';
import MedicationCard from '../../components/medication/MedicationCard';
import MedicationForm from '../../components/medication/MedicationForm';
import './MedicationsPage.css';
import {
    Pill,
    PauseCircle,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Plus
} from 'lucide-react';
import { toast } from 'react-toastify';

export const MedicationsPage = () => {
    // --- State ---
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

    // --- Data Fetching ---
    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        setLoading(true);
        try {
            const data = await medicationService.getMedications();
            setMedications(data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load medications.');
        } finally {
            setLoading(false);
        }
    };

    // --- Grouping ---
    const groupedMeds = useMemo(() => {
        return {
            active: medications.filter(m => m.status === 'Active'),
            paused: medications.filter(m => m.status === 'Paused'),
            completed: medications.filter(m => m.status === 'Completed')
        };
    }, [medications]);

    // --- Form Handlers ---
    const handleOpenForm = (medId: string | null = null) => {
        setEditingId(medId);
        setIsFormOpen(true);
    };

    // --- Actions ---
    const handleToggleStatus = async (med: Medication) => {
        const newStatus = med.status === 'Active' ? 'Paused' : 'Active';
        const action = newStatus === 'Paused' ? 'pause' : 'resume';

        if (newStatus === 'Paused') {
            const confirmed = window.confirm(`Are you sure you want to pause ${med.name}? Reminders will stop triggering.`);
            if (!confirmed) return;
        }

        try {
            await medicationService.toggleStatus(med);
            toast.success(`Medication ${action}d`);
            fetchMedications();
        } catch (err) {
            toast.error(`Failed to ${action} medication`);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this medication? This action cannot be undone.');
        if (!confirmed) return;

        try {
            await medicationService.deleteMedication(id);
            toast.success('Medication deleted');
            fetchMedications();
        } catch (err) {
            toast.error('Failed to delete medication');
        }
    };

    // --- Render ---
    if (loading) return <div className="loading-view">Loading Medications...</div>;

    return (
        <div className="medications-container">
            {/* Header */}
            <header className="medications-header">
                <h1><Pill size={32} /> Medication Management</h1>
                <p>Track your prescriptions, manage dosages, and control your reminder schedule.</p>
            </header>

            {/* Actions */}
            <div className="actions-bar">
                <button className="btn-add-med" onClick={() => handleOpenForm()}>
                    <Plus size={20} /> Add New Medication
                </button>
            </div>

            {error && <div className="error-box">{error}</div>}

            {/* Active Medications */}
            <section className="medication-group">
                <div className="group-title">
                    <CheckCircle2 size={24} className="text-green-600" />
                    Active Medications ({groupedMeds.active.length})
                </div>

                {groupedMeds.active.length === 0 ? (
                    <div className="empty-state">
                        <Pill size={48} style={{ opacity: 0.2 }} />
                        <p>No active medications.</p>
                    </div>
                ) : (
                    <div className="medication-grid">
                        {groupedMeds.active.map(med => (
                            <MedicationCard
                                key={med.id}
                                med={med}
                                onEdit={() => handleOpenForm(med.id)}
                                onToggle={() => handleToggleStatus(med)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Paused Medications */}
            {groupedMeds.paused.length > 0 && (
                <section className="medication-group">
                    <div className="group-title">
                        <PauseCircle size={24} className="text-gray-500" />
                        Paused Medications ({groupedMeds.paused.length})
                    </div>
                    <div className="medication-grid">
                        {groupedMeds.paused.map(med => (
                            <MedicationCard
                                key={med.id}
                                med={med}
                                onEdit={() => handleOpenForm(med.id)}
                                onToggle={() => handleToggleStatus(med)}
                                isPaused
                                onDelete={() => handleDelete(med.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Completed Medications */}
            {groupedMeds.completed.length > 0 && (
                <section className="medication-group">
                    <div
                        className="group-title"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
                    >
                        <CheckCircle2 size={24} className="text-gray-400" />
                        Completed History ({groupedMeds.completed.length})
                        {isCompletedCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </div>
                    {!isCompletedCollapsed && (
                        <div className="medication-grid">
                            {groupedMeds.completed.map(med => (
                                <MedicationCard
                                    key={med.id}
                                    med={med}
                                    isReadOnly
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            <MedicationForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                editingId={editingId}
                medications={medications}
                onSuccess={fetchMedications}
            />
        </div>
    );
};
