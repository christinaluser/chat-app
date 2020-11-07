  

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const port = 8000;

let onlineUsers = [];
let messages = [];

io.on("connection", socket => {
  // add user list of online users 
  onlineUsers.push(socket.id);
  socket.emit("successful connect", {id: socket.id, onlineUsers: onlineUsers, messages: messages});

  // socket.emit("connect", onlineUsers);
  socket.broadcast.emit("connected", socket.id, onlineUsers);

  socket.on("send message", body => {
    let currentDate = new Date();
    body.timeStamp = currentDate.toLocaleString('en-US', { hour12: true });
    saveMessage(body);
    io.emit("message received", body) // send message to all clients
  });

  socket.on("change username", body => {

    body.timeStamp = Date.now();
    io.emit("message received", body) 
  });

  socket.on("change color", body => {

    body.timeStamp = Date.now();
    io.emit("", body) 
  });

  socket.on("disconnect", () => {
    // remove user from list of online users
    onlineUsers = onlineUsers.filter(val => val !== socket.id);
    io.emit("disconnect", socket.id, onlineUsers)
  });
})

function saveMessage(message) {
  if (messages.length === 200) {
    //remove oldest msg
  }
  messages.push(message);
}

server.listen(port, () => console.log(`server is running on port ${port}`));