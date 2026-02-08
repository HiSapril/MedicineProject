import { useEffect, useState } from 'react';
import { appointmentApi, type CreateAppointmentPayload } from '../api/appointment.api';
import { toast } from 'react-toastify';

// Define strict types locally to match API
interface Appointment {
  id: string;
  doctorName: string;
  location: string;
  appointmentDate: string;
  notes?: string;
}

const AppointmentsPage = () => {
  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState<CreateAppointmentPayload>({
    doctorName: '',
    location: '',
    appointmentDate: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentApi.getAll();
      setAppointments(response.data);
      setError('');
    } catch (err) {
      setError('Unable to load appointments. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctorName || !formData.appointmentDate || !formData.location) {
      toast.warning('Please fill in Doctor Name, Date, and Location');
      return;
    }
    // Date Validation: Cannot be in the past
    const selectedDate = new Date(formData.appointmentDate);
    if (selectedDate < new Date()) {
      toast.error('Cannot schedule an appointment in the past.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await appointmentApi.update(editingId, formData);
        toast.success('Appointment updated successfully');
      } else {
        await appointmentApi.create(formData);
        toast.success('Appointment created successfully');
      }

      // Reset and refresh
      setFormData({ doctorName: '', location: '', appointmentDate: '', notes: '' });
      setEditingId(null);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to save appointment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (apt: Appointment) => {
    setEditingId(apt.id);
    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    // Assuming API returns simplified ISO string or similar, usually standardizing is good
    // For simplicity, we assume the API string is close enough or we use it directly if compatible
    // Ideally we parse it:
    let dateStr = apt.appointmentDate;
    try {
      // Try to ensure it fits datetime-local format yyyy-MM-ddThh:mm
      const dateObj = new Date(apt.appointmentDate);
      if (!isNaN(dateObj.getTime())) {
        // Adjust to local ISO string roughly
        // Get local ISO string part
        const offset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj.getTime() - offset)).toISOString().slice(0, 16);
        dateStr = localISOTime;
      }
    } catch (e) {
      console.warn("Date parsing fallback", e);
    }

    setFormData({
      doctorName: apt.doctorName,
      location: apt.location,
      appointmentDate: dateStr,
      notes: apt.notes || ''
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ doctorName: '', location: '', appointmentDate: '', notes: '' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await appointmentApi.delete(id);
      fetchAppointments();
    } catch (err) {
      alert('Failed to delete appointment');
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Manage Appointments</h1>

      {/* ERROR MESSAGE */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* FORM SECTION */}
      <div style={styles.formSection}>
        <h2 style={styles.sectionTitle}>
          {editingId ? 'Edit Appointment' : 'Schedule New Appointment'}
        </h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Doctor Name / Clinic *</label>
            <input
              style={styles.input}
              name="doctorName"
              value={formData.doctorName}
              onChange={handleInputChange}
              placeholder="e.g. Dr. Smiths"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Location *</label>
            <input
              style={styles.input}
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. General Hospital Room 3B"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Date & Time *</label>
            <input
              style={styles.input}
              type="datetime-local"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleInputChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notes (Optional)</label>
            <textarea
              style={{ ...styles.input, height: '80px' }}
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              placeholder="Bring medical reports..."
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editingId ? 'Update Appointment' : 'Create Appointment')}
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
        <h2 style={styles.sectionTitle}>Upcoming Appointments</h2>

        {loading ? (
          <p style={styles.loadingText}>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p style={styles.emptyText}>No appointments scheduled yet.</p>
        ) : (
          <div style={styles.list}>
            {appointments.map(apt => (
              <div key={apt.id} style={styles.card}>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{apt.doctorName}</h3>
                  <p style={styles.cardText}>
                    <strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleString()}
                  </p>
                  <p style={styles.cardText}>
                    <strong>Location:</strong> {apt.location}
                  </p>
                  {apt.notes && (
                    <p style={styles.cardText}>
                      <strong>Notes:</strong> {apt.notes}
                    </p>
                  )}
                </div>
                <div style={styles.cardActions}>
                  <button
                    onClick={() => handleEdit(apt)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(apt.id)}
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

// Simple inline styles for elderly-friendly UI
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
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
    borderRadius: '5px',
    fontSize: '18px',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#f9f9f9',
    padding: '25px',
    borderRadius: '10px',
    marginBottom: '40px',
    border: '1px solid #ddd',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  saveButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    flex: 1,
  },
  cancelButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  listSection: {
    marginTop: '20px',
  },
  loadingText: {
    fontSize: '20px',
    color: '#7f8c8d',
    textAlign: 'center',
    padding: '20px',
  },
  emptyText: {
    fontSize: '20px',
    color: '#7f8c8d',
    textAlign: 'center',
    padding: '20px',
    fontStyle: 'italic',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: '22px',
    margin: '0 0 10px 0',
    color: '#2c3e50',
  },
  cardText: {
    fontSize: '18px',
    color: '#555',
    margin: '5px 0',
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginLeft: '20px',
  },
  editButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    minWidth: '100px',
  },
  deleteButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    minWidth: '100px',
  },
};

export default AppointmentsPage;
