import React from 'react';
import "./App.css"
import socketIOClient from 'socket.io-client';
import Chat from "./Components/Chat"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      colour: "",
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
        username: data.id,
        onlineUsers: data.users,
        messages: data.messages,
      });
    })
    
    this.socket.on("connected", (id, users) => {
      this.userConnected( id, users);
    })

    this.socket.on("message received", message => {
      console.log(message);
      this.receivedMessage(message);
    })

    this.socket.on("disconnect", (id, users) => {
        this.userDisconnected(users, id);
    })
  }

  componentWillUnmount(){
    this.socket.close();
  }

  userConnected( id, users) {
    let message = { id: id, body: "connected to chat" };
    this.receivedMessage(message);
    this.setState({
      onlineUsers: users,
    });
  }

  userDisconnected(users, id) {
    let message = { id: id, body: "disconnected from chat" }
    this.receivedMessage(message);
    this.setState({
      onlineUsers: users,
    });
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
    let detectedCommand = this.detectCommand();
    if (detectedCommand) {
      this.socket.emit(detectedCommand.command, detectedCommand.argument);
    } else {
      const messageObject = {
        body: this.state.message,
        id: this.state.username,
      };
      this.setState({
        message: "",
      })
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
          <Chat messages={this.state.messages} username={this.state.username}></Chat>
          <form onSubmit={this.sendMessage}>
            <textarea value={this.state.message} onChange={this.handleMessageChange} placeholder="Type a message..." />
            <button>Send</button>
          </form>
        </div>
        <div className="user-panel">
          <h2>Online Users</h2>
          {
              // this.state.onlineUsers.map((id, index) => {
              //   return (
              //     <div className="user" key={index}>{id}</div>
              //   )
              // }) 
          }
        </div> 
      </div>
    );
  }
}

export default App;
