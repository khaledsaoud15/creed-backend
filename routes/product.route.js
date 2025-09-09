const upload = require("../config/cloudinary");
const {
  addProduct,
  updateProduct,
  deletProduct,
  getProducts,
  getSingleProduct,
} = require("../controllers/product.controller");
const { authenticateAdmin } = require("../middlewares/token");

const router = require("express").Router();

router.post(
  "/add",
  authenticateAdmin,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),

  addProduct
);

router.put("/update/:id", authenticateAdmin, updateProduct);
router.delete("/delete/:id", authenticateAdmin, deletProduct);
router.get("/get", getProducts);
router.get("/get/:id", getSingleProduct);

module.exports = router;
