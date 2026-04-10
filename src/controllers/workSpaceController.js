const { success, error } = require("../utils/response");
const User = require("../models/Users");
const Workspace = require("../models/Workspace");
const Task = require("../models/Task");
const { getWorkspaceAndCheckMember } = require("../utils/workspace");

exports.createWorkspace = async (req, res, next) => {
  const { name, members } = req.body;
  const currentUserId = req.user.id;

  if (!name) return error(res, "Workspace name is required", 400);
  const normalizedName = name.trim();

  try {
    let resolvedMembers = [];
    const workspaceExist = await Workspace.findOne({
      name: normalizedName,
      owner: currentUserId,
    });
    if (workspaceExist)
      return error(res, "Workspace with same name already exist", 400);

    if (members && members.length > 0) {
      for (const val of members) {
        if (!val.email || !val.role) {
          return error(res, "Invalid member object", 400);
        }

        const user = await User.findOne({ email: val.email }).select("_id");
        if (!user) {
          return error(res, `User not found: ${val.email}`, 404);
        }
        resolvedMembers.push({
          userId: user._id,
          role: val.role,
        });
      }
    }

    // To remove the duplicate members
    const allMembers = [
      ...(resolvedMembers || []),
      { userId: currentUserId, role: "owner" },
    ];

    const uniqueMembersMap = new Map();

    for (const m of allMembers) {
      uniqueMembersMap.set(m.userId?.toString(), m);
    }

    const cleanMembers = Array.from(uniqueMembersMap.values());
    const data = await Workspace.create({
      name: normalizedName,
      members: cleanMembers,
      owner: currentUserId,
    });
    return success(res, data, 201);
  } catch (err) {
    next(err);
  }
};

exports.addUserInWorkspace = async (req, res, next) => {
  const { members: newMembers } = req.body;
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

    const hasPermission =
      workspace.owner.toString() === currentUserId ||
      workspace.members.some(
        (val) =>
          val.userId.toString() === currentUserId && val.role !== "member",
      );

    if (!hasPermission) {
      return error(res, "User does not have access to add members", 403);
    }

    let newMemberIds = [];

    if (newMembers && newMembers.length > 0) {
      for (const val of newMembers) {
        if (!val.userId || !val.role) {
          return error(res, "Invalid member object", 400);
        }
        const userId = val.userId.toString();
        const isAlreadyExist = workspace.members.some(
          (x) => x.userId.toString() === userId,
        );
        if (isAlreadyExist || newMemberIds.includes(userId))
          return error(res, `Duplicate ${userId}`, 400);
        newMemberIds.push(userId);
      }
    }

    const isValidUser = await User.find({
      _id: { $in: Array.from(newMemberIds) },
    });
    if (isValidUser.length !== newMemberIds.length)
      return error(res, "The user are not valid", 401);

    const allMembers = [...workspace.members, ...newMembers];

    await Workspace.findByIdAndUpdate(workspaceId, { members: allMembers });

    return success(res, newMembers, 200);
  } catch (err) {
    next(err);
  }
};

exports.getWorkspaceUsers = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const { workspace, error: wsError } = await getWorkspaceAndCheckMember(
      workspaceId,
      userId,
    );

    if (wsError) {
      return error(res, wsError.message, wsError.status);
    }

    const users = workspace.members.map((val) => ({
      id: val.userId._id,
      name: val.userId?.name,
      role: val.role,
    }));

    return success(res, users, 200);
  } catch (err) {
    next(err);
  }
};

exports.getMyAllWorkspace = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await Workspace.find({ "members.userId": userId }).select(
      "name _id members",
    );

    const formattedData = list.map((val) => ({
      id: val._id,
      wsName: val.name,
      role: val.members.find((x) => x.userId.toString() === userId)?.role,
    }));

    return success(res, formattedData, 200);
  } catch (err) {
    next(err);
  }
};

exports.getWorkspaceDetails = async (req, res, next) => {
  const userId = req.user.id;
  const { workspaceId } = req.params;

  try {
    const { workspace, error: wsError } = await getWorkspaceAndCheckMember(
      workspaceId,
      userId,
      { populateMembers: true, populateOwner: true },
    );

    if (wsError) return error(res, wsError.message, wsError.status);

    // getting the task stats for the workspace
    const stats = await Task.aggregate([
      { $match: { workspace: workspaceId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formatedStats = {
      total: 0,
    };

    stats.forEach((item) => {
      formatedStats[item._id] = item.count;
      formatedStats.total += item.count;
    });

    // limiting the task list to be 5 high priority task
    const recentTasks = await Task.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status priority dueDate");

    const finalData = { workspace, formatedStats, recentTasks };
    return success(res, finalData, 200);
  } catch (err) {
    next(err);
  }
};


