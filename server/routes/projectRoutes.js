const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/checkAdmin");
const projectController = require("../controllers/projectController");

// ✅ ONLY THIS
router.post("/create", auth, checkAdmin, projectController.createProject);

router.get("/all", auth, projectController.getProjects);

router.delete(
  "/delete",
  auth,
  checkAdmin,
  projectController.deleteProject
);
module.exports = router;