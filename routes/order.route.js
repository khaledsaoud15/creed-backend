const { getOrders, getUserOrders } = require("../controllers/order.controller");
const { authenticateAdmin, authenticateJWT } = require("../middlewares/token");

const router = require("express").Router();

router.get("/all-orders", authenticateAdmin, getOrders);
router.get("/user-order", authenticateJWT, getUserOrders);

module.exports = router;
