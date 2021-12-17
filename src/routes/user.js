const express = require("express");
const authorization = require("../middlewares/authorization");
const { getCurrentUser } = require("../controllers/user");

const router = express.Router();

// @GET     | Private     | /api/user/me
router.get("/me", authorization, getCurrentUser);

module.exports = router;
