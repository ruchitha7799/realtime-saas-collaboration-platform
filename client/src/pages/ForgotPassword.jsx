import { useState } from "react";
import API from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const sendReset = async () => {
    try {
      const res = await API.post(
        "/auth/forgot-password",
        { email }
      );

      alert("Reset link sent to your email ✅");

      console.log(res.data.resetLink);

    } catch (error) {
      alert(error.response?.data || "Error ❌");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">

        <h2 className="text-2xl font-bold mb-6">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter email"
          className="border p-3 rounded w-full mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={sendReset}
          className="bg-blue-500 text-white w-full py-3 rounded"
        >
          Send Reset Link
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;