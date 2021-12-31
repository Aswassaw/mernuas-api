const express = require("express");
const authorization = require("../middlewares/authorization");
const {
  register,
  login,
  loginWithGoogle,
  accountActivation,
  resendAccountActivationLink,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");
const runValidation = require("../utils/runValidation");
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validations/auth");

const router = express.Router();

// @POST     | Public     | /api/auth/register
router.post("/register", registerValidation, runValidation, register);
// @POST     | Public     | /api/auth/login
router.post("/login", loginValidation, runValidation, login);
// @POST     | Public     | /api/auth/login-with-google
router.post("/login-with-google", loginWithGoogle);
// @POST     | Public     | /api/auth/account-activation
router.post("/account-activation", accountActivation);
// @POST     | Private    | /api/auth/account-activation/resend
router.post(
  "/account-activation/resend",
  authorization,
  resendAccountActivationLink
);
// @POST     | Public     | /api/auth/forgot-password
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  runValidation,
  forgotPassword
);
// @POST     | Public     | /api/auth/forgot-password/reset
router.post(
  "/forgot-password/reset",
  resetPasswordValidation,
  runValidation,
  resetPassword
);

module.exports = router;
