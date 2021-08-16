const app = require("../../../app.js");
const mongoose = require("mongoose");
const request = require("supertest");

const { assert, expect: chaiExpect } = require("chai");
describe("tasks", () => {
  let jwt, teamId, jwt2, tubeId, userId, userId2, taskId;
  before(() => {
    const uri = "mongodb://localhost:27017/doTubes";
    return mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(() => {
    return mongoose.connection.db.dropDatabase();
  });
  after(() => {
    return mongoose.disconnect();
  });

  describe("add task", () => {
    before(() => {
      return request(app)
        .post("/auth/signup")
        .send({
          email: "user1@walla.com",
          fullName: "user1",
          password: "123456Aa!",
        })
        .then((res) => {
          jwt = res.body.jwt;
          userId = res.body.userId;
        });
    });
    before(() => {
      return request(app)
        .post("/auth/signup")
        .send({
          email: "user2@walla.com",
          fullName: "user2",
          password: "123456Aa!",
        })
        .then((res) => {
          jwt2 = res.body.jwt;
          userId2 = res.body.userId;
        });
    });
    before(() => {
      return request(app)
        .post("/teams/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          teamName: "my team",
        })
        .expect(201)
        .then((res) => {
          chaiExpect(res.body).to.have.property("team");
          teamId = res.body.team._id;
        });
    });
    before(() => {
      return request(app)
        .post("/tubes/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          name: "my tube",
          teamId: teamId,
        })
        .expect(201)
        .then((res) => {
          chaiExpect(res.body).to.have.property("tube");
          tubeId = res.body.tube._id;
        });
    });
    it("add task to tube succeed", () => {
      return request(app)
        .post("/tasks/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          name: "my tube",
          tubeId: tubeId,
          type: "ux",
          score: 10,
          userId: userId,
          description: "description"
        })
        .expect(201)
        .then((res) => {
          chaiExpect(res.body).to.have.property("task");
          chaiExpect(res.body.task).to.have.property("status", "pending");
          taskId = res.body.task._id;
        });
    });

    it("add task to tube faild, executor is not part of tubes", () => {
      return request(app)
        .post("/tasks/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          name: "my tube",
          tubeId: tubeId,
          type: "ux",
          score: 10,
          userId: userId2,
          description: "description",
        })
        .expect(401)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("task");
        });
    });

    it("add task to tube faild, jwt user is not part of tubes", () => {
      return request(app)
        .post("/tasks/")
        .set("Authorization", "Bearer " + jwt2)
        .send({
          name: "my tube",
          tubeId: tubeId,
          type: "ux",
          score: 10,
          userId: userId,
          description: "description",
        })
        .expect(401)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("task");
        });
    });
  });
  describe("update Task status", () => {
    it("change status of task from pending to preEstimted", () => {
      return request(app)
        .put("/tasks/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          status: "pre-estimated",
          taskId: taskId,
        })
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("task");
        });
    });
    it("change status of task from preEstimted to in-process with", () => {
      return request(app)
        .put("/tasks/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          status: "in-process",
          taskId: taskId,
          estimatedTime: new Date(Date.now()).toISOString(),
        })
        .expect(403)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("task");
        });
    });

    it("change status of task from preEstimted to in-process", () => {
      return request(app)
        .put("/tasks/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          status: "in-process",
          taskId: taskId,
          estimatedTime: new Date(Date.now() + 3600000).toISOString(),
        })
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("task");
          chaiExpect(res.body.task).to.have.property("status", "in-process");
          chaiExpect(res.body.task).to.have.property("startDateTime");
          chaiExpect(res.body.task).to.have.property("estimatedDateTime");
          chaiExpect(res.body.task).to.not.have.property("endDateTime");
        });
    });

    it("change status of task from preEstimted to pre-report", () => {
      return request(app)
        .put("/tasks/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          status: "pre-report",
          taskId: taskId,
        })
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("task");
          chaiExpect(res.body.task).to.have.property("status", "pre-report");
          chaiExpect(res.body.task).to.have.property("startDateTime");
          chaiExpect(res.body.task).to.have.property("estimatedDateTime");
          chaiExpect(res.body.task).to.not.have.property("endDateTime");
        });
    });
    it("change status of task from in-process to completed", () => {
      return request(app)
        .put("/tasks/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          status: "completed",
          taskId: taskId,
        })
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("task");
          chaiExpect(res.body.task).to.have.property("status", "completed");
          chaiExpect(res.body.task).to.have.property("startDateTime");
          chaiExpect(res.body.task).to.have.property("estimatedDateTime");
          chaiExpect(res.body.task).to.have.property("endDateTime");
        });
    });

    it("change status of task from completed to in-process", () => {
      return request(app)
        .put("/tasks/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          status: "in-process",
          taskId: taskId,
        })
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("task");
          chaiExpect(res.body.task).to.have.property("status", "in-process");
          chaiExpect(res.body.task).to.have.property("startDateTime");
          chaiExpect(res.body.task).to.have.property("estimatedDateTime");
          chaiExpect(res.body.task).to.not.have.property("endDateTime");
        });
    });
  });
  describe("get tasks", () => {
    it("get tasks with valid jwt and tubeId", () => {
      return request(app)
        .get("/tasks/" + tubeId)
        .set("Authorization", "Bearer " + jwt)

        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("tasks");
        });
    });

    it("get tasks with invalid jwt and  valid tubeId", () => {
      return request(app)
        .get("/tasks/" + tubeId)
        .set("Authorization", "Bearer " + jwt2)

        .expect(403)
        .then((res) => {
          chaiExpect(res.body).to.have.not.property("tasks");
        });
    });

    it("get tasks with valid jwt and invalid tubeId", () => {
      return request(app)
        .get("/tasks/" + tubeId.substr(12) + "A")
        .set("Authorization", "Bearer " + jwt)

        .expect(404)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("tasks");
        });
    });
  });
});
