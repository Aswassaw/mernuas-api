require("dotenv").config();
const axios = require("axios");
const superagent = require("superagent"); // axios dan superagent sama saja
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Token = require("../models/Token");
const activateAccountEmail = require("../utils/email/activateAccountEmail");
const resetPasswordEmail = require("../utils/email/resetPasswordEmail");
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
        name.trim().toLowerCase().split(" ").join("-") +
        "-" +
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

    // send email for activate account
    const templateEmail = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to: newUser.email,
      subject: "Activate Your Account!",
      html: activateAccountEmail(
        `${process.env.CLIENT_URL}/activate/${newToken.token}`
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

        res.status(201).json({ token });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

// @POST     | Public     | /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

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
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

// @POST     | Public     | /api/auth/login-with-google
const loginWithGoogle = async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { tokenId } = req.body;
  console.log(tokenId);

  try {
    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email_verified, name, email } = response.payload;

    if (email_verified) {
      const user = await User.findOne({ email });

      // jika user sudah terdaftar
      if (user) {
        // jika user tidak terdaftar dengan email dan password
        if (!user.loginWithEmailAndPassword) {
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
        }

        // jika user terdaftar menggunakan email dan password
        else {
          return res.status(400).json({
            errors: [
              {
                msg: `That Email already registered using another way. Please use Login With ${user.loginMethod} instead.`,
              },
            ],
          });
        }
      }

      // jika user belum terdaftar
      else {
        const password = email + process.env.JWT_SECRET;
        const newUser = new User({
          name,
          slug:
            name.trim().toLowerCase().split(" ").join("-") +
            "-" +
            crypto.randomBytes(6).toString("hex"),
          email,
          password,
          loginWithEmailAndPassword: false,
          loginMethod: "Google",
        });

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

        // send email for activate account
        const templateEmail = {
          from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
          to: newUser.email,
          subject: "Activate Your Account!",
          html: activateAccountEmail(
            `${process.env.CLIENT_URL}/activate/${newToken.token}`
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

            res.status(201).json({ token });
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

// @POST     | Public     | /api/auth/login-with-github
const loginWithGithub = async (req, res) => {
  const { tokenId } = req.body;
  console.log(tokenId);

  try {
    const response = await superagent
      .post("https://github.com/login/oauth/access_token")
      .send({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: tokenId,
      }) // sends a JSON post body
      .set("Accept", "application/json");
    const data = response.body;
    console.log(data);

    // get github data
    const githubData = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: "token " + data.access_token,
      },
    });
    // get github email
    const githubEmail = await axios.get("https://api.github.com/user/emails", {
      headers: {
        Authorization: "token " + data.access_token,
      },
    });

    const user = await User.findOne({ email: githubEmail.data[0].email });

    // jika user sudah terdaftar
    if (user) {
      // jika user tidak terdaftar dengan email dan password
      if (user.loginWithEmailAndPassword) {
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
      }

      // jika user terdaftar menggunakan email dan password
      else {
        return res.status(400).json({
          errors: [
            {
              msg: `That Email already registered using another way. Please use Login With ${user.loginMethod} instead.`,
            },
          ],
        });
      }
    }

    // jika user belum terdaftar
    else {
      const password = githubEmail.data[0].email + process.env.JWT_SECRET;
      const newUser = new User({
        name: githubData.data.name,
        slug:
          githubData.data.name.trim().toLowerCase().split(" ").join("-") +
          "-" +
          crypto.randomBytes(6).toString("hex"),
        email: githubEmail.data[0].email,
        password,
        loginWithEmailAndPassword: false,
        loginMethod: "Github",
      });

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

      // send email for activate account
      const templateEmail = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: newUser.email,
        subject: "Activate Your Account!",
        html: activateAccountEmail(
          `${process.env.CLIENT_URL}/activate/${newToken.token}`
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

          res.status(201).json({ token });
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

// @POST     | Private    | /api/auth/account-activation
const accountActivation = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({
      errors: [{ msg: "No token, Activation denied" }],
    });
  }

  try {
    const activationToken = await Token.findOne({ token });

    // check if token exist or not
    if (!activationToken) {
      return res.status(401).json({
        errors: [
          {
            msg:
              "Link is not valid, Activation failed. Try requesting a new link",
          },
        ],
      });
    }

    // check if token expired or not
    if (Date.now() - Date.parse(activationToken.createdAt) > 18000000) {
      // 30 minutes
      return res.status(410).json({
        errors: [
          {
            msg:
              "Link has expired, Activation failed. Try requesting a new link",
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

    res.json({ msg: "Congratulations! Your account has been verified" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
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
      html: activateAccountEmail(
        `${process.env.CLIENT_URL}/activate/${newToken.token}`
      ),
    };
    sendEmail(templateEmail);

    res.json({ msg: "Verification email successfully resend" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

// @POST     | Public     | /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const email = req.body.email.toLowerCase();

  try {
    const user = await User.findOne({ email });

    // check if email exist or not
    if (!user) {
      return res.json({
        msg: "Reset email successfully sended, please check your email",
      });
    }

    const oldToken = await Token.findOne({ email, type: "Reset Password" });
    // delete old reset password token
    if (oldToken) await oldToken.remove();

    // create new token instance
    const token = crypto.randomBytes(30).toString("hex");
    const newToken = new Token({
      token,
      email,
      type: "Reset Password",
    });

    // save new token to db
    await newToken.save();

    // send email for reset password
    const templateEmail = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Reset Your Password!",
      html: resetPasswordEmail(
        `${process.env.CLIENT_URL}/reset-password/${newToken.token}`
      ),
    };
    sendEmail(templateEmail);

    res.json({
      msg: "Reset email successfully sended, please check your email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

// @POST     | Public     | /api/auth/forgot-password/reset
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(401).json({
      errors: [{ msg: "No token, Reset Password denied" }],
    });
  }

  try {
    const resetToken = await Token.findOne({ token });

    // check if token exist or not
    if (!resetToken) {
      return res.status(401).json({
        errors: [
          {
            msg:
              "Link is not valid, Reset Password failed. Try requesting a new token",
          },
        ],
      });
    }

    // check if token expired or not
    if (Date.now() - Date.parse(resetToken.createdAt) > 18000000) {
      // 30 minutes
      return res.status(410).json({
        errors: [
          {
            msg:
              "Link has expired, Reset Password failed. Try requesting a new token",
          },
        ],
      });
    }

    // reset password
    const user = await User.findOne({ email: resetToken.email });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.save();

    // delete reset token
    await resetToken.remove();

    res.json({ msg: "Congratulations! Your password successfully reset" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

module.exports = {
  register,
  login,
  loginWithGoogle,
  loginWithGithub,
  accountActivation,
  resendAccountActivationLink,
  forgotPassword,
  resetPassword,
};
