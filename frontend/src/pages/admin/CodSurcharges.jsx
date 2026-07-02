import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function AdminCodSurcharges() {
  const [surcharges, setSurcharges] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ orderType: "B2C", surchargeAmount: 30 });

  const load = async () => {
    try {
      const res = await api.adminCodSurcharges();
      setSurcharges(res.data.codSurcharges);
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
      await api.upsertCodSurcharge(form);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>COD Surcharges</h1>
      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <section className="card">
        <h2>Upsert COD Surcharge</h2>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Order type
            <select value={form.orderType} onChange={(e) => setForm({ ...form, orderType: e.target.value })}>
              <option value="B2C">B2C</option>
              <option value="B2B">B2B</option>
            </select>
          </label>
          <label>
            Surcharge amount (₹)
            <input type="number" value={form.surchargeAmount} onChange={(e) => setForm({ ...form, surchargeAmount: Number(e.target.value) })} required />
          </label>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </section>

      <section className="card">
        <h2>Current Surcharges</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order Type</th><th>Amount</th><th>Active</th></tr></thead>
            <tbody>
              {surcharges.map((s) => (
                <tr key={s.id}><td>{s.orderType}</td><td>₹{s.surchargeAmount}</td><td>{s.isActive ? "Yes" : "No"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
