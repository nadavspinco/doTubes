const express = require("express");

const router = express.Router();

const controller = require("../controllers/task");

const isAuth = require("../middleware/is-Auth");

const { body } = require("express-validator");

router.post(
  "/",
  [
    body("type").custom((value, { req }) => {
      const types = ["ux", "ui", "aws", "git", "fixing bugs"];
      return types.includes(value);
    }),
    body("score").isDecimal({ min: 10, max: 100 }),
    body("name").trim().not().isEmpty(),
    body("tubeId").trim().not().isEmpty(),
    body("userId").trim().not().isEmpty(),
    body("description").trim().not().isEmpty(),
  ],
  isAuth,
  controller.addTask
);

router.put(
  "/",
  [
    body("status").custom((value, { req }) => {
      const types = [
        "pending",
        "pre-estimated",
        "in-process",
        "pre-report",
        "completed",
      ];
      return types.includes(value);
    }),
    body("taskId").trim().not().isEmpty(),
    body("feedback").custom((value, { req }) => {
      return value === undefined || (value >=1 && value <=10)
    }),
  ],
  isAuth,
  controller.changeTaskStatus
);

router.get("/:tubeId", isAuth, controller.getUserTasksByTube);

module.exports = router;
