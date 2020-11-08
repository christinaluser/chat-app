const express = require("express");
const http = require("http");
const { disconnect, connected } = require("process");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const port = 8000;

let onlineUsers = [];
let messages = [];

io.on("connection", socket => {
  // add user list of online users. color code corresponds to dimgrey rgb(41, 41, 41)
  let username = generateUniqueUsername("user");
  onlineUsers.push({socketid: socket.id, username: username, color: "#696969"});
  socket.emit("successful connect", {username: username, users: onlineUsers, messages:messages});

  // socket.emit("connect", onlineUsers);
  let message = { username: "", body: username + " connected to chat" };
  saveMessage(message);
  socket.broadcast.emit("user connected", message, onlineUsers);

  socket.on("send message", body => {
    let currentDate = new Date();
    body.timeStamp = currentDate.toLocaleString('en-US', { hour12: true });
    saveMessage(body);
    io.emit("message received", body) // send message to all clients
  });

  socket.on("change username", body => {
    if (onlineUsers.find(u => u.username === body)) {
      socket.emit("username change denied", { username: "", body: "the username " + body + " is already taken"  } );
    } else {
      // update messages sent by user previously
      let changedUser = onlineUsers.find(val => val.socketid === socket.id);
      messages.forEach(message => {
        if (message.username === changedUser.username) {
          message.username = body;
        } 
      });
      changedUser.username = body;
      onlineUsers = onlineUsers.filter(val => val.socketid !== socket.id);
      onlineUsers.push(changedUser);

      // send updated user list and messages to everyone
      io.emit("users updated", onlineUsers, messages);
      // user notification message that their color has been changed but dont save for everyone
      socket.emit("username changed", body, { username: "", body: "your username has been changed" } );
    }
  });

  socket.on("change color", body => {
    console.log(body)
    if (validateHexColorCode(body)) {
      let changedUser = onlineUsers.find(val => val.socketid === socket.id);
      changedUser.color = "#" + body;
      onlineUsers = onlineUsers.filter(val => val.socketid !== socket.id);
      onlineUsers.push(changedUser);
      // user notification message that their color has been changed but dont save for everyone
      socket.emit("color changed", { username: "", body: "your color has been changed" } );
      // send new user list to everyone
      io.emit("users updated", onlineUsers);
    } else {
      socket.emit("color change denied", { username: "", body: "#" + body + " is not a valid hex color code"  } );
    }
  });

  socket.on("disconnect", () => {
    // remove user from list of online users
    let disconnectedUsername = onlineUsers.find(val => val.socketid === socket.id).username;
    onlineUsers = onlineUsers.filter(val => val.socketid !== socket.id);
    let message = { username: "", body: disconnectedUsername + " disconnected from chat" };
    saveMessage(message);
    io.emit("user disconnected", message, onlineUsers)
  });
})

function validateHexColorCode(code) {
  if (code.length !== 6) return false;
  if (code.match(RegExp("[0-9A-F]{6}", "i"))) return true;
  return false;
}

function saveMessage(message) {
  // if over 200 messages saved, remove oldest message
  if (messages.length === 200) {
    messages.splice(0,1);
  }
  messages.push(message);
}

// appends random number to base so that username is unique
function generateUniqueUsername(base) {
  let randomInt = Math.floor(Math.random() * Math.floor(999));
  let randomUsername = base + randomInt;;
  while (onlineUsers.find(u => u.username === randomUsername)) {
    randomInt = Math.floor(Math.random() * Math.floor(999));
    randomUsername = base + randomInt;
  }
  if (!onlineUsers.find(u => u.username === randomUsername)) {
    return randomUsername;
  }
}

server.listen(port, () => console.log(`server is running on port ${port}`));