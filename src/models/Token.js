const mongoose = require("mongoose");

// token schema
const TokenScheme = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Token = mongoose.model("token", TokenScheme);

module.exports = Token;
