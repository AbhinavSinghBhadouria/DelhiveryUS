// pages/agent/Profile.jsx - agent apni availability toggle karta hai aur GPS location set karta hai
// yeh data auto-assignment mein use hota hai - services/agent-assignment.service.js wahan padhta hai
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function AgentProfile() {
  const [agent, setAgent] = useState(null);
  const [zones, setZones] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // location state - zone, lat, lng teeno ek jagah manage kiye
  const [location, setLocation] = useState({ currentZoneId: "", currentLatitude: "", currentLongitude: "" });

  const load = async () => {
    try {
      // profile aur zones dono parallel fetch - Promise.all se
      const [profileRes, zonesRes] = await Promise.all([api.agentProfile(), api.agentZones()]);
      setAgent(profileRes.data.agent);
      setZones(zonesRes.data.zones);
      // location state ko agent ke current values se initialize karo
      // ?? "" - null ya undefined ko empty string se replace karo - controlled input ke liye
      setLocation({
        currentZoneId: profileRes.data.agent.currentZoneId || "",
        currentLatitude: profileRes.data.agent.currentLatitude ?? "",
        currentLongitude: profileRes.data.agent.currentLongitude ?? ""
      });
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // toggleAvailability - agent available/unavailable toggle karta hai
  // !agent.isAvailable - current value ka opposite bhejo
  const toggleAvailability = async () => {
    setError("");
    try {
      await api.agentUpdateAvailability({ isAvailable: !agent.isAvailable });
      setSuccess("Availability updated");
      await load();  // fresh data reload karo - UI latest state dikhaye
    } catch (err) {
      setError(err.message);
    }
  };

  const saveLocation = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.agentUpdateLocation({
        // empty string hai toh undefined bhejo - backend optional field hai
        currentZoneId: location.currentZoneId || undefined,
        // Number() se convert karo - input value string hoti hai, backend number expect karta hai
        currentLatitude: location.currentLatitude ? Number(location.currentLatitude) : undefined,
        currentLongitude: location.currentLongitude ? Number(location.currentLongitude) : undefined
      });
      setSuccess("Location updated");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!agent) return <div className="page">Loading profile...</div>;

  return (
    <div className="page">
      <h1>Agent Profile</h1>
      <p className="muted">Update your availability and GPS location for smarter auto-assignment.</p>
      <ErrorAlert message={error} onDismiss={() => setError("")} />
      {/* success message - sirf tabhi dikhao jab ho */}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="card">
        <h2>Availability</h2>
        <p>Status: <strong>{agent.isAvailable ? "Available" : "Unavailable"}</strong></p>
        <p>Active orders: {agent.activeOrderCount}</p>
        {/* button text dynamically change hota hai current state ke hisab se */}
        <button type="button" className="btn btn-primary" onClick={toggleAvailability}>
          Mark as {agent.isAvailable ? "Unavailable" : "Available"}
        </button>
      </section>

      <section className="card">
        <h2>Location & Zone</h2>
        <form onSubmit={saveLocation} className="form">
          <label>
            Active zone
            {/* zones api.agentZones() se aate hain - sabse upar load() mein fetch hue */}
            <select
              value={location.currentZoneId}
              onChange={(e) => setLocation({ ...location, currentZoneId: e.target.value })}
            >
              <option value="">Select zone</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </label>
          <div className="form-row">
            <label>
              Latitude
              {/* step="0.0001" - 4 decimal precision GPS ke liye kaafi hai */}
              <input
                type="number"
                step="0.0001"
                value={location.currentLatitude}
                onChange={(e) => setLocation({ ...location, currentLatitude: e.target.value })}
              />
            </label>
            <label>
              Longitude
              <input
                type="number"
                step="0.0001"
                value={location.currentLongitude}
                onChange={(e) => setLocation({ ...location, currentLongitude: e.target.value })}
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Save Location</button>
        </form>
      </section>

      <Link to="/agent/orders" className="btn btn-ghost">View assigned orders</Link>
    </div>
  );
}
