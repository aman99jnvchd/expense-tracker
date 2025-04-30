import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserToken } from "../services/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = "Login | Expense Tracker";
  }, []);
  
  useEffect(() => {
    const storedMessage = sessionStorage.getItem("registrationMessage");

    if (storedMessage) {
      setMessage(storedMessage);
      sessionStorage.removeItem("registrationMessage");
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!username || !password) {
      setError("Please enter username and password");
    } else {
      try {
        const access_token = await getUserToken({ username, password });
        login(access_token);
      } catch (err: any) {
        if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else if (typeof err.response?.data === "string") {
          setError(err.response.data);
        } else {
          setError("Something went wrong. Retry");
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-[30px] py-[15px] shadow-[1px_1px_5px_#0e0e0e] bg-[#202020]">
      <div>
        <h2 className="text-center">Expense Tracker</h2>
        <form onSubmit={handleSubmit}>
          
          {message &&
          <div className="flex flex-col justify-center mb-[10px]">
            <label className="mr-[10px] mb-[3px] text-[#28a745]">{message}</label>
          </div>
          }
          
          <div className="flex flex-col justify-center mb-[10px]">
            <label className="mr-[10px] mb-[3px]">Username</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-w-[200px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-center mb-[10px]">
            <label className="mr-[10px] mb-[3px]">Password</label>
            <div className="flex flex-row items-center justify-start">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="rounded-[4px] font-normal px-[10px] py-[5px] ml-[5px] focus:outline-none focus-visible:outline-none">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-center mb-[10px]">
            <label className="text-[#dc3545]">{error}</label>
          </div>

          <button type="submit" className="w-full rounded-[4px] hover:bg-indigo-700 transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#646cff] focus-visible:border-[#646cff]">
            Sign In
          </button>
        </form>

        <p className="text-sm text-center">
          Don't have an account?
          <Link to="/register" className="text-indigo-600 hover:underline cursor-pointer"> Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
