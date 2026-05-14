const express = require("express");

const router = express.Router();

const auth =
  require("../middleware/authMiddleware");

const chatController =
  require("../controllers/chatController");


// 🟢 SEND MESSAGE
router.post(
  "/send",
  auth,
  chatController.sendMessage
);


// 🟢 GET MESSAGES
router.get(
  "/all",
  auth,
  chatController.getMessages
);


module.exports = router;