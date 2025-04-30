import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addNewUser } from "../services/api";

const Register = () => {
  const [enroll, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register | Expense Tracker";
  }, []);

  const handleChange = (e: any) => {
    setForm({
      ...enroll,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (Object.values(enroll).some(value => !value)) {
      setError("All fields are required");
    } else {
      try {
        await addNewUser(enroll);
        setError("");
        sessionStorage.setItem("registrationMessage", "Registration successful! You can now log in.");
        navigate("/login");
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
          <div className="flex flex-col justify-center mb-[10px]">
            <label className="mr-[10px] mb-[3px]">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={enroll.username}
              onChange={handleChange}
              className="min-w-[250px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-center mb-[10px]">
            <label className="mr-[10px] mb-[3px]">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={enroll.email}
              onChange={handleChange}
              className="min-w-[250px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-center mb-[10px]">
            <label className="mr-[10px] mb-[3px]">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={enroll.password}
              onChange={handleChange}
              className="min-w-[250px] px-[10px] py-[7px] text-[darkgray] bg-[#1c1c1c] border border-[#808080] rounded-[2px] focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-center mb-[10px]">
            <label className="text-[#dc3545]">{error}</label>
          </div>

          <button type="submit" className="w-full rounded-[4px] hover:bg-indigo-700 transition duration-300 focus:outline-none focus-visible:outline-none focus:border-[#646cff] focus-visible:border-[#646cff]">
            Register
          </button>
        </form>

        <p className="text-sm text-center">
          Already have an account?
          <Link to="/login" className="text-indigo-600 hover:underline cursor-pointer"> Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
