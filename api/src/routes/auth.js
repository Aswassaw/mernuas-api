const express = require("express");
const { register, accountActivation, login } = require("../controllers/auth");
const runValidation = require("../utils/runValidation");
const { registerValidation, loginValidation } = require("../validations/auth");

const router = express.Router();

// @POST     | /api/auth/register
router.post("/register", registerValidation, runValidation, register);
// @POST     | /api/auth/login
router.post("/login", loginValidation, runValidation, login);
// @POST     | /api/auth/account-activation
router.post("/account-activation", accountActivation);

module.exports = router;
