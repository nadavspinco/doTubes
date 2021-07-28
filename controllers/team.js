const Team = require("../models/team.js");

const User = require("../models/user.js");

const { handleErrors } = require("./error.js");

const mongoose = require("mongoose");

const ObjectId = require("mongodb").ObjectId;

const { validationResult } = require("express-validator");

exports.addTeam = (req, res, next) => {
  handleErrors(req,res,next, 402);
  const { teamName, _id, user } = req.body;
  if (user) {
    const team = new Team({
      admin: new ObjectId(_id),
      users: [new ObjectId(_id)],
      name: teamName,
    });
    team
      .save()
      .then(result => {
        if (result) {
          user.teams.addToSet(team._id);
          return user.save();
        } else {
          res.status(500).json({ message: "error" });
        }
      })
      .then((result) => {
        if (result) {
          res.json({ team: result._doc, message: "team is added" }).status(201);
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
  handleErrors(req, res, next, 402);
    const { teamId, user, _id } = req.body;
    try {
        team = await Team.findById(teamId);
        if (!team) {
            throw new Error();
        }
    } catch (error) {
        res.json({ message: "unable to find the wanted team" }.status(404));
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
          throw new Error("user already in the team").status(500);
          }
        else {
            throw new Error("unable to find the wanted team").status(404);
          }
        await team.save();
      }
    } catch (error) {
      res.json({ message: error.message }).status(error.status);
      return;
    }
    try {
      user.teams.addToSet(new ObjectId(team._id));
      result = await user.save();
      if (result) {
        res.json({ message: "added succsfuly"}).status(200);
      } else {
          res.json({ message: "added failed" }).status(500);
          session.abortTransaction();
      }
    } catch (error) {
      res.json({ message: "failed" }).status(500);
      return;
    }
  });
};

exports.getTeams = async (req, res, next) => {
  const { user } = req.body;
  try {
    const teams = await Promise.all(user.teams.map(teamId => {
      return Team.findById(teamId);
    }))
    res.json({ teams });
  } catch (error) {
    res.json({ message: "action faild" }).status(500);
  }

};