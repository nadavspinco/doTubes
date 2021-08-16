const Team = require("../models/team.js");

const User = require("../models/user.js");

const Tube = require("../models/tube.js");

const Task = require("../models/task");

const { handleErrors } = require("./error.js");

const ObjectId = require("mongodb").ObjectId;

exports.addTask = async (req, res, next) => {
  try {
    handleErrors(req, res, next, 400);
    const { score, name, tubeId, type, user, userId, description } = req.body;
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
      description: description
    });
    if (userId && !tube.users.includes(new ObjectId(userId))) {
      res.status(401).json({ message: "user is not part of the tube" });
      return;
    }
    task.exacutor = new ObjectId(userId);
    task
      .save()
      .then(async (result) => {
        if (result) {
          tube.totalScore += score;
          tube.tasks.addToSet(task);
          await tube.save();
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

exports.changeTaskStatus = (req, res, next) => {
  handleErrors(req, res, next, 400);
  const { taskId, status, user, _id, estimatedTime } = req.body;
  let tube, prevStatus, chosenTask, date;
  date = Date.parse(estimatedTime);
  Task.findById(taskId)
    .then((task) => {
      if (!task) {
        res.status(404).json({ message: "task wan't found" });
        return;
      }
      prevStatus = task.status;
      chosenTask = task;

      if (task.exacutor.toString() !== _id) {
        res
          .status(401)
          .json({ message: "unauthrized to change the task status" });
        return;
      }
      if (!isValidStatus(task.status, status)) {
        res.status(403).json({ message: "action is not allowed" });
        return;
      }

      if (
        (task.status === "pre-estimated" &&
          status === "in-progress" &&
          date === NaN) ||
        date <= Date.now()
      ) {
        res.status(403).json({ message: "invalid time selection" });
        return;
      }
      updateStatus(task, status, estimatedTime)
        .then((result) => {
          if (!result) {
            res.status(500).json({ message: "unable to save the task" });
            return;
          }
          return Tube.findById(chosenTask.tube);
        })
        .then((tube) => {
          if (!tube) {
            res.status(403).json({ message: "action is not allowed" });
            return;
          }
          if (chosenTask.status === "completed") {
            tube.currentScore += chosenTask.score;
          } else if (
            chosenTask.status === "in-process" &&
            prevStatus === "completed"
          ) {
            tube.currentScore -= chosenTask.score;
          }
          return tube.save();
        })
        .then((result) => {
          if (result) {
            res.json({ message: "update completed", task: chosenTask });
            return;
          }
          throw new Error("server error");
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: error.message });
      return;
    });
};

const isValidStatus = (currentStatus, nextStatus) => {
  if (currentStatus === "pending" && nextStatus === "pre-estimated") {
    return true;
  }
  if (currentStatus === "pre-estimated" && nextStatus === "in-process") {
    return true;
  }

  if (currentStatus === "in-process" && nextStatus === "pre-report") {
    return true;
  }
  if (currentStatus === "pre-report" && nextStatus === "completed") {
    return true;
  }
  if (currentStatus === "completed" && nextStatus === "in-process") {
    return true;
  }
  return false;
};

const updateStatus = async (task, newStatus, estimatedTime) => {
  if (newStatus === "in-process" && task.status === "pre-estimated") {
    task.startDateTime = new Date();
    task.estimatedDateTime = new Date(estimatedTime);
  } else if (task.status === "pre-report" && newStatus === "completed") {
    task.endDateTime = new Date();
  }
  if (task.status === "completed" && newStatus === "in-process") {
    task.endDateTime = undefined;
  }
  task.status = newStatus;

  return await task.save();
};

exports.getUserTasksByTube = (req, res, next) => {
  const { user, _id } = req.body;
  const { tubeId } = req.params;
  let tubeCheck;
  try {
    tubeCheck = new ObjectId(tubeId);
  } catch (error) {
    res.status(404).json({ message: "tube was not found" });
    return;
  }

  Tube.findById(tubeId)
    .then((tube) => {
      if (!tube) {
        res.status(404).json({ message: "tube was not found" });
        return;
      }
      if (!tube.users.includes(new ObjectId(_id))) {
        res.status(403).json({ message: "user is not part of this tube" });
        return;
      }
      Task.find({
        tube: new ObjectId(tubeId),
        exacutor:
          tube.admin.toString() === user._id.toString() ? undefined : user._id,
      })
        .then((tasks) => {
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
          res.json({ tasks });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ message: "server error" });
          return;
        });
    })
    .catch((error) => {
      res.status(400).json({ message: "invalid tube Id" });
    });
};
