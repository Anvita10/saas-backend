const express = require("express");
const router = express.Router();

const {
  createWorkspace,
  addUserInWorkspace,
  getMyAllWorkspace,
} = require("../controllers/workSpaceController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("", authMiddleware, createWorkspace);
router.get("", authMiddleware, getMyAllWorkspace);
router.post("/:workspaceId/members", authMiddleware, addUserInWorkspace);

module.exports = router;
