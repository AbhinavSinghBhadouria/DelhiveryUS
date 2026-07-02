import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myOrders()
      .then((res) => setOrders(res.data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Orders</h1>
        <Link to="/customer/orders/new" className="btn btn-primary">
          New Order
        </Link>
      </div>
      <ErrorAlert message={error} />

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="muted">No orders yet. Create your first delivery order.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Route</th>
                <th>Status</th>
                <th>Charge</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="mono">{order.id.slice(0, 10)}…</td>
                  <td>
                    {order.pickupZone?.name} → {order.dropZone?.name}
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>₹{order.finalCharge}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/customer/orders/${order.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
