const express = require("express");

const router = express.Router();

const controller = require("../controllers/tube");

const isAuth = require("../middleware/is-Auth");

const { body } = require("express-validator");

router.post(
  "/",
  [body("teamId").trim().not().isEmpty(), body("name").trim().not().isEmpty()],
  isAuth,
  controller.addTube
);

router.post(
  "/",
  [body("teamId").trim().not().isEmpty(), body("name").trim().not().isEmpty()],
  isAuth,
  controller.addTube
);

router.get(
  "/all/:teamId",
  isAuth,
  controller.getTubes
);

module.exports = router;
