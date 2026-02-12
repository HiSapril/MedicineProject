import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/auth.api';

export const RegisterPage = () => {
    const navigate = useNavigate();

    // State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 0 // Default to Elderly
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'role' ? parseInt(value) : value
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await authApi.register({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            // Navigate to Login after success
            alert('Account created successfully! Please login.');
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            setError(
                err?.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Create Account</h1>
                <p style={styles.subtitle}>Register a new account to start using the system</p>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleRegister} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Register As</label>
                        <select
                            id="role"
                            style={styles.select}
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value={0}>Elderly Person</option>
                            <option value={1}>Caregiver</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            id="fullName"
                            style={styles.input}
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            id="email"
                            style={styles.input}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g. john@example.com"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            id="password"
                            style={styles.input}
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            id="confirmPassword"
                            style={styles.input}
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                        />
                    </div>

                    <button type="submit" style={styles.registerButton} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <button onClick={handleBackToLogin} style={styles.linkButton}>
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Styles (Elderly Friendly) ---
const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f0f4f8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'sans-serif',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
    },
    title: {
        fontSize: '36px',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    subtitle: {
        fontSize: '18px',
        color: '#7f8c8d',
        marginBottom: '30px',
        lineHeight: '1.4',
    },
    errorBox: {
        backgroundColor: '#ffdddd',
        color: '#c0392b',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '16px',
        border: '1px solid #e74c3c',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        gap: '8px',
    },
    label: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#34495e',
    },
    input: {
        padding: '15px',
        fontSize: '18px',
        borderRadius: '8px',
        border: '1px solid #bdc3c7',
        outline: 'none',
    },
    select: {
        padding: '15px',
        fontSize: '18px',
        borderRadius: '8px',
        border: '1px solid #bdc3c7',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    registerButton: {
        marginTop: '10px',
        padding: '18px',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: '#27ae60', // Green for register
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    footer: {
        marginTop: '25px',
        borderTop: '1px solid #eee',
        paddingTop: '20px',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#7f8c8d',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
};
