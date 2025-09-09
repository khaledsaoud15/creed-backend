const {
  createCart,
  getCart,
  getAllCart,
  removeFromCart,
} = require("../controllers/cart.controller");
const { authenticateJWT, authenticateAdmin } = require("../middlewares/token");

const router = require("express").Router();

router.post("/add", authenticateJWT, createCart);
router.get("/get/:id", authenticateJWT, getCart);
router.get("/get-all", authenticateAdmin, getAllCart);
router.delete("/delete/:id", authenticateJWT, removeFromCart);

module.exports = router;
