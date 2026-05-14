const pool = require("../db");

module.exports = async (req, res, next) => {
  const userId = req.user.id;
  const { organization_id } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM memberships WHERE user_id=$1 AND organization_id=$2",
      [userId, organization_id]
    );

    if (result.rows.length === 0) {
      return res.send("Access denied ❌");
    }

    next();
  } catch (error) {
    console.error(error);
    res.send("Membership check error ❌");
  }
};