const Workspace=require("../models/Workspace")

exports.getWorkspaceAndCheckMember=async(workspaceId,userId)=>{
  const workspace=await Workspace.findById(workspaceId)
  if (!workspace) {
    return { error: { status: 404, message: "Workspace not found" } };
  }

  const isMember = workspace.members.some(
    val => val.userId?.toString() === userId
  );

  if (!isMember) {
    return { error: { status: 403, message: "Not a workspace member" } };
  }

  return {workspace}
}