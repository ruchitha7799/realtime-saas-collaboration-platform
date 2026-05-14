const express = require("express");

const router = express.Router();

const auth =
  require("../middleware/authMiddleware");

const upload =
  require("../middleware/upload");

const attachmentController =
  require("../controllers/attachmentController");


// 🟢 UPLOAD FILE
router.post(
  "/upload",
  auth,
  upload.single("file"),
  attachmentController.uploadAttachment
);


// 🟢 GET FILES
router.get(
  "/all",
  auth,
  attachmentController.getAttachments
);


module.exports = router;