import React from 'react';
import "../App.css"
import Message from "./Message"

class Chat extends React.Component {

  getUserColor(username) {
    if (this.props.users){
      if (this.props.users.find(u => username === u.username)){
        console.log(this.props.users.find(u => username === u.username))
        return this.props.users.find(u => username === u.username).color;
      }
    } else {
      return "41, 41, 41";
    }
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
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
          return message.username === this.props.username ?
            <Message key={index} type="outgoing-message" message={message} color={this.getUserColor(message.username)}></Message> :
            <Message key={index} type={message.username !== "" ? "incoming-message" : "notification" } message={message} color={this.getUserColor(message.username)}></Message>
        })}
        <div ref={(el) => { this.messagesEnd = el; }}></div>
      </div>
    );
  }
}

export default Chat;
