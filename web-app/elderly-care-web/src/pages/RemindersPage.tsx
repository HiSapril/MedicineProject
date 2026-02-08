import { useEffect, useState } from 'react';
import { reminderApi, type CreateReminderPayload } from '../api/reminder.api';

// Interface matching the API response/structure
interface Reminder {
  id: string;
  message: string;
  scheduledTime: string;
  type?: string;
}

const RemindersPage = () => {
  // --- State Management ---
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState<CreateReminderPayload>({
    message: '',
    scheduledTime: '',
    type: 'Medication' // Default type
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Effects ---
  useEffect(() => {
    fetchReminders();
  }, []);

  // --- API Handlers ---
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const response = await reminderApi.getReminders();
      setReminders(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load reminders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message || !formData.scheduledTime) {
      alert('Please fill in Message and Time');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await reminderApi.updateReminder(editingId, formData);
        alert('Reminder updated successfully');
      } else {
        await reminderApi.createReminder(formData);
        alert('Reminder created successfully');
      }

      // Reset
      setFormData({ message: '', scheduledTime: '', type: 'Medication' });
      setEditingId(null);
      fetchReminders();
    } catch (err) {
      console.error(err);
      alert('Failed to save reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await reminderApi.deleteReminder(id);
      fetchReminders();
    } catch (err) {
      console.error(err);
      alert('Failed to delete reminder');
    }
  };

  // --- UI Handlers ---
  const handleEdit = (rem: Reminder) => {
    setEditingId(rem.id);

    // Attempt to format date for input if possible, similar to AppointmentsPage logic
    let dateStr = rem.scheduledTime;
    try {
      const dateObj = new Date(rem.scheduledTime);
      if (!isNaN(dateObj.getTime())) {
        const offset = dateObj.getTimezoneOffset() * 60000;
        dateStr = (new Date(dateObj.getTime() - offset)).toISOString().slice(0, 16);
      }
    } catch (e) {
      console.warn("Date parsing fallback", e);
    }

    setFormData({
      message: rem.message,
      scheduledTime: dateStr,
      type: rem.type || 'Medication'
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ message: '', scheduledTime: '', type: 'Medication' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Render ---
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Reminders</h1>

      {/* ERROR DISPLAY */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* FORM SECTION */}
      <div style={styles.formSection}>
        <h2 style={styles.sectionTitle}>
          {editingId ? 'Edit Reminder' : 'Set New Reminder'}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Message *</label>
            <input
              style={styles.input}
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="e.g. Check Blood Pressure"
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Time *</label>
              <input
                style={styles.input}
                type="datetime-local"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Type *</label>
              <select
                style={styles.select}
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="Medication">Medication</option>
                <option value="Appointment">Appointment</option>
                <option value="Exercise">Exercise</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingId ? 'Update Reminder' : 'Add Reminder')}
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
        <h2 style={styles.sectionTitle}>Upcoming Reminders</h2>

        {loading ? (
          <p style={styles.loadingText}>Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p style={styles.emptyText}>No reminders set yet.</p>
        ) : (
          <div style={styles.list}>
            {reminders.map(rem => (
              <div key={rem.id} style={styles.card}>
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{rem.message}</h3>
                    {rem.type && (
                      <span style={styles.typeTag}>{rem.type}</span>
                    )}
                  </div>
                  <p style={styles.cardText}>
                    <strong>Time:</strong> {new Date(rem.scheduledTime).toLocaleString()}
                  </p>
                </div>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => handleEdit(rem)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rem.id)}
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
  select: {
    padding: '14px',
    fontSize: '18px',
    borderRadius: '8px',
    border: '1px solid #bdc3c7',
    backgroundColor: '#fdfdfd',
    cursor: 'pointer',
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
    backgroundColor: '#9b59b6',
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
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: '26px',
    margin: '0',
    color: '#8e44ad',
  },
  typeTag: {
    backgroundColor: '#e8daef',
    color: '#8e44ad',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
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

export default RemindersPage;
