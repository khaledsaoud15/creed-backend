const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    price: {
      type: [Number],
      required: true,
    },
    size: {
      type: [String],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["men", "women", "unisex", "popular"],
    },
    topNotes: {
      type: [String],
    },
    heartNotes: {
      type: [String],
    },
    baseNotes: {
      type: [String],
    },
    type: {
      type: String,
      required: true,
      enum: ["eau de parfum", "eau de toilette", "eau de cologne"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
