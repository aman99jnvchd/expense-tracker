import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired, handleLogout, decodeJWT } from "../utils/authHelper";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

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

    if (timeout >= 60000) {
      setTimeout(() => {
        showExpiryWarning();
      }, timeout - 60000);
    }

    // showExpiryWarning();

    setTimeout(() => {
      handleLogout();
    }, timeout);
  };

  const showExpiryWarning = () => {
    let timerInterval: any;

    MySwal.fire({
      title: "Session Expiring Soon!",
      html: "Logging out in <b></b> seconds.",
      timer: 60000,
      timerProgressBar: true,
      position: "top-start",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      showCloseButton: true,
      willOpen: () => {
        const b = Swal.getHtmlContainer()?.querySelector("b");
        if (b) {
          timerInterval = setInterval(() => {
            if (Swal.getTimerLeft() !== null) {
              b.textContent = `${Math.ceil(Swal.getTimerLeft()! / 1000)}`;
            }
          }, 100);
        }
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    });
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
