import React from "react";
import "../App.css"

class Message extends React.Component {
  componentDidMount(){
    this.text.innerHTML = this.props.message.body;
  }

  render = () => (
    <div className={this.props.type}>
      <div className="row" key={this.props.index}>
        <div className="message-bubble">
          <div className="username-text" style={{color: this.props.color}}>{this.props.message.username}</div>
          <span className="message-text" ref={(el) => { this.text = el; }}></span> 
          <div className="timestamp-text">{this.props.message.timeStamp}</div>
        </div>
      </div>
    </div>
  );
}

export default Message;