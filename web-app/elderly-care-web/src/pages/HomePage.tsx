import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            {/* HERO SECTION */}
            <section style={styles.heroSection}>
                <h1 style={styles.heroTitle}>Elderly Care & Medicine Reminder</h1>
                <p style={styles.heroSubtitle}>
                    A simple system to help elderly people remember medications, appointments, and daily health tracking.
                </p>
                <div style={styles.buttonGroup}>
                    <button onClick={handleLogin} style={styles.primaryButton}>
                        Get Started
                    </button>
                    <button onClick={handleLogin} style={styles.secondaryButton}>
                        Login
                    </button>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>What We Do</h2>
                <div style={styles.grid}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Medication Reminders</h3>
                        <p style={styles.cardText}>Never miss a pill with clear, timely alerts for your daily medications.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Appointment Management</h3>
                        <p style={styles.cardText}>Keep track of doctor visits and check-ups in one simple place.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Health Tracking</h3>
                        <p style={styles.cardText}>Record and monitor vital signs like blood pressure and heart rate easily.</p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Simple Interface</h3>
                        <p style={styles.cardText}>Designed specifically for seniors with large text and clear buttons.</p>
                    </div>
                </div>
            </section>

            {/* WHO IS IT FOR SECTION */}
            <section style={styles.altSection}>
                <h2 style={styles.sectionTitle}>Who Is It For?</h2>
                <div style={styles.targetList}>
                    <div style={styles.targetItem}>
                        <strong style={styles.targetTitle}>Elderly People</strong>
                        <p style={styles.targetText}>Stay independent and healthy with easy tools.</p>
                    </div>
                    <div style={styles.targetItem}>
                        <strong style={styles.targetTitle}>Family Members</strong>
                        <p style={styles.targetText}>Peace of mind knowing your loved ones are on track.</p>
                    </div>
                    <div style={styles.targetItem}>
                        <strong style={styles.targetTitle}>Caregivers</strong>
                        <p style={styles.targetText}>Efficiently manage schedules and health logs.</p>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section style={styles.ctaSection}>
                <h2 style={styles.ctaTitle}>Start taking care of your health today</h2>
                <button onClick={handleLogin} style={styles.ctaButton}>
                    Login to Your Account
                </button>
            </section>

            {/* FOOTER */}
            <footer style={styles.footer}>
                <p>© 2026 Elderly Care System. Simple & Secure.</p>
            </footer>
        </div>
    );
};

// --- Styles (Elderly Friendly: High Contrast, Large Text) ---
const styles: Record<string, React.CSSProperties> = {
    container: {
        fontFamily: 'sans-serif',
        color: '#333',
        backgroundColor: '#fdfdfd',
        minHeight: '100vh',
    },
    heroSection: {
        backgroundColor: '#eaf2f8',
        padding: '80px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #d6eaf8',
    },
    heroTitle: {
        fontSize: '48px',
        color: '#2c3e50',
        marginBottom: '20px',
        fontWeight: 'bold',
    },
    heroSubtitle: {
        fontSize: '24px',
        color: '#555',
        maxWidth: '800px',
        margin: '0 auto 40px auto',
        lineHeight: '1.4',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
    },
    primaryButton: {
        padding: '20px 40px',
        fontSize: '22px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
    secondaryButton: {
        padding: '20px 40px',
        fontSize: '22px',
        backgroundColor: 'transparent',
        color: '#3498db',
        border: '3px solid #3498db',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    section: {
        padding: '60px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
    },
    altSection: {
        backgroundColor: '#fffcf5', // Warm tint
        padding: '60px 20px',
        textAlign: 'center',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
    },
    sectionTitle: {
        fontSize: '36px',
        color: '#2c3e50',
        marginBottom: '40px',
        borderBottom: '2px solid #3498db',
        display: 'inline-block',
        paddingBottom: '10px',
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '30px',
    },
    card: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '30px',
        width: '280px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    },
    cardTitle: {
        fontSize: '24px',
        color: '#2980b9',
        marginBottom: '10px',
    },
    cardText: {
        fontSize: '18px',
        color: '#666',
        lineHeight: '1.4',
    },
    targetList: {
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        flexWrap: 'wrap',
    },
    targetItem: {
        maxWidth: '300px',
        textAlign: 'center',
    },
    targetTitle: {
        display: 'block',
        fontSize: '24px',
        color: '#d35400',
        marginBottom: '10px',
    },
    targetText: {
        fontSize: '20px',
        color: '#555',
    },
    ctaSection: {
        padding: '80px 20px',
        textAlign: 'center',
        backgroundColor: '#2ecc71',
        color: 'white',
    },
    ctaTitle: {
        fontSize: '36px',
        marginBottom: '30px',
        fontWeight: 'bold',
    },
    ctaButton: {
        padding: '20px 50px',
        fontSize: '24px',
        backgroundColor: 'white',
        color: '#27ae60',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    },
    footer: {
        padding: '30px',
        textAlign: 'center',
        backgroundColor: '#34495e',
        color: '#ecf0f1',
        fontSize: '16px',
    },
};

export default HomePage;
