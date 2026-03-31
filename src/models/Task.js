const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "ToDo",
    },
    category: {
      type: String,
      required: true,
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
