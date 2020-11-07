import React from 'react';
import "../App.css"
import Message from "./Message"

class Chat extends React.Component {
  render() {
    return (
      <div className="messages-container">
        {this.props.messages.map((message, index) => {
          return message.id === this.props.username ?
            <Message key={index} type="outgoing-message" message={message}></Message> :
            <Message key={index} type="incoming-message" message={message}></Message>
        })}
      </div>
    );
  }
}

export default Chat;
