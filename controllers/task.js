const Team = require("../models/team.js");

const User = require("../models/user.js");

const Tube = require("../models/tube.js");

const Task = require('../models/task');

const { handleErrors } = require("./error.js");

const ObjectId = require("mongodb").ObjectId;

exports.addTask = async (req, res, next) => {
    try {
      handleErrors(req, res, next, 400);
      const { score, name, tubeId, type, user, userId } = req.body;
      const tube = await Tube.findById(tubeId);
      if (!tube) {
        res.status(404).json({ message: "tube is not exists" });
        return;
      }
      if (tube.admin.toString() !== user._id.toString()) {
        res.status(401).json({ message: "not authorized" });
        return;
      }
      const task = new Task({
        score: score,
        name: name,
        type: type,
        tube: tube._id,
      });
      if (userId && !tube.users.includes(new ObjectId(userId))) {
        res.status(401).json({ message: "user is not part of the tube" });
        return;
      }
      task.exacutor = new ObjectId(userId);
      task
        .save()
        .then((result) => {
          if (result) {
            res.status(201).json({
              message: "task added successfully",
              task: result,
            });
          } else {
            res.status(500).json({ "message:": "task not added" });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ "message:": error });
        });
    } catch (error) {
      next(error, req, res);
    }
};

