const Cart = require("../models/cart.model");

const createCart = async (req, res) => {
  const userId = req.user.id;
  const { products } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json("No products provided for the cart");
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      const validProducts = products.map((p) => ({
        product: p.product,
        price: p.price,
        size: p.size,
        quantity: p.quantity,
        total: p.price * p.quantity,
      }));

      const newCart = new Cart({
        userId,
        products: validProducts,
      });

      const savedCart = await newCart.save();
      return res.status(201).json(savedCart);
    } else {
      for (const incoming of products) {
        if (!incoming.size) {
          throw new Error("Size is required for all products");
        }

        const existing = cart.products.find(
          (p) =>
            p.product.toString() === incoming.product &&
            p.size === incoming.size
        );

        if (existing) {
          existing.quantity += incoming.quantity;
          existing.total = existing.quantity * existing.price;
        } else {
          // Add new product
          cart.products.push({
            product: incoming.product,
            price: incoming.price,
            size: incoming.size,
            quantity: incoming.quantity,
            total: incoming.price * incoming.quantity,
          });
        }
      }

      const updatedCart = await cart.save();
      return res.status(200).json(updatedCart);
    }
  } catch (err) {
    console.error("Cart save error:", err);
    return res.status(500).json({ error: err.message });
  }
};

const getCart = async (req, res) => {
  const id = req.params.id;

  if (!req.user || !req.user.id) {
    return res.status(401).json("Unauthorized access");
  }

  if (req.user.id.toString() !== id) {
    return res.status(403).json("You are not authorized to access this cart");
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "products.product"
    );

    if (!cart) {
      return res.status(404).json("Cart is empty");
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getAllCart = async (req, res) => {
  try {
    const carts = await Cart.find().populate("userId products");
    if (!carts || carts.length === 0) {
      return res.status(404).json("No carts found");
    }
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const removeFromCart = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { _id: productId } } },
      { new: true }
    );

    if (!updatedCart) {
      return res
        .status(404)
        .json("Product not found in cart or cart doesn't exist");
    }

    res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Error removing product from cart:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCart,
  getCart,
  getAllCart,
  removeFromCart,
};
