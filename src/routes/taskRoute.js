const express = require("express");
const router = express.Router();

const {
  getTask,
  createTask,
  deleteTask,
  updateStatus,
  getCategoryList,
} = require("../controllers/taskController");

const { getAiSuggestion } = require("../controllers/aiSuggestController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getTask);
router.post("/", authMiddleware, createTask);
router.delete("/:id", authMiddleware, deleteTask);
router.put("/:id", authMiddleware, updateStatus);
router.get("/categorylist", authMiddleware, getCategoryList);
router.post("/ai-suggest", authMiddleware, getAiSuggestion);
module.exports = router;
