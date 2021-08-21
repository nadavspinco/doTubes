const express = require("express");

const router = express.Router();

const controller = require('../controllers/analytics');

const isAuth = require("../middleware/is-Auth");

router.get("/tasksType/:teamId", isAuth, controller.getTaskstypeByTeam);

router.get(
  "/timeEstimationByMonth/:teamId",
  isAuth,
  controller.getEstimtedTimeByMonth
);

router.get(
  "/timeEstimationByType/:teamId",
  isAuth,
  controller.getEstimtedTimeByTypes
);

router.get("/scoreByMonth/:teamId",
    isAuth,
    controller.getScoreByMonth);



router.get("/feedbackByMonth/:teamId", isAuth, controller.getFeedbackByMonth);

router.get("/feedbackByType/:teamId", isAuth, controller.getFeedbackByTypes);




module.exports = router;