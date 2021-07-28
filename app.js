const express = require("express");
const mongoose = require("mongoose");
const compression = require('compression');
const helmet = require('helmet');
const router = express.Router();
require("dotenv").config();

const MONGODB_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@dotubes.rxz2c.mongodb.net/doTubes?retryWrites=true&w=majority `;
const authRouter = require("./routes/auth");
const teamRouter = require("./routes/team");
const tubeRouter = require('./routes/tube');
const taskRouter = require('./routes/task');
const cors = require("cors");
var methodOverride = require("method-override");

const app = express();

app.use(cors()); // enable all cors request

app.use(helmet());

app.use(compression());

app.use(express.json()); // parse incoming requests to JSON

app.use("/auth", authRouter);

app.use("/teams", teamRouter);

app.use("/tubes", tubeRouter);

app.use("/tasks", taskRouter);

app.use(methodOverride());
app.use(function (error, req, res, next) {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("server is running");
    app.listen(process.env.PORT || 8080);
  })
  .catch((error) => console.log(error));
