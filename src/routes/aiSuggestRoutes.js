const express = require("express");
const router = express.Router();

const {
  getAiSuggestion,
  getAiComparison,
} = require("../controllers/aiSuggestController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:workspaceId", authMiddleware, getAiSuggestion);
router.get("/:workspaceId/comparison", authMiddleware, getAiComparison);

module.exports = router;
