const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    trim: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
  },
  displayName: {
    type: String,
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  otp: {
    type: String,
  },
  isVerifiedOTP: {
    type: Boolean,
    default: false,
  },
  expiredOtp: {
    type: Date,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
