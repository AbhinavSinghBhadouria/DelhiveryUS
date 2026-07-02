// App.jsx - poori app ki routing yahan define hai
// BrowserRouter, Routes, Route react-router-dom se - SPA navigation ke liye
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// AuthProvider context/AuthContext.jsx se - yeh poori app ko user state deta hai
// useAuth hook bhi wahan se aata hai
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// components/ folder se
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // role check karta hai
import Layout from "./components/Layout.jsx";                 // header + nav + Outlet

// pages/ se saare screens import kiye
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import CustomerDashboard from "./pages/customer/Dashboard.jsx";
import CreateOrder from "./pages/customer/CreateOrder.jsx";
import MyOrders from "./pages/customer/MyOrders.jsx";
import CustomerOrderDetail from "./pages/customer/OrderDetail.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminZones from "./pages/admin/Zones.jsx";
import AdminRateCards from "./pages/admin/RateCards.jsx";
import AdminCodSurcharges from "./pages/admin/CodSurcharges.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminOrderDetail from "./pages/admin/OrderDetail.jsx";
import AdminCreateOrder from "./pages/admin/CreateOrder.jsx";
import AdminCustomers from "./pages/admin/Customers.jsx";
import AdminAgents from "./pages/admin/Agents.jsx";
import AgentDashboard from "./pages/agent/Dashboard.jsx";
import AgentOrders from "./pages/agent/Orders.jsx";
import AgentOrderDetail from "./pages/agent/OrderDetail.jsx";
import AgentProfile from "./pages/agent/Profile.jsx";

// navigation links - yeh Layout.jsx mein navItems prop ke roop mein jaate hain
// har role ka alag nav set hai
const customerNav = [
  { to: "/customer", label: "Dashboard" },
  { to: "/customer/orders", label: "My Orders" },
  { to: "/customer/orders/new", label: "Create Order" }
];

const adminNav = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/zones", label: "Zones" },
  { to: "/admin/rates", label: "Rates" },
  { to: "/admin/cod", label: "COD" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/agents", label: "Agents" }
];

const agentNav = [
  { to: "/agent", label: "Dashboard" },
  { to: "/agent/profile", label: "Profile" },
  { to: "/agent/orders", label: "Orders" }
];

// HomeRedirect - "/" pe koi aaye toh role ke hisab se redirect karo
// useAuth context/AuthContext.jsx se - user aur loading state milta hai
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;  // login nahi hai toh login page
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "AGENT") return <Navigate to="/agent" replace />;
  return <Navigate to="/customer" replace />;  // default customer
}

export default function App() {
  return (
    // AuthProvider context/AuthContext.jsx se - yeh sab children ko user/login/logout provide karta hai
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* public routes - koi bhi access kar sakta hai */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* customer routes - sirf CUSTOMER role allowed hai
              ProtectedRoute components/ProtectedRoute.jsx mein hai - role check karta hai
              Layout navItems pe customerNav pass kiya - header mein wahi links dikhenge */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute roles={["CUSTOMER"]}>
                <Layout navItems={customerNav} />
              </ProtectedRoute>
            }
          >
            {/* index = /customer pe directly yeh render hoga */}
            <Route index element={<CustomerDashboard />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/new" element={<CreateOrder />} />
            {/* :id URL se dynamic order ID aata hai - useParams() se milta hai pages mein */}
            <Route path="orders/:id" element={<CustomerOrderDetail />} />
          </Route>

          {/* admin routes - sirf ADMIN role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Layout navItems={adminNav} />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="zones" element={<AdminZones />} />
            <Route path="rates" element={<AdminRateCards />} />
            <Route path="cod" element={<AdminCodSurcharges />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/new" element={<AdminCreateOrder />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="agents" element={<AdminAgents />} />
          </Route>

          {/* agent routes - sirf AGENT role */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute roles={["AGENT"]}>
                <Layout navItems={agentNav} />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentDashboard />} />
            <Route path="profile" element={<AgentProfile />} />
            <Route path="orders" element={<AgentOrders />} />
            <Route path="orders/:id" element={<AgentOrderDetail />} />
          </Route>

          {/* koi bhi unknown path aaye toh "/" pe bhejo - wahan HomeRedirect handle karega */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
