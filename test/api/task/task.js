const app = require("../../../app.js");
const mongoose = require("mongoose");
const request = require("supertest");

const { assert, expect: chaiExpect } = require("chai");
describe("auth", () => {
    let jwt, teamId, jwt2,tubeId,userId,userId2;
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
        })
        before(()=> {
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
        })
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
              })
              .expect(201)
              .then((res) => {
                chaiExpect(res.body).to.have.property("task");
              });
        })
        
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
             })
             .expect(401)
             .then((res) => {
               chaiExpect(res.body).to.not.have.property("task");
             });
         });
        
    })
});