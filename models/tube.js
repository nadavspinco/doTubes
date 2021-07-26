const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
  users: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
});

module.exports = mongoose.model("Tube", userSchema);
