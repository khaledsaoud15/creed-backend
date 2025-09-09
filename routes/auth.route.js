const {
  register,
  login,
  verifyOTP,
} = require("../controllers/auth.controller");
const validateSchema = require("../middlewares/joi.validate");
const userValidationSchema = require("../validation/user.validation");
const passport = require("passport");

const jwt = require("jsonwebtoken");

const router = require("express").Router();
const callback =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL_PRD
    : process.env.FRONTEND_URL_DEV;

router.post("/register", validateSchema(userValidationSchema), register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.displayName || user.username,
    },
    process.env.JWT_SECRET
  );
};

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = createToken(req.user);

    //HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(callback);
  }
);

module.exports = router;
