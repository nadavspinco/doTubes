const { signup } = require("../../../controllers/auth");
const app = require("../../../app.js");
const mongoose = require("mongoose");
const request = require("supertest");

const { assert, expect: chaiExpect } = require("chai");
const { deleteOne } = require("../../../models/user");




describe("auth", () => {
  before(() => {
    
    const uri = "mongodb://localhost:27017/doTubes";
    return mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  })
  after(() => {
    return mongoose.disconnect();
  })


  afterEach(() => {
      return mongoose.connection.db.dropDatabase();
  })


  describe("sign up", () => {
    it("signup successful ", () => {
      return request(app)
        .post("/auth/signup")
        .send({
          email: "kso@walla.com",
          fullName: "avi c",
          password: "123456Aa!",
        })
        .expect(201)
        .then((res) => {
          chaiExpect(res.body).to.have.property("jwt");
        });
    });

    it("signup failed, invalid email", () => {
      return request(app)
        .post("/auth/signup")
        .send({
          email: "ksowalla.com",
          fullName: "avi c",
          password: "123456Aa!",
        })
        .expect(400)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("jwt");
        });
    });
  });
  describe("login", () => {
    beforeEach(() => {
      return request(app)
        .post("/auth/signup")
        .send({
          email: "kso@walla.com",
          fullName: "avi c",
          password: "123456Aa!",
        })
        .expect(201);
    });
    it("login succeed ", () => {
      return request(app)
        .post("/auth/login")
        .send({
          email: "kso@walla.com",
          password: "123456Aa!",
        })
        .expect(200)
        .then((res) => {
          chaiExpect(res.body).to.have.property("jwt");
        });
    });
    it("login failed wrong email ", () => {
      return request(app)
        .post("/auth/login")
        .send({
          email: "ks@walla.com",
          password: "123456Aa!",
        })
        .expect(403)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("jwt");
        });
    });
    it("login failed wrong password ", () => {
      return request(app)
        .post("/auth/login")
        .send({
          email: "kso@walla.com",
          password: "123456A!",
        })
        .expect(403)
        .then((res) => {
          chaiExpect(res.body).to.not.have.property("jwt");
        });
    });
  })
});
