const Tube = require("../models/tube.js");
const { isValidMongoId } = require("../utils/validation");
const User = require("../models/user.js");
let io;
const jwt = require("jsonwebtoken");
const { getIo } = require("../utils/io.js");
const Message = require("./model/message");
const ObjectId = require("mongodb").ObjectId;


exports.chatHandler = (socket) => {
  socket.on("joinRoom", ( token, tubeId ) => {
    const userId = getUserIdFromJwt(token);
    socket.userId = userId;
    User.findById(userId).then((user) => {
      if (!user) {
        return;
      }
      socket.user = user;
      if (isValidMongoId(tubeId)) {
        Tube.findById(tubeId).then((tube) => {
          if (!tube) {
            return;
          }
          if (!tube.users.includes(user._id)) {
            return;
          }
          socket.join(tubeId);
          socket.tubeId = tubeId;
          socket.join(user._id.toString());
          user.tubeId = tubeId;
        });
        Message.find({ tube: new ObjectId(tubeId) }).populate("user").then((messages) => {
          if (!messages) {
            return;
          }
          socket.emit("chatHistory", { messages });
        });
      }
    });
  });


  socket.on("chatMessage", (data, tubeId) => {
    io = getIo();
      const { userId, tubeId: tubeIdSocket } = socket;
      
    Message;
    if (!userId || !tubeId || tubeId !== tubeIdSocket) {
      socket.emit("error", { message: "you are not part of this chat" });
    } else {
         User.findById(userId).then(user => {
             if (!user) {
                 return;
             }
      const message = new Message({
        data,
        user: new ObjectId(userId),
        tube: new ObjectId(tubeId),
      });
             message.save().then((res) => {
                 if (!res) {
                     return;
                 }
                 message.user = user;
                 io.to(tubeId).emit("chatMessage", { message, tubeId });
             });
      });
    }
  });

  socket.on("disconnect", () => {
      console.log("user disconnect  " +socket.userId);
      })
};

const getUserIdFromJwt = (token) => {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somekeyfromivtech");
  } catch (error) {
    console.log(error);
    return;
  }
  const { userId } = decodedToken;
  return userId;
};
