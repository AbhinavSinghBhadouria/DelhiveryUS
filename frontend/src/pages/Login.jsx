import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// useAuth context/AuthContext.jsx se - login function milta hai
import { useAuth } from "../context/AuthContext.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";

// roleHome - login ke baad kahan redirect karna hai role ke hisab se
function roleHome(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "AGENT") return "/agent";
  return "/customer";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();  // form ki default submit behavior rok do - page reload na ho
    setError("");
    setLoading(true);

    try {
      // context/AuthContext.jsx ka login - API call karta hai aur token save karta hai
      const user = await login(email, password);
      // user.role ke hisab se sahi dashboard pe bhejo
      navigate(roleHome(user.role));
    } catch (err) {
      setError(err.message);  // api/client.js ka error message - backend se aata hai
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="muted">Last-Mile Delivery Tracker</p>
        {/* ErrorAlert - dismiss karne pe setError("") se message clear ho jaata hai */}
        <ErrorAlert message={error} onDismiss={() => setError("")} />

        {error && error.toLowerCase().includes("verify your email") && (
          <div style={{ marginTop: "-8px", marginBottom: "16px", textAlign: "center" }}>
            <Link
              to="/verify-email"
              state={{ email }}
              style={{
                color: "var(--primary, #6366f1)",
                fontWeight: "bold",
                textDecoration: "underline",
                fontSize: "14px"
              }}
            >
              Click here to verify your email
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {/* loading ke time button disable karo - double submit se bachao */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </p>

        <div className="demo-credentials">
          <p className="demo-title">Demo credentials</p>
          <p>Admin: admin@example.com</p>
          <p>Customer: customer@example.com</p>
          <p>Agent: agent@example.com</p>
          <p>Password: Password@123</p>
        </div>
      </div>
    </div>
  );
}
