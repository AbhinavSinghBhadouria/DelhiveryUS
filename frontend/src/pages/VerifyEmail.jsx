import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { api } from "../api/client.js";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  // email Register.jsx se navigate ke waqt state mein aata hai
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // countdown timer for resend button cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.verifyEmail({ email, otp });
      // OTP correct - token milega, user ko login kar do
      loginWithToken(res.data.token, res.data.user);
      const role = res.data.user.role;
      navigate(role === "AGENT" ? "/agent" : role === "ADMIN" ? "/admin" : "/customer");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      await api.resendOtp({ email });
      setSuccess("A new OTP has been sent to your email.");
      setResendCooldown(60); // 60 second cooldown before next resend
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Email icon */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            fontSize: 28
          }}>
            ✉️
          </div>
        </div>

        <h1 style={{ textAlign: "center" }}>Verify your email</h1>
        <p className="muted" style={{ textAlign: "center" }}>
          We sent a 6-digit OTP to <strong>{email || "your email"}</strong>.
          <br />Enter it below to activate your account.
        </p>

        <ErrorAlert message={error} onDismiss={() => setError("")} />

        {success && (
          <div style={{
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            color: "#10b981", fontSize: 14
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="form">
          {/* Show email field if not pre-filled from navigation state */}
          {!location.state?.email && (
            <label>
              Email address
              <input
                id="verify-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
              />
            </label>
          )}

          <label>
            One-Time Password (OTP)
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
              style={{
                fontSize: 24,
                letterSpacing: 10,
                textAlign: "center",
                fontWeight: "bold"
              }}
            />
          </label>

          <button
            id="verify-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
            Didn't receive the OTP?
          </p>
          <button
            id="resend-otp-btn"
            className="btn"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: 13,
              padding: "6px 16px"
            }}
          >
            {resendLoading
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend OTP"}
          </button>
        </div>

        <p className="auth-footer">
          <Link to="/login">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
