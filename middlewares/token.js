const jwt = require("jsonwebtoken");
const responseHandler = require("../utils/responseHandler");

function authenticateJWT(req, res, next) {
  const token = req.cookies.token;
  if (!token) return responseHandler(res, 401, { message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return responseHandler(res, 403, { message: "Forbidden" });
    req.user = user;
    next();
  });
}

const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return responseHandler(res, 401, "Unauthorized");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return responseHandler(res, 403, "Forbidden");
    if (user.role !== "admin") return responseHandler(res, 403, "Forbidden");
    req.user = user;
    next();
  });
};

module.exports = { authenticateJWT, authenticateAdmin };
