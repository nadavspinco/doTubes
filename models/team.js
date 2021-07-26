const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("mongoose-validator");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
  tubes: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tube",
      },
    ],
    required: true,
    default: [],
  },
});

module.exports = mongoose.model("Team", userSchema);
