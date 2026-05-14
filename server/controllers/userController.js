const pool = require("../db");

// 🟢 UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;

  const { name, email } = req.body;

  try {
    let avatar = null;

    if (req.file) {
      avatar =
        `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updated = await pool.query(
      `
      UPDATE users
      SET
        name=$1,
        email=$2,
        avatar=COALESCE($3, avatar)
      WHERE id=$4
      RETURNING *
      `,
      [name, email, avatar, userId]
    );

    res.json(updated.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating profile ❌");
  }
};