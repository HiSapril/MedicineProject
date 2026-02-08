import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Profile</h1>

      <div style={styles.card}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={styles.name}>{user.name}</h2>
          <span style={styles.roleBadge}>
            {user.role === "0" || user.role === 0 ? "Elderly" : "Caregiver"}
          </span>
        </div>

        <div style={styles.infoSection}>
          <div style={styles.infoGroup}>
            <label style={styles.label}>Email Address</label>
            <p style={styles.value}>{user.email}</p>
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>User ID</label>
            <p style={styles.value}>{user.id}</p>
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>Role</label>
            <p style={styles.value}>
              {user.role === "0" || user.role === 0 ? "Elderly Person" : "Caregiver / Doctor"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    fontSize: "32px",
    color: "#2c3e50",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "30px",
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#3498db",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "40px",
    fontWeight: "bold",
  },
  name: {
    fontSize: "24px",
    color: "#2c3e50",
    margin: 0,
  },
  roleBadge: {
    backgroundColor: "#eaf2f8",
    color: "#2980b9",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  infoSection: {
    width: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    borderTop: "1px solid #eee",
    paddingTop: "30px",
  },
  infoGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "14px",
    color: "#7f8c8d",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "bold",
  },
  value: {
    fontSize: "18px",
    color: "#2c3e50",
    margin: 0,
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
  },
};

export default ProfilePage;
