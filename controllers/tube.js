const Team = require("../models/team.js");

const User = require("../models/user.js");

const ObjectId = require("mongodb").ObjectId;

const Tube = require("../models/tube.js");

const { handleErrors } = require("./error.js");

const Task = require("../models/task");

exports.addTube = async (req, res, next) => {
  try {
    handleErrors(req, res, next, 400);
    let team;
    const { teamId, name, user, _id, color } = req.body;
    try {
      team = await Team.findById(teamId);
      if (!team) {
        res.status(404).json({ message: "team is not exists" });
        return;
      }
    } catch (error) {
      res.status(404).json({ message: "team is not exists" });
      return;
    }
    const teamUser = team.users.find((teamUser) => teamUser.toString() === _id);
    if (!teamUser) {
      res.status(401).json({ message: "not authorized" });
      return;
    }
    const tube = new Tube({
      name: name,
      team: team._id,
      admin: user._id,
      users: [user._id],
      color: color,
    });
    tube
      .save()
      .then((result) => {
        if (!result) {
          res.status(500).json({ message: "creating tube failed" });
          return;
        }
        team.tubes.addToSet(result);
        return team.save();
      })
      .then((result) => {
        if (!result) {
          res.status(500).json({ message: "creating tube failed" });
        }
        res.status(201).json({ message: "tube is created", tube: tube });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    next(error, req, res);
  }
};

exports.getUsersSuggestions = (req, res, next) => {
  const { tubeId } = req.params;
  const { _id, user } = req.body;
  Tube.findById(tubeId).then((tube) => {
    if (!tube) {
      res.status(404).json({ message: "tube was not find" });
      return;
    }
    if (tube.admin.toString() !== _id) {
      res.status(401).json({ message: "unauthorized" });
      return;
    }
    User.find({ teams: tube.team })
      .then((users) => {
        if (!users) {
          res.status(500).json({ message: "server error" });
        }
        const suggestions = users.filter((teamUser) => {
          return !tube.users.includes(teamUser._id);
        });
        res.status(200).json({ users: suggestions });
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  });
};

exports.getTubes = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { _id } = req.body;
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        res.status(404).json({ message: "team was not found" });
        return;
      }
      const teamUser = team.users.find((userId) => userId.toString() === _id);
      if (!teamUser) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const tubes = await Tube.find({
        team: teamId,
        users: new ObjectId(_id),
      });
      res.json({ tubes, isTeamAdmin: team.admin.toString() === _id });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  } catch (error) {
    next(error, req, res);
  }
};

exports.getTubeDetails = async (req, res, next) => {
  try {
    const { tubeId } = req.params;
    const { _id, user } = req.body;
    try {
      const tube = await Tube.findById(tubeId);
      if (!tube) {
        res.status(404).json({ message: "tube was not found" });
        return;
      }
      const tubeUser = tube.users.find((userId) => userId.toString() === _id);
      if (!tubeUser) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      Task.find({
        tube: tubeId,
        exacutor: tube.admin.toString() === _id ? undefined : user._id,
      }).then((tasks) => {
        if (!tasks) {
          res.status(500).json({ message: "server error" });
          return;
        }
        tasks = tasks.map((task) => {
          return {
            task,
            isMyTask: task.exacutor.toString() === user._id.toString(),
          };
        });
        res.json({
          tasks,
          tube: tube,
          isTubeManager: tube.admin.toString() === _id,
          progress: calculateProgress(tube.currentScore, tube.totalScore),
          totalCount: tasks.length,
          doneCount: tasks.filter((task) => {
            return task.status === "completed";
          }).length,
        });
      });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  } catch (error) {
    next(error, req, res);
  }
};

exports.addUser = (req, res, next) => {
  handleErrors(req, res, next, 400);
  const { tubeId, userId, user } = req.body;
  User.findById(userId)
    .then((userToAdd) => {
      if (!userToAdd) {
        res.status(404).json({ message: "user wans't not found" });
        return;
      }

      Tube.findById(tubeId).then((tube) => {
        if (!tube) {
          res.status(404).json({ message: "tube wans't not found" });
          return;
        }
        if (!userToAdd.teams.includes(tube.team)) {
          res.status(403).json({ message: "user is not part of the team" });
          return;
        }
        if (tube.admin.toString() !== user._id.toString()) {
          res
            .status(401)
            .json({ message: "only admins are able to add users to the tube" });
          return;
        }
        if (tube.users.includes(userToAdd._id)) {
          res.status(400).json({ message: "user is already part of the tube" });
          return;
        }
        tube.users.addToSet(userToAdd._id);
        tube.save().then((result) => {
          if (!result) {
            res.status(500).json({ message: "unable to save the tube" });
            return;
          }
          res.status(200).json({ message: "user added to the tube", tube });
        });
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "server error" });
    });
};

const calculateProgress = (currentScore, totalScore) => {
  if (totalScore === 0) {
    return 0;
  }
  return (currentScore / totalScore) * 100;
};
