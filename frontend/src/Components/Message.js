import React from "react";
import "../App.css"

class Message extends React.Component {
  render = () => (
    <div className={this.props.type}>
      <div className="row" key={this.props.index}>
        <div className="message-bubble">
          <div className="username-text" style={{color: "rgb("+this.props.color+")"}}>{this.props.message.username}</div>
          <span className="message-text">{this.props.message.body}</span> 
          <div className="timestamp-text">{this.props.message.timeStamp}</div>
        </div>
      </div>
    </div>
  );
}

export default Message;