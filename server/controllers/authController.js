const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");
// 🟢 SIGNUP
exports.signup = async (req, res) => {

  const {
    name,
    email,
    password
  } = req.body;

  try {

    // check existing user
    const existingUser =
      await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );

    if (
      existingUser.rows.length > 0
    ) {
      return res
        .status(400)
        .send("Email already exists ❌");
    }

    // hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // create user
    const user = await pool.query(
      `
      INSERT INTO users
      (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [
        name,
        email,
        hashedPassword
      ]
    );

    // 🔥 auto login token
    const token = jwt.sign(
      {
        id: user.rows[0].id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user: user.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Signup error ❌"
    );
  }
};


// 🟢 LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).send("User not found ❌");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).send("Invalid password ❌");
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).send("Login error ❌");
  }
};

exports.getMe = async (req, res) => {
  try {

    const orgId = req.query.organization_id;
    if (!orgId) {
      return res.json({
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: "member"
    });

  }

    let role = "member";

    if (orgId) {
      const membership = await pool.query(
        `
        SELECT role
        FROM memberships
        WHERE user_id=$1
        AND organization_id=$2
        `,
        [req.user.id, orgId]
      );

      if (membership.rows.length > 0) {
        role = membership.rows[0].role;
      }
    }

    const user = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        avatar
      FROM users
      WHERE id=$1
      `,
      [req.user.id]
    );

    res.json({
      ...user.rows[0],
      role,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error ❌");
  }
};

// 🟢 FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).send("User not found ❌");
    }

    const token = crypto.randomBytes(20).toString("hex");

    await pool.query(
      "UPDATE users SET reset_token=$1 WHERE email=$2",
      [token, email]
    );

    const resetLink =
      `http://localhost:5173/reset-password/${token}`;

    await sendEmail(
      email,
      "Reset Your Password",
      `
        <h2>Password Reset</h2>

        <p>Click below to reset password:</p>

        <a href="${resetLink}">
          Reset Password
        </a>
      `
    );

    res.json({
      message: "Reset link generated ✅",
      resetLink
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error ❌");
  }
};


// 🟢 RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE reset_token=$1",
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).send("Invalid token ❌");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password=$1, reset_token=NULL WHERE reset_token=$2",
      [hashedPassword, token]
    );

    res.send("Password reset successful ✅");

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error ❌");
  }
};