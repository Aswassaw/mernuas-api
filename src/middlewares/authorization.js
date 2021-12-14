require("dotenv").config();
const jwt = require("jsonwebtoken");

const authorization = (req, res, next) => {
  // get token from header
  const token = req.header("x-auth-token");

  // check if token exist or not
  if (!token) {
    return res
      .status(401)
      .json({ errors: [{ msg: "No token, Authorization denied" }] });
  }

  // verify jwt token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // mengisi request dengan hasil decode jwt token
    req.user = decoded.user;

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ errors: [{ msg: "Token is not valid, Authorization failed" }] });
  }
};

module.exports = authorization;
