const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: "user" });

  const token = signToken({ id: user._id, role: user.role });

  return res.status(201).json({
    message: "Registered successfully",
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  const token = signToken({ id: user._id, role: user.role });

  return res.json({
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};