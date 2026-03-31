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

router.get("/", getTask);
router.post("/", createTask);
router.delete("/:id", deleteTask);
router.put("/:id", updateStatus);
router.get("/categorylist", getCategoryList);
router.post("/ai-suggest", getAiSuggestion);
module.exports = router;
