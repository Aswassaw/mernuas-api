const User = require("../models/User");

const verified = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ errors: [{ msg: "User not found" }] });

    if (!user.verified) {
      return res
        .status(401)
        .json({ errors: [{ msg: "User not yet verified" }] });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

module.exports = verified;
