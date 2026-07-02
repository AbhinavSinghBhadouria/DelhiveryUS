import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { api } from "../api/client.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role
      });
      // Registration successful - OTP bheja gaya, verify-email page pe bhejo
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="muted">Register as a customer or delivery agent</p>
        <ErrorAlert message={error} onDismiss={() => setError("")} />

        <form onSubmit={handleSubmit} className="form">
          <label>
            Full name
            <input value={form.name} onChange={update("name")} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={update("email")} required />
          </label>
          <label>
            Phone (optional)
            <input value={form.phone} onChange={update("phone")} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={update("password")} minLength={8} required />
          </label>
          <label>
            Role
            <select value={form.role} onChange={update("role")}>
              <option value="CUSTOMER">Customer</option>
              <option value="AGENT">Delivery Agent</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
