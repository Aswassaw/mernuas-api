const express = require('express');
const { register, accountActivation } = require('../controllers/auth');
const runValidation = require('../utils/runValidation');
const { registerValidation } = require('../validations/auth');

const router = express.Router();

// @POST     | /api/auth/register
router.post("/register", registerValidation, runValidation, register);
// @POST     | /api/auth/account-activation
router.post("/account-activation", accountActivation);

module.exports = router;
