const pool = require("../db");

module.exports = async (req, res, next) => {
  const userId = req.user.id;

  // 🔥 handle both cases (safe)
  const orgId =
    req.body.organization_id ||
    req.query.organization_id ||
    req.params.organization_id;

  console.log("USER:", userId);
  console.log("ORG:", orgId);

  try {
    const result = await pool.query(
      "SELECT * FROM memberships WHERE user_id=$1 AND organization_id=$2 AND role='admin'",
      [userId, orgId]
    );

    console.log("DB RESULT:", result.rows);

    if (result.rows.length === 0) {
      return res.status(403).send("Admin only ❌");
    }

    next();

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error ❌");
  }
};