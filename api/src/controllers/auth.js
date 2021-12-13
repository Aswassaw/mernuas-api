const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Token = require("../models/Token");

// @POST     | /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if email already exist
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Email already exist", param: "email" }] });
    }

    // create new user instance
    const newUser = new User({
      name,
      email,
      password,
    });

    // create password encript using bcrypt
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // create new token instance
    const token = crypto.randomBytes(30).toString("hex");
    const newToken = new Token({
      token,
      email: newUser.email,
      type: "Verify Account",
    });

    // save new user and token to db
    await newUser.save();
    await newToken.save();

    res.json({ msg: "Register success! Please login." });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

module.exports = { register };
