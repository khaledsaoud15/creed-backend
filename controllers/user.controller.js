const User = require("../models/user.model");
const responseHandler = require("../utils/responseHandler");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return responseHandler(res, 404, { message: "User not found" });
    }
    responseHandler(res, 200, user);
  } catch (error) {
    responseHandler(res, 500, { message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
};
