const mongoose = require("mongoose");

// user schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 50,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
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
      select: false,
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
    loginWithEmailAndPassword: {
      type: Boolean,
      default: true,
    },
    loginMethod: {
      type: String,
      default: "Email & Password"
    },
    socialId: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: function (doc, obj, options) {
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
  },
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
