const pool = require("../db");

exports.logActivity = async (userId, orgId, message) => {
  try {
    await pool.query(
      "INSERT INTO activities (user_id, organization_id, message) VALUES ($1, $2, $3)",
      [userId, orgId, message]
    );
  } catch (error) {
    console.error("Activity log error:", error);
  }
};