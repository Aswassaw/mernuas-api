const express = require('express');
const { register } = require('../controllers/auth');
const runValidation = require('../utils/runValidation');
const { registerValidation } = require('../validations/auth');

const router = express.Router();

// @POST     | /api/v1/auth/register
router.post("/register", registerValidation, runValidation, register);

module.exports = router;
