const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const { success, error } = require("../utils/response");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phoneNo } = await req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNo,
    });
    return success(res, user, 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return error(res, "User do  not exist", 400);
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, "Invalid credentials", 400);
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "2h",
    });

    success(res, { token, username: user.name }, 200);
  } catch (err) {
    next(err);
  }
};
