const { success, error } = require("../utils/response");
const User = require("../models/Users");
const Workspace = require("../models/Workspace");

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

    // ✅ STEP 1: Clean + validate new members
    let uniqueNewMembers = [];

    if (newMembers && newMembers.length > 0) {
      const uniqueMap = new Map();
      const newMemberIds = new Set();

      for (const val of newMembers) {
        if (!val.userId) {
          return error(res, "Invalid member object", 400);
        }

        const key = val.userId.toString();

        uniqueMap.set(key, val); // removes duplicates
        newMemberIds.add(key);
      }

      const users = await User.find({
        _id: { $in: Array.from(newMemberIds) },
      });

      if (users.length !== newMemberIds.size) {
        return error(res, "Some users do not exist", 404);
      }

      uniqueNewMembers = Array.from(uniqueMap.values());
    }

    // ✅ STEP 2: Remove already existing members
    const existingUserIds = new Set(
      workspace.members.map((val) => val.userId.toString()),
    );

    const filteredNewMembers = uniqueNewMembers.filter(
      (val) => !existingUserIds.has(val.userId.toString()),
    );

    // ✅ FINAL MERGE
    const updatedMembers = [...workspace.members, ...filteredNewMembers];

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { members: updatedMembers },
      { new: true },
    );

    return success(res, updatedWorkspace, 200);
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
