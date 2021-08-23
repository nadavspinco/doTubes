const express = require("express");

const router = express.Router();

const controller = require("../controllers/analytics");

const isAuth = require("../middleware/is-Auth");

router.get(
  "/tasksType/:teamId/:userId?",
  isAuth,
  controller.getTaskstypeByTeam
);

router.get(
  "/timeEstimationByMonth/:teamId/:userId?",
  isAuth,
  controller.getEstimtedTimeByMonth
);

router.get(
  "/timeEstimationByType/:teamId/:userId?",
  isAuth,
  controller.getEstimtedTimeByTypes
);

router.get(
  "/scoreByMonth/:teamId/:userId?",
  isAuth,
  controller.getScoreByMonth
);

router.get(
  "/feedbackByMonth/:teamId/:userId?",
  isAuth,
  controller.getFeedbackByMonth
);

router.get(
  "/feedbackByType/:teamId/:userId?",
  isAuth,
  controller.getFeedbackByTypes
);
router.get("/all/:teamId/:userId?", isAuth, controller.getAllAnalytics);

module.exports = router;
