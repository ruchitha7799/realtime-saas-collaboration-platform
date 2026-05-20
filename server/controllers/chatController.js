const pool = require("../db");


// 🟢 SEND MESSAGE
exports.sendMessage = async (
  req,
  res
) => {

  const { project_id, message } =
    req.body;

  const userId = req.user.id;

  try {

    const msg = await pool.query(
      `
      INSERT INTO messages
      (
        project_id,
        user_id,
        message
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [
        project_id,
        userId,
        message
      ]
    );

    // 🔥 realtime
    const io = req.app.get("io");

    io.to(project_id.toString()).emit(
      "newMessage"
    );

    res.json(msg.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Error sending message ❌"
    );
  }
};



// 🟢 GET MESSAGES
exports.getMessages = async (
  req,
  res
) => {

  const { project_id } = req.query;
  const parsedProjectId = project_id ? parseInt(project_id, 10) : null;
    if (!parsedProjectId) {
      return res.json([]);
    }

  try {

    const messages =
      await pool.query(
        `
        SELECT
          messages.*,
          users.name,
          users.avatar
        FROM messages
        JOIN users
        ON messages.user_id = users.id
        WHERE project_id=$1
        ORDER BY messages.created_at ASC
        `,
        [parsedProjectId]
      );

    res.json(messages.rows);

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Error fetching messages ❌"
    );
  }
};