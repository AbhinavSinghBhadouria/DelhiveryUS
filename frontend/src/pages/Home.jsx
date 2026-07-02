import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "AGENT") return "/agent";
    return "/customer";
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-brand">
          <span>Delhivery</span>US
        </div>
        <nav className="landing-nav-actions">
          {user ? (
            <>
              <span className="user-name" style={{ marginRight: '1rem' }}>Welcome, {user.name}</span>
              <Link to={getDashboardLink()} className="btn-filled">
                Go to Dashboard
              </Link>
              <button onClick={logout} className="btn-outline" style={{ cursor: 'pointer' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn-filled">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="hero-text">
          <span className="hero-badge">Smart Logistics</span>
          <h1>Next-Gen Last-Mile Delivery Tracking</h1>
          <p>
            An intelligent, automated last-mile logistics platform for DelhiveryUS.
            Experience instant zone-based rate calculation, proximity-optimized agent auto-assignment, 
            and an immutable, fully auditable timeline history for every delivery attempt.
          </p>
          <div className="hero-cta">
            <Link to={user ? getDashboardLink() : "/register"} className="btn-filled">
              {user ? "Go to Dashboard" : "Get Started Now"}
            </Link>
            {!user && (
              <Link to="/login" className="btn-outline">
                Sign In to Account
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img 
            src="/delivery_hero.png" 
            alt="Futuristic Logistics Cargo Truck and Grid" 
            className="hero-image" 
          />
        </div>
      </main>

      {/* Features Section */}
      <section className="landing-features">
        <div className="features-container">
          <div className="features-header">
            <h2>Built for Modern Operations</h2>
            <p>Our core engines automate and verify logistics processes from order placement to final delivery.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Dynamic Pricing Engine</h3>
              <p>
                Calculates live shipping quotes based on actual vs volumetric weight, pickup/drop zones, 
                B2B/B2C profiles, and COD surcharges with zero hardcoding.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Intelligent Auto-Assignment</h3>
              <p>
                Uses geo-distance calculations to instantly match orders with the closest available delivery agent 
                in the pickup zone.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Immutable Tracking Timeline</h3>
              <p>
                Every single package status update is logged with a secure timestamp and actor role, 
                rendering a transparent audit timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} DelhiveryUS. All rights reserved. Deployed via Vercel, Render, and Neon.</p>
      </footer>
    </div>
  );
}
