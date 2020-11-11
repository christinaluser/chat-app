import React from 'react';
import "../App.css"
import Message from "./Message"

class Chat extends React.Component {

  getUserInfo(message) {
    if (message.id === "notification") {
      return {id: "notification", username: "", color: "#696969"}
    }
    if (message.username) {
      return {id: "disconnected user", username: message.username + " (disconnected)", color: "#696969"}
    }
    if (this.props.users){
      const user = this.props.users.find(u => message.id === u.id);
      if (user) {
        return user;
      } else {
        return {id: "disconnected user", username: "disconnected user", color: "#696969"}
      }
    } else {
      return {username: "err", color: "#FF0000"};
    }
  }

  scrollToBottom = () => {
    this.end.scrollIntoView({ behavior: "smooth" });
  }
  
  componentDidMount() {
    this.scrollToBottom();
  }
  
  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div className="messages-container">
        {this.props.messages.map((message, index) => {
          if (message.id === sessionStorage.getItem("id"))
            return <Message key={index} type="outgoing-message" message={message} user={this.getUserInfo(message)}></Message> 
          else if (message.id !== "notification")
            return <Message key={index} type="incoming-message"  message={message} user={this.getUserInfo(message)}></Message>
          else
            return <Message key={index} type="notification" message={message} user={this.getUserInfo(message)}> </Message>
        })}
        <div ref={(el) => { this.end = el; }}></div>
      </div>
    );
  }
}

export default Chat;
