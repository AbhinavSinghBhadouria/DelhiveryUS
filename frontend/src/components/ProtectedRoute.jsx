// components/ProtectedRoute.jsx - route level guard hai
// App.jsx mein har role ke routes ke upar wrap kiya gaya hai

import { Navigate } from "react-router-dom";
// useAuth context/AuthContext.jsx se - user aur loading state milta hai
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // token verify ho raha hai - wait karo, abhi redirect mat karo
  if (loading) {
    return <div className="page-center">Loading...</div>;
  }

  // user nahi hai matlab logged in nahi - login page pe bhejo
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // user logged in hai but wrong role - apne dashboard pe bhejo
  // jaise AGENT /customer access karne ki koshish kare toh /agent pe redirect karo
  if (roles && !roles.includes(user.role)) {
    const home = user.role === "ADMIN" ? "/admin" : user.role === "AGENT" ? "/agent" : "/customer";
    return <Navigate to={home} replace />;
  }

  // sab theek hai - actual page render karo
  return children;
}
