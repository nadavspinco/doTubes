const express = require("express");

const router = express.Router();

const controller = require("../controllers/task");

const isAuth = require("../middleware/is-Auth");

const { body } = require("express-validator");

router.post(
  "/",
  [
    body("type")
      .custom((value, { req }) => {
        const types = ["ux", "ui", "aws", "git", "fixing bugs"];
        return types.includes(value);
      }),
    body("score").isDecimal({ min: 10, max: 100 }),
    body("name").trim().not().isEmpty(),
    body("tubeId").trim().not().isEmpty(),
  ],
  isAuth,
  controller.addTask
);

module.exports = router;

    // body("type").custom((value, { req }) => {
    //   const types = ["ux", "ui", "aws", "git", "fixing bugs"];
    //   if (!types.includes(value)) {
    //     console.log("faild");
    //     return Promise.reject("type should be: ux/ui/aws/git/fixing bugs");
    //   }
    // });