// components/Layout.jsx - shared shell hai - header, nav aur main content
// App.jsx mein har role ke Route ke element mein yeh use hota hai
// navItems prop se role-specific navigation links aate hain

import { Link, Outlet, useNavigate } from "react-router-dom";
// useAuth context/AuthContext.jsx se - user info aur logout function
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ navItems }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();             // context/AuthContext.jsx ka logout - token clear karta hai
    navigate("/login");   // logout ke baad login page pe bhejo
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <Link to="/">DelhiveryUS</Link>
          {/* user?.role - optional chaining - agar user null ho toh crash mat karo */}
          <span className="role-pill">{user?.role}</span>
        </div>
        <nav className="app-nav">
          {/* navItems App.jsx se aate hain - customerNav/adminNav/agentNav */}
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <span className="user-name">{user?.name}</span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="app-main">
        {/* Outlet - React Router ka magic - yahan nested child routes render hote hain
            jaise /customer/orders pe MyOrders.jsx yahan aayega */}
        <Outlet />
      </main>
    </div>
  );
}
