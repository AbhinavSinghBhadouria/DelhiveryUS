// context/AuthContext.jsx - poori app ka authentication state yahan manage hota hai
// jo bhi component user ya login/logout chahiye woh useAuth() hook se le sakta hai

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// api aur setToken api/client.js se - HTTP calls aur localStorage token manage karne ke liye
import { api, setToken } from "../api/client.js";

// context object banao - default null hai, Provider ke baad real value milegi
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // pehle true - jab tak token check na ho jaaye

  // useCallback isliye lagaya taaki loadUser ki reference stable rahe
  // agar reference change hoti toh useEffect baar baar fire hota
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // api.me() api/client.js ka function - /auth/me endpoint call karta hai
      // token valid hai toh user data milega warna error aayega
      const result = await api.me();
      setUser(result.data.user);
    } catch {
      // token expired ya invalid - hata do aur user null karo
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // app mount hote hi ek baar token check karo - page refresh pe bhi session recover hoga
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // login - api/client.js ka api.login call karta hai, token save karta hai
  const login = async (email, password) => {
    const result = await api.login({ email, password });
    setToken(result.data.token);   // api/client.js ka setToken - localStorage mein save
    setUser(result.data.user);
    return result.data.user;       // caller ko user return karo taaki role dekh ke redirect kar sake
  };

  // loginWithToken - verify-email ke baad directly token aur user set karo
  const loginWithToken = (token, userData) => {
    setToken(token);
    setUser(userData);
  };

  // register - sirf API call karta hai; OTP verify hone ke baad loginWithToken se login hoga
  const register = async (form) => {
    const result = await api.register(form);
    return result; // caller (Register.jsx) verify-email page pe redirect karega
  };

  const logout = () => {
    setToken(null);   // localStorage se token hata do
    setUser(null);
  };

  // useMemo - value object har render pe naya na bane - unnecessary re-renders rokta hai
  // yeh object saare children ko milta hai useAuth() ke through
  const value = useMemo(
    () => ({ user, loading, login, loginWithToken, register, logout, refreshUser: loadUser }),
    [user, loading, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth - custom hook, saare components yahi use karte hain
// agar AuthProvider ke bahar use karo toh error throw karta hai - accidental misuse se bachao
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
