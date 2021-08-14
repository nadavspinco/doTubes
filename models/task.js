const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
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
    dicription: {
      type: String,
    },
    exacutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      enum: [
        "pending",
        "pre-estimated",
        "in-process",
        "pre-report",
        "completed",
      ],
      required: true,
      default: "pending",
    },
    startDateTime: {
      type: Date,
    },
    endDateTime: {
      type: Date,
    },
    estimatedDateTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
