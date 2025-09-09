const Cart = require("../models/cart.model");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const Checkout = require("../models/checkout.model");

const callback =
  process.env.NODE_ENV === "production"
    ? "https://creed-clone.vercel.app/"
    : "http://localhost:5173";

const checkoutFN = async (req, res) => {
  try {
    const { userId, cartId } = req.body;

    const cart = await Cart.findById(cartId).populate("products.product");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const lineItems = cart.products.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.title,
          description: item.product.description,
          images: [item.product.image],
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: callback + "success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: callback + "cancel",
      metadata: {
        userId,
        cartId,
      },
    });

    await Checkout.create({
      userId,
      cartId,
      amount: cart.products.reduce(
        (sum, acc) => sum + acc.price * acc.quantity,
        0
      ),
      sessionId: session.id,
      status: "pending",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Stripe checkout failed", error: err.message });
  }
};

module.exports = {
  checkoutFN,
};
