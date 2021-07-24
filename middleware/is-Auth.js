const jwt = require("jsonwebtoken");

const User = require("../models/user.js");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    handleUnauthorizedRequest();
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somekeyfromivtech");
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
  if (!decodedToken) {
    handleUnauthorizedRequest();
  }
  req.body._id = decodedToken.userId;
  let user;
  try {
    user = await User.findById(req.body._id);
    if (user) {
      req.body.user = user;
    } else {
        handleUnauthorizedRequest();
    }
  } catch (error) {
    error.statusCode = 500;
    error.message = "internal error";
    throw error;
  }
  next();
};

const handleUnauthorizedRequest = () => {
  const error = new Error("not auth");
  error.statusCode = 401;
  throw error;
};
