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
  PlusCircle
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

        <div className="grid md:grid-cols-3 gap-6">

          {["todo", "in progress", "done"].map(
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

                                <img
                                  src={
                                    t.assigned_avatar ||
                                    "https://i.pravatar.cc/100"
                                  }
                                  className="w-9 h-9 rounded-full object-cover border"
                                />

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

    </Layout>
  );
}

export default Tasks;