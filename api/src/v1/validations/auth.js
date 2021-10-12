const { check } = require("express-validator");

// @POST     | /api/v1/auth/register
const registerValidation = [
  check("name", "Name is required").not().isEmpty(),
  check("name", "Name maximum length is 50 characters").isLength({
    max: 50,
  }),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password require 8 or more characters").isLength({
    min: 8,
  }),
];

module.exports = { registerValidation };
