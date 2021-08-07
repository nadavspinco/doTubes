const { validationResult } = require("express-validator");

exports.handleErrors = (
  req,
  res,
  next,
  statusCode,
  message
) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.data = errors.array();
    throw error;
  }

};
