import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { PieChart, Pie, Cell } from "recharts";

function Dashboard() {
  const [orgs, setOrgs] = useState([]);
  const [name, setName] = useState("");
  const [taskStats, setTaskStats] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [activities, setActivities] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  // 🟢 FETCH ORGS
  const fetchOrgs = async () => {
    const res = await API.get("/org/my-orgs");
    setOrgs(res.data);
  };

  // 🟢 FETCH TASK STATS
  const fetchTaskStats = async () => {
    try {
      const orgId = localStorage.getItem("orgId");
      if (!orgId) return;

      const projectsRes = await API.get(
        `/project/all?organization_id=${orgId}`
      );

      let allTasks = [];

      for (let p of projectsRes.data) {
        const taskRes = await API.get(`/task/all?project_id=${p.id}`);
        allTasks = [...allTasks, ...taskRes.data];
      }

      const stats = { todo: 0, inProgress: 0, done: 0 };

      allTasks.forEach((t) => {
        if (t.status === "todo") stats.todo++;
        else if (t.status === "in progress") stats.inProgress++;
        else if (t.status === "done") stats.done++;
      });

      setTaskStats([
        { name: "Done", value: stats.done },
        { name: "In Progress", value: stats.inProgress },
        { name: "Todo", value: stats.todo },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  // 🟢 FETCH ACTIVITIES
  const fetchActivities = async () => {
    try {
      const orgId = localStorage.getItem("orgId");
      if (!orgId) return;

      const res = await API.get(
        `/org/activities?organization_id=${orgId}`
      );
      setActivities(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 🟢 CREATE ORG
  const createOrg = async () => {
    try {
      await API.post("/org/create", { name });
      setName("");
      fetchOrgs();
    } catch (error) {
      alert(error.response?.data || "Error ❌");
    }
  };

  // 🟢 INVITE MEMBER
  const addMember = async () => {
    try {
      const orgId = selectedOrg || localStorage.getItem("orgId");

      if (!orgId) {
        return alert("Select organization first ❌");
      }

      const res = await API.post("/org/invite", {
        email,
        organization_id: orgId,
        role,
      });

      alert("Invite sent ✅");
      console.log(res.data.inviteLink);
    } catch (error) {
      alert(error.response?.data || "Error ❌");
    }
  };

  // 🟢 LOAD DATA
  useEffect(() => {
    fetchOrgs();
    fetchTaskStats();
    fetchActivities();
  }, []);

  return (
    <Layout>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

      {/* Create Org */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 flex gap-3">
        <input
          className="border p-2 rounded w-full"
          placeholder="Organization name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={createOrg}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* Org Cards */}
      <div className="grid grid-cols-3 gap-4">
        {orgs.map((org) => (
          <div
            key={org.id}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-xl transition"
          >
            <h3 className="text-lg font-semibold">{org.name}</h3>

            <button
              className="mt-3 text-blue-500"
              onClick={() => {
                setSelectedOrg(org.id);
                localStorage.setItem("orgId", org.id);
              }}
            >
              Select →
            </button>
          </div>
        ))}
      </div>

      {/* Selected Org Info */}
      {selectedOrg && (
        <p className="mt-4 text-sm text-gray-500">
          Selected Org ID: {selectedOrg}
        </p>
      )}

      {/* Invite Member */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mt-6 flex gap-3">
        <input
          placeholder="User email"
          className="border p-2 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={addMember}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Invite
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="font-bold mb-4">Activity Timeline</h3>

        {activities.length === 0 ? (
          <p>No activity yet</p>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="border-b py-2 text-sm">
              🟢 {a.message}
              <div className="text-gray-400 text-xs">
                {new Date(a.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Stats */}
      <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="font-bold mb-4">Task Overview</h3>

        <PieChart width={300} height={300}>
          <Pie data={taskStats} dataKey="value" outerRadius={100}>
            <Cell fill="#22c55e" />
            <Cell fill="#facc15" />
            <Cell fill="#ef4444" />
          </Pie>
        </PieChart>
      </div>
    </Layout>
  );
}

export default Dashboard;