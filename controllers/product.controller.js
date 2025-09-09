const Product = require("../models/product.model");
const responseHandler = require("../utils/responseHandler");

const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      topNotes,
      heartNotes,
      baseNotes,
      size,
      type,
      category,
    } = req.body;

    const mainImage = req.files?.image
      ? req.files.image[0].path
      : req.body.image;

    const newProduct = new Product({
      title,
      description,
      price,
      size,
      image: mainImage,
      category,
      topNotes,
      heartNotes,
      baseNotes,
      type,
    });

    await newProduct.save();
    return responseHandler(res, 201, newProduct);
  } catch (error) {
    console.error(error);
    return responseHandler(res, 500, error.message);
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return responseHandler(res, 404, "Product not found");
    }

    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.price = req.body.price ? req.body.price : product.price;
    product.size = req.body.size ? req.body.size : product.size;
    product.type = req.body.type || product.type;
    product.category = req.body.category || product.category;

    product.image = req.files?.image ? req.files.image[0].path : product.image;

    if (req.body.topNotes) {
      product.topNotes = req.body.topNotes;
    }
    if (req.body.heartNotes) {
      product.heartNotes = req.body.heartNotes;
    }
    if (req.body.baseNotes) {
      product.baseNotes = req.body.baseNotes;
    }

    await product.save();
    return responseHandler(res, 200, product);
  } catch (err) {
    return responseHandler(res, 500, err.message);
  }
};

const deletProduct = async (req, res) => {
  const id = req.params.id;
  try {
    await Product.findByIdAndDelete(id);
    responseHandler(res, 200, "Product Deleted");
  } catch (err) {
    responseHandler(res, 500, err.message);
  }
};

const getProducts = async (req, res) => {
  try {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(4);
    } else if (qCategory) {
      products = await Product.find({ category: qCategory })
        .sort({ createdAt: -1 })
        .limit(4);
    } else {
      products = await Product.find().sort({ createdAt: -1 });
    }

    responseHandler(res, 200, products);
  } catch (error) {
    responseHandler(res, 500, error.message);
  }
};

const getSingleProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    responseHandler(res, 200, product);
  } catch (err) {
    responseHandler(res, 500, err.message);
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deletProduct,
  getProducts,
  getSingleProduct,
};
