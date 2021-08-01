const { signup } = require("../../../controllers/auth");
const app = require("../../../app.js");
const mongoose = require("mongoose");
const request = require("supertest");

const { assert, expect: chaiExpect } = require("chai");

describe("tubes", () => {
  let jwt, teamId, jwt2 ,jwt3;
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
            });
        });
        before( () => {
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
              })
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
           .expect(201);
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
          .set("Authorization", "Bearer " + jwt2 + 'a')
          .send({
            name: "my tube",
            teamId: "abc",
          })
          .expect(401);
      });
    
    });
  
 

  });
