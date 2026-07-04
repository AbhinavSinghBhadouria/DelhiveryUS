// pages/customer/CreateOrder.jsx - 2 step flow hai: form → quote preview → confirm
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// api api/client.js se - quoteOrder aur createOrder calls
import { api } from "../../api/client.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function CreateOrder() {
  const navigate = useNavigate();

  // step - "form" se "preview" pe jata hai jab quote aa jaaye
  const [step, setStep] = useState("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);  // api.quoteOrder ka response yahan store hota hai
  const [serviceAreas, setServiceAreas] = useState([]);

  // form state - pickup, drop, package dimensions aur order options sab ek jagah
  const [form, setForm] = useState({
    pickup: { address: "12 Janpath Road", area: "Connaught Place", pincode: "110001" },
    drop: { address: "45 Temple Lane", area: "Kalkaji", pincode: "110019" },
    package: { length: 30, breadth: 20, height: 15, actualWeight: 2 },
    orderType: "B2C",
    paymentType: "PREPAID"
  });

  // Load supported service areas on mount
  useEffect(() => {
    async function fetchAreas() {
      try {
        const response = await api.getServiceAreas();
        setServiceAreas(response.data.serviceAreas || []);
      } catch (err) {
        console.error("Failed to load service areas:", err);
      }
    }
    fetchAreas();
  }, []);

  // updateNested - nested state update karne ka helper
  // (section, field) => (e) => ... - curried function hai, input onChange mein seedha lagate hain
  // number type inputs ke liye value Number() mein convert karte hain - string nahi chahiye
  const updateNested = (section, field) => (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({
      ...form,
      [section]: { ...form[section], [field]: value }  // [section] computed property - dynamic key
    });
  };

  // buildPayload - form state se API ke liye payload bana do
  const buildPayload = () => ({
    pickup: form.pickup,
    drop: form.drop,
    package: form.package,
    orderType: form.orderType,
    paymentType: form.paymentType
  });

  // handleQuote - Step 1: quote fetch karo, success pe preview dikhao
  const handleQuote = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // api/client.js ka quoteOrder - /orders/quote POST call karta hai
      const result = await api.quoteOrder(buildPayload());
      setQuote(result.data.quote);  // quote mein zones, weight, pricing sab aata hai
      setStep("preview");           // form se preview step pe shift karo
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // handleConfirm - Step 2: user ne quote dekha aur confirm kiya
  const handleConfirm = async () => {
    setError("");
    setLoading(true);

    try {
      // api/client.js ka createOrder - /orders POST - order database mein save hoga
      const result = await api.createOrder(buildPayload());
      // order create hone ke baad seedha order detail page pe bhejo
      navigate(`/customer/orders/${result.data.order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Create Order</h1>
      <ErrorAlert message={error} onDismiss={() => setError("")} />

      {/* Step 1: form dikhao - step "form" hai tabhi */}
      {step === "form" && (
        <form onSubmit={handleQuote} className="form form-wide">
          <section className="form-section">
            <h2>Pickup</h2>
            <label>
              Address
              <input value={form.pickup.address} onChange={updateNested("pickup", "address")} required />
            </label>
            <div className="form-row">
              <label style={{ gridColumn: "span 2" }}>
                Area / Pincode
                <select
                  value={`${form.pickup.area}||${form.pickup.pincode}`}
                  onChange={(e) => {
                    const [area, pincode] = e.target.value.split("||");
                    setForm(prev => ({
                      ...prev,
                      pickup: { ...prev.pickup, area: area || "", pincode: pincode || "" }
                    }));
                  }}
                  required
                >
                  <option value="">-- Select Supported Service Area --</option>
                  {serviceAreas.map((sa) => (
                    <option key={`pickup-${sa.areaName}-${sa.pincode}`} value={`${sa.areaName}||${sa.pincode}`}>
                      {sa.areaName} ({sa.pincode})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>Drop</h2>
            <label>
              Address
              <input value={form.drop.address} onChange={updateNested("drop", "address")} required />
            </label>
            <div className="form-row">
              <label style={{ gridColumn: "span 2" }}>
                Area / Pincode
                <select
                  value={`${form.drop.area}||${form.drop.pincode}`}
                  onChange={(e) => {
                    const [area, pincode] = e.target.value.split("||");
                    setForm(prev => ({
                      ...prev,
                      drop: { ...prev.drop, area: area || "", pincode: pincode || "" }
                    }));
                  }}
                  required
                >
                  <option value="">-- Select Supported Service Area --</option>
                  {serviceAreas.map((sa) => (
                    <option key={`drop-${sa.areaName}-${sa.pincode}`} value={`${sa.areaName}||${sa.pincode}`}>
                      {sa.areaName} ({sa.pincode})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>Package</h2>
            <div className="form-row">
              <label>
                Length (cm)
                <input type="number" value={form.package.length} onChange={updateNested("package", "length")} required />
              </label>
              <label>
                Breadth (cm)
                <input type="number" value={form.package.breadth} onChange={updateNested("package", "breadth")} required />
              </label>
              <label>
                Height (cm)
                <input type="number" value={form.package.height} onChange={updateNested("package", "height")} required />
              </label>
              <label>
                Weight (kg)
                <input type="number" step="0.01" value={form.package.actualWeight} onChange={updateNested("package", "actualWeight")} required />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>Order options</h2>
            <div className="form-row">
              <label>
                Order type
                <select value={form.orderType} onChange={(e) => setForm({ ...form, orderType: e.target.value })}>
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
              </label>
              <label>
                Payment
                <select value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })}>
                  <option value="PREPAID">Prepaid</option>
                  <option value="COD">COD</option>
                </select>
              </label>
            </div>
          </section>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Calculating..." : "Get Quote"}
          </button>
        </form>
      )}

      {/* Step 2: quote preview - dono conditions true honin chahiye: step aur quote */}
      {step === "preview" && quote && (
        <div className="quote-preview">
          <h2>Quote Preview</h2>
          <div className="quote-grid">
            <div>
              <p><strong>Pickup zone:</strong> {quote.pickupZone.name}</p>
              <p><strong>Drop zone:</strong> {quote.dropZone.name}</p>
              {/* rateType INTRA_ZONE ya INTER_ZONE hoga - rate-calculation.service.js decide karta hai */}
              <p><strong>Rate type:</strong> {quote.pricing.rateType}</p>
            </div>
            <div>
              {/* volumetricWeight = L x B x H / 5000, billableWeight = max(actual, volumetric) */}
              <p><strong>Volumetric weight:</strong> {quote.package.volumetricWeight} kg</p>
              <p><strong>Billable weight:</strong> {quote.package.billableWeight} kg</p>
              <p><strong>Base charge:</strong> ₹{quote.pricing.baseCharge}</p>
              <p><strong>COD charge:</strong> ₹{quote.pricing.codCharge}</p>
              <p className="quote-total"><strong>Final charge:</strong> ₹{quote.pricing.finalCharge}</p>
            </div>
          </div>
          <div className="btn-row">
            {/* Edit button - wapas form step pe le jao */}
            <button type="button" className="btn btn-ghost" onClick={() => setStep("form")}>
              Edit
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
              {loading ? "Creating..." : "Confirm Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
