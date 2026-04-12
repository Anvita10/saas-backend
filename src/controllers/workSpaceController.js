const { success, error } = require("../utils/response");
const User = require("../models/Users");
const Workspace = require("../models/Workspace");
const Task = require("../models/Task");
const { getWorkspaceAndCheckMember } = require("../utils/workspace");
const mongoose = require("mongoose");

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

    // 🔐 permission check
    const hasPermission =
      workspace.owner.toString() === currentUserId ||
      workspace.members.some(
        (val) =>
          val.userId.toString() === currentUserId && val.role === "admin",
      );

    if (!hasPermission) {
      return error(res, "User does not have access to add members", 403);
    }

    let resolvedMembers = [];

    if (!newMembers || newMembers.length === 0) {
      return error(res, "No members provided", 400);
    }

    for (const member of newMembers) {
      const { email, role } = member;

      if (!email || !role) {
        return error(res, "Invalid member object", 400);
      }

      // 🔍 find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return error(res, `User not found: ${email}`, 404);
      }

      const userId = user._id.toString();

      // ❌ duplicate check (existing workspace members)
      const alreadyExists = workspace.members.some(
        (m) => m.userId.toString() === userId,
      );

      if (alreadyExists) {
        return error(res, `User already in workspace: ${email}`, 400);
      }

      // ❌ duplicate in same request
      const duplicateInRequest = resolvedMembers.some(
        (m) => m.userId === userId,
      );

      if (duplicateInRequest) {
        return error(res, `Duplicate in request: ${email}`, 400);
      }

      resolvedMembers.push({
        userId,
        role,
      });
    }

    // ✅ merge properly
    const updatedMembers = [...workspace.members, ...resolvedMembers];

    await Workspace.findByIdAndUpdate(workspaceId, {
      members: updatedMembers,
    });

    return success(res, resolvedMembers, 200);
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
      { populateMembers: true },
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
      memberCount: val.members.length,
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
      { $match: { workspace: new mongoose.Types.ObjectId(workspaceId) } },
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

exports.deleteWorkspace = async (req, res, next) => {
  const userId = req.user.id;
  const { workspaceId } = req.params;

  try {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return error(res, "Workspace not found", 404);
    }

    const isOwner = workspace.owner.toString() === userId;

    if (!isOwner) {
      return error(res, "You are not allowed to delete this workspace", 403);
    }

    await Task.deleteMany({ workspace: workspaceId });
    await Workspace.findByIdAndDelete(workspaceId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  const userId = req.user.id;
  const { workspaceId } = req.params;
  const { userId: deleteId } = req.body;

  try {
    const { workspace, error: wsError } = await getWorkspaceAndCheckMember(
      workspaceId,
      userId,
    );

    if (wsError) return error(res, wsError.message, wsError.status);

    if (userId !== workspace.owner.toString())
      return error(res, "You are not authorized to delete members", 403);
    if (deleteId === workspace.owner.toString())
      return error(res, "Owner cannot be removed", 403);

    const isMember = workspace.members.some(
      (val) => val.userId.toString() === deleteId,
    );

    if (!isMember) return error(res, "No such member exist", 400);

    // remove member from workspace
    workspace.members = workspace.members.filter(
      (val) => val.userId.toString() !== deleteId,
    );
    await workspace.save();

    await Task.updateMany({ assignedTo: deleteId }, { assignedTo: userId });
    await Task.updateMany({ assignedBy: deleteId }, { assignedBy: userId });
    return success(res, workspace, 200);
  } catch (err) {
    next(err);
  }
};

