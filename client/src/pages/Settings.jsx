import { useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);

  const updateProfile = async () => {
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      await API.put(
        "/user/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Profile updated ✅");

    } catch (error) {
      alert(error.response?.data || "Error ❌");
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        
        <h2 className="text-2xl font-bold mb-6">
          Profile Settings
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="New name"
            className="w-full border p-3 rounded"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="New email"
            className="w-full border p-3 rounded"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) =>
              setAvatar(e.target.files[0])
            }
            className="w-full"
          />

          <button
            onClick={updateProfile}
            className="bg-blue-500 text-white px-5 py-3 rounded w-full"
          >
            Update Profile
          </button>

        </div>
      </div>
    </Layout>
  );
}

export default Settings;