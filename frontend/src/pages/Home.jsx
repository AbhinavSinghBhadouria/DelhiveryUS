import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user, logout } = useAuth();
  
  // Tab switch for right panel: "command" (our generated 3D map dashboard) or "vector" (interactive SVG map)
  const [mapMode, setMapMode] = useState("command");
  
  // Interactive Calculator State
  const [orderType, setOrderType] = useState("B2C");
  const [movement, setMovement] = useState("INTRA_ZONE");
  const [paymentType, setPaymentType] = useState("PREPAID");
  const [weight, setWeight] = useState(2);

  // Live Operations Feed State
  const [logs, setLogs] = useState([
    { id: 1, time: "12:44:02 AM", text: "⚡ Auto-assignment engine triggered for Order #9910" },
    { id: 2, time: "12:44:10 AM", text: "🚚 Agent Duxuxu picked up package for Route: North Zone" },
    { id: 3, time: "12:44:15 AM", text: "📦 Order #8821 marked OUT_FOR_DELIVERY in South Zone" }
  ]);

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

  // Simulate scrolling live log feed
  useEffect(() => {
    const mockLogs = [
      "🚚 Truck-104 en route to South Zone Area",
      "📦 Order #2041 marked DELIVERED by Agent Duxuxu",
      "⚠️ Delivery attempt failed for Order #3928: Customer Not Available",
      "🔄 Customer Abhiraj Verma rescheduled Order #3928 to tomorrow",
      "✅ Agent assigned to rescheduled Order #3928 successfully",
      "💸 COD Payment of ₹126 collected for Order #4019",
      "⚡ Proximity search matched Agent to Order #1105 (0.8km)",
      "🔒 Immutable tracking event recorded for Order #2041",
      "📧 Status email dispatched to customer for Order #8821"
    ];

    const interval = setInterval(() => {
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const randomText = mockLogs[Math.floor(Math.random() * mockLogs.length)];
      
      setLogs((prev) => {
        const updated = [...prev, { id: Date.now(), time: timeString, text: randomText }];
        if (updated.length > 5) updated.shift(); // Keep last 5 logs
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page dashboard-layout">
      {/* Background grid pattern */}
      <div className="grid-overlay"></div>

      {/* Control Panel (Left Sidebar) */}
      <aside className="control-panel">
        <header className="panel-header">
          <div className="landing-brand">
            <span>Delhivery</span>US
          </div>
          <div className="auth-header-actions">
            {user ? (
              <div className="auth-user-info">
                <span className="user-name">Welcome, <strong>{user.name}</strong></span>
                <div className="btn-group">
                  <Link to={getDashboardLink()} className="btn-filled btn-sm">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="btn-outline btn-sm signout-btn">
                    Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="btn-group">
                <Link to="/login" className="btn-outline btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn-filled btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        <section className="panel-hero-info">
          <span className="hero-badge">Logistics Command Center</span>
          <h1>Next-Gen Delivery Tracking</h1>
          <p>
            An automated last-mile routing and mapping cockpit. 
            Proximity matching, automatic rate estimation, and tamper-proof timelines.
          </p>
        </section>

        {/* Dynamic Rate Estimator */}
        <section className="calculator-widget glass-card">
          <div className="widget-header">
            <h3>Live Quote Estimator</h3>
            <span className="widget-badge">Real-Time</span>
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
                <span>Movement Type</span>
                <select value={movement} onChange={(e) => setMovement(e.target.value)}>
                  <option value="INTRA_ZONE">Intra-Zone (Same Area)</option>
                  <option value="INTER_ZONE">Inter-Zone (Cross Region)</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Payment Mode</span>
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
                    COD
                  </button>
                </div>
              </label>
            </div>

            <div className="form-row">
              <label className="range-label">
                <span>Weight: <strong>{weight} kg</strong></span>
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
            <span className="result-label font-bold text-white">Estimated Shipping Cost</span>
            <span className="result-price">₹{calculateEstimate()}</span>
          </div>
        </section>

        {/* Live Operations Feed */}
        <section className="terminal-feed glass-card">
          <div className="terminal-header">
            <div className="status-dot-wrapper">
              <span className="status-dot pulsing"></span>
              <h4>Live Logs Feed</h4>
            </div>
            <span className="terminal-ip">NODE_OK</span>
          </div>
          <div className="terminal-body">
            {logs.map((log) => (
              <div className="log-line" key={log.id}>
                <span className="log-time">[{log.time}]</span>
                <span className="log-text">{log.text}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* Map Monitor Area (Right Main Column) */}
      <main className="map-monitor">
        {/* Map Header Tabs */}
        <div className="map-tabs">
          <button 
            type="button" 
            className={`map-tab-btn ${mapMode === "command" ? "active" : ""}`}
            onClick={() => setMapMode("command")}
          >
            🛰️ Command Center View
          </button>
          <button 
            type="button" 
            className={`map-tab-btn ${mapMode === "vector" ? "active" : ""}`}
            onClick={() => setMapMode("vector")}
          >
            🗺️ Interactive Routing Map
          </button>
        </div>

        {/* Map Body Content */}
        <div className="map-viewport glass-card">
          {mapMode === "command" ? (
            <div className="command-viewer">
              <img 
                src="/logistics_map_ui.png" 
                alt="DelhiveryUS Live Logistics Dashboard Map" 
                className="command-map-img" 
              />
              <div className="command-info-overlay">
                <div className="overlay-badge">
                  <span className="status-dot pulsing green"></span> Live Fleet Tracker
                </div>
                <div className="overlay-stats">
                  <div className="stat-pill"><strong>42</strong> Active Trucks</div>
                  <div className="stat-pill"><strong>1.2M</strong> Deliveries</div>
                  <div className="stat-pill"><strong>100%</strong> Node Health</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="vector-map-viewer">
              <div className="map-instruction">
                Click a route to quickly calculate estimated delivery quotes
              </div>
              
              <svg viewBox="0 0 600 450" className="vector-svg">
                {/* SVG Grid Lines */}
                <defs>
                  <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-grid)" />

                {/* Delhivery Routes (Connected Lines) */}
                <g strokeWidth="2" fill="none">
                  {/* Route: North to South (Via Central) */}
                  <path 
                    d="M 200 120 L 300 220 L 340 340" 
                    stroke={movement === "INTER_ZONE" ? "#d4af37" : "rgba(255, 255, 255, 0.15)"} 
                    className="route-path inter-zone-path"
                    onClick={() => {
                      setMovement("INTER_ZONE");
                    }}
                  />
                  {/* Route: Intra North */}
                  <path 
                    d="M 200 120 Q 250 80 300 220" 
                    stroke={movement === "INTRA_ZONE" ? "#d4af37" : "rgba(255, 255, 255, 0.15)"} 
                    className="route-path intra-zone-path"
                    onClick={() => {
                      setMovement("INTRA_ZONE");
                    }}
                  />
                </g>

                {/* Animated Pulsing Cargo Dots on Routes */}
                <circle r="5" fill="#d4af37" className="pulsing-carrier-dot carrier-1">
                  <animateMotion 
                    path="M 200 120 L 300 220 L 340 340" 
                    dur="7s" 
                    repeatCount="indefinite" 
                  />
                </circle>

                <circle r="4" fill="#d4af37" className="pulsing-carrier-dot carrier-2">
                  <animateMotion 
                    path="M 300 220 Q 250 80 200 120" 
                    dur="5s" 
                    repeatCount="indefinite" 
                  />
                </circle>

                {/* Delivery Hub Nodes */}
                {/* North Zone Hub */}
                <g 
                  transform="translate(200, 120)" 
                  className="map-node"
                  onClick={() => {
                    setMovement("INTRA_ZONE");
                  }}
                >
                  <circle r="16" fill="rgba(212, 175, 55, 0.15)" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="1" className="hub-pulse" />
                  <circle r="6" fill="#d4af37" />
                  <text y="-22" textAnchor="middle" fill="#fff" className="node-label">North Zone Depot</text>
                </g>

                {/* Central Sorting Hub */}
                <g 
                  transform="translate(300, 220)" 
                  className="map-node"
                >
                  <circle r="22" fill="rgba(212, 175, 55, 0.2)" stroke="rgba(212, 175, 55, 0.5)" strokeWidth="1.5" className="hub-pulse" />
                  <circle r="8" fill="#d4af37" />
                  <text y="-28" textAnchor="middle" fill="#fff" className="node-label font-bold">Delhi Sort Hub (HQ)</text>
                </g>

                {/* South Zone Hub */}
                <g 
                  transform="translate(340, 340)" 
                  className="map-node"
                  onClick={() => {
                    setMovement("INTER_ZONE");
                  }}
                >
                  <circle r="16" fill="rgba(212, 175, 55, 0.15)" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="1" className="hub-pulse" />
                  <circle r="6" fill="#d4af37" />
                  <text y="28" textAnchor="middle" fill="#fff" className="node-label">South Zone Depot</text>
                </g>
              </svg>

              <div className="map-legend">
                <span className="legend-item"><span className="legend-dot active"></span> Selected Route</span>
                <span className="legend-item"><span className="legend-dot carrier"></span> Active Truck Courier</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Metrics Bar */}
        <section className="metrics-ticker">
          <div className="metric-box">
            <span className="metric-val">99.8%</span>
            <span className="metric-tag">Auto-Assign Accuracy</span>
          </div>
          <div className="metric-sep"></div>
          <div className="metric-box">
            <span className="metric-val">&lt; 15ms</span>
            <span className="metric-tag">Pricing Engine Latency</span>
          </div>
          <div className="metric-sep"></div>
          <div className="metric-box">
            <span className="metric-val">100%</span>
            <span className="metric-tag">Immutable Audit Trails</span>
          </div>
        </section>
      </main>
    </div>
  );
}
