require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Token = require("../models/Token");
const activateAccount = require("../utils/email/activateAccount");
const sendEmail = require("../utils/email/sendEmail");

// @POST     | Public     | /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // check if email already exist
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ errors: [{ msg: "Email already exist", param: "email" }] });
    }

    // create new user instance
    const newUser = new User({
      name,
      slug:
        name.trim().toLowerCase().split(" ").join("-") + "-" +
        crypto.randomBytes(6).toString("hex"),
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

    // send jsonwebtoken
    jwt.sign(
      {
        user: {
          id: newUser.id,
        },
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 18000, // will expired after 5 hours
      },
      (err, token) => {
        if (err) throw err;

        res.json({ token });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

// @POST     | Public     | /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    // check if email exist or not
    if (!user) {
      return res.status(401).json({
        errors: [{ msg: "Email or Password is wrong" }],
      });
    }

    // check if password correct or not
    const passwordIsMatch = await bcrypt.compare(password, user.password);
    if (!passwordIsMatch)
      return res.status(401).json({
        errors: [{ msg: "Email or Password is wrong" }],
      });

    // send jsonwebtoken
    jwt.sign(
      {
        user: {
          id: user.id,
        },
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 18000, // will expired after 5 hours
      },
      (err, token) => {
        if (err) throw err;

        res.json({ token });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

// @POST     | Private    | /api/auth/account-activation
const accountActivation = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({
      errors: [{ msg: "No token, Activation denied", param: "token" }],
    });
  }

  try {
    const activationToken = await Token.findOne({ token });

    // check if token exist or not
    if (!activationToken) {
      return res.status(401).json({
        errors: [
          { msg: "Token is not valid, Activation failed", param: "token" },
        ],
      });
    }

    // check if token expired or not
    if (Date.now() - Date.parse(activationToken.createdAt) > 18000000) {
      // 30 minutes
      return res.status(410).json({
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

// @POST     | Private    | /api/auth/account-activation/resend
const resendAccountActivationLink = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(401)
        .json({ errors: [{ msg: "User is not valid, resend token failed" }] });
    }

    // if user already verified
    if (user.verified) {
      return res
        .status(401)
        .json({ errors: [{ msg: "User already verified" }] });
    }

    const token = await Token.findOne({ email: user.email });
    // delete old activation account token
    if (token) await token.remove();

    // save new activation account token to db
    const newToken = new Token({
      token: crypto.randomBytes(30).toString("hex"),
      email: user.email,
      type: "Activate Account",
    });
    await newToken.save();

    // send email for activate account account
    const templateEmail = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Activate Your Account!",
      html: activateAccount(
        `${process.env.CLIENT_URL}/auth/activate/${newToken.token}`
      ),
    };
    sendEmail(templateEmail);

    res.json({ msg: "New token successfully resend, check your email" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

// @POST     | Public     | /api/auth/forgot-password
// @POST     | Public     | /api/auth/forgot-password/resend
// @POST     | Public     | /api/auth/reset-password

module.exports = {
  register,
  login,
  accountActivation,
  resendAccountActivationLink,
};
