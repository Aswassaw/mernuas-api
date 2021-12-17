require("dotenv").config();
const User = require("../models/User");

// @POST     | Public     | /api/user/me
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

module.exports = {
  getCurrentUser,
};
