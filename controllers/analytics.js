const Team = require("../models/team.js");

const User = require("../models/user.js");

const Tube = require("../models/tube.js");

const { Task } = require("../models/task");

const ObjectId = require("mongodb").ObjectId;

const mongoose = require("mongoose");

const { isValidMongoId } = require("../utils/validation");
const task = require("../models/task");

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getAllAnalytics = (
  req,
  res,
  next,
  buildDictionary,
  taskStratagy,
  makeResObject
) => {
  const { _id, user } = req.body;
  const { teamId, userId } = req.params;
  if (!teamId) {
    res.status(400).json({ message: "team id is missing" });
    return;
  }
  if (!isValidMongoId(teamId)) {
    res.status(400).json({ message: "team id is invalid" });
    return;
  }
  Team.findById(teamId)
    .then((team) => {
      if (!team) {
        res.status(404).json({ message: "team was not found" });
        return;
      }
      if (!team.users.includes(user._id)) {
        res.status(401).json({ message: "user is not part of this team" });
        return;
      }
      if (userId !== undefined || !isValidMongoId(userId)) {
        res.status(400).json({ message: "user id is invalid" });
        return;
      }
      if (
        userId !== undefined &&
        team.admin.toString() !== user._id.toString() &&
        userId !== user._id.toString()
      ) {
        res.status(401).json({
          message: "only admin can get analytics on other team members",
        });
        return;
      }

      const searchObject = {
        tube: { $in: team.tubes },
        status: "completed",
      };
      if (userId) {
        searchObject.exacutor = new ObjectId(userId);
      }
      Task.find(searchObject).then((tasks) => {
        if (!tasks) {
          res.json({ message: "there is no available data" });
          return;
        }
        res.json(
          analzyeData(tasks, buildDictionary, taskStratagy, makeResObject)
        );
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({ message: error.message });
    });
};

exports.getAllAnalytics = (req, res, next) => {
  const { _id, user } = req.body;
  const { teamId, userId } = req.params;
  if (!teamId) {
    res.status(400).json({ message: "team id is missing" });
    return;
  }
  if (!isValidMongoId(teamId)) {
    res.status(400).json({ message: "team id is invalid" });
    return;
  }
  Team.findById(teamId).then((team) => {
    if (!team) {
      res.status(404).json({ message: "team was not found" });
      return;
    }
    if (!team.users.includes(user._id)) {
      res.status(401).json({ message: "user is not part of this team" });
      return;
    }

    if (
      (userId !== undefined  &&(
      (team.admin.toString() === user._id.toString() ||
        userId !== user._id.toString()))))
     {

      res
        .status(401)
        .json({ message: "only admin can get the team analytics" });
      return;
    }

    const searchObject = {
      tube: { $in: team.tubes },
      status: "completed",
    };
    if (userId) {
      searchObject.exacutor = new ObjectId(userId);
    }
    Task.find(searchObject)
      .then((tasks) => {
        if (!tasks) {
          res.json({ message: "there is no available data" });
          return;
        }
        res.json(getAllAnalyticsToObject(tasks));
      })
      .catch((error) => {
        console.log(error);
        res.json({ message: error.message });
      });
  });
};

const getAllAnalyticsToObject = (tasks) => {
  const tasksByTypes = analzyeData(
    tasks,
    buildDictionaryByLastYear,
    (task) => {
      return task.type;
    },
    calclateTypesResObject
  );
  const estimtedTimeByMonth = analzyeData(
    tasks,
    buildDictionaryByLastYearByMonthes,
    (task) => {
      return months[task.endDateTime.getMonth()];
    },
    calculateEstimations
  );

  const feedbackByMonth = analzyeData(
    tasks,
    buildDictionaryByLastYearByMonthes,
    (task) => {
      return months[task.endDateTime.getMonth()];
    },
    calculateFeedback
  );
  const feedbackByType = analzyeData(
    tasks,
    buildDictionaryByLastYear,
    (task) => {
      return task.type;
    },
    calculateFeedback
  );
  const estimtedTimeByTypes = analzyeData(
    tasks,
    buildDictionaryByLastYear,
    (task) => {
      return task.type;
    },
    calculateEstimations
  );

  const scoreByMonth = analzyeData(
    tasks,
    buildDictionaryByLastYearByMonthes,
    (task) => {
      return months[task.endDateTime.getMonth()];
    },
    calculateScore
  );
  return {
    tasksByTypes,
    estimtedTimeByMonth,
    feedbackByMonth,
    feedbackByType,
    estimtedTimeByTypes,
    scoreByMonth,
  };
};

exports.getTaskstypeByTeam = (req, res, next) => {
  getAnalytics(
    req,
    res,
    next,
    buildDictionaryByLastYear,
    (task) => {
      return task.type;
    },
    calclateTypesResObject
  );
};

exports.getEstimtedTimeByMonth = (req, res, next) => {
  getAnalytics(
    req,
    res,
    next,
    buildDictionaryByLastYearByMonthes,
    (task) => {
      return months[task.endDateTime.getMonth()];
    },
    calculateEstimations
  );
};

exports.getFeedbackByMonth = (req, res, next) => {
  getAnalytics(
    req,
    res,
    next,
    buildDictionaryByLastYearByMonthes,
    (task) => {
      return months[task.endDateTime.getMonth()];
    },
    calculateFeedback
  );
};

exports.getFeedbackByTypes = (req, res, next) => {
  getAnalytics(
    req,
    res,
    next,
    buildDictionaryByLastYear,
    (task) => {
      return task.type;
    },
    calculateFeedback
  );
};

const buildDictionaryByLastYearByMonthes = (tasks, taskStratagy) => {
  dictionary = {};
  const currentTime = new Date();
  const lastYear = new Date(
    currentTime.getFullYear() - 1,
    (currentTime.getMonth() + 2) % 12,
    0,
    0,
    0,
    0
  );

  for (let i = 0; i < 12; i++) {
    dictionary[months[(lastYear.getMonth() + i) % 12]] = [];
  }
  for (const task of tasks) {
    if (task.endDateTime.getTime() >= lastYear) {
      dictionary[months[task.endDateTime.getMonth()]].push(task);
    }
  }
  return dictionary;
};

const buildDictionaryByLastYear = (tasks, taskStratagy) => {
  dictionary = {};
  const currentTime = new Date();
  const lastYear = new Date(
    currentTime.getFullYear() - 1,
    (currentTime.getMonth() + 2) % 12,
    0,
    0,
    0,
    0
  );
  for (const task of tasks) {
    if (task.endDateTime.getTime() >= lastYear) {
      if (dictionary[taskStratagy(task)] === undefined) {
        dictionary[taskStratagy(task)] = [];
      }
      dictionary[taskStratagy(task)].push(task);
    }
  }
  return dictionary;
};

exports.getEstimtedTimeByTypes = (req, res, next) => {
  getAnalytics(
    req,
    res,
    next,
    buildDictionaryByLastYear,
    (task) => {
      return task.type;
    },
    calculateEstimations
  );
};
const analzyeData = (tasks, buildDictionary, taskStratagy, makeResObject) => {
  dictionary = buildDictionary(tasks, taskStratagy);
  return makeResObject(dictionary);
};

const calculateEstimations = (dictionary) => {
  const labels = [];
  const estimated = [];
  const real = [];
  for (key in dictionary) {
    labels.push(key);
    let realCount = 0;
    let estimatedCount = 0;
    for (const task of dictionary[key]) {
      estimatedCount +=
        (task.estimatedDateTime.getTime() - task.startDateTime.getTime()) /
        3600000;
      realCount +=
        (task.endDateTime.getTime() - task.startDateTime.getTime()) / 3600000;
    }
    estimated.push(estimatedCount.toFixed(2));
    real.push(realCount.toFixed(2));
  }
  return { labels, estimated, real };
};

exports.getScoreByMonth = (req, res, next) => {
  getAnalytics(
    req,
    res,
    next,
    buildDictionaryByLastYearByMonthes,
    (task) => {
      return months[task.endDateTime.getMonth()];
    },
    calculateScore
  );
};

const calculateFeedback = (dictionary) => {
  const labels = [];
  const data = [];
  for (key in dictionary) {
    let sum = 0,
      count = 0;
    for (let task of dictionary[key]) {
      sum += task.feedback;
      count++;
    }
    labels.push(key);
    if (count > 0) {
      data.push((sum / count).toFixed(2));
    } else {
      data.push(0);
    }
  }
  return { data, labels };
};

const calculateScore = (dictionary) => {
  const labels = [];
  const data = [];
  for (key in dictionary) {
    let sum = 0;
    for (let task of dictionary[key]) {
      sum += task.score;
    }
    labels.push(key);
    data.push(sum);
  }
  return { data, labels };
};

const calclateTypesResObject = (dictionary) => {
  let total = 0;
  const labels = [];
  const data = [];
  for (key in dictionary) {
    total += dictionary[key].length;
  }
  for (key in dictionary) {
    labels.push(key);
    data.push(((dictionary[key].length / total) * 100).toFixed(2));
  }
  return { data, labels };
};
