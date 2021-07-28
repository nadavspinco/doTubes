const { validationResult } = require("express-validator");

exports.handleErrors = (
  req,
  res,
  next,
  statusCode,
  message = "Validation Faild"
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.data = errors.array();
    next(error, req, res);
  }

};
