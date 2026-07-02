import { Link } from "react-router-dom";

export default function AgentDashboard() {
  return (
    <div className="page">
      <h1>Agent Dashboard</h1>
      <p className="muted">Update your availability, location, and delivery statuses.</p>

      <div className="card-grid">
        <Link to="/agent/profile" className="action-card">
          <h3>Profile & Location</h3>
          <p>Set availability and GPS for auto-assignment.</p>
        </Link>
        <Link to="/agent/orders" className="action-card">
          <h3>Assigned Orders</h3>
          <p>View and update delivery status.</p>
        </Link>
      </div>
    </div>
  );
}
