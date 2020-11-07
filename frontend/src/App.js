import React from 'react';
import "./App.css"
import socketIOClient from 'socket.io-client';
import Chat from "./Components/Chat"
import UsersPanel from "./Components/UsersPanel"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      messages: [],
      onlineUsers: [],
      message: "",
    }
    this.sendMessage = this.sendMessage.bind(this);
    this.receivedMessage = this.receivedMessage.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this)
  }
  

  componentDidMount() {
    this.socket = socketIOClient();

    this.socket.on("successful connect", (data) => {
      this.setState({
        username: data.username,
        onlineUsers: data.users,
        messages: data.messages,
      });
    })
    
    this.socket.on("user connected", (message, users) => {
      this.receivedMessage(message);
      this.setState({
        onlineUsers: users,
      });
    })

    this.socket.on("color changed", (message) => {
      this.receivedMessage(message);
    })

    this.socket.on("users updated", (users, messages) => {
      this.setState({
        onlineUsers: users,
      });
      if (messages) {
        this.setState({
          messages: messages,
        })
      }
    })

    this.socket.on("message received", message => {
      this.receivedMessage(message);
    })

    this.socket.on("user disconnected", (message, users) => {
      this.receivedMessage(message);
      this.setState({
        onlineUsers: users,
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
    // if more than 2 words, too many args to be a command
    if (messageArr.length !== 2) return;
    
    if (messageArr[0].match(RegExp("/color"))) {
      // arg must be in the form RRGGBB ie.6 digits 
      if (messageArr[1].length === 6 && messageArr[1].match(RegExp("\\d{6}")))
        return {command: "change color", argument: messageArr[1]};
    }
    if (messageArr[0].match(RegExp("/name"))) {
      return {command: "change username", argument: messageArr[1]}
    }
  }

  sendMessage(e) {
    e.preventDefault();
    if (this.state.message === "") return;
    let detectedCommand = this.detectCommand();
    if (detectedCommand) {
      this.setState({
        message: "",
      });
      this.socket.emit(detectedCommand.command, detectedCommand.argument);
    } else {
      const messageObject = {
        body: this.state.message,
        username: this.state.username,
      };
      this.setState({
        message: "",
      });
      this.socket.emit("send message", messageObject);
    }
  }

  handleMessageChange(e) {
    this.setState({
      message: e.target.value
    });
  }

  render() {
    return (
      <div className="page">
        <div className="chat-wrapper">
          <Chat messages={this.state.messages} username={this.state.username} users={this.state.onlineUsers}></Chat>
          <form onSubmit={this.sendMessage}>
            <textarea value={this.state.message} onChange={this.handleMessageChange} placeholder="Type a message..." />
            <button>Send</button>
          </form>
        </div>
        <UsersPanel currentUser={this.state.username} users={this.state.onlineUsers || []}></UsersPanel>
      </div>
    );
  }
}

export default App;
