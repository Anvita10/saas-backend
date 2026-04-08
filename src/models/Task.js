const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      default: "ToDo",
      enum: ["Completed", "Pending", "In-Progress", "ToDo", "Rejected"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    category: {
      type: String,
      // required: true,
      enum: [
        "Tech",
        "Fitness",
        "Learning",
        "Productivity",
        "Personal",
        "Fun",
        "Career",
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
