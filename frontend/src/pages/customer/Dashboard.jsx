import { Link } from "react-router-dom";

export default function CustomerDashboard() {
  return (
    <div className="page">
      <h1>Customer Dashboard</h1>
      <p className="muted">Create orders, track deliveries, and reschedule failed shipments.</p>

      <div className="card-grid">
        <Link to="/customer/orders/new" className="action-card">
          <h3>Create Order</h3>
          <p>Get a quote and place a new delivery order.</p>
        </Link>
        <Link to="/customer/orders" className="action-card">
          <h3>My Orders</h3>
          <p>View all your orders and tracking timelines.</p>
        </Link>
      </div>

      <div className="info-box">
        <h3>Sample addresses (from seed data)</h3>
        <p>Pickup: Connaught Place, 110001 (North Zone)</p>
        <p>Drop: Kalkaji, 110019 (South Zone)</p>
      </div>
    </div>
  );
}
