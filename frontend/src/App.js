import React from 'react';
import "./App.css"
import socketIOClient from 'socket.io-client';
import Chat from "./Components/Chat"
import SidePanel from "./Components/SidePanel"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      onlineUsers: [],
      message: "",
    }
    this.sendMessage = this.sendMessage.bind(this);
    this.receivedMessage = this.receivedMessage.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this)
    this.enterPressed = this.enterPressed.bind(this);
  }
  
  componentDidMount() {
    this.socket = socketIOClient();

    this.socket.on("connect", () => {
      let username = sessionStorage.getItem("username");
      let color = sessionStorage.getItem("color");
      let id = sessionStorage.getItem("id");
      if (id && username && color) {
        const user = { id: id, username: username, color: color}

        this.socket.emit("connect existing user", user);
      } else {
        this.socket.emit("connect new user")
      }
    })

    this.socket.on("successful connect", body => {
      this.setSession(body.user);

      this.setState({
        onlineUsers: body.onlineUsers,
        messages: body.messageHistory,
      });
    })
    
    this.socket.on("user reconnected", body => {
      this.receivedMessage(body.message);
      this.setState({
        onlineUsers: body.onlineUsers,
        messages: body.messageHistory,
      });
    })

    this.socket.on("user connected", body => {
      this.receivedMessage(body.message);
      this.setState({
        onlineUsers: body.onlineUsers,
      });
    })

    this.socket.on("user changed", body => {
      this.setSession(body.user)
      this.receivedMessage(body.message);
    })

    this.socket.on("users updated", body => {
      this.setState({
        onlineUsers: body.onlineUsers,
      });
    })

    this.socket.on("message received", message => {
      this.receivedMessage(message);
    })

    this.socket.on("user disconnected", body => {
      this.receivedMessage(body.message);
      this.setState({
        onlineUsers: body.onlineUsers,
        messages: body.messageHistory,
      });
    })
  }

  componentWillUnmount(){
    this.socket.close();
  }

  receivedMessage(message) {
    let newMessages = this.state.messages;
    if (newMessages) {
      newMessages.push(message);
    } else {
      newMessages = [message];
    }
    this.setState({
      messages: newMessages,
    })
  }

  detectCommand() {
    // if doesnt start with "/" it isn't a command 
    if (!this.state.message.match(RegExp("^/"))) return;

    let messageArr = this.state.message.split(RegExp("\\s{1,}"));
    
    if (messageArr[0].match(RegExp("/color"))) {
      messageArr.shift();
      return {command: "change color", argument: messageArr};
    }
    if (messageArr[0].match(RegExp("/name"))) {
      messageArr.shift();
      return {command: "change username", argument: messageArr}
    }

    return {command: "unknown command", argument: { body: this.state.message, username: this.state.username }}
  }

  sendMessage(e) {
    e.preventDefault();
    if (this.state.message === "") return;
    const messageObject = {
      body: this.state.message,
      id: sessionStorage.getItem("id"),
    };
    this.setState({
      message: "",
    });
    this.socket.emit("send message", messageObject);
    let detectedCommand = this.detectCommand();
    if (detectedCommand) {
      this.socket.emit(detectedCommand.command, detectedCommand.argument);
    } 
    
  }

  setSession(user) {
    sessionStorage.setItem("username", user.username);
    sessionStorage.setItem("color", user.color);
    sessionStorage.setItem("id", user.id);
  }

  handleMessageChange(e) {
    this.setState({
      message: e.target.value
    });
  }

  enterPressed(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.sendMessage(e);
    }
  }

  render() {
    return (
      <div className="page">
        <div className="chat-wrapper">
          <Chat messages={this.state.messages} users={this.state.onlineUsers}></Chat>
          <form onSubmit={this.sendMessage}>
            <textarea value={this.state.message} onChange={this.handleMessageChange} onKeyPress={e => this.enterPressed(e)} placeholder="Type a message..." />
            <button type="submit">Send</button>
          </form>
        </div>
        <SidePanel users={this.state.onlineUsers || []}></SidePanel>
      </div>
    );
  }
}

export default App;
