const Team = require("../models/team.js");

const User = require("../models/user.js");

const ObjectId = require("mongodb").ObjectId;

const Tube = require("../models/tube.js");
const { handleErrors } = require("./error.js");

exports.addTube = async (req, res, next) => {
  handleErrors(req, res, next, 400);
  let team;
  const { teamId, name, user, _id } = req.body;
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
};

exports.getTubes = async (req, res, next) => {
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
    let tubes = [];
    for (const tubeId of team.tubes) {
      const tube = await Tube.findOne({
        _id: tubeId,
        users: new ObjectId(_id),
      });
    
      if (tube !== null) {
        tubes.push(tube);
      }
    }
    res.json({ tubes });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
