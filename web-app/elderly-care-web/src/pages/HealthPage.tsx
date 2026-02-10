import { useEffect, useState, useMemo, useCallback } from 'react';
import { healthApi, type HealthLog, type CreateHealthLogPayload } from '../api/health.api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Weight, Heart, AlertTriangle, ChevronRight, Plus, X, Save, Clock, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import './HealthPage.css';

/**
 * HealthPage - Implementation following the Universal Form Pattern & Design Plan.
 * Restored Weight metric support as a mandatory health indicator.
 */
const HealthPage = () => {
  const { user } = useAuth();

  // --- States ---
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeMetric, setActiveMetric] = useState<'bloodPressure' | 'heartRate' | 'weight'>('bloodPressure');

  // UI Modes
  const [isEntryMode, setIsEntryMode] = useState(false);
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null);

  // Form State
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
  const [isMounted, setIsMounted] = useState(false);

  // --- Initial Layout Logic ---
  useEffect(() => {
    setIsMounted(true);
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // --- Form Logic ---
  const resetForm = useCallback((log: HealthLog | null = null) => {
    if (log) {
      setFormData({
        bloodPressure: log.bloodPressure || '',
        heartRate: log.heartRate,
        weight: log.weight,
        note: log.note || ''
      });
      setTimestamp(log.date);
      if (log.bloodPressure && log.bloodPressure !== '-') setMeasurementType('bloodPressure');
      else if (log.heartRate) setMeasurementType('heartRate');
      else if (log.weight) setMeasurementType('weight');
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

  const handleOpenEntry = (log: HealthLog | null = null) => {
    setEditingLog(log);
    resetForm(log);
    setIsEntryMode(true);
  };

  const handleCloseEntry = () => {
    if (isDirty) {
      setShowCancelModal(true);
    } else {
      setIsEntryMode(false);
      setEditingLog(null);
    }
  };

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
  };

  const handleSave = async () => {
    if (!user) return;

    validateField(measurementType);
    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);

      const payload: CreateHealthLogPayload = {
        userId: user.id,
        date: timestamp,
        bloodPressure: measurementType === 'bloodPressure' ? (formData.bloodPressure || '-') : '-',
        heartRate: measurementType === 'heartRate' ? formData.heartRate : undefined,
        weight: measurementType === 'weight' ? formData.weight : undefined,
        note: formData.note
      };

      await healthApi.createHealthLog(payload);

      setSaveSuccess(true);
      setTimeout(() => {
        setIsEntryMode(false);
        setEditingLog(null);
        fetchLogs();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFetchError('Failed to save record. Please ensure all required fields are valid.');
    } finally {
      setLoading(false);
    }
  };

  // --- Derived Data ---
  const latestMetrics = useMemo(() => {
    const metrics = {
      bloodPressure: '--',
      heartRate: '--',
      weight: '--'
    };

    // Find latest of each metric in descending order logs
    for (const log of logs) {
      // Handle potential casing differences from backend (Weight vs weight)
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

  const getStatus = (metric: string, value: any) => {
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

  // --- Render Helpers ---

  if (isEntryMode) {
    // ... (rest of entry mode remains same)
    return (
      <div className="health-page-container" style={{ maxWidth: '800px' }}>
        <header className="health-header">
          <button className="metric-toggle" onClick={handleCloseEntry} style={{ marginBottom: '1rem' }}>
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
                onClick={handleCloseEntry}
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
                  onClick={() => { setShowCancelModal(false); setIsDirty(false); setIsEntryMode(false); setEditingLog(null); }}
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
  }

  return (
    <div className="health-page-container">
      <header className="health-header">
        <h1>Health Records</h1>
        <p>Track and review daily health measurements over time to monitor elderly well-being.</p>
      </header>

      {fetchError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '0.5rem', color: '#991b1b', marginBottom: '2rem' }}>
          <AlertTriangle size={20} />
          <span>{fetchError}</span>
        </div>
      )}

      <div className="health-content">
        <section className="health-section">
          <h2 className="section-title"><ChevronRight size={24} /> Latest Recorded Values</h2>
          <div className="status-grid">
            <div className={`status-card ${getStatus('bloodPressure', latestMetrics.bloodPressure)}`}>
              <div className="status-card-header"><span>Blood Pressure</span><Activity size={20} /></div>
              <div className="status-value">{latestMetrics.bloodPressure}<span className="status-unit"> {latestMetrics.bloodPressure !== '--' ? 'mmHg' : ''}</span></div>
            </div>
            <div className={`status-card ${getStatus('heartRate', latestMetrics.heartRate)}`}>
              <div className="status-card-header"><span>Heart Rate</span><Heart size={20} /></div>
              <div className="status-value">{latestMetrics.heartRate}<span className="status-unit"> {latestMetrics.heartRate !== '--' ? 'bpm' : ''}</span></div>
            </div>
            <div className={`status-card ${getStatus('weight', latestMetrics.weight)}`}>
              <div className="status-card-header"><span>Weight</span><Weight size={20} /></div>
              <div className="status-value">{latestMetrics.weight}<span className="status-unit"> {latestMetrics.weight !== '--' ? 'kg' : ''}</span></div>
            </div>
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
          <div className="trends-container" style={{ width: '100%', height: '350px', minHeight: '350px', position: 'relative', overflow: 'hidden' }}>
            {logs.length > 1 && isMounted ? (
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={activeMetric}
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : logs.length <= 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                Record at least two measurements to see trends.
              </div>
            ) : null}
          </div>
        </section>

        <section className="health-section">
          <h2 className="section-title">History Logs</h2>
          <div className="history-list">
            {logs.map(log => (
              <div key={log.id} className="history-item" onClick={() => handleOpenEntry(log)} style={{ cursor: 'pointer' }}>
                <div className="history-date">
                  {new Date(log.date).toLocaleDateString()}<br />
                  <span style={{ fontWeight: 400, fontSize: '0.8rem' }}>{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="history-metrics">
                  <div className="history-metric">
                    <span className="history-metric-label">BP (mmHg)</span>
                    <span className={`history-metric-value ${getStatus('bloodPressure', log.bloodPressure)}`}>
                      {log.bloodPressure || '--'}
                    </span>
                  </div>
                  <div className="history-metric">
                    <span className="history-metric-label">HR (bpm)</span>
                    <span className={`history-metric-value ${getStatus('heartRate', log.heartRate !== undefined ? log.heartRate : (log as any).HeartRate)}`}>
                      {(log.heartRate !== undefined ? log.heartRate : (log as any).HeartRate) || '--'}
                    </span>
                  </div>
                  <div className="history-metric">
                    <span className="history-metric-label">Weight (kg)</span>
                    <span className={`history-metric-value ${getStatus('weight', log.weight !== undefined ? log.weight : (log as any).Weight)}`}>
                      {(log.weight !== undefined ? log.weight : (log as any).Weight) || '--'}
                    </span>
                  </div>
                  {log.note && <div className="history-note">{log.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <button className="add-log-trigger" onClick={() => handleOpenEntry()}>
        <Plus size={20} /> Add Record
      </button>
    </div>
  );
};

export default HealthPage;
