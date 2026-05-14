const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const checkAdmin = require("../middleware/checkAdmin");

const orgController = require("../controllers/orgController");


// 🟢 CREATE ORG
router.post(
  "/create",
  auth,
  orgController.createOrg
);


// 🟢 MY ORGS
router.get(
  "/my-orgs",
  auth,
  orgController.getUserOrgs
);


// 🟢 INVITE
router.post(
  "/invite",
  auth,
  checkAdmin,
  orgController.sendInvite
);


// 🟢 GET MEMBERS
router.get(
  "/members",
  auth,
  orgController.getMembers
);

router.get(
  "/activities",
  auth,
  orgController.getActivities
);
module.exports = router;