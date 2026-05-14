const pool = require("../db");
const crypto = require("crypto");
const { logActivity } = require("../utils/activityLogger");
const { sendEmail } = require("../utils/sendEmail");
// 🟢 CREATE ORGANIZATION
exports.createOrg = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const org = await pool.query(
      "INSERT INTO organizations (name, owner_id) VALUES ($1, $2) RETURNING *",
      [name, userId]
    );

    const orgId = org.rows[0].id;

    await pool.query(
      "INSERT INTO memberships (user_id, organization_id, role) VALUES ($1, $2, $3)",
      [userId, orgId, "admin"]
    );

    // ✅ Activity log
    await logActivity(userId, orgId, `created organization "${name}"`);

    res.json(org.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating organization ❌");
  }
};

// 🟢 GET USER ORGANIZATIONS
exports.getUserOrgs = async (req, res) => {
  const userId = req.user.id;

  try {
    const orgs = await pool.query(
      `SELECT o.* FROM organizations o
       JOIN memberships m ON o.id = m.organization_id
       WHERE m.user_id = $1`,
      [userId]
    );

    res.json(orgs.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching organizations ❌");
  }
};

// 🟢 ADD MEMBER
exports.addMember = async (req, res) => {
  const { email, organization_id, role } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).send("User not found ❌");
    }

    const userId = user.rows[0].id;

    await pool.query(
      "INSERT INTO memberships (user_id, organization_id, role) VALUES ($1, $2, $3)",
      [userId, organization_id, role || "member"]
    );

    res.send("Member added ✅");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding member ❌");
  }
};



// 🟢 SEND INVITE
exports.sendInvite = async (req, res) => {
  const { email, organization_id, role } = req.body;

  try {
    const token = crypto.randomBytes(20).toString("hex");

    await pool.query(
      "INSERT INTO invitations (email, organization_id, role, token) VALUES ($1, $2, $3, $4)",
      [email, organization_id, role || "member", token]
    );

    const inviteLink = `http://localhost:5173/accept-invite/${token}`;

    // ✅ Activity log
    await logActivity(
      req.user.id,
      organization_id,
      `invited ${email} as ${role || "member"}`
    );
    await sendEmail(
      email,
      "Organization Invite",
      `
        <h2>You are invited 🚀</h2>
        <p>Click below to join organization:</p>

        <a href="${inviteLink}">
          Join Organization
        </a>
      `
    );

        res.json({ message: "Invite sent ✅", inviteLink });
      } catch (error) {
        console.error(error);
        res.status(500).send("Error sending invite ❌");
      }
    };

// 🟢 ACCEPT INVITE
exports.acceptInvite = async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;

  try {
    const invite = await pool.query(
      "SELECT * FROM invitations WHERE token=$1 AND status='pending'",
      [token]
    );

    if (invite.rows.length === 0) {
      return res.status(400).send("Invalid invite ❌");
    }

    const data = invite.rows[0];

    await pool.query(
      "INSERT INTO memberships (user_id, organization_id, role) VALUES ($1, $2, $3)",
      [userId, data.organization_id, data.role]
    );

    await pool.query(
      "UPDATE invitations SET status='accepted' WHERE id=$1",
      [data.id]
    );

    // ✅ Activity log
    await logActivity(
      userId,
      data.organization_id,
      `joined organization`
    );

    res.send("Joined organization ✅");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error accepting invite ❌");
  }
};

// 🟢 GET ACTIVITIES
exports.getActivities = async (req, res) => {
  const { organization_id } = req.query;

  try {

    const activities = await pool.query(
      `
      SELECT *
      FROM activities
      WHERE organization_id=$1
      ORDER BY created_at DESC
      `,
      [organization_id]
    );

    res.json(activities.rows);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching activities ❌");
  }
};

exports.getMembers = async (req, res) => {
  const { organization_id } = req.query;

  try {

    const members = await pool.query(
      `
      SELECT
        users.id,
        users.name,
        users.email,
        users.avatar,
        memberships.role
      FROM memberships
      JOIN users
      ON memberships.user_id = users.id
      WHERE memberships.organization_id=$1
      `,
      [organization_id]
    );

    res.json(members.rows);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching members ❌");
  }
};