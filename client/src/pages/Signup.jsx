import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";

import API from "../services/api";

function Signup() {

  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");


  // 🟢 Signup
    const signup = async () => {

    try {

        const res = await API.post(
        "/auth/signup",
        {
            name,
            email,
            password
        }
        );

        // 🔥 save token
        localStorage.setItem(
        "token",
        res.data.token
        );

        alert(
        "Account created ✅"
        );

        // go dashboard
        navigate("/dashboard");

    } catch (error) {

        alert(
        error.response?.data ||
        "Signup failed ❌"
        );
    }
    };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">

        {/* Logo */}
        <h1 className="text-4xl font-bold text-center mb-2">
          🚀 SaaS
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Create your account
        </p>

        {/* Name */}
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-6"
        />

        {/* Button */}
        <button
          onClick={signup}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl font-semibold transition"
        >
          Create Account
        </button>

        {/* Login Link */}
        <p className="text-center text-gray-500 mt-6">

          Already have an account?

          <Link
            to="/"
            className="text-blue-500 ml-1"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Signup;