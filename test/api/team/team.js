const { signup } = require("../../../controllers/auth");
const app = require("../../../app.js");
const mongoose = require("mongoose");
const request = require("supertest");

const { assert, expect: chaiExpect } = require("chai");

describe("auth", () => {
    let jwt, teamId, jwt2;
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

    


});