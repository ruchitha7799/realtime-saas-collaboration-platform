import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  LogOut,
  Moon,
  Sun,
  Bell
} from "lucide-react";
import { useState, useEffect } from "react";
import socket from "../services/socket";
import { Settings as SettingsIcon } from "lucide-react";
import API from "../services/api";
function Layout({ children }) {
  const navigate = useNavigate();

  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState([]); // ✅ inside
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  // 🌙 Dark mode
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // 🔔 Socket notifications
  useEffect(() => {
  const handleNotification = (data) => {
    setNotifications((prev) => [data, ...prev]);
  };

  socket.on("notification", handleNotification);

  return () => {
    socket.off("notification", handleNotification);
  };
}, []);
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };
  const updateAvatar = async (file) => {
    try {

      const formData = new FormData();

      formData.append("avatar", file);

      await API.put(
        "/user/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // refresh user
      const res = await API.get(
        `/auth/me?organization_id=${localStorage.getItem("orgId")}`
      );

      setUser(res.data);

      alert("Avatar updated ✅");

    } catch (error) {
      console.log(error);
      alert("Error uploading avatar ❌");
    }
  };

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await API.get(
  `/auth/me?organization_id=${localStorage.getItem("orgId")}`
);
      setUser(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  fetchUser();

}, []);
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">

      {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white p-5 flex flex-col justify-between">
        <div
        onClick={() => setShowProfile(!showProfile)}
        className="mb-2 flex items-center gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded-xl transition"
      >
          <img
            src={
              user?.avatar ||
              "https://i.pravatar.cc/100"
            }
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <h2 className="font-bold">
              {user?.name}
            </h2>

            <p className="text-sm text-gray-400 capitalize">
              {user?.role || "Member"}
            </p>
          </div>

        </div>
          {showProfile && (
            <div className="absolute left-72 top-5 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-5 w-72 z-50 border dark:border-gray-700">

              <div className="flex flex-col items-center">

                <img
                  src={
                    user?.avatar ||
                    "https://i.pravatar.cc/100"
                  }
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                />

                <h2 className="font-bold text-xl mt-3 dark:text-white">
                  {user?.name || "User"}
                </h2>

                <p className="text-gray-500 text-sm">
                  {user?.email || "No email"}
                </p>

                <div className="mt-3 bg-blue-500 text-white px-4 py-1 rounded-full text-xs capitalize shadow">
                  {user?.role || "Member"}
                </div>
                <label className="mt-4 w-full">

                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        setAvatarFile(file);
                        updateAvatar(file);
                      }
                    }}
                  />

                  <div className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl text-center cursor-pointer transition">
                    Change Avatar
                  </div>

                </label>

                <button
                  onClick={() => navigate("/settings")}
                  className="mt-5 w-full bg-gray-900 hover:bg-black text-white py-2 rounded-xl transition"
                >
                  Open Settings
                </button>

              </div>

            </div>
          )}
                          
        <div>
          
          <nav className="space-y-4">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 hover:text-gray-300">
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <button onClick={() => navigate("/projects")} className="flex items-center gap-2 hover:text-gray-300">
              <Folder size={18} /> Projects
            </button>

            <button onClick={() => navigate("/tasks")} className="flex items-center gap-2 hover:text-gray-300">
              <CheckSquare size={18} /> Tasks
            </button>
          <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 hover:text-gray-300"
            >
              <SettingsIcon size={18} /> Settings
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <button onClick={() => setDark(!dark)} className="flex items-center gap-2">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>

          <button onClick={logout} className="flex items-center gap-2 text-red-400">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
      

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <div className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">

          <h2 className="font-semibold">Workspace</h2>

          {/* 🔔 Notification Bell */}
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)}>
              <Bell />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded">
                  {notifications.length}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 shadow rounded z-10">
                {notifications.length === 0 ? (
                  <p className="p-2 text-sm">No notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="p-2 border-b text-sm">
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        {/* Page Content */}
        <div className="p-6 overflow-auto text-black dark:text-white">
          {children}
        </div>

      </div>
    </div>
  );
}

export default Layout;