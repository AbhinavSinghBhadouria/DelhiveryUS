import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.agentOrders()
      .then((res) => setOrders(res.data.orders))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <h1>Assigned Orders</h1>
      <ErrorAlert message={error} />

      {orders.length === 0 ? (
        <p className="muted">No assigned orders.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Route</th><th>Status</th><th>Pickup</th><th>Drop</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.pickupZone?.name} → {order.dropZone?.name}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{order.pickupArea}</td>
                  <td>{order.dropArea}</td>
                  <td><Link to={`/agent/orders/${order.id}`}>Update</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
