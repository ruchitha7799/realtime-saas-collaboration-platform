const express = require("express");

const router = express.Router();

const auth =
  require("../middleware/authMiddleware");

const commentController =
  require("../controllers/commentController");


// 🟢 ADD COMMENT
router.post(
  "/add",
  auth,
  commentController.addComment
);


// 🟢 GET COMMENTS
router.get(
  "/all",
  auth,
  commentController.getComments
);

module.exports = router;