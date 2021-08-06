const jwt = require("jsonwebtoken");

const User = require("../models/user.js");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    handleUnauthorizedRequest(new Error("please enter jwt token"), next);
    return;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somekeyfromivtech");
  } catch (error) {
    handleUnauthorizedRequest(error, next);
    return;
  }
  if (!decodedToken) {
    handleUnauthorizedRequest(new Error("invalid token"), next);
    return;
  }

  req.body._id = decodedToken.userId;
  let user;
  try {
    user = await User.findById(req.body._id);
    if (user) {
      req.body.user = user;
    } else {
      handleUnauthorizedRequest(new Error("invalid token user not in db"), next);
    }
  } catch (error) {
    next(error);
  }
  next();
};

const handleUnauthorizedRequest = (error, next) => {
  error.statusCode = 401;
  next(error);
  //using throw error will end up with UnhandledPromiseRejectionWarning
};
