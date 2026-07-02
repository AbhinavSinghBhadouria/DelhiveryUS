import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

const emptyForm = { name: "", email: "", phone: "", password: "Password@123" };

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await api.adminCustomers();
    setCustomers(res.data.customers);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.adminCreateCustomer({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password
      });
      setSuccess("Customer created");
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Customers</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Customer"}
        </button>
      </div>
      <p className="muted">View and create customer accounts for order placement.</p>
      <ErrorAlert message={error} onDismiss={() => setError("")} />
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <section className="card">
          <h2>Create Customer</h2>
          <form onSubmit={handleCreate} className="form">
            <label>Name <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Email <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label>Phone <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Password <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required /></label>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Creating..." : "Create"}</button>
          </form>
        </section>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || "—"}</td>
                <td>{c._count?.customerOrders ?? 0}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
