// pages/agent/OrderDetail.jsx - agent is page se delivery status update karta hai
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import TrackingTimeline from "../../components/TrackingTimeline.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";

// yeh sirf woh statuses hain jo agent set kar sakta hai
// backend mein bhi yahi list hai order.service.js ke agentStatuses mein - dono sync hone chahiye
const AGENT_STATUSES = ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"];

export default function AgentOrderDetail() {
  const { id } = useParams();  // URL se order ID - App.jsx /agent/orders/:id se
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState("PICKED_UP");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    try {
      // order aur tracking dono ek saath fetch - Promise.all se parallel calls
      const [orderRes, trackingRes] = await Promise.all([
        api.getOrder(id),
        api.getTracking(id)
      ]);
      setOrder(orderRes.data.order);
      setTracking(trackingRes.data.trackingEvents);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    try {
      // api/client.js ka agentUpdateStatus - /agent/orders/:id/status PATCH
      // note empty hai toh undefined bhejo - backend mein optional field hai
      await api.agentUpdateStatus(id, { status: newStatus, note: note || undefined });
      setNote("");
      await load();  // status update ke baad fresh tracking events reload karo
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // order load nahi hua - ya error dikhao ya loading message
  if (!order) return <div className="page">{error ? <ErrorAlert message={error} /> : "Loading..."}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Update Delivery</h1>
        <StatusBadge status={order.status} />
      </div>
      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <div className="detail-grid">
        <section className="card">
          <h2>Shipment</h2>
          <p><strong>Pickup:</strong> {order.pickupAddress}, {order.pickupArea}</p>
          <p><strong>Drop:</strong> {order.dropAddress}, {order.dropArea}</p>
          <p><strong>Customer:</strong> {order.customer?.name}</p>

          {order.status !== "DELIVERED" ? (
            <form onSubmit={handleUpdate} className="form">
              <h3>Update Status</h3>
              <label>
                New status
                {/* AGENT_STATUSES se dropdown banao - sirf allowed statuses dikhao */}
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {AGENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>
                Note (optional)
                <input value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? "Updating..." : "Update Status"}
              </button>
            </form>
          ) : (
            <p className="muted" style={{ marginTop: "1.5rem" }}>
              <em>This order has been delivered. No further actions can be taken.</em>
            </p>
          )}
        </section>

        <section className="card">
          <h2>Tracking Timeline</h2>
          {/* TrackingTimeline components/TrackingTimeline.jsx se - puri history dikhata hai */}
          <TrackingTimeline events={tracking} />
        </section>
      </div>
    </div>
  );
}
