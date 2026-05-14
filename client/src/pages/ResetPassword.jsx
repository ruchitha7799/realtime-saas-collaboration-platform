import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const resetPassword = async () => {
    try {
      await API.put(
        `/auth/reset-password/${token}`,
        { password }
      );

      alert("Password reset successful ✅");

      navigate("/");

    } catch (error) {
      alert(error.response?.data || "Error ❌");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">

        <h2 className="text-2xl font-bold mb-6">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New password"
          className="border p-3 rounded w-full mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={resetPassword}
          className="bg-green-500 text-white w-full py-3 rounded"
        >
          Reset Password
        </button>

      </div>
    </div>
  );
}

export default ResetPassword;