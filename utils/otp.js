const crypto = require("crypto");

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const verifyOtp = (inputOtp, generatedOtp) => {
  return inputOtp === generatedOtp;
};

module.exports = {
  generateOtp,
  verifyOtp,
};
