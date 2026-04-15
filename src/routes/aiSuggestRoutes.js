const express = require("express");
const router = express.Router();

const { getAiSuggestion } = require("../controllers/aiSuggestController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:workspaceId", authMiddleware, getAiSuggestion);

module.exports = router;
