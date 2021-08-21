const Team = require("../models/team.js");

const User = require("../models/user.js");

const { handleErrors } = require("./error.js");

const mongoose = require("mongoose");

const ObjectId = require("mongodb").ObjectId;

const { validationResult } = require("express-validator");



exports.addTeam = (req, res, next) => {
  handleErrors(req, res, next, 400);
  const { teamName, _id, user } = req.body;
  if (user) {
    const team = new Team({
      admin: new ObjectId(_id),
      users: [new ObjectId(_id)],
      name: teamName,
    });
    team
      .save()
      .then((result) => {
        if (result) {
          user.teams.addToSet(team._id);
          return user.save();
        } else {
          res.status(500).json({ message: "error" });
        }
      })
      .then((result) => {
        if (result) {
          res.status(201).json({ team: team, message: "team is added" });
        } else {
          res.status(500).json({ message: "error" });
        }
      })
      .catch((error) => {
        res.status(500).json({ message: "error" });
      });
  } else {
    res.status(500).json({ message: "error" });
  }
};

exports.joinTeam = async (req, res, next) => {
  try {
    handleErrors(req, res, next, 400);
    const { teamId, user, _id } = req.body;
    try {
      team = await Team.findById(teamId);
      if (!team) {
        next(new Error("id is invalid"), req, res);
        return;
      }
    } catch (error) {
      res.status(404).json({ message: "unable to find the wanted team" });
      return;
    }
    const session = await Team.startSession();
    await session.withTransaction(async () => {
      try {
        if (team) {
          const oldLength = team.users.length;
          team.users.addToSet(new ObjectId(_id));
          const newLength = team.users.length;
          if (oldLength === newLength) {
            next(new Error("you already in that team"));
            return;
          }
        } else {
          throw new Error("unable to find the wanted team");
        }
        await team.save();
      } catch (error) {
        res.json({ message: error.message }).status(error.status);
        return;
      }
      try {
        user.teams.addToSet(new ObjectId(team._id));
        result = await user.save();
        if (result) {
          res.json({ message: "added succsfuly" }).status(200);
        } else {
          res.json({ message: "added failed" }).status(500);
          session.abortTransaction();
        }
      } catch (error) {
        res.json({ message: "failed" }).status(500);
        return;
      }
    });
  } catch (error) {
    next(error, req, res);
  }
};

exports.getTeamDeatils = async (req, res, next) => {
  const { user, _id } = req.body;
  const { teamId } = req.params;
  try {
    const team = await Team.findById(teamId);

    if (!team) {
      res.status(404).json({ message: "team is not found" });
      return;
    }
    if (!team.users.includes(new ObjectId(_id))) {
      res.status(401).json({ message: "unauthorized" });
      return;
    }
    await team
      .populate("admin")
      .populate("users")
      .populate("tubes")
      .execPopulate();
    res.json({ team });
  } catch (error) {
    res.status(500).json({ message: "server error" });
    return;
  }
};


exports.getTeams = async (req, res, next) => {
  const { user } = req.body;
  try {
    const teams = await Promise.all(
      user.teams.map((teamId) => {
        return Team.findById(teamId);
      })
    );
    res.json({ teams });
  } catch (error) {
    res.json({ message: "action faild" }).status(500);
    return;
  }
};

exports.getTeamByPermissions = (req, res, next) => {
  const { user, _id } = req.body;
  Team.find({ _id: { $in: user.teams } })
    .populate("users")
    .then((teams) => {
      if (!teams) {
        res.status(404).json({ message: "no team was found" });
        return;
      }
      const resTeamsObj = teams.map((team) => {
        if (team.admin._id.toString() === _id) {
          return team;
        }
        team.users = [user];
        return team;
      });
      res.json({ teams, resTeamsObj });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "server error" });
    })
};


