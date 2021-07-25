const { validationResult } = require("express-validator");

exports.handleErrors = (req, message = "Validation Faild", statusCode) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.data = errors.array();
    throw error;
  }
};
