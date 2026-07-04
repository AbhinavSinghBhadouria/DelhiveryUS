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
    <div className="landing-page scrollable-layout">
      {/* Background Glows */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-brand">
          <span>Delhivery</span>US
        </div>
        <nav className="landing-nav-actions">
          {user ? (
            <>
              <span className="user-name">Welcome, <strong>{user.name}</strong></span>
              <Link to={getDashboardLink()} className="btn-filled">
                Dashboard
              </Link>
              <button onClick={logout} className="btn-outline signout-btn">
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
          <span className="hero-badge">⚡ Smart Logistics Platform</span>
          <h1>Next-Gen Last-Mile Delivery Tracking</h1>
          <p>
            An intelligent, automated last-mile logistics cockpit. DelhiveryUS offers 
            proximity-optimized agent auto-assignment, instant dynamic pricing, 
            and an immutable, fully auditable timeline history for every delivery attempt.
          </p>
          <div className="hero-cta">
            <Link to={user ? getDashboardLink() : "/register"} className="btn-filled hero-btn">
              {user ? "Go to Dashboard" : "Get Started Now"}
            </Link>
            {!user && (
              <Link to="/login" className="btn-outline hero-btn">
                Sign In to Account
              </Link>
            )}
          </div>
        </div>

        <div className="hero-showcase">
          <div className="showcase-card">
            <img 
              src="/logistics_map_ui.png" 
              alt="DelhiveryUS Live Command Center Dashboard" 
              className="showcase-img" 
            />
            <div className="showcase-glowing-glow"></div>
          </div>
        </div>
      </main>

      {/* Stats Counter Section */}
      <section className="landing-stats">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">99.8%</span>
            <span className="stat-label">Auto-Assignment Success</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">&lt; 15ms</span>
            <span className="stat-label">Pricing Latency</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Audit Log Integrity</span>
          </div>
        </div>
      </section>

      {/* Interactive Map Visual Section */}
      <section className="map-visual-section">
        <div className="section-header">
          <h2>Real-Time Delivery Network</h2>
          <p>View active dispatching routes and simulated agent couriers traversing DelhiveryUS hubs.</p>
        </div>
        <div className="map-card-wrapper glass-card">
          <div className="vector-map-viewer">
            <svg viewBox="0 0 600 400" className="vector-svg">
              {/* SVG Grid Lines */}
              <defs>
                <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid)" />

              {/* Delivery Routes */}
              <g strokeWidth="2" fill="none">
                <path d="M 200 100 L 300 200 L 340 320" stroke="#d4af37" className="route-path inter-zone-path" />
                <path d="M 200 100 Q 250 60 300 200" stroke="rgba(212, 175, 55, 0.3)" className="route-path intra-zone-path" />
              </g>

              {/* Animated Cargo Carriers */}
              <circle r="5" fill="#d4af37" className="pulsing-carrier-dot">
                <animateMotion path="M 200 100 L 300 200 L 340 320" dur="8s" repeatCount="indefinite" />
              </circle>

              <circle r="4" fill="#d4af37" className="pulsing-carrier-dot">
                <animateMotion path="M 300 200 Q 250 60 200 100" dur="6s" repeatCount="indefinite" />
              </circle>

              {/* Delivery Hub Nodes */}
              {/* North Zone Hub */}
              <g transform="translate(200, 100)" className="map-node">
                <circle r="14" fill="rgba(212, 175, 55, 0.15)" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="1" className="hub-pulse" />
                <circle r="5" fill="#d4af37" />
                <text y="-20" textAnchor="middle" fill="#fff" className="node-label">North Depot</text>
              </g>

              {/* Central Sorting Hub */}
              <g transform="translate(300, 200)" className="map-node">
                <circle r="20" fill="rgba(212, 175, 55, 0.2)" stroke="rgba(212, 175, 55, 0.5)" strokeWidth="1.5" className="hub-pulse" />
                <circle r="7" fill="#d4af37" />
                <text y="-26" textAnchor="middle" fill="#fff" className="node-label font-bold">Delhi Central Sorting Hub</text>
              </g>

              {/* South Zone Hub */}
              <g transform="translate(340, 320)" className="map-node">
                <circle r="14" fill="rgba(212, 175, 55, 0.15)" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="1" className="hub-pulse" />
                <circle r="5" fill="#d4af37" />
                <text y="24" textAnchor="middle" fill="#fff" className="node-label">South Depot</text>
              </g>
            </svg>

            <div className="map-legend">
              <span className="legend-item"><span className="legend-dot active"></span> Active Route</span>
              <span className="legend-item"><span className="legend-dot carrier"></span> Courier En Route</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="landing-features">
        <div className="features-container">
          <div className="features-header">
            <h2>High-Velocity Operations</h2>
            <p>Our backend services automate and secure last-mile package routing seamlessly.</p>
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
              <h3>Immutable Timeline</h3>
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
        <p>&copy; {new Date().getFullYear()} DelhiveryUS. All rights reserved. Powered by React, Express, Prisma, and PostgreSQL.</p>
      </footer>
    </div>
  );
}
