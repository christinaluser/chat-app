const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const port = 8000;

const emojiList = [{regex: /:\)/g, src: "https://www.flaticon.com/svg/static/icons/svg/1933/1933663.svg"}, {regex: /:\(/g, src: "https://www.flaticon.com/svg/static/icons/svg/1933/1933260.svg"}, {regex: /:o/g, src: "https://www.flaticon.com/svg/static/icons/svg/1933/1933111.svg"}]
const textEffectList = [{ regex: /[*]{2}/g, startTag: "<b>", closeTag: "</b>" }, { regex: /[\/\/]{2}/g, startTag: "<i>", closeTag: "</i>" }, { regex: /[__]{2}/g, startTag: "<u>", closeTag: "</u>" }]

//each user is structured as {id: <user's socket id>, username, color}
let onlineUsers = [];
// each message is structured {id: <sender's socket id>, body: <message ccontents>, timestamp: <time server processed message> }
let messageHistory = [];

io.on("connection", socket => {

  socket.on("connect existing user", body => {
    const color = body.color;
    let username = body.username;

    const user = {id: socket.id, username: username, color: color}
    onlineUsers.push(user);
    console.log(onlineUsers)

    // update users old messages to contain their new id
    messageHistory.forEach(m => {
      if (m.id === body.id) {
        m.id = socket.id;
        if (m.username) {
          delete m.username;
        }
      }
    })
    socket.emit("successful connect", {user: user, onlineUsers: onlineUsers, messageHistory: messageHistory});

      const message = { id: "notification", body: username + " connected to chat" };
      saveMessage(message);
      socket.broadcast.emit("user reconnected", {message: message, onlineUsers: onlineUsers, messageHistory: messageHistory});
  });

  socket.on("connect new user", () => {
    const username = generateUniqueUsername("user");
    const user = {id: socket.id, username: username, color: "#696969"}
    onlineUsers.push(user);

    socket.emit("successful connect", {user: user, onlineUsers: onlineUsers, messageHistory: messageHistory});

    const message = { id: "notification", body: username + " connected to chat" };
    saveMessage(message);
    socket.broadcast.emit("user connected", {message: message, onlineUsers: onlineUsers});
  });

  socket.on("send message", body => {
    let message = body;
    const currentDate = new Date();
    message.timeStamp = currentDate.toLocaleString('en-US', { hour12: true });

    const formattedMessage = formatMessage(message.body);

    if (formattedMessage !== message.body) {
      message.body = formattedMessage;
      message.isFormated = true;
    }

    saveMessage(message);
    io.emit("message received", message)
  });

  socket.on("change username", body => {
    const newName = body[0];

    if (body.length !== 1) {
      socket.emit("message received", { id: "notification", body: "command invalid. format: /name username" } );
    } else if (onlineUsers.find(u => u.username === newName)) {
      socket.emit("message received", { id: "notification", body: "the username " + newName + " is already taken"  } );
    } else {
      // update messageHistory sent by user previously
      let changedUserIndex = onlineUsers.findIndex(val => val.id === socket.id);
      onlineUsers[changedUserIndex].username = newName;

      // send updated user list and messages to everyone
      io.emit("users updated", {onlineUsers: onlineUsers});
      // user notification message that their color has been changed but dont save for everyone
      const message = { id: "notification", body: "your username has been changed" }
      socket.emit("user changed", {user: onlineUsers[changedUserIndex], message: message });
    }
  });

  socket.on("change color", body => {
    let newColor = body[0];
    if (body.length !== 1) {
      socket.emit("message received", { id: "notification", body: "command invalid. format: /color RRGGBB"  } );
    } else if (validateHexColorCode(newColor)) {
      let changedUser = onlineUsers.find(val => val.id === socket.id);
      changedUser.color = "#" + newColor;
      onlineUsers = onlineUsers.filter(val => val.id !== socket.id);
      onlineUsers.push(changedUser);
      
      // send new user list to everyone
      io.emit("users updated", {onlineUsers: onlineUsers});

      // user notification message that their color has been changed but dont save for everyone
      const message = { id: "notification", body: "your color has been changed to #" + newColor };
      socket.emit("user changed", {user: changedUser, message: message } );
    } else {
      socket.emit("message received", { id: "notification", body: "#" + newColor + " is not a valid hex color code"  } );
    }
  });

  socket.on("unknown command", () => {
    socket.emit("message received", { id: "notification", body: "trying to use a command? see info bar for options!"  } );
  });

  socket.on("disconnect", () => {
    // remove user from list of online users
      const disconnectedUsername = onlineUsers.find(val => val.id === socket.id).username;
      onlineUsers = onlineUsers.filter(val => val.id !== socket.id);
      
      messageHistory.forEach(m => {
        if (m.id === socket.id) {
          m.username = disconnectedUsername;
        }
      })

      let message = { id: "notification", body: disconnectedUsername + " disconnected from chat" };
      saveMessage(message);
      io.emit("user disconnected", {message: message, onlineUsers: onlineUsers, messageHistory: messageHistory})

  });
})

function formatMessage(message) {
  let formattedMessage = message;
  textEffectList.forEach(effect => {
    formattedMessage = replaceMarkdownWithTextEffect(effect.regex, effect.startTag, effect.closeTag, formattedMessage)
  });

  emojiList.forEach(emoji => {
    formattedMessage = replaceTextWithEmoji(emoji.regex, emoji.src, formattedMessage)
  });

  
  return formattedMessage;
}

function replaceMarkdownWithTextEffect(regex, startTag, closeTag, message) {
  let markdownArr = message.match(regex);
  if (!markdownArr) return message;
  let markdownCount = markdownArr.length
  if (markdownCount < 2) return message;
  let splitMessage = message.split(regex);
  let textEffectMessage = "";
  let counter = markdownCount % 2 === 0 ? markdownCount : markdownCount - 1;
  splitMessage.forEach(segment => {
    textEffectMessage += segment;
    if(counter > 0) {
      if (counter % 2 === 0) {
        textEffectMessage += startTag;
      } else {
        textEffectMessage += closeTag;
      }
      counter -= 1;
    } else if (counter == 0 && markdownCount % 2 !== 0) {
      textEffectMessage += regex.toString().split(/[\[\]]/g)[1];
    }
  });
  return textEffectMessage;
}

function replaceTextWithEmoji(regex, imgSrc, message) {
  let emojiMatchArr = message.match(regex);
  if (!emojiMatchArr) return message;
  let emojiCount = emojiMatchArr.length;
  let splitMessage = message.split(regex);
  let emojiMessage = "";
  splitMessage.forEach(segment => {
    emojiMessage += segment;
    if (emojiCount > 0) {
      emojiMessage += `<img class="emoji" src="${imgSrc}"/>`
      emojiCount -= 1;
    }
  })
  return emojiMessage;
}

function validateHexColorCode(code) {
  if (code.length !== 6) return false;
  if (code.match(RegExp("[0-9A-F]{6}", "i"))) return true;
  return false;
}

function saveMessage(message) {
  // if over 200 messages saved, remove oldest message
  if (messageHistory.length === 200) {
    messageHistory.shift();
  }
  messageHistory.push(message);
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