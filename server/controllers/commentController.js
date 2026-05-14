const pool = require("../db");


// 🟢 ADD COMMENT
exports.addComment = async (req, res) => {

  const { task_id, message } = req.body;

  const userId = req.user.id;

  try {

    const comment = await pool.query(
      `
      INSERT INTO comments
      (task_id, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [task_id, userId, message]
    );

    // 🔥 realtime update
    const io = req.app.get("io");

    io.to(task_id.toString()).emit(
      "commentAdded"
    );

    res.json(comment.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).send(
      "Error adding comment ❌"
    );
  }
};


// 🟢 GET COMMENTS
exports.getComments = async (req, res) => {

  const { task_id } = req.query;
  if (!task_id) {
    return res.json([]);
  }

  try {

    const comments = await pool.query(
      `
      SELECT
        comments.*,
        users.name,
        users.avatar
      FROM comments
      JOIN users
      ON comments.user_id = users.id
      WHERE task_id=$1
      ORDER BY comments.created_at ASC
      `,
      [task_id]
    );

    res.json(comments.rows);

  } catch (error) {
    console.error(error);

    res.status(500).send(
      "Error fetching comments ❌"
    );
  }
};