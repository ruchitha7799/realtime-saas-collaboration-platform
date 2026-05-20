const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");

// 🟢 CREATE TASK
exports.createTask = async (req, res) => {
  const {
    title,
    project_id,
    assigned_to,
    priority,
    due_date,
  } = req.body;

  try {
    const parsedProjectId = parseInt(project_id, 10);
    const parsedAssignedTo = assigned_to ? parseInt(assigned_to, 10) : null;

    const task = await pool.query(
      `
      INSERT INTO tasks
      (
        title,
        project_id,
        assigned_to,
        priority,
        due_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        title,
        parsedProjectId,
        parsedAssignedTo,
        priority || "low",
        due_date,
      ]
    );

    const newTask = task.rows[0];

    // 🔥 realtime
    const io = req.app.get("io");

    io.to(project_id.toString())
      .emit("taskUpdated");

    // 🔔 notification
    if (parsedAssignedTo) {
      await pool.query(
        `
        INSERT INTO notifications
        (user_id, message)
        VALUES ($1, $2)
        `,
        [
          parsedAssignedTo,
          `New task assigned: ${title}`,
        ]
      );
    }

    io.emit("notification", {
      message: `New task assigned: ${title}`
    });

    res.json(newTask);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating task ❌");
  }
};

// 🟢 GET TASKS
exports.getTasks = async (req, res) => {
  const { project_id } = req.query;
  const parsedProjectId = project_id ? parseInt(project_id, 10) : null;
  if (!parsedProjectId) {
  return res.json([]);
}

  try {
    const tasks = await pool.query(
      `
      SELECT
        tasks.*,
        users.name AS assigned_name,
        users.avatar AS assigned_avatar
      FROM tasks
      LEFT JOIN users
      ON tasks.assigned_to = users.id
      WHERE project_id=$1
      ORDER BY tasks.id DESC
      `,
      [parsedProjectId]
    );

    res.json(tasks.rows);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching tasks ❌");
  }
};



// 🟢 UPDATE TASK
exports.updateStatus = async (req, res) => {
  const { task_id, status } = req.body;

  try {
    const updated = await pool.query(
      "UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *",
      [status, task_id]
    );

    const updatedTask = updated.rows[0];
  await logActivity(
  req.user.id,
  updatedTask.project_id,
  `moved task "${updatedTask.title}" to ${status}`
);
    // 🔔 Save notification
    await pool.query(
      "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
      [updatedTask.assigned_to, `Task updated: ${updatedTask.title}`]
    );

    const io = req.app.get("io");

    // 🔥 Emit update
    io.to(updatedTask.project_id.toString()).emit("taskUpdated");

    // 🔔 Emit notification
    io.to(updatedTask.project_id.toString()).emit("notification", {
      message: `Task updated: ${updatedTask.title}`
    });

    res.json(updatedTask);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating task ❌");
  }
};



// 🟢 DELETE TASK
exports.deleteTask = async (req, res) => {
  const { task_id } = req.body;

  try {
    const deleted = await pool.query(
      "DELETE FROM tasks WHERE id=$1 RETURNING *",
      [task_id]
    );

    const deletedTask = deleted.rows[0];

    await logActivity(
  req.user.id,
  deletedTask.project_id,
  `deleted task "${deletedTask.title}"`
);

    const io = req.app.get("io");

    io.to(deletedTask.project_id.toString()).emit("taskUpdated");

    res.json({ message: "Task deleted ✅" });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting task ❌");
  }
};