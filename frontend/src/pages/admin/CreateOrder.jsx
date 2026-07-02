import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";

export default function AdminCreateOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [step, setStep] = useState("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [form, setForm] = useState({
    customerId: "",
    pickup: { address: "12 Janpath Road", area: "Connaught Place", pincode: "110001" },
    drop: { address: "45 Temple Lane", area: "Kalkaji", pincode: "110019" },
    package: { length: 30, breadth: 20, height: 15, actualWeight: 2 },
    orderType: "B2C",
    paymentType: "PREPAID"
  });

  useEffect(() => {
    api.adminCustomers()
      .then((res) => {
        setCustomers(res.data.customers);
        if (res.data.customers[0]) {
          setForm((f) => ({ ...f, customerId: res.data.customers[0].id }));
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const updateNested = (section, field) => (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [section]: { ...form[section], [field]: value } });
  };

  const buildPayload = () => ({
    customerId: form.customerId,
    pickup: form.pickup,
    drop: form.drop,
    package: form.package,
    orderType: form.orderType,
    paymentType: form.paymentType
  });

  const handleQuote = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { customerId, ...quoteBody } = buildPayload();
      const result = await api.quoteOrder(quoteBody);
      setQuote(result.data.quote);
      setStep("preview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.adminCreateOrder(buildPayload());
      navigate(`/admin/orders/${result.data.order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Create Order for Customer</h1>
      <ErrorAlert message={error} onDismiss={() => setError("")} />

      {step === "form" && (
        <form onSubmit={handleQuote} className="form form-wide">
          <label>
            Customer
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </label>

          <section className="form-section">
            <h2>Pickup</h2>
            <label>Address <input value={form.pickup.address} onChange={updateNested("pickup", "address")} required /></label>
            <div className="form-row">
              <label>Area <input value={form.pickup.area} onChange={updateNested("pickup", "area")} required /></label>
              <label>Pincode <input value={form.pickup.pincode} onChange={updateNested("pickup", "pincode")} required /></label>
            </div>
          </section>

          <section className="form-section">
            <h2>Drop</h2>
            <label>Address <input value={form.drop.address} onChange={updateNested("drop", "address")} required /></label>
            <div className="form-row">
              <label>Area <input value={form.drop.area} onChange={updateNested("drop", "area")} required /></label>
              <label>Pincode <input value={form.drop.pincode} onChange={updateNested("drop", "pincode")} required /></label>
            </div>
          </section>

          <section className="form-section">
            <h2>Package & options</h2>
            <div className="form-row">
              <label>L <input type="number" value={form.package.length} onChange={updateNested("package", "length")} /></label>
              <label>B <input type="number" value={form.package.breadth} onChange={updateNested("package", "breadth")} /></label>
              <label>H <input type="number" value={form.package.height} onChange={updateNested("package", "height")} /></label>
              <label>kg <input type="number" value={form.package.actualWeight} onChange={updateNested("package", "actualWeight")} /></label>
              <label>Type
                <select value={form.orderType} onChange={(e) => setForm({ ...form, orderType: e.target.value })}>
                  <option value="B2C">B2C</option><option value="B2B">B2B</option>
                </select>
              </label>
              <label>Payment
                <select value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })}>
                  <option value="PREPAID">Prepaid</option><option value="COD">COD</option>
                </select>
              </label>
            </div>
          </section>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Calculating..." : "Get Quote"}
          </button>
        </form>
      )}

      {step === "preview" && quote && (
        <div className="quote-preview">
          <h2>Quote for {customers.find((c) => c.id === form.customerId)?.name}</h2>
          <p><strong>Route:</strong> {quote.pickupZone.name} → {quote.dropZone.name}</p>
          <p className="quote-total"><strong>Final charge:</strong> ₹{quote.pricing.finalCharge}</p>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost" onClick={() => setStep("form")}>Edit</button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
              {loading ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
