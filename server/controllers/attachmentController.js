const pool = require("../db");


// 🟢 UPLOAD ATTACHMENT
exports.uploadAttachment = async (
  req,
  res
) => {

  const { task_id } = req.body;
  if (!task_id) {
    return res.json([]);
  }
  const userId = req.user.id;

  try {

    if (!req.file) {
      return res
        .status(400)
        .send("No file uploaded ❌");
    }

    const fileUrl =
      `http://localhost:5000/uploads/${req.file.filename}`;

    const attachment =
      await pool.query(
        `
        INSERT INTO attachments
        (
          task_id,
          user_id,
          file_url,
          file_name
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          task_id,
          userId,
          fileUrl,
          req.file.originalname
        ]
      );

    // 🔥 realtime
    const io = req.app.get("io");

    io.to(task_id.toString()).emit(
      "attachmentAdded"
    );

    res.json(attachment.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Upload failed ❌"
    );
  }
};



// 🟢 GET ATTACHMENTS
exports.getAttachments = async (
  req,
  res
) => {

  const { task_id } = req.query;

  try {

    const attachments =
      await pool.query(
        `
        SELECT *
        FROM attachments
        WHERE task_id=$1
        ORDER BY created_at DESC
        `,
        [task_id]
      );

    res.json(attachments.rows);

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Error fetching attachments ❌"
    );
  }
};