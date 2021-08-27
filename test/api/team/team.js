const { signup } = require("../../../controllers/auth");
const { app } = require("../../../app.js");
const mongoose = require("mongoose");
const request = require("supertest");

const { assert, expect: chaiExpect } = require("chai");

describe("teams", () => {
    let jwt, teamId, jwt2,jwt3,userId;
    before(() => {
        const uri = "mongodb://localhost:27017/doTubes";
        return mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });
    
    after(() => {
        return mongoose.connection.db.dropDatabase();
    })
    after(() => {
        return mongoose.disconnect();
    });



    describe("add team", () => {
        before(() => {
            return request(app)
                .post("/auth/signup")
                .send({
                    email: "ksol@walla.com",
                    fullName: "avi c",
                    password: "123456Aa!",
                })
                .then((res) => {
                    jwt = res.body.jwt;
                    userId = res.body.userId;
                });
        })
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
                    fullName: "gabi",
                    password: "123456Aa!",
                })
                .then((res) => {
                    jwt3 = res.body.jwt;
                });
        });
        it("add team successfully", () => {
            return request(app)
                .post("/teams/")
                .set('Authorization', 'Bearer ' + jwt)
                .send({
                    teamName: "my team",
                })
                .expect(201)
                .then((res) => {
                    chaiExpect(res.body).to.have.property("team");
                    teamId = res.body.team._id;
                });
        });
        it("add team fail with invalid jwt", () => {
            return request(app)
                .post("/teams/")
                .set("Authorization", "Bearer " + jwt + 'a')
                .send({
                    teamName: "my team",
                })
                .expect(401)
                .then((res) => {
                    chaiExpect(res.body).to.not.have.to.property("team");
                   
                });
        });
    })
    describe("join team", () => {
        it("join team succseed", () => {
            return request(app)
                .post("/teams/join")
                .set("Authorization", "Bearer " + jwt2)
                .send({
                    teamId: teamId,
                })
                .expect(200)
        })
        it("join team fail , id not exists", () => {
            return request(app)
              .post("/teams/join")
              .set("Authorization", "Bearer " + jwt2)
              .send({
                teamId: "p",
              })

              .expect(404);
        });
        it("join team fail , invalid team id", () => {
          return request(app)
            .post("/teams/join")
            .set("Authorization", "Bearer " + jwt2 + "a")
            .send({
              teamId: "teamId",
            })

            .expect(401);
        });
    });

    describe("get teams", () => {
        it("get all teams by user", () => {
            return request(app)
                .get("/teams/")
                .set("Authorization", "Bearer " + jwt)
                .expect(200)
                .then(res => {
                    chaiExpect(res.body).to.have.property("teams");
                })
        });

          it("get team by teamId", () => {
            return request(app)
              .get("/teams/"+teamId)
              .set("Authorization", "Bearer " + jwt2)
              .expect(200)
              .then((res) => {
                  chaiExpect(res.body).to.have.property("team");
                  chaiExpect(res.body.team).to.have.property("users");
                  chaiExpect(res.body.team).to.have.property("admin");
                  chaiExpect(res.body.team).to.have.property("tubes");
              });

          });
        
        
          it("get team by teamId, unauthorized jwt", () => {
            return request(app)
              .get("/teams/"+teamId)
              .set("Authorization", "Bearer " + jwt3)
              .expect(401)
              .then((res) => {
                chaiExpect(res.body).to.not.have.property("team");
              });
          });
        
        it("get team by teamId,team does not exist", () => {
         
            return request(app)
              .get("/teams/"  + userId)
              .set("Authorization", "Bearer " + jwt3)
              .expect(404)
              .then((res) => {
                chaiExpect(res.body).to.not.have.property("team");
              });
          });
    })

    


});