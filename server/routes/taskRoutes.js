const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");
const checkMembership = require("../middleware/checkMembership");

router.post("/create", auth, taskController.createTask);
router.get("/all", auth, taskController.getTasks);
router.put("/update", auth, taskController.updateStatus);
router.post("/create", auth, checkMembership, taskController.createTask);
module.exports = router;
