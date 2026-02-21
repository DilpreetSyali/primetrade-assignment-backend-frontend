const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  const task = await Task.create({ ...req.body, owner: req.user.id });
  return res.status(201).json({ message: "Task created", task });
};

exports.getMyTasks = async (req, res) => {
  const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
  return res.json({ tasks });
};

exports.updateMyTask = async (req, res) => {
  const { id } = req.params;

  const task = await Task.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    req.body,
    { new: true }
  );

  if (!task) return res.status(404).json({ message: "Task not found" });
  return res.json({ message: "Task updated", task });
};

exports.deleteMyTask = async (req, res) => {
  const { id } = req.params;

  const task = await Task.findOneAndDelete({ _id: id, owner: req.user.id });

  if (!task) return res.status(404).json({ message: "Task not found" });
  return res.json({ message: "Task deleted" });
};

exports.adminGetAllTasks = async (req, res) => {
  const tasks = await Task.find()
    .populate("owner", "name email role")
    .sort({ createdAt: -1 });

  return res.json({ tasks });
};