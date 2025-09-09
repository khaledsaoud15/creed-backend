const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const responseHandler = require("../utils/responseHandler");
const Crypto = require("crypto-js");
const { generateOtp } = require("../utils/otp");
const { sendEmail } = require("../utils/mailer");
const renderTemplate = require("../utils/emailTemplates");

const register = async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return responseHandler(res, 400, "User already exists");
  }

  const hashedPassword = Crypto.AES.encrypt(
    password,
    process.env.PSW_SECRET
  ).toString();

  const newUser = new User({ username, email, password: hashedPassword });

  const otp = generateOtp();
  const hashedOtp = Crypto.SHA256(otp).toString();
  newUser.otp = hashedOtp;
  newUser.expiredOtp = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  await newUser.save();

  const otpTemplate = renderTemplate("otp", { otp });

  await sendEmail(email, "Verify Your Account", otpTemplate).catch((err) =>
    console.log(err)
  );

  return responseHandler(res, 201, newUser);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return responseHandler(res, 400, "Invalid credentials");
  }

  const decryptedPassword = Crypto.AES.decrypt(
    user.password,
    process.env.PSW_SECRET
  ).toString(Crypto.enc.Utf8);

  if (decryptedPassword !== password) {
    return responseHandler(res, 400, "Invalid credentials");
  }

  const payload = {
    id: user._id,
    role: user.role,
    username: user.username || user.displayName,
    email: user.email,
  };

  res.cookie("token", jwt.sign(payload, process.env.JWT_SECRET), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return responseHandler(res, 200, user);
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return responseHandler(res, 400, "Invalid OTP");
  }

  const hashedOtp = Crypto.SHA256(otp).toString();

  if (user.otp !== hashedOtp || Date.now() > user.expiredOtp) {
    return responseHandler(res, 400, "Invalid or Expired OTP");
  }

  user.isVerifiedOTP = true;
  user.otp = null;
  user.expiredOtp = null;
  await user.save();

  return responseHandler(res, 200, "OTP verified successfully");
};

module.exports = {
  register,
  login,
  verifyOTP,
};
