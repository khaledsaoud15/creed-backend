const Order = require("../models/Order.model");
const responseHandler = require("../utils/responseHandler");

const getOrders = async (req, res) => {
  const isNew = req.query.new;
  try {
    let orders;
    if (isNew) {
      orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("items.productId");
    } else {
      orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate("items.productId");
    }
    responseHandler(res, 200, orders);
  } catch (err) {
    responseHandler(res, 500, err.message);
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId }).populate("items.productId");

    responseHandler(res, 200, orders);
  } catch (err) {
    responseHandler(res, 500, err.message);
  }
};

module.exports = {
  getOrders,
  getUserOrders,
};
