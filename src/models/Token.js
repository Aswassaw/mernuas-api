const mongoose = require("mongoose");

// token schema
const TokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

TokenSchema.set("toJSON", {
  transform: function (doc, obj, options) {
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
  },
});

const Token = mongoose.model("token", TokenSchema);

module.exports = Token;
