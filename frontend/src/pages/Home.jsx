import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user, logout } = useAuth();
  
  // Interactive Calculator State
  const [orderType, setOrderType] = useState("B2C");
  const [movement, setMovement] = useState("INTRA_ZONE");
  const [paymentType, setPaymentType] = useState("PREPAID");
  const [weight, setWeight] = useState(2);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "AGENT") return "/agent";
    return "/customer";
  };

  // Local calculation matching seeded database values
  const calculateEstimate = () => {
    let base = 60;
    let perKg = 12;

    if (orderType === "B2C") {
      if (movement === "INTRA_ZONE") {
        base = 60;
        perKg = 12;
      } else {
        base = 90;
        perKg = 18;
      }
    } else { // B2B
      if (movement === "INTRA_ZONE") {
        base = 120;
        perKg = 10;
      } else {
        base = 180;
        perKg = 16;
      }
    }

    let total = base + weight * perKg;
    if (paymentType === "COD") {
      total += orderType === "B2C" ? 30 : 75;
    }
    return Math.round(total);
  };

  return (
    <div className="landing-page">
      {/* Glow Effects */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

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
          <span className="hero-badge">⚡ Smart Logistics Engine</span>
          <h1>Next-Gen Last-Mile Delivery Tracking</h1>
          <p>
            An intelligent, automated last-mile logistics platform for DelhiveryUS.
            Experience instant zone-based rate calculation, proximity-optimized agent auto-assignment, 
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

        <div className="hero-visual-wrapper">
          {/* Glassmorphic Calculator Widget */}
          <div className="calculator-widget glass-card">
            <div className="widget-header">
              <h3>Live Quote Estimator</h3>
              <span className="widget-badge">Dynamic</span>
            </div>
            
            <div className="calculator-tabs">
              <button 
                type="button" 
                className={`tab-btn ${orderType === "B2C" ? "active" : ""}`}
                onClick={() => setOrderType("B2C")}
              >
                B2C Retail
              </button>
              <button 
                type="button" 
                className={`tab-btn ${orderType === "B2B" ? "active" : ""}`}
                onClick={() => setOrderType("B2B")}
              >
                B2B Enterprise
              </button>
            </div>

            <div className="widget-form">
              <div className="form-row">
                <label>
                  <span>Route / Distance</span>
                  <select value={movement} onChange={(e) => setMovement(e.target.value)}>
                    <option value="INTRA_ZONE">Intra-Zone (Same Area)</option>
                    <option value="INTER_ZONE">Inter-Zone (Cross Region)</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Payment Method</span>
                  <div className="payment-options">
                    <button 
                      type="button" 
                      className={`payment-btn ${paymentType === "PREPAID" ? "active" : ""}`}
                      onClick={() => setPaymentType("PREPAID")}
                    >
                      Prepaid
                    </button>
                    <button 
                      type="button" 
                      className={`payment-btn ${paymentType === "COD" ? "active" : ""}`}
                      onClick={() => setPaymentType("COD")}
                    >
                      Cash on Delivery
                    </button>
                  </div>
                </label>
              </div>

              <div className="form-row">
                <label className="range-label">
                  <span>Billable Weight: <strong>{weight} kg</strong></span>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="10" 
                    step="0.5" 
                    value={weight} 
                    onChange={(e) => setWeight(Number(e.target.value))} 
                  />
                </label>
              </div>
            </div>

            <div className="calculator-result">
              <span className="result-label">Estimated Charge</span>
              <span className="result-price">₹{calculateEstimate()}</span>
            </div>
          </div>
          
          <div className="hero-img-card">
            <img 
              src="/delivery_hero.png" 
              alt="Futuristic Logistics Cargo Truck and Grid" 
              className="hero-image" 
            />
          </div>
        </div>
      </main>

      {/* Stats Counter Bar */}
      <section className="landing-stats">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">99.8%</span>
            <span className="stat-label">Auto-Assignment Success</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">&lt; 20ms</span>
            <span className="stat-label">Pricing Latency</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Immutable Audit Logs</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="features-container">
          <div className="features-header">
            <h2>Engineered for High-Velocity Operations</h2>
            <p>Our intelligent system automates last-mile delivery and guarantees transparency at every step.</p>
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
        <p>&copy; {new Date().getFullYear()} DelhiveryUS. All rights reserved. Powered by React, Express, Prisma, and PostgreSQL.</p>
      </footer>
    </div>
  );
}
