const ObjectId = require("mongodb").ObjectId;

exports.validatePassword = (password) => {
  let passwordre = new RegExp(
    "(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
  );
  return passwordre.test(password);
};

exports.isValidMongoId = (id) =>{
  try {
    const mongoObject = new ObjectId(id);
    return true;
  } catch (error) {
    
  }
  return false;
}