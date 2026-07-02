// api/client.js - poore frontend ka ek jagah API layer
// yahan se saare HTTP calls hote hain - koi bhi page directly fetch() use nahi karta

// VITE_API_BASE_URL .env.example mein defined hai - Vite ke env variables VITE_ se start hote hain
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// token localStorage mein store kiya hai - tab bhi rahega agar user tab refresh kare
function getToken() {
  return localStorage.getItem("token");
}

// setToken - login ke baad token save karo, logout pe null pass karo toh remove ho jaata hai
export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

// request - sab API calls is ek function se jaati hain
// automatically token header lagata hai aur error response ko throw karta hai
async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  // agar token hai toh har request mein Authorization header lagao
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  // .catch(() => ({})) - agar response JSON nahi hai toh crash mat karo, empty object do
  const data = await response.json().catch(() => ({}));

  // response.ok false hai toh (4xx, 5xx) - error throw karo
  // backend ka message field use karo - warna generic message
  if (!response.ok) {
    const message = data.message || data.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

// api object - poore app mein hme isse import karke use karte hain
// har function ek specific endpoint call karta hai
export const api = {
  // auth routes - auth.routes.js se
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  verifyEmail: (body) => request("/auth/verify-email", { method: "POST", body: JSON.stringify(body) }),
  resendOtp: (body) => request("/auth/resend-otp", { method: "POST", body: JSON.stringify(body) }),

  // customer order routes - order.routes.js se
  quoteOrder: (body) => request("/orders/quote", { method: "POST", body: JSON.stringify(body) }),
  createOrder: (body) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
  myOrders: () => request("/orders/my"),
  getOrder: (id) => request(`/orders/${id}`),
  getTracking: (id) => request(`/orders/${id}/tracking`),
  rescheduleOrder: (id, body) =>
    request(`/orders/${id}/reschedule`, { method: "POST", body: JSON.stringify(body) }),

  // admin routes - admin.routes.js se - zones
  adminZones: (params) => request(`/admin/zones${toQuery(params)}`),
  createZone: (body) => request("/admin/zones", { method: "POST", body: JSON.stringify(body) }),
  updateZone: (id, body) =>
    request(`/admin/zones/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  adminZoneAreas: (params) => request(`/admin/zone-areas${toQuery(params)}`),
  createZoneArea: (body) => request("/admin/zone-areas", { method: "POST", body: JSON.stringify(body) }),

  // admin rate cards aur COD
  adminRateCards: (params) => request(`/admin/rate-cards${toQuery(params)}`),
  createRateCard: (body) => request("/admin/rate-cards", { method: "POST", body: JSON.stringify(body) }),

  adminCodSurcharges: () => request("/admin/cod-surcharges"),
  upsertCodSurcharge: (body) =>
    request("/admin/cod-surcharges", { method: "POST", body: JSON.stringify(body) }),

  // admin agents aur customers
  adminAgents: (params) => request(`/admin/agents${toQuery(params)}`),
  adminCustomers: () => request("/admin/customers"),
  adminCreateCustomer: (body) =>
    request("/admin/customers", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateAgent: (id, body) =>
    request(`/admin/agents/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // admin orders - assign, auto-assign, status update
  adminOrders: (params) => request(`/admin/orders${toQuery(params)}`),
  adminCreateOrder: (body) => request("/admin/orders", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateStatus: (id, body) =>
    request(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(body) }),
  adminAssignAgent: (id, body) =>
    request(`/admin/orders/${id}/assign-agent`, { method: "PATCH", body: JSON.stringify(body) }),
  adminAutoAssign: (id) => request(`/admin/orders/${id}/auto-assign`, { method: "POST" }),

  // agent routes - agent.routes.js se
  agentOrders: () => request("/agent/orders"),
  agentProfile: () => request("/agent/profile"),
  agentZones: () => request("/agent/zones"),
  agentUpdateAvailability: (body) =>
    request("/agent/availability", { method: "PATCH", body: JSON.stringify(body) }),
  agentUpdateLocation: (body) =>
    request("/agent/location", { method: "PATCH", body: JSON.stringify(body) }),
  agentUpdateStatus: (id, body) =>
    request(`/agent/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(body) })
};

// toQuery - filter params ko URL query string mein convert karta hai
// undefined ya empty string values ko ignore karta hai - unzaroori params skip karo
function toQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (!entries.length) return "";
  // URLSearchParams automatically encode karta hai - spaces aur special chars safe ho jaate hain
  return `?${new URLSearchParams(entries).toString()}`;
}
