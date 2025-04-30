import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired, handleLogout, decodeJWT } from "../utils/authHelper";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        handleLogout();
      } else {
        setToken(savedToken);
        startAutoLogout(savedToken);
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setToken(token);
    startAutoLogout(token);
    navigate("/");
  };

  const logout = () => {
    setToken(null);
    handleLogout();
  };

  const startAutoLogout = (token: string) => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return;

    const expiry = decoded.exp * 1000;
    const timeout = expiry - Date.now();

    setTimeout(() => {
      handleLogout();
    }, timeout);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
