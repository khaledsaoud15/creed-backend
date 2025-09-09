const { getUserProfile } = require("../controllers/user.controller");
const { authenticateJWT } = require("../middlewares/token");

const router = require("express").Router();

router.get("/fetch/me", authenticateJWT, getUserProfile);

module.exports = router;
