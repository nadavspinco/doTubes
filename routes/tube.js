const express = require("express");

const router = express.Router();

const controller = require("../controllers/tube");

const isAuth = require("../middleware/is-Auth");

const { body } = require("express-validator/check");

router.post(
  "/",
  [body("teamId").trim().not().isEmpty(), body("name").trim().not().isEmpty()],
  isAuth,
  controller.addTube
);

module.exports = router;
