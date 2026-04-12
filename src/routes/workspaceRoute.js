const express = require("express");
const router = express.Router();

const {
  createWorkspace,
  addUserInWorkspace,
  getMyAllWorkspace,
  getWorkspaceDetails,
  getWorkspaceUsers,
  deleteWorkspace,
  removeMember,
} = require("../controllers/workSpaceController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("", authMiddleware, createWorkspace);
router.get("", authMiddleware, getMyAllWorkspace);
router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);
router.patch("/:workspaceId/members", authMiddleware, addUserInWorkspace);
router.get("/:workspaceId/members", authMiddleware, getWorkspaceUsers);
router.delete("/:workspaceId", authMiddleware, deleteWorkspace);
router.patch("/:workspaceId/remove-member", authMiddleware, removeMember);

module.exports = router;
