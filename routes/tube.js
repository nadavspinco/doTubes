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

router.get("/all/:teamId", isAuth, controller.getTubes);

router.get("/:tubeId", isAuth, controller.getTubeDetails);

router.get(
  "/users-suggestions/:tubeId",
  isAuth,
  controller.getUsersSuggestions
);

router.put(
  "/addUser",
  [
    body("tubeId").trim().not().isEmpty(),
    body("userId").trim().not().isEmpty(),
  ],
  isAuth,
  controller.addUser
);

router.get("/users/:tubeId", isAuth, controller.getTubeUsers);

module.exports = router;
