const Task = require("../models/Task");

const category = [
  "Tech",
  "Fitness",
  "Learning",
  "Productivity",
  "Personal",
  "Fun",
  "Career",
];

exports.getTask = async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  const { status } = req.body;
  try {
    await Task.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryList = (req, res) => {
  res.json({ data: category });
};
