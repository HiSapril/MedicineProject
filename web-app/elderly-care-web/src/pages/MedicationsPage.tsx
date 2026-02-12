import { useEffect, useState, useMemo } from 'react';
import { medicationService } from '../services/medication.service';
import { type Medication } from '../api/medication.api';
import './MedicationsPage.css';
import {
  Pill,
  Clock,
  Calendar,
  Plus,
  Edit2,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

// --- Types ---
interface MedicationFormData {
  name: string;
  form: Medication['form'];
  dosageAmount: number;
  dosageUnit: Medication['dosage']['unit'];
  frequencyType: Medication['frequency']['type'];
  timesPerDay: number;
  specificTimes: string[]; // "08:00"
  intervalDays: number;
  daysOfWeek: number[]; // 0=Sun, 1=Mon
  startDate: string;
  endDate: string;
  instructions: string;
}

const INITIAL_FORM: MedicationFormData = {
  name: '',
  form: 'Tablet',
  dosageAmount: 0,
  dosageUnit: 'mg',
  frequencyType: 'Daily',
  timesPerDay: 1,
  specificTimes: ['08:00'],
  intervalDays: 1,
  daysOfWeek: [],
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  instructions: ''
};

const MedicationsPage = () => {
  // --- State ---
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

  // Form State
  const [formData, setFormData] = useState<MedicationFormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  // --- Form Logic ---
  const handleOpenForm = (med?: Medication) => {
    if (med) {
      setEditingId(med.id);
      setFormData({
        name: med.name,
        form: med.form,
        dosageAmount: med.dosage.amount,
        dosageUnit: med.dosage.unit,
        frequencyType: med.frequency.type,
        timesPerDay: med.frequency.timesPerDay || 1,
        specificTimes: med.frequency.specificTimes || ['08:00'],
        intervalDays: med.frequency.intervalDays || 1,
        daysOfWeek: med.frequency.daysOfWeek || [],
        startDate: new Date(med.startDate).toISOString().split('T')[0],
        endDate: med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : '',
        instructions: med.instructions || ''
      });
    } else {
      setEditingId(null);
      setFormData(INITIAL_FORM);
    }
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Medication name is required';
    if (formData.dosageAmount <= 0) errors.dosage = 'Dosage must be greater than 0';
    if (!formData.startDate) errors.startDate = 'Start date is required';

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date cannot be before start date';
    }

    if (formData.frequencyType === 'Daily' && formData.specificTimes.length !== formData.timesPerDay) {
      // Auto-fix or strict? Let's just warn for now or rely on UI to enforce sync
      // actually UI enforces sync
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Warning for editing existing items
    if (editingId) {
      const existing = medications.find(m => m.id === editingId);
      if (existing && existing.linkedRemindersCount && existing.linkedRemindersCount > 0) {
        const confirmed = window.confirm(
          `⚠️ Warning: This medication has ${existing.linkedRemindersCount} active reminders.\n\nChanging the schedule will update all future reminders. Continue?`
        );
        if (!confirmed) return;
      }
    }

    try {
      const payload: Partial<Medication> = {
        name: formData.name,
        form: formData.form,
        dosage: {
          amount: formData.dosageAmount,
          unit: formData.dosageUnit
        },
        frequency: {
          type: formData.frequencyType,
          timesPerDay: formData.timesPerDay,
          specificTimes: formData.specificTimes,
          intervalDays: formData.intervalDays,
          daysOfWeek: formData.daysOfWeek
        },
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        instructions: formData.instructions
      };

      if (editingId) {
        await medicationService.updateMedication(editingId, payload);
        toast.success('Medication updated successfully');
      } else {
        await medicationService.addMedication(payload as any);
        toast.success('Medication added successfully');
      }
      setIsFormOpen(false);
      fetchMedications();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save medication');
    }
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
                onEdit={() => handleOpenForm(med)}
                onToggle={() => handleToggleStatus(med)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Paused Medications (Collapsible-ish logic via UI preference, but keep simple for now) */}
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
                onEdit={() => handleOpenForm(med)}
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

      {/* --- Universal Medication Form Modal --- */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Medication' : 'Add New Medication'}</h2>
              <button className="btn-close" onClick={() => setIsFormOpen(false)}><X size={24} /></button>
            </div>

            <div className="modal-body form-body">
              {/* Section 1: Identity */}
              <div className="form-section">
                <h3>1. Medication Details</h3>
                <div className="form-group">
                  <label>Medication Name</label>
                  <input
                    className="form-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Lisinopril"
                  />
                  {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Form</label>
                    <select
                      className="form-select"
                      value={formData.form}
                      onChange={e => setFormData({ ...formData, form: e.target.value as any })}
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Liquid">Liquid</option>
                      <option value="Injection">Injection</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Dosage */}
              <div className="form-section">
                <h3>2. Dosage</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.dosageAmount}
                      onChange={e => setFormData({ ...formData, dosageAmount: Number(e.target.value) })}
                    />
                    {formErrors.dosage && <div className="form-error">{formErrors.dosage}</div>}
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      className="form-select"
                      value={formData.dosageUnit}
                      onChange={e => setFormData({ ...formData, dosageUnit: e.target.value as any })}
                    >
                      <option value="mg">mg</option>
                      <option value="ml">ml</option>
                      <option value="tablet">tablet(s)</option>
                      <option value="pills">pills</option>
                    </select>
                  </div>
                </div>
                <div className="form-hint">Typical dose: 250-500mg for most antibiotics</div>
              </div>

              {/* Section 3: Schedule */}
              <div className="form-section">
                <h3>3. Schedule</h3>
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    className="form-select"
                    value={formData.frequencyType}
                    onChange={e => {
                      setFormData({
                        ...formData,
                        frequencyType: e.target.value as any,
                        // Reset specific times if daily
                        specificTimes: e.target.value === 'Daily' ? ['08:00'] : []
                      });
                    }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Interval">Every X Days</option>
                    <option value="AsNeeded">As Needed (PRN)</option>
                  </select>
                </div>

                {formData.frequencyType === 'Daily' && (
                  <div className="form-group">
                    <label>Times Per Day</label>
                    <select
                      className="form-select"
                      value={formData.timesPerDay}
                      onChange={e => {
                        const count = Number(e.target.value);
                        // Adjust specificTimes array size
                        const newTimes = [...formData.specificTimes];
                        while (newTimes.length < count) newTimes.push('12:00');
                        while (newTimes.length > count) newTimes.pop();

                        setFormData({ ...formData, timesPerDay: count, specificTimes: newTimes });
                      }}
                    >
                      {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} time(s)</option>)}
                    </select>
                  </div>
                )}

                {/* Dynamic Time Pickers */}
                {formData.frequencyType === 'Daily' && (
                  <div className="form-group">
                    <label>Scheduled Times</label>
                    <div className="form-row">
                      {formData.specificTimes.map((time, idx) => (
                        <input
                          key={idx}
                          type="time"
                          className="form-input"
                          value={time}
                          onChange={e => {
                            const newTimes = [...formData.specificTimes];
                            newTimes[idx] = e.target.value;
                            setFormData({ ...formData, specificTimes: newTimes });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Duration */}
              <div className="form-section">
                <h3>4. Duration</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                    {formErrors.startDate && <div className="form-error">{formErrors.startDate}</div>}
                  </div>
                  <div className="form-group">
                    <label>End Date (Optional)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                    {formErrors.endDate && <div className="form-error">{formErrors.endDate}</div>}
                  </div>
                </div>
              </div>

              {/* Section 5: Instructions */}
              <div className="form-section" style={{ borderBottom: 'none' }}>
                <h3>5. Instructions</h3>
                <div className="form-group">
                  <label>Special Instructions</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.instructions}
                    onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="e.g. Take with food, do not operate heavy machinery..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>
                {editingId ? 'Save Changes' : 'Create Medication'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Components ---

const MedicationCard = ({
  med,
  onEdit,
  onToggle,
  onDelete,
  isPaused,
  isReadOnly
}: {
  med: Medication;
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  isPaused?: boolean;
  isReadOnly?: boolean;
}) => {
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

export default MedicationsPage;
