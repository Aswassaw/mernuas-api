require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Token = require("../models/Token");
const activateAccount = require("../utils/email/activateAccount");
const sendEmail = require("../utils/email/sendEmail");

// @POST     | /api/auth/register
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
      type: "Activate Account",
    });

    // save new user and token to db
    await newUser.save();
    await newToken.save();

    // send email for activate account account
    const templateEmail = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to: newUser.email,
      subject: "Activate Your Account!",
      html: activateAccount(
        `${process.env.CLIENT_URL}/auth/activate/${newToken.token}`
      ),
    };
    sendEmail(templateEmail);

    res.json({ msg: "Register success! Please login." });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

// @POST     | /api/auth/register
const accountActivation = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      errors: [{ msg: "No token, Activation denied", param: "token" }],
    });
  }

  try {
    const activationToken = await Token.findOne({ token });

    // check if token exist or not
    if (!activationToken) {
      return res.status(400).json({
        errors: [
          { msg: "Token is not valid, Activation failed", param: "token" },
        ],
      });
    }

    // check if token expired or not
    if (Date.now() - Date.parse(activationToken.createdAt) > 18000000) {
      // 30 minutes
      return res.status(400).json({
        errors: [
          {
            msg: "Token has expired, Activation failed. Try requesting a new token",
            param: "token",
          },
        ],
      });
    }

    // change verified status
    const user = await User.findOne({ email: activationToken.email });
    user.verified = true;
    user.save();

    // delete activation token
    await activationToken.remove();

    res.json({ msg: "Congratulations! Your account has been verified." });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

module.exports = { register, accountActivation };
