import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [zones, setZones] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const [agentsRes, zonesRes] = await Promise.all([api.adminAgents(), api.adminZones()]);
      setAgents(agentsRes.data.agents);
      setZones(zonesRes.data.zones);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateAgent = async (agentId, body) => {
    setError("");
    setSuccess("");
    try {
      await api.adminUpdateAgent(agentId, body);
      setSuccess("Agent updated");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>Delivery Agents</h1>
      <p className="muted">Manage agent availability, zone, and location for auto-assignment.</p>
      <ErrorAlert message={error} onDismiss={() => setError("")} />
      {success && <div className="alert alert-success">{success}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Zone</th><th>Available</th><th>Active orders</th><th>Location</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td>{agent.user?.name}<br /><span className="muted">{agent.user?.email}</span></td>
                <td>
                  <select
                    value={agent.currentZoneId || ""}
                    onChange={(e) => updateAgent(agent.id, { currentZoneId: e.target.value })}
                  >
                    <option value="">—</option>
                    {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className={`btn btn-sm ${agent.isAvailable ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => updateAgent(agent.id, { isAvailable: !agent.isAvailable })}
                  >
                    {agent.isAvailable ? "Available" : "Unavailable"}
                  </button>
                </td>
                <td>{agent.activeOrderCount}</td>
                <td className="mono">
                  {agent.currentLatitude != null
                    ? `${agent.currentLatitude}, ${agent.currentLongitude}`
                    : "—"}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      updateAgent(agent.id, {
                        currentLatitude: 28.6315,
                        currentLongitude: 77.2167
                      })
                    }
                  >
                    Set sample GPS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
