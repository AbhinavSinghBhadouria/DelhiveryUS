import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import TrackingTimeline from "../../components/TrackingTimeline.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";

const ADMIN_STATUSES = [
  "CONFIRMED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RESCHEDULED", "CANCELLED"
];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [orderRes, trackingRes, agentsRes] = await Promise.all([
        api.getOrder(id),
        api.getTracking(id),
        api.adminAgents()
      ]);
      setOrder(orderRes.data.order);
      setTracking(trackingRes.data.trackingEvents);
      setAgents(agentsRes.data.agents);
      setNewStatus(orderRes.data.order.status);
      if (agentsRes.data.agents[0]) setSelectedAgent(agentsRes.data.agents[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const assignAgent = async () => {
    setError("");
    try {
      await api.adminAssignAgent(id, { agentId: selectedAgent });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const autoAssign = async () => {
    setError("");
    try {
      await api.adminAutoAssign(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.adminUpdateStatus(id, { status: newStatus, note: statusNote || undefined });
      setStatusNote("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (!order) return <div className="page"><ErrorAlert message={error || "Order not found"} /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Order</h1>
        <StatusBadge status={order.status} />
      </div>
      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <div className="detail-grid">
        <section className="card">
          <h2>Order Info</h2>
          <p><strong>Customer:</strong> {order.customer?.name} ({order.customer?.email})</p>
          <p><strong>Route:</strong> {order.pickupZone?.name} → {order.dropZone?.name}</p>
          <p><strong>Charge:</strong> ₹{order.finalCharge}</p>
          <p><strong>Agent:</strong> {order.assignedAgent?.user?.name || "Unassigned"}</p>

          <h3>Assignment</h3>
          <div className="btn-row">
            <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.user?.name} ({a.isAvailable ? "available" : "busy"})</option>
              ))}
            </select>
            <button type="button" className="btn btn-primary" onClick={assignAgent}>Assign</button>
            <button type="button" className="btn btn-ghost" onClick={autoAssign}>Auto-assign</button>
          </div>

          <h3>Status Override</h3>
          <form onSubmit={updateStatus} className="form">
            <label>
              Status
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {ADMIN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Note
              <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
            </label>
            <button type="submit" className="btn btn-primary">Update Status</button>
          </form>
        </section>

        <section className="card">
          <h2>Tracking Timeline</h2>
          <TrackingTimeline events={tracking} />
        </section>
      </div>
    </div>
  );
}
