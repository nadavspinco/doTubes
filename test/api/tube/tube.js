const { signup } = require("../../../controllers/auth");
const mongoose = require("mongoose");
const request = require("supertest");
const { app } = require("../../../app.js");
const { assert, expect: chaiExpect } = require("chai");
const { getTubeDetails } = require("../../../controllers/tube");

describe("tubes", () => {
  let jwt, teamId, jwt2, jwt3, tubeId, userId, userId3, jwt4, userId4;
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

  describe("add tube", () => {
    before(() => {
      return request(app)
        .post("/auth/signup")
        .send({
          email: "user1@walla.com",
          fullName: "avi c",
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
          fullName: "gabi",
          password: "123456Aa!",
        })
        .then((res) => {
          jwt2 = res.body.jwt;
        });
    });
    before(() => {
      return request(app)
        .post("/auth/signup")
        .send({
          email: "user3@walla.com",
          fullName: "avi c",
          password: "123456Aa!",
        })
        .then((res) => {
          jwt3 = res.body.jwt;
          userId3 = res.body.userId;
        });
    });
    before(() => {
      return request(app)
        .post("/auth/signup")
        .send({
          email: "user4@walla.com",
          fullName: "avi c",
          password: "123456Aa!",
        })
        .then((res) => {
          jwt4 = res.body.jwt;
          userId4 = res.body.userId;
        });
    });
    before(() => {
      return request(app)
        .post("/teams/")
        .set("Authorization", "Bearer " + jwt)
        .send({
          teamName: "my team",
        })
        .then((res) => {
          teamId = res.body.team._id;
        });
    });
    before(() => {
      return request(app)
        .post("/teams/join")
        .set("Authorization", "Bearer " + jwt2)
        .send({
          name: "my tube",
          teamId: teamId,
        });
    });
    before(() => {
      return request(app)
        .post("/teams/join")
        .set("Authorization", "Bearer " + jwt4)
        .send({
          name: "my tube",
          teamId: teamId,
        });
    });

    before(() => {
      return request(app)
        .put("/tubes/addUser")
        .set("Authorization", "Bearer " + jwt2)
        .send({
          tubeId,
          userId,
        });
    });

    it("added tube to team failed, unauthorized user", () => {
      return request(app)
        .post("/tubes/")
        .set("Authorization", "Bearer " + jwt3)
        .send({
          name: "my tube",
          teamId: teamId,
        })
        .expect(401);
    });
    it("added tube to team succeed", () => {
      return request(app)
        .post("/tubes/")
        .set("Authorization", "Bearer " + jwt2)
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
    it("added tube failed, invalid team id", () => {
      return request(app)
        .post("/tubes/")
        .set("Authorization", "Bearer " + jwt2)
        .send({
          name: "my tube",
          teamId: "abc",
        })
        .expect(404);
    });
    it("added tube failed, invalid jwt", () => {
      return request(app)
        .post("/tubes/")
        .set("Authorization", "Bearer " + jwt2 + "a")
        .send({
          name: "my tube",
          teamId: "abc",
        })
        .expect(401);
    });
  });
  describe("get tubes", () => {
    it("get tubes ,user is part of tubes", () => {
      return request(app)
        .get("/tubes/all/" + teamId)
        .set("Authorization", "Bearer " + jwt2)
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("tubes");
          chaiExpect(res.body).to.have.property("isTeamAdmin", false);
          chaiExpect(res.body.tubes).to.have.lengthOf.above(0);
        });
    });

    it("get tubes ,user is not part of any tubes and admin", () => {
      return request(app)
        .get("/tubes/all/" + teamId)
        .set("Authorization", "Bearer " + jwt)
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("tubes");
          chaiExpect(res.body).to.have.property("isTeamAdmin", true);
          chaiExpect(res.body.tubes).to.have.lengthOf(0);
        });
    });

    it("get tubes ,user is not part of team", () => {
      return request(app)
        .get("/tubes/all/" + teamId)
        .set("Authorization", "Bearer " + jwt3)
        .expect(401)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("tubes");
        });
    });

    it("get Tube Details with tube Manager", () => {
      return request(app)
        .get("/tubes/" + tubeId)
        .set("Authorization", "Bearer " + jwt2)
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("tube");
          chaiExpect(res.body).to.have.property("progress");
          chaiExpect(res.body).to.have.property("isTubeManager", true);
          chaiExpect(res.body).to.have.property("doneCount");
          chaiExpect(res.body).to.have.property("totalCount");
        });
    });

    it("get Tube failed, user is not part of tube", () => {
      return request(app)
        .get("/tubes/" + tubeId)
        .set("Authorization", "Bearer " + jwt3)
        .expect(401)
        .then((res) => {
          chaiExpect(res.body).to.have.not.property("tube");
          chaiExpect(res.body).to.have.not.property("progress");
          chaiExpect(res.body).to.have.not.property("isTubeManager");
        });
    });
  });
  describe("add user to tube", () => {
    describe("get user sugestions", () => {
      it("get user suggestions faild , user is not tube admin", () => {
        return request(app)
          .get("/tubes//users-suggestions/" + tubeId)
          .set("Authorization", "Bearer " + jwt)
          .expect(401)
          .then((res) => {
            chaiExpect(res.body).to.not.have.property("users");
          });
      });

      it("get user suggestions succeed  withe tube admin", () => {
        return request(app)
          .get("/tubes//users-suggestions/" + tubeId)
          .set("Authorization", "Bearer " + jwt2)
          .expect(200)
          .then((res) => {
            chaiExpect(res.body).to.have.property("users");
            chaiExpect(res.body.users).to.have.lengthOf.above(0);
          });
      });
    });

    it("add user failed ,user already in that tube", () => {
      return request(app)
        .put("/tubes/addUser")
        .set("Authorization", "Bearer " + jwt)
        .send({
          tubeId,
          userId,
        })
        .expect(401)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("tube");
        });
    });

    it("add user successful with valid user and tube", () => {
      return request(app)
        .put("/tubes/addUser")
        .set("Authorization", "Bearer " + jwt2)
        .send({
          tubeId,
          userId,
        })
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("tube");
          chaiExpect(res.body.tube).to.have.property("users");
          chaiExpect(res.body.tube.users).to.have.contain(userId);
        });
    });

    it("add user failed ,user already in that tube", () => {
      return request(app)
        .put("/tubes/addUser")
        .set("Authorization", "Bearer " + jwt2)
        .send({
          tubeId,
          userId,
        })
        .expect(400)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("tube");
        });
    });
    it("add user failed ,user is not part of the team", () => {
      return request(app)
        .put("/tubes/addUser")
        .set("Authorization", "Bearer " + jwt2)
        .send({
          tubeId,
          userId: userId3,
        })
        .expect(403)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("tube");
        });
    });

    it("add user failed, user jwt is not admin", () => {
      return request(app)
        .put("/tubes/addUser")
        .set("Authorization", "Bearer " + jwt)
        .send({
          tubeId,
          userId,
        })
        .expect(401)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("tube");
        });
    });
  });
  describe("get users by tube", () => {
    it("get tube succeed", () => {
      return request(app)
        .get("/tubes/users/" + tubeId)
        .set("Authorization", "Bearer " + jwt)
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("users");
          chaiExpect(res.body.users).to.have.lengthOf.above(1);
        });
    });
      it("get tube failed, user is not part of the tube", () => {
        return request(app)
          .get("/tubes/users/" + tubeId)
          .set("Authorization", "Bearer " + jwt4)
          .expect(401)
          .then((res) => {
            chaiExpect(res.body).to.not.have.property("users");
          });

    });
  });
});
