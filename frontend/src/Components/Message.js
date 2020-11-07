import React from "react";
import "../App.css"

class Message extends React.Component {
  render = () => (
    <div className={this.props.type}>
      <div className="row" key={this.props.index}>
        <div className="message-bubble">
          <div className="username" style={{color: "rgb("+this.props.message.color+")"}}>{this.props.message.id}</div>
          <div>{this.props.message.body}</div> 
          <div>{this.props.message.timeStamp}</div>
        </div>
      </div>
    </div>
  );
}

export default Message;