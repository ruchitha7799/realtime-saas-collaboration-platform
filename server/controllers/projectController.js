const pool = require("../db");

// CREATE PROJECT
exports.createProject = async (req, res) => {
  const { name, organization_id } = req.body;

  try {
    const project = await pool.query(
      "INSERT INTO projects (name, organization_id) VALUES ($1, $2) RETURNING *",
      [name, organization_id]
    );

    res.json(project.rows[0]);
  } catch (error) {
    console.error(error);
    res.send("Error creating project ❌");
  }
};

// GET PROJECTS BY ORGANIZATION
exports.getProjects = async (req, res) => {
  const { organization_id } = req.query;
  if (!organization_id) {
  return res.json([]);
}

  try {
    const projects = await pool.query(
      "SELECT * FROM projects WHERE organization_id=$1",
      [organization_id]
    );

    res.json(projects.rows);
  } catch (error) {
    console.error(error);
    res.send("Error fetching projects ❌");
  }
};

exports.deleteProject = async (req, res) => {
  const { project_id } = req.body;

  try {

    // delete project tasks first
    await pool.query(
      "DELETE FROM tasks WHERE project_id=$1",
      [project_id]
    );

    // delete project
    await pool.query(
      "DELETE FROM projects WHERE id=$1",
      [project_id]
    );

    // 🔥 realtime update
    const io = req.app.get("io");

    io.emit("projectDeleted");

    res.send("Project deleted ✅");

  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting project ❌");
  }
};