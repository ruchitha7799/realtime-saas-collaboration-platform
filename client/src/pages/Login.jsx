import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data || "Login failed ❌");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded mb-4"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
        <p
          onClick={() => navigate("/forgot-password")}
          className="text-blue-500 cursor-pointer mt-3"
        >
          Forgot Password?
        </p>
        <p className="text-center text-gray-500 mt-6">

  Don't have an account?

  <Link
    to="/signup"
    className="text-blue-500 ml-1"
  >
    Create Account
  </Link>

</p>
      </div>
    </div>
    
  );
}

export default Login;