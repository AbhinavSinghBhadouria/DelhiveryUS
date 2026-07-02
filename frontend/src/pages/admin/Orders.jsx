import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", zoneId: "", agentId: "" });

  const loadMeta = async () => {
    const [zonesRes, agentsRes] = await Promise.all([api.adminZones(), api.adminAgents()]);
    setZones(zonesRes.data.zones);
    setAgents(agentsRes.data.agents);
  };

  const load = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.zoneId) params.zoneId = filters.zoneId;
      if (filters.agentId) params.agentId = filters.agentId;
      const res = await api.adminOrders(params);
      setOrders(res.data.orders);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadMeta().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [filters]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <Link to="/admin/orders/new" className="btn btn-primary">Create Order</Link>
      </div>
      <ErrorAlert message={error} />

      <div className="filter-bar">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All statuses</option>
          {["CONFIRMED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RESCHEDULED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.zoneId}
          onChange={(e) => setFilters({ ...filters, zoneId: e.target.value })}
          className="filter-select"
        >
          <option value="">All zones</option>
          {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        <select
          value={filters.agentId}
          onChange={(e) => setFilters({ ...filters, agentId: e.target.value })}
          className="filter-select"
        >
          <option value="">All agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.user?.name}</option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th><th>Route</th><th>Status</th><th>Agent</th><th>Charge</th><th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.customer?.name}</td>
                <td>{order.pickupZone?.name} → {order.dropZone?.name}</td>
                <td><StatusBadge status={order.status} /></td>
                <td>{order.assignedAgent?.user?.name || "—"}</td>
                <td>₹{order.finalCharge}</td>
                <td><Link to={`/admin/orders/${order.id}`}>Manage</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
