const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  score: {
    type: Number,
    required: true,
    min: 10,
    max: 100,
  },
  name: {
    type: String,
    required: true,
  },
  exacutor: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  tube: {
    type: Schema.Types.ObjectId,
    ref: "Tube",
    required: true,
  },
  type: {
    type: String,
    enum: ["ux", "ui", "aws", "git", "fixing bugs"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-process", "completed"],
    required: true,
    default: "pending",
  },
});

module.exports = mongoose.model("Task", taskSchema);
