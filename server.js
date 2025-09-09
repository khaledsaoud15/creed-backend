const express = require("express");
const connectDB = require("./db/connectDB");
const app = express();
const passport = require("passport");
require("dotenv").config();
// app.use(express.json());
app.use(passport.initialize());
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/payment/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

require("./utils/passportGoogle")(passport);
const port = process.env.PORT || 3000;

app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v1/user", require("./routes/user.route"));
app.use("/api/v1/products", require("./routes/product.route"));
app.use("/api/v1/cart", require("./routes/cart.route"));
app.use("/api/v1/payment", require("./routes/checkout.route"));
app.use("/api/v1/orders", require("./routes/order.route"));

connectDB();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
