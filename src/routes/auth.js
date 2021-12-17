const express = require("express");
const authorization = require("../middlewares/authorization");
const {
  register,
  login,
  accountActivation,
  resendAccountActivationLink,
} = require("../controllers/auth");
const runValidation = require("../utils/runValidation");
const { registerValidation, loginValidation } = require("../validations/auth");

const router = express.Router();

// @POST     | Public     | /api/auth/register
router.post("/register", registerValidation, runValidation, register);
// @POST     | Public     | /api/auth/login
router.post("/login", loginValidation, runValidation, login);
// @POST     | Public     | /api/auth/account-activation
router.post("/account-activation", accountActivation);
// @POST     | Private    | /api/auth/account-activation/resend
router.post("/account-activation/resend", authorization, resendAccountActivationLink);

module.exports = router;
