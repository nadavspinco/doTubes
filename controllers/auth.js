const User = require("../models/user.js");

const mongoose = require("mongoose");

const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { handleErrors } = require("./error.js");

const ObjectId = require("mongodb").ObjectId;

const createToken = (email, userId) => {
  return jwt.sign(
    {
      email: user.email,
      userId: userId.toString(),
    },
    "somekeyfromivtech",
    { expiresIn: "365d" }
  );
};

exports.isEmailExist = (req, res, next) => {
  handleErrors(req, res, next,400);
  const { email } = req.body;
  User.findOne({ email: email })
    .then((result) => {
      if (result) {
        res.json({ message: "email already exist", isEmailExist: true });
        return;
      }
      res.json({ message: "email not exist", isEmailExist: false });
    })
    .catch((error) => {
      console, log(error);
      res.json({ message: "error" });
    });
};

exports.signup = (req, res, next) => {
  handleErrors(req, res, next, 400);
  const { email, fullName, password } = req.body;
  let user;
  bcrypt
    .hash(password, 12)
    .then((hashrdPassword) => {
      user = new User({
        email: email,
        password: hashrdPassword,
        fullName: fullName,
      });
      return user.save();
    })
    .then((result) => {
      const token = jwt.sign(
        {
          userId: user._id.toString(),
        },
        "somekeyfromivtech",
        { expiresIn: "365d" }
      );

      res
        .status(201)
        .json({ message: "User Created", userId: result._id, jwt: token });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "user is not created",
      });
    });
};

exports.login = (req, res, next) => {
  handleErrors(req, res, next, 403);
  const { email, password } = req.body;
  let user;
  User.findOne({ email: email })
    .then((result) => {
      if (result) {
        user = result;
        return bcrypt.compare(password, user.password);
      }
      throw new Error("Login Failed");
    })
    .then((result) => {
      if (result) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id.toString(),
          },
          "somekeyfromivtech",
          { expiresIn: "365d" }
        );
        res.json({ message: "Login succeus", user: user, jwt: token });
        return;
      }
      res.status(403).json({ message: "incorrect password or email" });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Login Failed",
      });
    });
};

exports.updateUser = async (req, res, next) => {
  handleErrors(req, res, next, 400);
  const {
    _id,
    fullName,
    role,
    email,
    description,
    oldPassword,
    newPassword,
    user,
  } = req.body;
  if (newPassword) {
    if (!oldPassword) {
      res
        .status(401)
        .json({
          message:
            "user is not updated, old password is required in order to change the password",
        });
      return;
    }
    const toChangePassword = await bcrypt.compare(oldPassword, user.password);
    if (toChangePassword) {
      user.password = await bcrypt.hash(newPassword, 12);
    } else {
      res.status(401).json({ message: "user is not updated, wrong password" });
      return;
    }
  }
  user.fullName = fullName;
  user.email = email;
  user.role = role;
  user.description = description;
  user
    .save()
    .then((result) => {
      if (result) {
        res.json({ message: "user updated!", user: user });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "user is not updated" });
      return;
    });
};
exports.getUserData = (req, res, next) => {
  handleErrors(req, res, next, 401);
  const { user } = req.body;
  res.json({ user: user });
};
