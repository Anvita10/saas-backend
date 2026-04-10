const express = require("express");
const router = express.Router();

const {
  createWorkspace,
  addUserInWorkspace,
  getMyAllWorkspace,
  getWorkspaceDetails,
} = require("../controllers/workSpaceController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("", authMiddleware, createWorkspace);
router.get("", authMiddleware, getMyAllWorkspace);
router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);
router.patch("/:workspaceId/members", authMiddleware, addUserInWorkspace);

module.exports = router;
