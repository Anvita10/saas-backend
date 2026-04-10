const Workspace = require("../models/Workspace");

exports.getWorkspaceAndCheckMember = async (
  workspaceId,
  userId,
  options = {},
) => {
  const {
    populateMembers = false,
    populateOwner = false,
    selectFields = null,
  } = options;

  let query = Workspace.findById(workspaceId);

  if (selectFields) {
    query = query.select(selectFields);
  }

  if (populateMembers) {
    query = query.populate("members.userId", "name email");
  }

  if (populateOwner) {
    query = query.populate("owner", "name");
  }

  const workspace = await query;

  if (!workspace) {
    return { error: { status: 404, message: "Workspace not found" } };
  }

  const isMember = workspace.members.some((val) => {
    const memberId = val.userId?._id || val.userId;
    return memberId.toString() === userId;
  });

  if (!isMember) {
    return { error: { status: 403, message: "Not a workspace member" } };
  }

  return { workspace };
};
