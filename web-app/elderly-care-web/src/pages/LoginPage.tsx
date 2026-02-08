import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await authApi.login({
        email,
        password,
      });

      const data = response.data;

      // ✅ MAP ĐÚNG CẤU TRÚC AuthContext CẦN
      login(data);

      navigate("/app");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  const handleGoToRegister = () => {
    navigate("/register");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        <p style={styles.subtitle}>
          Sign in to manage your medications and health information
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" style={styles.loginButton} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Don't have an account?</p>
          <button onClick={handleGoToRegister} style={styles.linkButton}>
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Styles (UNCHANGED) ---
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "500px",
    textAlign: "center",
  },
  title: {
    fontSize: "36px",
    color: "#2c3e50",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#7f8c8d",
    marginBottom: "30px",
    lineHeight: "1.4",
  },
  errorBox: {
    backgroundColor: "#ffdddd",
    color: "#c0392b",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "16px",
    border: "1px solid #e74c3c",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    gap: "8px",
  },
  label: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#34495e",
  },
  input: {
    padding: "15px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "1px solid #bdc3c7",
    outline: "none",
  },
  loginButton: {
    marginTop: "10px",
    padding: "18px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#2980b9",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  footer: {
    marginTop: "30px",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
  },
  footerText: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "10px",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#27ae60",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default LoginPage;
