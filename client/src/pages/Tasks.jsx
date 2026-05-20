import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import TaskCard from "../components/TaskCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import socket from "../services/socket";
import {
  Search,
  Calendar,
  User,
  PlusCircle,
  FileText,
  Download,
  CheckCircle
} from "lucide-react";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("low");
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const projectId = localStorage.getItem("projectId");

  // 🟢 Fetch Tasks
  const fetchTasks = async () => {
    try {
      const res = await API.get(
        `/task/all?project_id=${projectId}`
      );

      setTasks(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  // 🟢 Fetch Members
  const fetchMembers = async () => {
    try {

      const orgId =
        localStorage.getItem("orgId");

      const res = await API.get(
        `/org/members?organization_id=${orgId}`
      );

      setMembers(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  // 🟢 Create Task
  const createTask = async () => {
    try {

      if (!title) {
        return alert("Enter task title ❌");
      }

      await API.post("/task/create", {
        title,
        project_id: projectId,
        assigned_to: assignedTo,
        priority,
        due_date: dueDate,
      });

      setTitle("");
      setPriority("low");
      setAssignedTo("");
      setDueDate("");

      fetchTasks();

    } catch (error) {
      alert(error.response?.data || "Error ❌");
    }
  };

  // 🟢 Drag Drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus =
      result.destination.droppableId;

    try {

      await API.put("/task/update", {
        task_id: taskId,
        status: newStatus,
      });

      fetchTasks();

    } catch (error) {
      console.log(error);
    }
  };

  // 🟢 Update Status
  const updateStatus = async (
    taskId,
    status
  ) => {
    try {

      await API.put("/task/update", {
        task_id: taskId,
        status,
      });

      fetchTasks();

    } catch (error) {
      console.log(error);
    }
  };

  // 🟢 Socket
  useEffect(() => {

    fetchTasks();
    fetchMembers();

    socket.emit("joinProject", projectId);

    socket.on("taskUpdated", () => {
      fetchTasks();
    });

    return () => {
      socket.off("taskUpdated");
    };

  }, []);

  // 🟢 Search
  const filteredTasks = tasks.filter((t) =>
    t.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-3xl font-bold">
          Tasks
        </h2>

      </div>

      {/* Search */}
      <div className="relative mb-6">

        <Search
          className="absolute left-3 top-3 text-gray-400"
          size={18}
        />

        <input
          placeholder="Search tasks..."
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 pl-10 rounded-xl w-full shadow-sm"
        />

      </div>

      {/* Create Task */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg mb-8">

        <h3 className="font-bold text-lg mb-4">
          Create New Task
        </h3>

        <div className="grid md:grid-cols-5 gap-4">

          {/* Title */}
          <input
            className="border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl"
            placeholder="Task title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
            className="border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl"
          >
            <option value="low">
              Low Priority
            </option>

            <option value="medium">
              Medium Priority
            </option>

            <option value="high">
              High Priority
            </option>
          </select>

          {/* Assign Member */}
          <div className="relative">

            <User
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />

            <select
              onChange={(e) =>
                setAssignedTo(e.target.value)
              }
              className="border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 pl-10 rounded-xl w-full"
            >
              <option>
                Assign Member
              </option>

              {members.map((m) => (
                <option
                  key={m.id}
                  value={m.id}
                >
                  {m.name} ({m.role})
                </option>
              ))}
            </select>

          </div>

          {/* Due Date */}
          <div className="relative">

            <Calendar
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />

            <input
              type="date"
              onChange={(e) =>
                setDueDate(e.target.value)
              }
              className="border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 pl-10 rounded-xl w-full"
            />

          </div>

          {/* Button */}
          <button
            onClick={createTask}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-md transition"
          >
            <PlusCircle size={18} />
            Add Task
          </button>

        </div>

      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>

        <div className="grid md:grid-cols-2 gap-6">

          {["todo", "in progress"].map(
            (status) => (

            <Droppable
              droppableId={status}
              key={status}
            >
              {(provided) => (

                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 min-h-[500px] shadow-md"
                >

                  {/* Column Title */}
                  <div className="flex justify-between items-center mb-5">

                    <h3 className="font-bold text-lg capitalize">
                      {status}
                    </h3>

                    <span className="bg-gray-300 dark:bg-gray-700 text-xs px-3 py-1 rounded-full">
                      {
                        filteredTasks.filter(
                          (t) =>
                            t.status === status
                        ).length
                      }
                    </span>

                  </div>

                  {/* Tasks */}
                  {filteredTasks
                    .filter(
                      (t) =>
                        t.status === status
                    )
                    .map((t, index) => (

                      <Draggable
                        key={t.id}
                        draggableId={t.id.toString()}
                        index={index}
                      >
                        {(provided) => (

                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-4"
                          >

                            {/* Task Card */}
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow hover:shadow-xl transition">

                              <TaskCard
                                t={t}
                                updateStatus={updateStatus}
                              />

                              {/* Assigned User */}
                              <div className="flex items-center gap-3 mt-4">

                                {t.assigned_avatar ? (
                                  <img
                                    src={t.assigned_avatar}
                                    alt={t.assigned_name}
                                    className="w-9 h-9 rounded-full object-cover border"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold text-xs border">
                                    {t.assigned_name?.charAt(0).toUpperCase() || "?"}
                                  </div>
                                )}

                                <div>

                                  <p className="text-sm font-semibold">
                                    {
                                      t.assigned_name ||
                                      "Unassigned"
                                    }
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    Due:
                                    {" "}
                                    {
                                      t.due_date ||
                                      "No date"
                                    }
                                  </p>

                                </div>

                              </div>

                            </div>

                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}

                </div>
              )}
            </Droppable>
          ))}

        </div>

      </DragDropContext>

      {/* Completed Tasks Section */}
      {filteredTasks.filter((t) => t.status === "done").length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="text-green-500" size={24} />
            <h2 className="text-2xl font-bold">
              Completed Tasks ({filteredTasks.filter((t) => t.status === "done").length})
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks
              .filter((t) => t.status === "done")
              .map((t) => (
                <CompletedTaskCard key={t.id} task={t} />
              ))}
          </div>
        </div>
      )}

    </Layout>
  );
}

// Completed Task Card Component
function CompletedTaskCard({ task }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttachments();
  }, []);

  const fetchAttachments = async () => {
    try {
      const res = await API.get(
        `/attachment/all?task_id=${task.id}`
      );
      setAttachments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition border-l-4 border-green-500">
      {/* Task Title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg line-through text-gray-500">
            {task.title}
          </h3>
          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded
            ${task.priority === "high" && "bg-red-500 text-white"}
            ${task.priority === "medium" && "bg-yellow-400"}
            ${task.priority === "low" && "bg-green-400"}
          `}>
            {task.priority}
          </span>
        </div>
        <CheckCircle className="text-green-500" size={20} />
      </div>

      {/* Assigned User */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        {task.assigned_avatar ? (
          <img
            src={task.assigned_avatar}
            alt={task.assigned_name}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold text-xs">
            {task.assigned_name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <span className="text-gray-600 dark:text-gray-300">
          {task.assigned_name || "Unassigned"}
        </span>
      </div>

      {/* Due Date */}
      <p className="text-xs text-gray-500 mb-4">
        Due: {task.due_date || "No date"}
      </p>

      {/* Attachments */}
      <div className="border-t dark:border-gray-700 pt-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-blue-500" />
          <span className="font-semibold text-sm">Files ({attachments.length})</span>
        </div>

        {loading ? (
          <p className="text-xs text-gray-500">Loading files...</p>
        ) : attachments.length === 0 ? (
          <p className="text-xs text-gray-500">No files attached</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs"
              >
                <span className="truncate text-gray-700 dark:text-gray-300">
                  {file.file_name}
                </span>
                <button
                  onClick={() =>
                    handleDownload(file.file_url, file.file_name)
                  }
                  className="text-blue-500 hover:text-blue-700 ml-2"
                  title="Download file"
                >
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;