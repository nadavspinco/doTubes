const express = require("express");

const controller = require("../controllers/auth");

const { body } = require("express-validator");

const router = express.Router();

const { validatePassword } = require("../utils/validation");

const isAuth = require("../middleware/is-Auth");

const User = require("../models/user.js");

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage(
        "The password should contains at least one capital letter, one special sign and one number, the length of the password should be 8 symbols"
      )
      .custom((value, { req }) => {
        return validatePassword(value);
      }),
    body("fullName").trim().not().isEmpty(),
  ],
  controller.signup
);

router.post(
  "/login",
  body("password")
    .trim()
    .not()
    .isEmpty(),
  body("email")
    .isEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (!userDoc) {
          return Promise.reject("Email not exists");
        }
      });
    })
    .normalizeEmail(),
  controller.login
);

router.get("/userData", isAuth, controller.getUserData);

router.post(
  "/isEmailExist",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
  ],
  controller.isEmailExist
);

router.put("/updateUser",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
 body("newPassword")
   .custom((value, { req }) => {
        return value === undefined || validatePassword(value);
      }).trim()],
   isAuth, controller.updateUser);

module.exports = router;
