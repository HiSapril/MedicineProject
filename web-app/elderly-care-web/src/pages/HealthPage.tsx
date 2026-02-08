import { useEffect, useState } from 'react';
import { healthApi, type CreateHealthLogPayload, type HealthLog } from '../api/health.api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';


const HealthPage = () => {
  // --- State Management ---
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState<CreateHealthLogPayload>({
    weight: undefined,
    bloodPressure: '',
    heartRate: undefined,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // --- Effects ---
  useEffect(() => {
    fetchLogs();
  }, []);

  // --- API Handlers ---
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await healthApi.getHealthLogs();
      // Ensure specific sort if needed, but usually API returns sorted. 
      // If client side sort is needed:
      // const sorted = response.data.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load health records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: At least one metric provided
    if (!formData.weight && !formData.bloodPressure && !formData.heartRate) {
      toast.warning('Please enter at least one health metric (Weight, BP, or Heart Rate)');
      return;
    }

    setSubmitting(true);
    try {
      // Clean up empty strings to undefined for numbers if needed, 
      // though input type="number" usually handles this, verify payload.
      const payload: CreateHealthLogPayload = {
        ...formData,
        weight: formData.weight || undefined,
        heartRate: formData.heartRate || undefined,
        bloodPressure: formData.bloodPressure || undefined,
      };

      await healthApi.createHealthLog(payload);
      toast.success('Health record saved successfully');

      // Reset
      setFormData({ weight: undefined, bloodPressure: '', heartRate: undefined, notes: '' });
      fetchLogs();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save health record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      const numValue = value === '' ? undefined : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // --- Render ---
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Health Tracker</h1>

      {/* ERROR DISPLAY */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* FORM SECTION */}
      <div style={styles.formSection}>
        <h2 style={styles.sectionTitle}>Add New Record</h2>
        <p style={styles.helperText}>You can enter one or more values.</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Weight (kg)</label>
              <input
                style={styles.input}
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight ?? ''}
                onChange={handleInputChange}
                placeholder="e.g. 70.5"
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Heart Rate (bpm)</label>
              <input
                style={styles.input}
                type="number"
                name="heartRate"
                value={formData.heartRate ?? ''}
                onChange={handleInputChange}
                placeholder="e.g. 72"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Blood Pressure</label>
            <input
              style={styles.input}
              type="text"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleInputChange}
              placeholder="e.g. 120/80"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notes</label>
            <textarea
              style={{ ...styles.input, height: '80px' }}
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              placeholder="Feeling dizzy, etc..."
            />
          </div>

          <button
            type="submit"
            style={styles.saveButton}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Health Record'}
          </button>
        </form>
      </div>

      {/* CHART SECTION */}
      <div style={styles.chartSection}>
        <h2 style={styles.sectionTitle}>Health Trends</h2>
        {logs.length > 0 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={[...logs].reverse().map(l => ({
                ...l,
                displayDate: new Date(l.timestamp).toLocaleDateString()
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bloodPressure" stroke="#8884d8" name="BP" />
                <Line type="monotone" dataKey="heartRate" stroke="#82ca9d" name="Heart Rate" />
                <Line type="monotone" dataKey="weight" stroke="#ffc658" name="Weight" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={styles.helperText}>Add data to see trends.</p>
        )}
      </div>

      {/* LIST SECTION */}
      <div style={styles.listSection}>
        <h2 style={styles.sectionTitle}>History</h2>

        {loading ? (
          <p style={styles.loadingText}>Loading records...</p>
        ) : logs.length === 0 ? (
          <p style={styles.emptyText}>No health records found.</p>
        ) : (
          <div style={styles.list}>
            {logs.map(log => (
              <div key={log.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.dateTitle}>
                    {new Date(log.timestamp).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </h3>
                </div>

                <div style={styles.metricsGrid}>
                  {log.weight != null && (
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Weight:</span>
                      <span style={styles.metricValue}>{log.weight} kg</span>
                    </div>
                  )}
                  {log.bloodPressure && (
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Blood Pressure:</span>
                      <span style={styles.metricValue}>{log.bloodPressure}</span>
                    </div>
                  )}
                  {log.heartRate != null && (
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Heart Rate:</span>
                      <span style={styles.metricValue}>{log.heartRate} bpm</span>
                    </div>
                  )}
                </div>

                {log.notes && (
                  <div style={styles.notesBox}>
                    <strong>Notes:</strong> {log.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Styles (Elderly Friendly) ---
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
    color: '#333',
  },
  title: {
    fontSize: '32px',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#34495e',
    marginBottom: '15px',
    borderBottom: '2px solid #ecf0f1',
    paddingBottom: '10px',
  },
  helperText: {
    fontSize: '18px',
    color: '#7f8c8d',
    marginBottom: '20px',
    fontStyle: 'italic',
  },
  errorBox: {
    backgroundColor: '#ffdddd',
    color: '#c0392b',
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '8px',
    fontSize: '18px',
    textAlign: 'center',
    border: '1px solid #e74c3c',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '40px',
    border: '1px solid #ddd',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#444',
  },
  input: {
    padding: '14px',
    fontSize: '18px',
    borderRadius: '8px',
    border: '1px solid #bdc3c7',
    backgroundColor: '#fdfdfd',
  },
  saveButton: {
    padding: '16px 32px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
  chartSection: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '40px',
    border: '1px solid #ddd',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  listSection: {
    marginTop: '20px',
  },
  loadingText: {
    fontSize: '22px',
    color: '#7f8c8d',
    textAlign: 'center',
    padding: '40px',
  },
  emptyText: {
    fontSize: '20px',
    color: '#7f8c8d',
    textAlign: 'center',
    padding: '30px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    fontStyle: 'italic',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  dateTitle: {
    fontSize: '22px',
    color: '#2c3e50',
    margin: 0,
  },
  metricsGrid: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
    marginBottom: '15px',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  metricLabel: {
    fontSize: '16px',
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: '24px',
    color: '#2980b9',
    fontWeight: 'bold',
  },
  notesBox: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '18px',
    color: '#555',
    lineHeight: '1.4',
  },
};

export default HealthPage;
