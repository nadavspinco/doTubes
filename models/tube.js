const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tubeSchema = new Schema({
  totalScore: {
    type: Number,
    required: true,
    default: 0,
  },

  currentScore: {
    type: Number,
    required: true,
    default: 0,
  },
  name: {
    type: String,
    required: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },

  tasks: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    default: [],
  },
  users: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  color: {
    type: String,
  },
});

module.exports = mongoose.model("Tube", tubeSchema);
