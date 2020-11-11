import React from "react";
import "../App.css"

class Message extends React.Component {
  componentDidMount(){
    if (this.text)
      this.text.innerHTML = this.props.message.body;
  }

  render = () => (
    <div className={this.props.type}>
      <div className="row" key={this.props.index}>
        <div className="message-bubble">
          { this.props.user.username !== "" ?
            <div className="username-text" style={{color: this.props.user.color}}>{this.props.user.username}</div> :
            <div className="empty-user"></div>
          } 
            { this.props.message.isFormated ? 
              <span className="message-text" ref={(el) => { this.text = el; }}></span>  : 
              <span className="message-text">{this.props.message.body}</span>
            }
          <div className="timestamp-text">{this.props.message.timeStamp}</div>
        </div>
      </div>
    </div>
  );
}

export default Message;