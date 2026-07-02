import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function AdminZones() {
  const [zones, setZones] = useState([]);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState("");
  const [zoneForm, setZoneForm] = useState({ name: "", description: "" });
  const [areaForm, setAreaForm] = useState({
    zoneId: "",
    areaName: "",
    pincode: "",
    city: "Delhi",
    state: "Delhi",
    latitude: "",
    longitude: ""
  });

  const load = async () => {
    try {
      const [zonesRes, areasRes] = await Promise.all([api.adminZones(), api.adminZoneAreas()]);
      setZones(zonesRes.data.zones);
      setAreas(areasRes.data.zoneAreas);
      if (!areaForm.zoneId && zonesRes.data.zones[0]) {
        setAreaForm((f) => ({ ...f, zoneId: zonesRes.data.zones[0].id }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createZone = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createZone(zoneForm);
      setZoneForm({ name: "", description: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const createArea = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createZoneArea({
        ...areaForm,
        latitude: areaForm.latitude ? Number(areaForm.latitude) : undefined,
        longitude: areaForm.longitude ? Number(areaForm.longitude) : undefined
      });
      setAreaForm({ ...areaForm, areaName: "", pincode: "", latitude: "", longitude: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>Zones & Areas</h1>
      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <div className="detail-grid">
        <section className="card">
          <h2>Create Zone</h2>
          <form onSubmit={createZone} className="form">
            <label>
              Name
              <input value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} required />
            </label>
            <label>
              Description
              <input value={zoneForm.description} onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })} />
            </label>
            <button type="submit" className="btn btn-primary">Add Zone</button>
          </form>
        </section>

        <section className="card">
          <h2>Create Zone Area</h2>
          <form onSubmit={createArea} className="form">
            <label>
              Zone
              <select value={areaForm.zoneId} onChange={(e) => setAreaForm({ ...areaForm, zoneId: e.target.value })} required>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </label>
            <label>
              Area name
              <input value={areaForm.areaName} onChange={(e) => setAreaForm({ ...areaForm, areaName: e.target.value })} required />
            </label>
            <label>
              Pincode
              <input value={areaForm.pincode} onChange={(e) => setAreaForm({ ...areaForm, pincode: e.target.value })} required />
            </label>
            <div className="form-row">
              <label>
                City
                <input value={areaForm.city} onChange={(e) => setAreaForm({ ...areaForm, city: e.target.value })} required />
              </label>
              <label>
                State
                <input value={areaForm.state} onChange={(e) => setAreaForm({ ...areaForm, state: e.target.value })} required />
              </label>
            </div>
            <div className="form-row">
              <label>
                Latitude (optional, for auto-assign)
                <input type="number" step="0.0001" value={areaForm.latitude} onChange={(e) => setAreaForm({ ...areaForm, latitude: e.target.value })} />
              </label>
              <label>
                Longitude (optional)
                <input type="number" step="0.0001" value={areaForm.longitude} onChange={(e) => setAreaForm({ ...areaForm, longitude: e.target.value })} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Add Area</button>
          </form>
        </section>
      </div>

      <section className="card">
        <h2>Zones</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Description</th><th>Active</th></tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id}><td>{z.name}</td><td>{z.description}</td><td>{z.isActive ? "Yes" : "No"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Zone Areas</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Zone</th><th>Area</th><th>Pincode</th><th>City</th><th>GPS</th></tr>
            </thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a.id}>
                  <td>{zones.find((z) => z.id === a.zoneId)?.name || a.zoneId}</td>
                  <td>{a.areaName}</td>
                  <td>{a.pincode}</td>
                  <td>{a.city}</td>
                  <td className="mono">
                    {a.latitude != null ? `${Number(a.latitude)}, ${Number(a.longitude)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
