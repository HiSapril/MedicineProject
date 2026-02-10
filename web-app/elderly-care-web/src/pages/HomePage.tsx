import { useNavigate } from 'react-router-dom';
import {
    Heart,
    Calendar,
    Clock,
    Activity,
    Smartphone,
    Layout,
    ShieldCheck,
    UserCheck,
    ArrowRight
} from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const handleLogin = () => navigate('/login');
    const handleRegister = () => navigate('/register');

    return (
        <div className="homepage-container">
            {/* 1. Header / Navigation */}
            <header className="homepage-header">
                <div className="logo-container">
                    <Heart fill="#3498db" stroke="#3498db" />
                    <span>CareLink</span>
                </div>
                <nav className="nav-links">
                    <a href="#hero">Home</a>
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                </nav>
                <div className="auth-buttons">
                    <button onClick={handleLogin} className="btn btn-outline">Login</button>
                    <button onClick={handleRegister} className="btn btn-primary">Register</button>
                </div>
            </header>

            {/* 2. Hero Section */}
            <section id="hero" className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Smart Healthcare Management for Elderly Care</h1>
                    <p className="hero-subtitle">
                        Manage medications, appointments, reminders, and health records — all in one accessible system.
                        Designed for caregivers, built for peace of mind.
                    </p>
                    <div className="hero-buttons">
                        <button onClick={handleLogin} className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '0.8rem 2rem' }}>
                            Login to Dashboard
                        </button>
                        <button onClick={handleRegister} className="btn btn-outline" style={{ fontSize: '1.2rem', padding: '0.8rem 2rem' }}>
                            Create Account
                        </button>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="hero-placeholder">
                        <Activity size={100} strokeWidth={1} />
                        <div style={{ position: 'absolute', bottom: '20px', fontSize: '1rem', opacity: 0.7 }}>
                            Comprehensive Dashboard
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. System Capabilities Overview */}
            <section id="features" className="features-section">
                <h2 className="section-title">Comprehensive Care Management</h2>
                <p className="section-subtitle">Everything you need to provide the best care for your loved ones.</p>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><Clock size={48} /></div>
                        <h3>Medication Management</h3>
                        <p>Set precise schedules and reminders so medications are never missed.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><Calendar size={48} /></div>
                        <h3>Appointment Scheduling</h3>
                        <p>Keep track of doctor visits, check-ups, and medical consultations.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><Activity size={48} /></div>
                        <h3>Health Monitoring</h3>
                        <p>Log and track vital signs like blood pressure, heart rate, and glucose.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><UserCheck size={48} /></div>
                        <h3>Caregiver Oversight</h3>
                        <p>Full control for caregivers to manage schedules and view health reports.</p>
                    </div>
                </div>
            </section>

            {/* 4. Web App vs Mobile App Explanation */}
            <section className="app-comparison-section">
                <div className="comparison-container">
                    {/* Web App Card */}
                    <div className="app-card">
                        <div className="web-app-header app-card-header">
                            <Layout size={64} style={{ marginBottom: '1rem' }} />
                            <h2>Web Application</h2>
                            <span style={{ opacity: 0.9 }}>For Caregivers & Admins</span>
                        </div>
                        <div className="app-card-body">
                            <ul>
                                <li>Full Management Dashboard</li>
                                <li>Detailed Health Reports & Charts</li>
                                <li>Manage Medication Schedules</li>
                                <li>Control Appointment Calendar</li>
                                <li>User & Profile Administration</li>
                            </ul>
                        </div>
                    </div>

                    {/* Mobile App Card */}
                    <div className="app-card">
                        <div className="mobile-app-header app-card-header">
                            <Smartphone size={64} style={{ marginBottom: '1rem' }} />
                            <h2>Mobile Application</h2>
                            <span style={{ opacity: 0.9 }}>For Elderly Users</span>
                        </div>
                        <div className="app-card-body">
                            <ul>
                                <li>Simple, Large-Text Interface</li>
                                <li>Receive Medication Reminders</li>
                                <li>Confirm Taken Medications</li>
                                <li>View Today's Appointments</li>
                                <li>Voice Notifications (Future)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. How It Works */}
            <section id="how-it-works" className="how-it-works-section">
                <h2 className="section-title">How It Works</h2>
                <div className="steps-container">
                    <div className="step-item">
                        <div className="step-number">1</div>
                        <h3>Register</h3>
                        <p>Caregiver creates an account and sets up the elderly profile.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">2</div>
                        <h3>Manage</h3>
                        <p>Input medications, appointments, and health logs on the Web App.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">3</div>
                        <h3>Monitor</h3>
                        <p>Elderly user receives alerts on Mobile. You track progress here.</p>
                    </div>
                </div>
            </section>

            {/* 6. Trust Section */}
            <section className="trust-section">
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <ShieldCheck size={40} color="#27ae60" />
                    <h2 style={{ margin: 0, color: '#2c3e50' }}>Healthcare-Grade Reliability</h2>
                </div>
                <p style={{ maxWidth: '700px', margin: '0 auto', color: '#7f8c8d' }}>
                    Our system is built with data consistency and reliability in mind.
                    We ensure that every reminder is delivered and every health log is securely stored.
                </p>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
                <h2 style={{ marginBottom: '20px' }}>Ready to simplify elderly care?</h2>
                <button onClick={handleRegister} className="btn" style={{ backgroundColor: 'white', color: '#3498db', fontSize: '1.2rem', padding: '1rem 3rem' }}>
                    Get Started Now <ArrowRight size={20} style={{ marginLeft: '10px', verticalAlign: 'middle' }} />
                </button>
            </section>

            {/* Footer */}
            <footer className="homepage-footer">
                <div className="footer-content">
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Heart size={20} fill="#ecf0f1" /> CareLink
                        </h3>
                        <p>Empowering caregivers, supporting seniors.</p>
                    </div>
                    <div className="footer-links">
                        <a href="#hero">Home</a>
                        <a href="#features">Features</a>
                        <a href="/login">Login</a>
                        <a href="/register">Register</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Elderly Care Management System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
