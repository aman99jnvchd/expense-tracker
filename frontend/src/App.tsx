import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ExpensePage from "./pages/ExpensePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} />
      <Route path="/home" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
