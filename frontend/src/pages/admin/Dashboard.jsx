import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <p className="muted">Configure zones, pricing, users, and manage orders.</p>

      <div className="card-grid">
        <Link to="/admin/orders" className="action-card">
          <h3>Orders</h3>
          <p>Filter, assign agents, override status, create orders.</p>
        </Link>
        <Link to="/admin/orders/new" className="action-card">
          <h3>Create Order</h3>
          <p>Place an order on behalf of a customer.</p>
        </Link>
        <Link to="/admin/zones" className="action-card">
          <h3>Zones & Areas</h3>
          <p>Manage service zones and pincode mappings.</p>
        </Link>
        <Link to="/admin/rates" className="action-card">
          <h3>Rate Cards</h3>
          <p>Configure B2B/B2C intra and inter-zone rates.</p>
        </Link>
        <Link to="/admin/cod" className="action-card">
          <h3>COD Surcharges</h3>
          <p>Set COD fees per order type.</p>
        </Link>
        <Link to="/admin/customers" className="action-card">
          <h3>Customers</h3>
          <p>View registered customers.</p>
        </Link>
        <Link to="/admin/agents" className="action-card">
          <h3>Agents</h3>
          <p>Manage agent availability and location.</p>
        </Link>
      </div>
    </div>
  );
}
