import { useState, useCallback, useEffect } from 'react';
import { Activity, Heart, X, Save, Clock, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { healthApi, type HealthLog, type CreateHealthLogPayload } from '../../api/health.api';

interface HealthEntryFormProps {
    userId: string;
    editingLog: HealthLog | null;
    onClose: () => void;
    onSuccess: () => void;
}

const HealthEntryForm = ({ userId, editingLog, onClose, onSuccess }: HealthEntryFormProps) => {
    const [formData, setFormData] = useState<Partial<CreateHealthLogPayload>>({
        bloodPressure: '',
        heartRate: undefined,
        weight: undefined,
        note: ''
    });
    const [measurementType, setMeasurementType] = useState<'bloodPressure' | 'heartRate' | 'weight'>('bloodPressure');
    const [timestamp, setTimestamp] = useState(new Date().toISOString());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const resetForm = useCallback((log: HealthLog | null = null) => {
        if (log) {
            const hr = log.heartRate !== undefined ? log.heartRate : (log as any).HeartRate;
            const w = log.weight !== undefined ? log.weight : (log as any).Weight;
            const bp = log.bloodPressure || (log as any).BloodPressure;

            setFormData({
                bloodPressure: bp || '',
                heartRate: hr,
                weight: w,
                note: log.note || ''
            });
            setTimestamp(log.date);
            if (bp && bp !== '-') setMeasurementType('bloodPressure');
            else if (hr) setMeasurementType('heartRate');
            else if (w) setMeasurementType('weight');
        } else {
            setFormData({
                bloodPressure: '',
                heartRate: undefined,
                weight: undefined,
                note: ''
            });
            setTimestamp(new Date().toISOString());
            setMeasurementType('bloodPressure');
        }
        setErrors({});
        setIsDirty(false);
        setSaveSuccess(false);
    }, []);

    useEffect(() => {
        resetForm(editingLog);
    }, [editingLog, resetForm]);

    const handleInputChange = (field: keyof CreateHealthLogPayload, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validateField = (field: string) => {
        const newErrors = { ...errors };

        if (field === 'bloodPressure' && measurementType === 'bloodPressure') {
            if (!formData.bloodPressure) {
                newErrors.bloodPressure = 'Please enter blood pressure (e.g. 120/80).';
            } else if (!/^\d{2,3}\/\d{2,3}$/.test(formData.bloodPressure)) {
                newErrors.bloodPressure = 'Format must be Systolic/Diastolic (e.g. 120/80).';
            } else {
                delete newErrors.bloodPressure;
            }
        }

        if (field === 'heartRate' && measurementType === 'heartRate') {
            if (!formData.heartRate) {
                newErrors.heartRate = 'Please enter heart rate.';
            } else if (formData.heartRate < 30 || formData.heartRate > 250) {
                newErrors.heartRate = 'Please enter a realistic heart rate.';
            } else {
                delete newErrors.heartRate;
            }
        }

        if (field === 'weight' && measurementType === 'weight') {
            if (!formData.weight) {
                newErrors.weight = 'Please enter weight.';
            } else if (formData.weight < 20 || formData.weight > 500) {
                newErrors.weight = 'Please enter a realistic weight.';
            } else {
                delete newErrors.weight;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateField(measurementType)) return;

        try {
            setLoading(true);

            const payload: CreateHealthLogPayload = {
                userId: userId,
                date: timestamp,
                bloodPressure: measurementType === 'bloodPressure' ? (formData.bloodPressure || '-') : '-',
                heartRate: measurementType === 'heartRate' ? formData.heartRate : undefined,
                weight: measurementType === 'weight' ? formData.weight : undefined,
                note: formData.note
            };

            await healthApi.createHealthLog(payload);

            setSaveSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (isDirty) {
            setShowCancelModal(true);
        } else {
            onClose();
        }
    };

    return (
        <div className="health-page-container" style={{ maxWidth: '800px' }}>
            <header className="health-header">
                <button className="metric-toggle" onClick={handleClose} style={{ marginBottom: '1rem' }}>
                    <X size={20} /> Close
                </button>
                <h1>{editingLog ? 'Edit Health Record' : 'Add New Health Record'}</h1>
                <p>Provide accurate measurement details below to help with care decisions.</p>
            </header>

            {saveSuccess ? (
                <div className="status-card normal" style={{ alignItems: 'center', padding: '3rem' }}>
                    <CheckCircle2 size={64} color="var(--hp-success)" />
                    <h2 style={{ marginTop: '1rem' }}>Record Saved Successfully</h2>
                    <p>Returning to dashboard...</p>
                </div>
            ) : (
                <div className="health-section">
                    {editingLog && (
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--hp-border)' }}>
                            <span className="history-metric-label">Original Record Date</span>
                            <p style={{ margin: 0, fontWeight: 600 }}>{new Date(editingLog.date).toLocaleString()}</p>
                        </div>
                    )}

                    <section style={{ marginBottom: '2rem' }}>
                        <h3 className="section-title"><Activity size={20} /> Measurement Information</h3>
                        <div className="metric-toggles" style={{ width: 'fit-content' }}>
                            {(['bloodPressure', 'heartRate', 'weight'] as const).map(type => (
                                <button
                                    key={type}
                                    className={`metric-toggle ${measurementType === type ? 'active' : ''}`}
                                    onClick={() => { setMeasurementType(type); setIsDirty(true); }}
                                    disabled={!!editingLog}
                                >
                                    {type === 'bloodPressure' ? 'Blood Pressure' : type === 'heartRate' ? 'Heart Rate' : 'Weight'}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h3 className="section-title"><Heart size={20} /> Measurement Values</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {measurementType === 'bloodPressure' && (
                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        Blood Pressure (mmHg) <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Required)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 120/80"
                                        value={formData.bloodPressure}
                                        onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                                        onBlur={() => validateField('bloodPressure')}
                                        style={{ height: '48px', width: '100%', borderRadius: '8px', border: errors.bloodPressure ? '2px solid var(--hp-critical)' : '1px solid var(--hp-border)', padding: '0 1rem', fontSize: '1.125rem' }}
                                    />
                                    {errors.bloodPressure && <p style={{ color: 'var(--hp-critical)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.bloodPressure}</p>}
                                </div>
                            )}

                            {measurementType === 'heartRate' && (
                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        Heart Rate (bpm) <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Required)</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 72"
                                        value={formData.heartRate || ''}
                                        onChange={(e) => handleInputChange('heartRate', parseInt(e.target.value))}
                                        onBlur={() => validateField('heartRate')}
                                        style={{ height: '48px', width: '100%', borderRadius: '8px', border: errors.heartRate ? '2px solid var(--hp-critical)' : '1px solid var(--hp-border)', padding: '0 1rem', fontSize: '1.125rem' }}
                                    />
                                    {errors.heartRate && <p style={{ color: 'var(--hp-critical)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.heartRate}</p>}
                                </div>
                            )}

                            {measurementType === 'weight' && (
                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        Weight (kg) <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Required)</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g. 70.5"
                                        value={formData.weight || ''}
                                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                                        onBlur={() => validateField('weight')}
                                        style={{ height: '48px', width: '100%', borderRadius: '8px', border: errors.weight ? '2px solid var(--hp-critical)' : '1px solid var(--hp-border)', padding: '0 1rem', fontSize: '1.125rem' }}
                                    />
                                    {errors.weight && <p style={{ color: 'var(--hp-critical)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.weight}</p>}
                                </div>
                            )}
                        </div>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h3 className="section-title"><Clock size={20} /> Time & Context</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}><Calendar size={14} /> Date</label>
                                <input
                                    type="date"
                                    value={timestamp.split('T')[0]}
                                    onChange={(e) => {
                                        const time = timestamp.split('T')[1] || '00:00:00';
                                        setTimestamp(`${e.target.value}T${time}`);
                                        setIsDirty(true);
                                    }}
                                    style={{ height: '48px', width: '100%', borderRadius: '8px', border: '1px solid var(--hp-border)', padding: '0 1rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}><Clock size={14} /> Time</label>
                                <input
                                    type="time"
                                    value={timestamp.split('T').length > 1 ? timestamp.split('T')[1].substring(0, 5) : '00:00'}
                                    onChange={(e) => {
                                        const date = timestamp.split('T')[0];
                                        setTimestamp(`${date}T${e.target.value}:00.000Z`);
                                        setIsDirty(true);
                                    }}
                                    style={{ height: '48px', width: '100%', borderRadius: '8px', border: '1px solid var(--hp-border)', padding: '0 1rem' }}
                                />
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h3 className="section-title"><FileText size={20} /> Notes (Optional)</h3>
                        <textarea
                            placeholder="Observed symptoms or conditions..."
                            value={formData.note}
                            onChange={(e) => handleInputChange('note', e.target.value)}
                            style={{ width: '100%', height: '120px', borderRadius: '12px', border: '1px solid var(--hp-border)', padding: '1rem', fontSize: '1rem', resize: 'vertical' }}
                        />
                    </section>

                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '2rem', borderTop: '2px solid var(--hp-border)' }}>
                        <button
                            className="add-log-trigger"
                            style={{ position: 'static', flex: 1, justifyContent: 'center', boxShadow: 'none' }}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : <><Save size={20} /> Save Health Record</>}
                        </button>
                        <button
                            className="metric-toggle"
                            style={{ flex: 1, justifyContent: 'center', height: '56px', borderRadius: '9999px', border: '2px solid var(--hp-border)' }}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showCancelModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Unsaved Changes</h2>
                        <p style={{ color: 'var(--hp-text-muted)', marginBottom: '2rem' }}>You have entered information that hasn't been saved. Are you sure you want to discard this record?</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: 'none', background: 'var(--hp-critical)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                                onClick={() => { setShowCancelModal(false); setIsDirty(false); onClose(); }}
                            >
                                Discard
                            </button>
                            <button
                                style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid var(--hp-border)', background: 'white', fontWeight: 700, cursor: 'pointer' }}
                                onClick={() => setShowCancelModal(false)}
                            >
                                Keep Editing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthEntryForm;
