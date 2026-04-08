const express = require("express");
const router = express.Router();

const {
  getTask,
  createTask,
  deleteTask,
  updateTask,
  getCategoryList,
} = require("../controllers/taskController");

const { getAiSuggestion } = require("../controllers/aiSuggestController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/workspaces/:workspaceId/tasks", authMiddleware, getTask);
router.post("/workspaces/:workspaceId/tasks", authMiddleware, createTask);
router.delete("/workspaces/:workspaceId/tasks/:taskId", authMiddleware, deleteTask);
router.patch("/workspaces/:workspaceId/tasks/:taskId", authMiddleware, updateTask);
router.get("/categorylist", authMiddleware, getCategoryList);
router.post("/ai-suggest", authMiddleware, getAiSuggestion);
module.exports = router;
