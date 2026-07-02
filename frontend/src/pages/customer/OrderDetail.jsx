// pages/customer/OrderDetail.jsx - order detail aur tracking timeline dikhata hai
// FAILED order pe reschedule form bhi dikhata hai
import { useEffect, useState } from "react";
// useParams - URL se :id nikalta hai - App.jsx mein /orders/:id define kiya tha
import { useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import TrackingTimeline from "../../components/TrackingTimeline.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function CustomerOrderDetail() {
  const { id } = useParams();  // URL ka :id - jaise /customer/orders/abc123
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const loadOrder = async () => {
    try {
      // Promise.all - order aur tracking dono parallel mein fetch karo, ek ka wait doosre ke liye nahi
      const [orderRes, trackingRes] = await Promise.all([api.getOrder(id), api.getTracking(id)]);
      setOrder(orderRes.data.order);
      setTracking(trackingRes.data.trackingEvents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // id change hone pe reload karo - agar user directly URL change kare
  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleReschedule = async (event) => {
    event.preventDefault();
    setRescheduling(true);
    setError("");

    try {
      // input[datetime-local] ka value "2024-01-15T14:00" format mein hota hai
      // backend ISO string expect karta hai isliye toISOString() lagate hain
      const isoDate = new Date(rescheduleDate).toISOString();
      await api.rescheduleOrder(id, {
        newDeliveryDate: isoDate,
        reason: rescheduleReason || undefined  // empty string ki jagah undefined bhejo - optional field
      });
      setRescheduleDate("");
      setRescheduleReason("");
      await loadOrder();  // reschedule ke baad fresh data reload karo
    } catch (err) {
      setError(err.message);
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) return <div className="page">Loading order...</div>;
  if (!order) return <div className="page"><ErrorAlert message={error || "Order not found"} /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Order Details</h1>
        {/* StatusBadge components/StatusBadge.jsx se - colored pill */}
        <StatusBadge status={order.status} />
      </div>
      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <div className="detail-grid">
        <section className="card">
          <h2>Shipment</h2>
          <p><strong>From:</strong> {order.pickupAddress}, {order.pickupArea} ({order.pickupPincode})</p>
          <p><strong>To:</strong> {order.dropAddress}, {order.dropArea} ({order.dropPincode})</p>
          {/* optional chaining ?.name - zone include na ho toh crash mat karo */}
          <p><strong>Zones:</strong> {order.pickupZone?.name} → {order.dropZone?.name}</p>
          <p><strong>Charge:</strong> ₹{order.finalCharge} ({order.orderType}, {order.paymentType})</p>
          {/* assignedAgent null ho sakta hai - sirf tabhi dikhao jab assign ho */}
          {order.assignedAgent && (
            <p><strong>Agent:</strong> {order.assignedAgent.user?.name}</p>
          )}
        </section>

        <section className="card">
          <h2>Tracking Timeline</h2>
          {/* TrackingTimeline components/TrackingTimeline.jsx se - events history dikhata hai */}
          <TrackingTimeline events={tracking} />
        </section>
      </div>

      {/* reschedule form sirf tab dikhao jab order FAILED ho - customer hi kar sakta hai */}
      {order.status === "FAILED" && (
        <section className="card reschedule-card">
          <h2>Reschedule Failed Delivery</h2>
          <form onSubmit={handleReschedule} className="form">
            <label>
              New delivery date
              <input
                type="datetime-local"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                required
              />
            </label>
            <label>
              Reason (optional)
              <textarea value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} rows={2} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={rescheduling}>
              {rescheduling ? "Rescheduling..." : "Reschedule"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
