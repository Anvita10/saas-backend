const User = require("../models/Users");

exports.resolveMembers = async (members = [], existingMembers = []) => {
  let resolvedMembers = [];

  for (const member of members) {
    const { email, role } = member;

    if (!email || !role) {
      return { error: { message: "Invalid member object", status: 400 } };
    }

    const user = await User.findOne({ email }).select("_id");

    if (!user) {
      return { error: { message: `User not found: ${email}`, status: 404 } };
    }

    const userId = user._id.toString();

    // already exists in workspace
    const alreadyExists = existingMembers.some(
      (m) => m.userId.toString() === userId,
    );

    if (alreadyExists) {
      return {
        error: { message: `User already in workspace: ${email}`, status: 400 },
      };
    }

    // duplicate in same request
    const duplicateInRequest = resolvedMembers.some(
      (m) => m.userId.toString() === userId,
    );

    if (duplicateInRequest) {
      return {
        error: { message: `Duplicate in request: ${email}`, status: 400 },
      };
    }

    resolvedMembers.push({
      userId,
      role,
    });
  }

  return { resolvedMembers };
};
