import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";
import TeamChat from "../components/TeamChat";
function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const orgId = localStorage.getItem("orgId");

  const fetchProjects = async () => {
    const res = await API.get(`/project/all?organization_id=${orgId}`);
    setProjects(res.data);
  };

  const createProject = async () => {
    try {
      await API.post("/project/create", {
        name,
        organization_id: orgId,
      });
      setName("");
      fetchProjects();
    } catch (error) {
      alert(error.response?.data || "Error ❌");
    }
  };
  const deleteProject = async (projectId) => {

    const confirmDelete =
      window.confirm(
        "Delete this project?"
      );

    if (!confirmDelete) return;

    try {

      await API.delete(
        "/project/delete",
        {
          data: {
            project_id: projectId,
            organization_id:
              localStorage.getItem("orgId"),
          },
        }
      );

      fetchProjects();

    } catch (error) {
      alert(
        error.response?.data ||
        "Error ❌"
      );
    }
  };
  useEffect(() => {

    fetchProjects();

    // 🔥 realtime delete update
    socket.on("projectDeleted", () => {
      fetchProjects();
    });

    return () => {
      socket.off("projectDeleted");
    };

  }, []);
  return (
    <Layout>
      <h2 className="text-3xl font-bold mb-6">Projects</h2>

      <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-3">
        <input
          className="border p-2 rounded w-full"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={createProject}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-xl shadow hover:shadow-xl"
          >
            <h3 className="font-semibold text-lg">{p.name}</h3>

            <button
              className="mt-2 text-blue-500"
              onClick={() => {
                localStorage.setItem("projectId", p.id);
                navigate("/tasks");
              }}
            >
              Open Tasks
            </button>
            <div>
            <button
              onClick={() => deleteProject(p.id)}
              className="mt-3 text-red-500 text-sm background-red-100 px-2 py-1 rounded bg-black/5 "
            >
              Delete
            </button>
            </div>
          </div>
        ))}

      </div>
      <div className="mt-8">
        <TeamChat />
      </div>
    </Layout>
  );
}

export default Projects;