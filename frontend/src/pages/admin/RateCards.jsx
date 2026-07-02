import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function AdminRateCards() {
  const [zones, setZones] = useState([]);
  const [rateCards, setRateCards] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    orderType: "B2C",
    fromZoneId: "",
    toZoneId: "",
    minWeight: 0,
    maxWeight: 5,
    baseCharge: 60,
    perKgCharge: 12
  });

  const load = async () => {
    try {
      const [zonesRes, cardsRes] = await Promise.all([api.adminZones(), api.adminRateCards()]);
      setZones(zonesRes.data.zones);
      setRateCards(cardsRes.data.rateCards);
      if (!form.fromZoneId && zonesRes.data.zones[0]) {
        setForm((f) => ({
          ...f,
          fromZoneId: zonesRes.data.zones[0].id,
          toZoneId: zonesRes.data.zones[0].id
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createRateCard(form);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>Rate Cards</h1>
      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <section className="card">
        <h2>Add Rate Card</h2>
        <form onSubmit={handleSubmit} className="form form-wide">
          <div className="form-row">
            <label>
              Order type
              <select value={form.orderType} onChange={(e) => setForm({ ...form, orderType: e.target.value })}>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </label>
            <label>
              From zone
              <select value={form.fromZoneId} onChange={(e) => setForm({ ...form, fromZoneId: e.target.value })}>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </label>
            <label>
              To zone
              <select value={form.toZoneId} onChange={(e) => setForm({ ...form, toZoneId: e.target.value })}>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>Min weight <input type="number" value={form.minWeight} onChange={(e) => setForm({ ...form, minWeight: Number(e.target.value) })} /></label>
            <label>Max weight <input type="number" value={form.maxWeight} onChange={(e) => setForm({ ...form, maxWeight: Number(e.target.value) })} /></label>
            <label>Base charge <input type="number" value={form.baseCharge} onChange={(e) => setForm({ ...form, baseCharge: Number(e.target.value) })} /></label>
            <label>Per kg <input type="number" value={form.perKgCharge} onChange={(e) => setForm({ ...form, perKgCharge: Number(e.target.value) })} /></label>
          </div>
          <button type="submit" className="btn btn-primary">Add Rate Card</button>
        </form>
      </section>

      <section className="card">
        <h2>Active Rate Cards</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th><th>From</th><th>To</th><th>Rate</th><th>Weight slab</th><th>Base</th><th>Per kg</th>
              </tr>
            </thead>
            <tbody>
              {rateCards.map((rc) => (
                <tr key={rc.id}>
                  <td>{rc.orderType}</td>
                  <td>{rc.fromZone?.name}</td>
                  <td>{rc.toZone?.name}</td>
                  <td>{rc.rateType}</td>
                  <td>{rc.minWeight}–{rc.maxWeight} kg</td>
                  <td>₹{rc.baseCharge}</td>
                  <td>₹{rc.perKgCharge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
