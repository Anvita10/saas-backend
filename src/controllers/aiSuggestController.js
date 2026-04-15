const Task = require("../models/Task");
const { success, error } = require("../utils/response");
const { deriveStats, generateInsights } = require("../utils/analytics");
const { getWorkspaceAndCheckMember } = require("../utils/workspace");

exports.getAiSuggestion = async (req, res, next) => {
  const currentUserId = req.user.id;
  const { workspaceId } = req.params;

  try {
    const { workspace, error: wsError } = await getWorkspaceAndCheckMember(
      workspaceId,
      currentUserId,
    );

    if (wsError) {
      return error(res, wsError.message, wsError.status);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tasks = await Task.find({
      workspace: workspaceId,
      createdAt: { $gte: sevenDaysAgo },
    });

    const analytics = deriveStats(tasks);
    const insights = generateInsights(analytics);

    return success(
      res,
      { analytics, insights },
      200,
      "Analysis generated successfully",
    );
  } catch (err) {
    next(err);
  }
};
