const mongoose = require("mongoose");

// user schema
const UserScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 50,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "https://images227.netlify.app/mernuas/default.jpg",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user", // user -> admin -> superadmin
    },
    resetPasswordLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", UserScheme);

module.exports = User;
