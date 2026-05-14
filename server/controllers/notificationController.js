const pool = require("../db");

exports.getNotifications = async (req, res) => {
  const userId = req.user.id;

  const result = await pool.query(
    "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
    [userId]
  );

  res.json(result.rows);
};