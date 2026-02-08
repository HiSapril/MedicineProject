import { useEffect, useState } from 'react';
import { medicationApi, type CreateMedicationPayload, type Medication } from '../api/medication.api';


const MedicationsPage = () => {
  // --- State Management ---
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState<CreateMedicationPayload>({
    name: '',
    dosage: '',
    time: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Effects ---
  useEffect(() => {
    fetchMedications();
  }, []);

  // --- API Handlers ---
  const fetchMedications = async () => {
    setLoading(true);
    try {
      const response = await medicationApi.getMedications();
      setMedications(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load medications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage || !formData.time) {
      alert('Please fill in Name, Dosage, and Time');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await medicationApi.updateMedication(editingId, formData);
        alert('Medication updated successfully');
      } else {
        await medicationApi.createMedication(formData);
        alert('Medication added successfully');
      }

      // Reset
      setFormData({ name: '', dosage: '', time: '', notes: '' });
      setEditingId(null);
      fetchMedications();
    } catch (err) {
      console.error(err);
      alert('Failed to save medication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;

    try {
      await medicationApi.deleteMedication(id);
      fetchMedications();
    } catch (err) {
      console.error(err);
      alert('Failed to delete medication');
    }
  };

  // --- UI Handlers ---
  const handleEdit = (med: Medication) => {
    setEditingId(med.id);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      time: med.time,
      notes: med.notes || ''
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', dosage: '', time: '', notes: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Render ---
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Daily Medications</h1>

      {/* ERROR DISPLAY */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* FORM SECTION */}
      <div style={styles.formSection}>
        <h2 style={styles.sectionTitle}>
          {editingId ? 'Edit Medication' : 'Add New Medication'}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Medication Name *</label>
            <input
              style={styles.input}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Aspirin"
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Dosage *</label>
              <input
                style={styles.input}
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                placeholder="e.g. 1 pill"
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Time of Day *</label>
              <input
                style={styles.input}
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                placeholder="e.g. Morning (8 AM)"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notes (Optional)</label>
            <textarea
              style={{ ...styles.input, height: '80px' }}
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              placeholder="Take with food..."
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingId ? 'Update Medication' : 'Add Medication')}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={styles.cancelButton}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST SECTION */}
      <div style={styles.listSection}>
        <h2 style={styles.sectionTitle}>Current Medications</h2>

        {loading ? (
          <p style={styles.loadingText}>Loading medications...</p>
        ) : medications.length === 0 ? (
          <p style={styles.emptyText}>No medications recorded yet.</p>
        ) : (
          <div style={styles.list}>
            {medications.map(med => (
              <div key={med.id} style={styles.card}>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{med.name}</h3>
                  <div style={styles.cardDetails}>
                    <p style={styles.cardText}>
                      <strong>Dosage:</strong> {med.dosage}
                    </p>
                    <p style={styles.cardText}>
                      <strong>Time:</strong> {med.time}
                    </p>
                  </div>
                  {med.notes && (
                    <p style={styles.cardText}>
                      <strong>Notes:</strong> {med.notes}
                    </p>
                  )}
                </div>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => handleEdit(med)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(med.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
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
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px',
  },
  saveButton: {
    padding: '16px 32px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 2,
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    padding: '16px 24px',
    fontSize: '18px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  cardContent: {
    flex: 1,
    marginRight: '20px',
  },
  cardTitle: {
    fontSize: '26px',
    margin: '0 0 15px 0',
    color: '#2980b9',
  },
  cardDetails: {
    display: 'flex',
    gap: '30px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  cardText: {
    fontSize: '20px',
    color: '#555',
    margin: '5px 0',
    lineHeight: '1.4',
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: '120px',
  },
  editButton: {
    padding: '12px 20px',
    fontSize: '18px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '12px 20px',
    fontSize: '18px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default MedicationsPage;
