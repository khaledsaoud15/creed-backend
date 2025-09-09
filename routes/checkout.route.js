const { checkoutFN } = require("../controllers/checkout.controller");
const { authenticateJWT } = require("../middlewares/token");
const express = require("express");

const router = require("express").Router();

const Checkout = require("../models/checkout.model");

router.post("/checkout", authenticateJWT, checkoutFN);
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const Order = require("../models/Order.model");
const Cart = require("../models/cart.model");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.sendStatus(400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        await Checkout.findOneAndUpdate(
          { sessionId: session.id },
          { status: "completed" }
        );

        const cart = await Cart.findById(session.metadata.cartId).populate(
          "products.product"
        );

        if (!cart) {
          console.error("Cart not found");
          return res.sendStatus(400);
        }

        await Order.create({
          userId: session.metadata.userId,
          items: cart.products.map((p) => ({
            productId: p.product._id,
            quantity: p.quantity,
            price: p.price,
          })),
          total: cart.products.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          status: "paid",
          sessionId: session.id,
        });

        await Cart.findByIdAndUpdate(session.metadata.cartId, { products: [] });
      } catch (error) {
        console.error("Error handling checkout completion:", error.message);
      }
    }

    res.sendStatus(200);
  }
);

module.exports = router;
