const Task = require("../models/Task");
const { getWorkspaceAndCheckMember } = require("../utils/workspace");
const { success, error } = require("../utils/response");

exports.getTask = async (req, res, next) => {
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

    //getting the filters
    const { status, assignedTo, dueDate, priority } = req.query;

    //building the filter
    let parsedDate;
    if (dueDate) {
      parsedDate = new Date(dueDate);
      if (isNaN(parsedDate.getTime())) {
        return error(res, "Invalid date format", 400);
      }
    }
    const filter = {
      workspace: workspaceId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedTo && { assignedTo }),
      ...(parsedDate && { dueDate: { $lte: parsedDate } }),
    };

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name")
      .populate("assignedBy", "name");
    return success(res, tasks);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
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

    const { title, description, assignedTo, dueDate, priority } = req.body;

    //validate the inputs
    if (!title) {
      return error(res, "Title is required", 400);
    }

    // check is assiggned to a member of workspace
    if (assignedTo) {
      const isAssignedTo = workspace.members.some(
        (val) => val.userId.toString() === assignedTo.toString(),
      );
      if (!isAssignedTo)
        return error(res, "Assigned user is not part of workspace", 403);
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      assignedBy: userId,
      workspace: workspaceId,
    });
    await task.save();
    return success(res, task, 201, "Task created successfully");
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { workspaceId, taskId } = req.params;
    const userID = req.user.id;

    const { workspace, error: wsError } = await getWorkspaceAndCheckMember(
      workspaceId,
      userID,
    );

    if (wsError) {
      return error(res, wsError.message, wsError.status);
    }

    //validate if the task exist in workspace
    const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
    if (!task) return error(res, "Task Not exist", 404);

    //Validate user access
    const hasPermission =
      workspace.owner.toString() === userID ||
      workspace.members.some(
        (val) => val.userId.toString() === userID && val.role === "admin",
      );
    if (!hasPermission) return error(res, "user do not have access", 403);

    await Task.findByIdAndDelete(taskId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  const { status, assignedTo } = req.body;
  const { workspaceId, taskId } = req.params;
  const userID = req.user.id;

  try {
    const { workspace, error: wsError } = await getWorkspaceAndCheckMember(
      workspaceId,
      userID,
    );

    if (wsError) {
      return error(res, wsError.message, wsError.status);
    }

    //validate if the task exist in workspace
    const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
    if (!task) return error(res, "Task Not exist", 404);

    //validate user permission to update the task
    const hasPermission =
      task.assignedTo?.toString() === userID ||
      workspace.owner.toString() === userID ||
      workspace.members.some(
        (val) => val.userId.toString() === userID && val.role === "admin",
      );
    if (!hasPermission)
      return error(res, "user is not allowed to update the task", 403);

    const update = {};
    if (status) update.status = status;

    //check weather the assigned to member of workspace
    if (assignedTo !== undefined && assignedTo !== null) {
      const isAssignedToMember = workspace.members.some(
        (val) => val.userId.toString() === assignedTo.toString(),
      );
      if (!isAssignedToMember)
        return error(res, "Assigned user is not part of workspace", 400);
      update.assignedTo = assignedTo;
      update.assignedBy = userID;
    }
    const updatedTask = await Task.findByIdAndUpdate(taskId, update, {
      new: true,
      runValidators: true,
    });
    return success(res, updatedTask, 200, "Update is Done");
  } catch (err) {
    next(err);
  }
};
