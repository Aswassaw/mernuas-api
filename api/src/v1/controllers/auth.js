const { runValidation } = require("../utils/runValidation");

// @POST     | /api/v1/auth/register
const register = async (req, res) => {
  try {
    res.send("Post Register");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

module.exports = { register };
