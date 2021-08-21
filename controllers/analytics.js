const Team = require("../models/team.js");

const User = require("../models/user.js");

const Tube = require("../models/tube.js");

const Task = require("../models/task");

const ObjectId = require("mongodb").ObjectId;

const mongoose = require("mongoose");

const { isValidMongoId } = require('../utils/validation');
const task = require("../models/task");

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getAnalytics = (req, res, next, buildDictionary, taskStratagy, makeResObject) => {
  const { _id, user } = req.body;
  const { teamId } = req.params;
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
      }
      Task.find({
        tube: { $in: team.tubes },
        exacutor: user._id,
        status: "completed",
      }).then((tasks) => {
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
      res.json({ message: "server error" });
    });
};

exports.getTaskstypeByTeam = (req, res, next) => {
  getAnalytics(
    req,
    res,
    next,
    buildDictionaryByLastYear,
    ((task) => {
      return task.type;
    }),
    calclateTypesResObject
  );
}

exports.getEstimtedTimeByMonth = (req, res, next) =>{
    getAnalytics(
      req,
      res,
      next,
      buildDictionaryByLastYear,
      (task) => {
        return months[task.endDateTime.getMonth()];
      },
      calculateEstimations
    );
    
}

exports.getFeedbackByMonth = (req, res, next) => {
  getAnalytics(
    req,
    res,
    next,
    buildDictionaryByLastYear,
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
         return task.type;;
    },
    calculateFeedback
  );
};



const buildDictionaryByLastYear = (tasks, taskStratagy) => {
    dictionary = {};
  const currentTime = new Date();
  const lastYear = new Date(
    currentTime.getFullYear() - 1,
    (currentTime.getMonth() + 1) % 12,
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
  ((task) => {
      return task.type;
    }),
    calculateEstimations
  );
};
const analzyeData = (tasks, buildDictionary, taskStratagy, makeResObject) => {
    dictionary = buildDictionary(tasks, taskStratagy);
    return makeResObject(dictionary)
}

const calculateEstimations = (dictionary) => {
    const labels = []
    const estimated = []
    const real =[]
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
    estimated.push(estimatedCount);
    real.push(realCount);
  }
  return { labels, estimated, real };
};

exports.getScoreByMonth = (req,res,next) => {
    getAnalytics(
        req,
        res,
        next,
        buildDictionaryByLastYear,
        ((task) => {
            return months[task.endDateTime.getMonth()]
        }),
        calculateScore);
}

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
    data.push((sum / count).toFixed(2));
  }
  return { data, labels };
};


const calculateScore = (dictionary)=>{
    const labels = [];
    const data = [];
    for (key in dictionary) {
        let sum = 0, count = 0;
        for (let task of dictionary[key]) {
            sum += task.score;
            count++;
        }
        labels.push(key);
        data.push(sum);
    }
    return { data, labels };
}


const calclateTypesResObject = (dictionary) => {
    let total = 0;
  const labels = [];
    const data = [];
    for (key in dictionary) {
        total+=dictionary[key].length;
    }
      for (key in dictionary) {
        labels.push(key);
        data.push(((dictionary[key].length / total) * 100).toFixed(2));
      }
  return { data, labels };
};
