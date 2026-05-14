const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");
router.put(
  "/update",
  auth,
  upload.single("avatar"),
  userController.updateProfile
);
module.exports = router;