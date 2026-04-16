const Task = require("../models/Task");
const { success, error } = require("../utils/response");
const {
  deriveStats,
  generateInsights,
  generateTrendInsights,
} = require("../utils/analytics");
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

exports.getAiComparison = async (req, res, next) => {
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

    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    const fourteenDaysAgo = new Date();

    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    fourteenDaysAgo.setDate(currentDate.getDate() - 14);

    const tasks = await Task.find({
      workspace: workspaceId,
      createdAt: { $gte: fourteenDaysAgo },
    });

    // split task weekwise
    const week1Tasks = tasks.filter(
      (val) =>
        new Date(val.createdAt) < sevenDaysAgo &&
        new Date(val.createdAt) >= fourteenDaysAgo,
    );

    const week2Tasks = tasks.filter(
      (val) => new Date(val.createdAt) >= sevenDaysAgo,
    );

    const week1Stats = deriveStats(week1Tasks);
    const week2Stats = deriveStats(week2Tasks);
    const trends = generateTrendInsights(week1Stats, week2Stats);

    return success(res, {
      weekly: {
        week1: week1Stats,
        week2: week2Stats,
      },
      trends,
    });
  } catch (err) {
    next(err);
  }
};
