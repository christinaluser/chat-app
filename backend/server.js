const express = require("express");
const http = require("http");
const { disconnect } = require("process");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const port = 8000;

let onlineUsers = [];
let messages = [];

io.on("connection", socket => {
  // add user list of online users. color code corresponds to dimgrey rgb(41, 41, 41)
  let username = uniqueUsername();
  onlineUsers.push({socketid: socket.id, username: username, color: "41, 41, 41"});
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
    //TODO: change username
  });

  socket.on("change color", body => {
    let changedUser = onlineUsers.find(val => val.socketid === socket.id);
    changedUser.color = convertToRGBString(body);
    onlineUsers = onlineUsers.filter(val => val.socketid !== socket.id);
    onlineUsers.push(changedUser);
    // user notification message that their color has been changed but dont save for everyone
    socket.emit("color changed", { username: "", body: "your color has been changed" } );
    // send new user list to everyone
    io.emit("users updated", onlineUsers);
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

function convertToRGBString(string) {
  let splitString = string.match(/.{1,2}/g);
  return splitString[0] + ", " + splitString[1] + ", " + splitString[2];
}

function saveMessage(message) {
  if (messages.length === 200) {
    //remove oldest msg
  }
  messages.push(message);
}

function uniqueUsername() {
  let randomInt = Math.floor(Math.random() * Math.floor(999));
  let randomUsername = "user" + randomInt;;
  while (onlineUsers.find(u => u.username === randomUsername)) {
    randomInt = Math.floor(Math.random() * Math.floor(999));
    randomUsername = "user" + randomInt;
  }
  if (!onlineUsers.find(u => u.username === randomUsername)) {
    return randomUsername;
  }
}

server.listen(port, () => console.log(`server is running on port ${port}`));