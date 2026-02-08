import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <nav style={{ width: 200, padding: 10, borderRight: "1px solid #ccc" }}>
      <ul>
        <li><Link to="/app">Dashboard</Link></li>
        <li><Link to="/app/appointments">Appointments</Link></li>
        <li><Link to="/app/medications">Medications</Link></li>
        <li><Link to="/app/health">Health</Link></li>
        <li><Link to="/app/reminders">Reminders</Link></li>
        <li><Link to="/app/profile">Profile</Link></li>
      </ul>
    </nav>
  );
}
