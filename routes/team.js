const express = require("express");

const router = express.Router();

const controller = require("../controllers/team");

const analyticsRoutes =  require('./analytics')

const isAuth = require("../middleware/is-Auth");

const { body } = require("express-validator");

router.post(
  "/",
  [body("teamName").trim().not().isEmpty()],
  isAuth,
  controller.addTeam
);

router.post(
  "/join",
  [body("teamId").trim().not().isEmpty()],
  isAuth,
  controller.joinTeam
);



router.get("/getTeamByPermissions", isAuth, controller.getTeamByPermissions);

router.use("/analytics", analyticsRoutes);

router.get("/:teamId", isAuth, controller.getTeamDeatils);

router.get("/", isAuth, controller.getTeams);

module.exports = router;
