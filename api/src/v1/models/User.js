const mongoose = require("mongoose");

const UserScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "default.jpg",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", UserScheme);

module.exports = User;
